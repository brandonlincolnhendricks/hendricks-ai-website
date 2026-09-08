'use server'

import { headers } from 'next/headers'

import { checkAntiAbuse } from '@/lib/forms/anti-abuse'
import { buildAttribution } from '@/lib/forms/attribution'
import { IDEMPOTENCY_WINDOW_SECONDS } from '@/lib/forms/limits'
import { hashIdentifier, identifierFromHeaders } from '@/lib/forms/rate-limit'
import { withSharedStore } from '@/lib/forms/shared-store'
import { deliverCheck } from '@/lib/visibility-check/delivery'
import { engineIsConfigured } from '@/lib/visibility-check/engines'
import { checkAllowance } from '@/lib/visibility-check/limits'
import { generateCheckRequestId, runVisibilityCheck } from '@/lib/visibility-check/run'
import { visibilityCheckInputSchema } from '@/lib/visibility-check/schema'
import type { VisibilityCheckState } from '@/lib/visibility-check/state'

/**
 * The one submission path behind the AI Visibility Check.
 *
 * A server action rather than a route handler, for the same reason the lead
 * forms use one: the form posts without JavaScript and the page re-renders
 * with the reading. The cost is that the browser waits for the whole run,
 * which the pending copy on the form says plainly.
 *
 * Order of the checks is the contract. Allowance first, because a refused run
 * must cost nothing. Validation before anti-abuse, because the honeypot and
 * the timing floor are read out of the parsed input. The duplicate bucket
 * before the run, so a double submit cannot buy the same twenty probes twice.
 */

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

function duplicateKey(workEmail: string, website: string, now = Date.now()): string {
  const bucket = Math.floor(now / (IDEMPOTENCY_WINDOW_SECONDS * 1000))
  const parts = [workEmail.trim().toLowerCase(), website.trim().toLowerCase(), String(bucket)].join(':')
  return `hx:idem:vischeck:v1:${hashIdentifier(parts)}`
}

export async function submitVisibilityCheck(
  _previous: VisibilityCheckState,
  formData: FormData,
): Promise<VisibilityCheckState> {
  const values = readValues(formData)
  const requestHeaders = await headers()

  const parsed = visibilityCheckInputSchema.safeParse({
    brandName: text(formData, 'brandName'),
    website: text(formData, 'website'),
    market: text(formData, 'market'),
    location: text(formData, 'location'),
    name: text(formData, 'name'),
    workEmail: text(formData, 'workEmail'),
    marketingOptIn: formData.get('marketingOptIn') === 'on',
    honeypot: text(formData, 'honeypot'),
    startedAt: Number(formData.get('startedAt') ?? 0),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string' && !fieldErrors[field]) fieldErrors[field] = issue.message
    }
    // A honeypot or timing failure is reported as the generic error rather
    // than as a field message, so the control that tripped is never named.
    if (fieldErrors.honeypot || fieldErrors.startedAt) return { status: 'error', values }
    return { status: 'invalid', fieldErrors, values }
  }

  const input = parsed.data

  if (!checkAntiAbuse({ honeypot: input.honeypot, startedAt: input.startedAt }).ok) {
    return { status: 'error', values }
  }

  if (!engineIsConfigured) return { status: 'unavailable', values }

  const allowance = await checkAllowance({ identifier: identifierFromHeaders(requestHeaders) })

  if (!allowance.allowed) {
    return allowance.reason === 'daily'
      ? { status: 'capped', values }
      : { status: 'rate-limited', values, retryAfterSeconds: allowance.retryAfterSeconds }
  }

  const key = duplicateKey(input.workEmail, input.website)
  const { claimed } = await withSharedStore(
    (store) => store.claim(key, 'running', IDEMPOTENCY_WINDOW_SECONDS),
    'the visibility check duplicate bucket',
  )

  if (!claimed) return { status: 'duplicate', values }

  const requestId = generateCheckRequestId()
  const now = new Date()

  let result
  try {
    result = await runVisibilityCheck(input, { requestId, now })
  } catch {
    await withSharedStore((store) => store.release(key), 'the visibility check duplicate bucket')
    console.error(`[visibility-check] ${requestId} run threw before a result existed.`)
    return { status: 'error', values }
  }

  const attribution = buildAttribution({
    storedRaw: text(formData, 'attribution') || null,
    referer: requestHeaders.get('referer'),
  })

  await deliverCheck(result, {
    name: input.name,
    workEmail: input.workEmail,
    marketingOptIn: input.marketingOptIn,
    attribution,
    submittedAt: now.toISOString(),
  }).catch(() => {
    console.error(`[visibility-check] ${requestId} delivery threw; the reading was still shown.`)
  })

  /**
   * A run in which no cell measured is not a reading, and showing twenty
   * "Not measured" cells as one would be. The lead has already been delivered
   * above, so Hendricks can run it by hand; the duplicate bucket is released
   * so the visitor can try again once the engines answer; and the visitor is
   * told what happened rather than handed a table of nothing.
   */
  if (result.summary.cellsMeasured === 0) {
    await withSharedStore((store) => store.release(key), 'the visibility check duplicate bucket')
    console.error(`[visibility-check] ${requestId} measured no cell; reported as failed to the visitor.`)
    return { status: 'failed', values }
  }

  return { status: 'complete', result }
}
