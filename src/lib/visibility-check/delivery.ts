import 'server-only'

import { createHmac } from 'node:crypto'

import { appendSheetRow, CRM_TABS } from '@/lib/crm/google-sheets'
import { visibilityCheckRow } from '@/lib/crm/rows'
import { env } from '@/lib/env'
import type { LeadAttribution } from '@/lib/forms/attribution'
import { engineNames, type VisibilityCheckResult } from '@/lib/visibility-check/schema'

/**
 * What happens to a reading once it exists: Brandon is emailed, the CRM sheet
 * gets a row, the optional webhook gets the record, and the visitor gets a
 * copy only when that is switched on.
 *
 * Delivery never hides the reading. The visitor waited two minutes for twenty
 * paid probes and the result is on screen whatever happens here; a delivery
 * failure is an operator problem, logged with the request id, and never a
 * reason to show an error over a reading that exists.
 */

export type CheckLead = {
  name: string
  workEmail: string
  marketingOptIn: boolean
  attribution: LeadAttribution
  submittedAt: string
}

export type CheckDeliveryResult = {
  email: 'success' | 'failed' | 'skipped'
  sheet: 'success' | 'failed' | 'skipped'
  crmWebhook: 'success' | 'failed' | 'skipped'
  visitorCopy: 'success' | 'failed' | 'skipped'
}

function cellWord(cell: VisibilityCheckResult['cells'][number]): string {
  if (cell.status === 'failed') return 'failed'
  if (cell.cited) return 'CITED'
  if (cell.mentioned) return 'mentioned'
  if (cell.engine === 'google_aio') return cell.panel === 'none' ? 'no panel' : 'not cited'
  return 'absent'
}

/** The grid as fixed-width text: questions down, systems across. */
export function gridText(result: VisibilityCheckResult): string {
  const engines = ['google_aio', 'chat_gpt', 'perplexity', 'gemini'] as const
  const lines = [`${'Question'.padEnd(6)} ${engines.map((id) => engineNames[id].padEnd(20)).join(' ')}`]

  for (const question of result.questions) {
    const cells = engines.map((engine) => {
      const cell = result.cells.find((c) => c.engine === engine && c.questionId === question.id)
      return (cell ? cellWord(cell) : 'missing').padEnd(20)
    })
    lines.push(`${question.id.padEnd(6)} ${cells.join(' ')}`)
  }

  return lines.join('\n')
}

export function buildCheckSubject(result: VisibilityCheckResult): string {
  const s = result.summary
  return `AI Visibility Check: ${result.brandName} (${result.domain}), cited ${s.cited} of ${s.citedDenominator}`
}

export function buildCheckBody(result: VisibilityCheckResult, lead: CheckLead): string {
  const s = result.summary
  const lines = [
    'AI Visibility Check',
    `Reference: ${result.requestId}`,
    `Run at: ${result.runAt}`,
    '',
    `Name: ${lead.name}`,
    `Email: ${lead.workEmail}`,
    `Brand: ${result.brandName}`,
    `Website: ${result.website}`,
    `Domain: ${result.domain}`,
    `Market phrase: ${result.market}`,
    `Location: ${result.location ?? 'not given'}`,
    `Marketing opt-in: ${lead.marketingOptIn ? 'yes' : 'no'}`,
    '',
    'Reading',
    s.sentence,
    `Cited: ${s.cited} of ${s.citedDenominator}. Mentioned: ${s.mentioned} of ${s.mentionDenominator}. Measured: ${s.cellsMeasured} of ${s.cellsTotal}. Cost: $${s.costUsd.toFixed(2)}.`,
    '',
    'Questions',
    ...result.questions.map((question) => `${question.id} (${question.shape}): ${question.text}`),
    '',
    'Grid',
    gridText(result),
    '',
    'Who was cited instead (cells)',
    ...(s.topDomains.length > 0
      ? s.topDomains.map((entry) => `${entry.domain}: ${entry.cells}${entry.owned ? ' (own domain)' : ''}`)
      : ['No citations were returned in this run.']),
  ]

  const attribution = Object.entries(lead.attribution).filter(([, value]) => Boolean(value))
  if (attribution.length > 0) {
    lines.push('', 'Attribution')
    for (const [key, value] of attribution) lines.push(`${key}: ${String(value)}`)
  }

  return lines.join('\n')
}

/**
 * The visitor's copy, when it is switched on. The same reading in the same
 * words, with no sales copy attached: the page they ran it on carries the CTA.
 */
export function buildVisitorBody(result: VisibilityCheckResult): string {
  const s = result.summary
  return [
    `Your AI Visibility Check for ${result.brandName}`,
    `Reference: ${result.requestId}`,
    `Run at: ${result.runAt}`,
    '',
    s.sentence,
    '',
    'Questions asked',
    ...result.questions.map((question) => `${question.id}: ${question.text}`),
    '',
    'Grid',
    gridText(result),
    '',
    'Absence is not yet a diagnosis. A single answer screen is one observation under one set of conditions.',
    '',
    'Hendricks reviews every reading by hand and follows up by email.',
    `${env.NEXT_PUBLIC_SITE_URL}/ai-visibility-check`,
  ].join('\n')
}

async function sendEmail({
  to,
  replyTo,
  subject,
  text,
  requestId,
  label,
}: {
  to: string
  replyTo?: string
  subject: string
  text: string
  requestId: string
  label: string
}): Promise<'success' | 'failed' | 'skipped'> {
  const apiKey = env.RESEND_API_KEY
  const from = env.LEAD_FROM_EMAIL

  if (!apiKey || !from) {
    console.error(`[visibility-check] ${requestId} ${label} email skipped: RESEND_API_KEY or LEAD_FROM_EMAIL unset.`)
    return 'skipped'
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: [to], ...(replyTo ? { reply_to: replyTo } : {}), subject, text }),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error(`[visibility-check] ${requestId} ${label} email failed with ${response.status}.`)
      return 'failed'
    }

    return 'success'
  } catch {
    console.error(`[visibility-check] ${requestId} ${label} email threw.`)
    return 'failed'
  }
}

async function sendWebhook(
  result: VisibilityCheckResult,
  lead: CheckLead,
): Promise<'success' | 'failed' | 'skipped'> {
  const url = env.CRM_WEBHOOK_URL
  if (!url) return 'skipped'

  const body = JSON.stringify({ kind: 'visibility-check', lead, result })
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (env.CRM_WEBHOOK_SECRET) {
    headers['x-hendricks-signature'] = createHmac('sha256', env.CRM_WEBHOOK_SECRET).update(body).digest('hex')
  }

  try {
    const response = await fetch(url, { method: 'POST', headers, body, cache: 'no-store' })
    if (!response.ok) {
      console.error(`[visibility-check] ${result.requestId} CRM webhook failed with ${response.status}.`)
      return 'failed'
    }
    return 'success'
  } catch {
    console.error(`[visibility-check] ${result.requestId} CRM webhook threw.`)
    return 'failed'
  }
}

export async function deliverCheck(
  result: VisibilityCheckResult,
  lead: CheckLead,
): Promise<CheckDeliveryResult> {
  const s = result.summary

  const [email, sheet, crmWebhook, visitorCopy] = await Promise.all([
    env.LEAD_NOTIFICATION_EMAIL
      ? sendEmail({
          to: env.LEAD_NOTIFICATION_EMAIL,
          replyTo: lead.workEmail,
          subject: buildCheckSubject(result),
          text: buildCheckBody(result, lead),
          requestId: result.requestId,
          label: 'notification',
        })
      : Promise.resolve<'skipped'>('skipped'),
    appendSheetRow({
      tab: CRM_TABS.visibilityChecks,
      requestId: result.requestId,
      values: visibilityCheckRow({
        submittedAt: lead.submittedAt,
        requestId: result.requestId,
        name: lead.name,
        workEmail: lead.workEmail,
        brandName: result.brandName,
        website: result.website,
        domain: result.domain,
        market: result.market,
        location: result.location ?? '',
        cellsMeasured: s.cellsMeasured,
        cellsTotal: s.cellsTotal,
        mentioned: s.mentioned,
        mentionDenominator: s.mentionDenominator,
        cited: s.cited,
        citedDenominator: s.citedDenominator,
        reading: s.reading,
        topDomains: s.topDomains.map((entry) => `${entry.domain} (${entry.cells})`),
        questions: result.questions.map((question) => question.text),
        marketingOptIn: lead.marketingOptIn,
        attribution: lead.attribution,
        resultJson: JSON.stringify(result),
      }),
    }),
    sendWebhook(result, lead),
    env.VISIBILITY_CHECK_SEND_VISITOR_COPY === 'true'
      ? sendEmail({
          to: lead.workEmail,
          subject: `Your AI Visibility Check for ${result.brandName}`,
          text: buildVisitorBody(result),
          requestId: result.requestId,
          label: 'visitor copy',
        })
      : Promise.resolve<'skipped'>('skipped'),
  ])

  if (email !== 'success' && sheet !== 'success') {
    console.error(
      `[visibility-check] ${result.requestId} reached no durable destination: email ${email}, sheet ${sheet}. The reading was shown to the visitor.`,
    )
  }

  return { email, sheet, crmWebhook, visitorCopy }
}
