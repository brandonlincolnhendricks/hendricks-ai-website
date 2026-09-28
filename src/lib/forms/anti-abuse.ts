import 'server-only'

import { looksLikeGibberish } from '@/lib/forms/gibberish'
import { MAXIMUM_SUBMIT_SECONDS, MINIMUM_SUBMIT_SECONDS } from '@/lib/forms/limits'

/**
 * Accessible anti-abuse controls (docs/16 §15, `21-privacy-request.md`).
 *
 * An inaccessible CAPTCHA is explicitly prohibited, so the defences here are
 * ones a person never sees: a honeypot field that only an automated submitter
 * fills, and a minimum elapsed time between the form rendering and the
 * submission arriving. A third check reads the free-text answers for the
 * random-string fill bots use (see gibberish.ts).
 *
 * Both fail silently from the visitor's point of view — the caller reports a
 * generic error rather than naming the control, since telling a bot which check
 * it failed is how the check gets bypassed.
 */

export type AntiAbuseResult = { ok: true } | { ok: false; reason: 'honeypot' | 'timing' | 'gibberish' }

export function checkAntiAbuse({
  honeypot,
  startedAt,
  freeText = [],
  now = Date.now(),
}: {
  honeypot: string
  startedAt: number
  /** The visitor-typed answers, read for random-string fill. */
  freeText?: (string | undefined)[]
  now?: number
}): AntiAbuseResult {
  if (honeypot.length > 0) return { ok: false, reason: 'honeypot' }

  const elapsedSeconds = (now - startedAt) / 1000
  if (elapsedSeconds < MINIMUM_SUBMIT_SECONDS) return { ok: false, reason: 'timing' }
  if (elapsedSeconds > MAXIMUM_SUBMIT_SECONDS) return { ok: false, reason: 'timing' }

  if (looksLikeGibberish(freeText)) return { ok: false, reason: 'gibberish' }

  return { ok: true }
}
