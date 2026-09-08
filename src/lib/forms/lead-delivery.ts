import 'server-only'

import { createHmac, randomInt } from 'node:crypto'

import { appendSheetRow, CRM_TABS } from '@/lib/crm/google-sheets'
import { leadRow } from '@/lib/crm/rows'
import { env } from '@/lib/env'
import { monthlySearchInvestmentOptions } from '@/lib/forms/lead-options'
import type { LeadSubmissionRecord } from '@/lib/forms/lead-record'

/**
 * Lead delivery (docs/07 section 8, docs/15 section 4, decision D-H).
 *
 * Three destinations behind one call: the notification email, which is
 * required, the CRM sheet, which is the pipeline record for now (Brandon,
 * 2026-09-07), and the CRM webhook, which is optional. The rule that shapes the module is
 * that a submission is never reported as delivered when nothing durable
 * received it. A form that accepts a lead it cannot deliver is worse than a
 * form that says so, because the visitor believes the message was sent.
 *
 * The transport is the provider's HTTP API over `fetch`. The SDK adds a
 * dependency for one POST, and a serverless function keeps no connection open
 * between invocations for it to reuse.
 */

export type DeliveryChannelStatus = 'success' | 'failed' | 'skipped'

export type DeliveryResult = {
  email: DeliveryChannelStatus
  crmWebhook: DeliveryChannelStatus
  /** The Google Sheet that is the CRM for now. A durable destination. */
  sheet: DeliveryChannelStatus
  /** True when at least one durable destination accepted the submission. */
  delivered: boolean
}

/** Which destinations actually took it, for the success event's parameter. */
export function deliveryChannels(result: DeliveryResult): string {
  const channels = [
    result.email === 'success' ? 'email' : null,
    result.crmWebhook === 'success' ? 'crm' : null,
    result.sheet === 'success' ? 'sheet' : null,
  ].filter(Boolean)

  return channels.length > 0 ? channels.join('_') : 'none'
}

/**
 * Non-sequential reference. A sequential id leaks submission volume and lets
 * one submitter guess another's reference; the year prefix keeps it legible
 * when it is read back over the phone.
 */
export function generateLeadRequestId(now: Date = new Date()): string {
  const suffix = String(randomInt(0, 1_000_000)).padStart(6, '0')
  return `LEAD-${now.getUTCFullYear()}-${suffix}`
}

const FORM_TITLES = {
  diagnostic: 'Diagnostic application',
  'agency-partnership': 'Agency partnership inquiry',
  contact: 'General inquiry',
} as const

const FIELD_TITLES: Record<string, string> = {
  audienceType: 'Applying as',
  firstName: 'First name',
  lastName: 'Last name',
  workEmail: 'Work email',
  organization: 'Organization',
  website: 'Website',
  role: 'Role',
  primaryMarket: 'Primary product, service, or market',
  relevantAccounts: 'Relevant accounts',
  preferredModel: 'Preferred model',
  primaryQuestion: 'Question',
  currentStack: 'Current systems',
  monthlySearchInvestment: 'Monthly search investment',
  desiredTiming: 'Desired timing',
  additionalContext: 'Additional context',
}

/** The stored value is the contract; the reviewer reads the label. */
function readable(field: string, value: string): string {
  if (field !== 'monthlySearchInvestment') return value
  return monthlySearchInvestmentOptions.find((option) => option.value === value)?.label ?? value
}

export function buildNotificationSubject(record: LeadSubmissionRecord): string {
  const organization = record.fields.organization ?? 'unknown organization'
  return `${FORM_TITLES[record.formName]}: ${organization}`
}

export function buildNotificationBody(record: LeadSubmissionRecord): string {
  const lines = [
    `${FORM_TITLES[record.formName]}`,
    `Reference: ${record.requestId}`,
    `Received: ${record.submittedAt}`,
    '',
  ]

  for (const [field, value] of Object.entries(record.fields)) {
    lines.push(`${FIELD_TITLES[field] ?? field}: ${readable(field, value)}`)
  }

  lines.push(
    '',
    `Marketing opt-in: ${record.marketingOptIn ? 'yes' : 'no'}`,
    `Privacy Notice version: ${record.privacyNoticeVersion}`,
    `Form copy version: ${record.formCopyVersion}`,
  )

  const attribution = Object.entries(record.attribution).filter(([, value]) => Boolean(value))

  if (attribution.length > 0) {
    lines.push('', 'Attribution')
    for (const [key, value] of attribution) lines.push(`${key}: ${String(value)}`)
  }

  return lines.join('\n')
}

async function sendNotificationEmail(record: LeadSubmissionRecord): Promise<DeliveryChannelStatus> {
  const apiKey = env.RESEND_API_KEY
  const from = env.LEAD_FROM_EMAIL
  const to = env.LEAD_NOTIFICATION_EMAIL

  if (!apiKey || !from || !to) {
    // Named so the operator can fix it without reading the code. The values
    // themselves are never printed.
    const missing = [
      apiKey ? null : 'RESEND_API_KEY',
      from ? null : 'LEAD_FROM_EMAIL',
      to ? null : 'LEAD_NOTIFICATION_EMAIL',
    ].filter(Boolean)

    console.error(
      `[leads] ${record.requestId} was not delivered: email is unconfigured. Set ${missing.join(', ')}.`,
    )
    return 'skipped'
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: record.fields.workEmail,
        subject: buildNotificationSubject(record),
        text: buildNotificationBody(record),
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error(`[leads] ${record.requestId} email delivery failed with ${response.status}.`)
      return 'failed'
    }

    return 'success'
  } catch {
    // The caught value can carry the submitted address, so it is not logged.
    console.error(`[leads] ${record.requestId} email delivery threw.`)
    return 'failed'
  }
}

async function sendCrmWebhook(record: LeadSubmissionRecord): Promise<DeliveryChannelStatus> {
  const url = env.CRM_WEBHOOK_URL
  if (!url) return 'skipped'

  const body = JSON.stringify(record)
  const headers: Record<string, string> = { 'content-type': 'application/json' }

  if (env.CRM_WEBHOOK_SECRET) {
    headers['x-hendricks-signature'] = createHmac('sha256', env.CRM_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')
  }

  try {
    const response = await fetch(url, { method: 'POST', headers, body, cache: 'no-store' })

    if (!response.ok) {
      console.error(`[leads] ${record.requestId} CRM webhook failed with ${response.status}.`)
      return 'failed'
    }

    return 'success'
  } catch {
    console.error(`[leads] ${record.requestId} CRM webhook threw.`)
    return 'failed'
  }
}

async function appendToCrmSheet(record: LeadSubmissionRecord): Promise<DeliveryChannelStatus> {
  return appendSheetRow({
    tab: CRM_TABS.leads,
    values: leadRow(record),
    requestId: record.requestId,
  })
}

/**
 * Delivers to every configured destination and reports what happened.
 *
 * The three run in parallel because none depends on another. Public success
 * needs one durable destination (15 section 4), and it also needs the email
 * adapter to exist: D-H puts a named human on `brandon@hendricks.ai`, and a
 * `skipped` email means the three Resend variables are unset, which is launch
 * blocker 1 rather than a transient fault. A CRM-only success would show the
 * visitor a confirmation while nothing reached the monitored inbox, so an
 * unconfigured email channel fails closed. A configured channel that failed is
 * different: it is a logged operator problem, and the CRM holding the lead is
 * the partial success the spec describes.
 */
export async function deliverLead(record: LeadSubmissionRecord): Promise<DeliveryResult> {
  const [email, crmWebhook, sheet] = await Promise.all([
    sendNotificationEmail(record),
    sendCrmWebhook(record),
    appendToCrmSheet(record),
  ])

  const delivered =
    email !== 'skipped' && (email === 'success' || crmWebhook === 'success' || sheet === 'success')

  if (delivered && (email === 'failed' || crmWebhook === 'failed' || sheet === 'failed')) {
    console.error(
      `[leads] ${record.requestId} was delivered partially: email ${email}, crm ${crmWebhook}, sheet ${sheet}.`,
    )
  }

  return { email, crmWebhook, sheet, delivered }
}

/**
 * Records the marketing choice.
 *
 * The restricted store is blocker 12 and does not exist, so an opt-in is
 * refused rather than written somewhere it does not belong. It never fails the
 * submission: the visitor asked a question and gave permission for something
 * else, and losing the question over the permission would be the wrong trade.
 * Recurring marketing stays disabled until the store lands, which docs/16
 * section 12 already requires for its own reason.
 */
export function recordMarketingConsent(record: LeadSubmissionRecord): void {
  if (!record.marketingOptIn) return

  console.info(
    `[leads] ${record.requestId} selected the marketing opt-in. The restricted consent store is not configured, so no marketing record was created and no recurring email is enabled.`,
  )
}
