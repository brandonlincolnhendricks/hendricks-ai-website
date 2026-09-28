'use server'

import { headers } from 'next/headers'

import { buildAttribution } from '@/lib/forms/attribution'
import { checkAntiAbuse } from '@/lib/forms/anti-abuse'
import { claimSubmission, idempotencyKey, releaseSubmission } from '@/lib/forms/idempotency'
import {
  deliverLead,
  deliveryChannels,
  generateLeadRequestId,
  recordMarketingConsent,
} from '@/lib/forms/lead-delivery'
import type { LeadFormState } from '@/lib/forms/lead-form-state'
import { buildSubmissionRecord } from '@/lib/forms/lead-record'
import {
  audienceTypeOf,
  leadInputSchema,
  type LeadFormName,
  type LeadInput,
} from '@/lib/forms/lead-schema'
import { checkRateLimit, identifierFromHeaders } from '@/lib/forms/rate-limit'

/**
 * The one submission path behind the three lead forms (15 sections 4 to 6).
 *
 * A server action rather than a route handler so every form posts without
 * JavaScript (16 FM-12). The three exported entry points differ only in the
 * form name they bind, which is bound here rather than read from the request:
 * a client that names its own form could aim a Diagnostic application at the
 * contact schema and skip half the required fields.
 *
 * The order of the checks is the contract. Rate limit first, because a limited
 * request should cost nothing else. Validation before anti-abuse, because the
 * honeypot and the timing floor are read out of the parsed input. Idempotency
 * before delivery, so two instances cannot each send the same lead, with the
 * claim released again when nothing durable accepted it.
 */

/** Never echoed back into the rendered form. */
const NOT_ECHOED = new Set(['honeypot', 'startedAt', 'attribution'])

function readValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {}

  for (const [key, value] of formData.entries()) {
    if (NOT_ECHOED.has(key)) continue
    if (typeof value === 'string') values[key] = value
  }

  return values
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

function optional(formData: FormData, name: string): string | undefined {
  const value = text(formData, name)
  return value.length > 0 ? value : undefined
}

/**
 * Builds the parse input for one form.
 *
 * Written out per form rather than passing `Object.fromEntries(formData)`
 * through: an action is a public endpoint, and a schema that reads whatever
 * arrives will happily accept a field the form does not render.
 */
function readInput(formName: LeadFormName, formData: FormData): Record<string, unknown> {
  const shared = {
    formName,
    firstName: text(formData, 'firstName'),
    lastName: text(formData, 'lastName'),
    workEmail: text(formData, 'workEmail'),
    organization: text(formData, 'organization'),
    role: text(formData, 'role'),
    primaryQuestion: text(formData, 'primaryQuestion'),
    currentStack: text(formData, 'currentStack'),
    desiredTiming: text(formData, 'desiredTiming'),
    additionalContext: text(formData, 'additionalContext'),
    marketingOptIn: formData.get('marketingOptIn') === 'on',
    honeypot: text(formData, 'honeypot'),
    startedAt: Number(formData.get('startedAt') ?? 0),
  }

  if (formName === 'diagnostic') {
    return {
      ...shared,
      audienceType: text(formData, 'audienceType'),
      website: text(formData, 'website'),
      primaryMarket: text(formData, 'primaryMarket'),
      monthlySearchInvestment: text(formData, 'monthlySearchInvestment'),
    }
  }

  if (formName === 'agency-partnership') {
    return {
      ...shared,
      website: text(formData, 'website'),
      primaryMarket: text(formData, 'primaryMarket'),
      relevantAccounts: text(formData, 'relevantAccounts'),
      preferredModel: text(formData, 'preferredModel'),
    }
  }

  return {
    ...shared,
    audienceType: text(formData, 'audienceType'),
    website: optional(formData, 'website'),
    primaryMarket: text(formData, 'primaryMarket'),
  }
}

async function handle(
  formName: LeadFormName,
  formData: FormData,
): Promise<LeadFormState> {
  const values = readValues(formData)
  const requestHeaders = await headers()

  const rateLimit = await checkRateLimit({
    identifier: identifierFromHeaders(requestHeaders),
  })

  if (!rateLimit.allowed) {
    return { status: 'rate-limited', values, retryAfterSeconds: rateLimit.retryAfterSeconds }
  }

  const parsed = leadInputSchema.safeParse(readInput(formName, formData))

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}

    for (const issue of parsed.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string' && !fieldErrors[field]) fieldErrors[field] = issue.message
    }

    // A honeypot or timing failure is reported as the generic error rather than
    // as a field message. Naming the control that rejected a submission is how
    // that control gets bypassed.
    if (fieldErrors.honeypot || fieldErrors.startedAt) return { status: 'error', values }

    return { status: 'invalid', fieldErrors, values }
  }

  const input: LeadInput = parsed.data

  const freeText = [
    input.role,
    input.primaryMarket,
    input.primaryQuestion,
    input.currentStack,
    input.additionalContext,
  ]

  if (
    !checkAntiAbuse({ honeypot: input.honeypot, startedAt: input.startedAt, freeText }).ok
  ) {
    return { status: 'error', values }
  }

  const key = idempotencyKey({
    formName,
    workEmail: input.workEmail,
    organization: input.organization,
  })

  const { firstSubmission } = await claimSubmission(key)

  if (!firstSubmission) {
    // The same success, nothing re-sent (docs/15 section 5). No
    // `deliveryChannels`: the first submission named them and this one sent to
    // nothing, and the parameter is optional in the analytics CSV, so an
    // omission is inside the vocabulary where a word like "duplicate" is not.
    return { status: 'success', audienceType: audienceTypeOf(input) }
  }

  const attribution = buildAttribution({
    storedRaw: text(formData, 'attribution') || null,
    referer: requestHeaders.get('referer'),
  })

  const record = buildSubmissionRecord(
    input,
    { requestId: generateLeadRequestId() },
    attribution,
  )

  const result = await deliverLead(record).catch(() => {
    // The caught value can carry submitted field values, so it is not logged.
    console.error(`[leads] ${record.requestId} delivery threw before any destination replied.`)
    return null
  })

  if (!result?.delivered) {
    // Nothing durable accepted it, so the bucket goes back. Holding it would
    // answer every retry inside the window with a success that never happened.
    await releaseSubmission(key)
    return { status: 'delivery-error', values }
  }

  recordMarketingConsent(record)

  return {
    status: 'success',
    deliveryChannels: deliveryChannels(result),
    audienceType: audienceTypeOf(input),
  }
}

export async function submitDiagnosticApplication(
  _previous: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  return handle('diagnostic', formData)
}

export async function submitAgencyPartnershipInquiry(
  _previous: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  return handle('agency-partnership', formData)
}

export async function submitContactInquiry(
  _previous: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  return handle('contact', formData)
}
