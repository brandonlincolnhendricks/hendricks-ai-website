/**
 * Detects the random-string fill that form bots use (Brandon, 2026-09-27).
 *
 * The submissions that prompted this answered every free-text field with one
 * run of letters and scattered capitals ("rAiwZymmdTABxHwSjTW"). A person does
 * not write that even once, and never in several fields of the same form. The
 * test is a single token of twelve or more letters that flips case at least
 * four times; real product names ("HubSpot", "BigQuery") flip once or twice
 * and are short.
 *
 * Two such fields are required before a submission is treated as a bot, so
 * one odd value from a real visitor never costs them the lead. Free of the
 * `server-only` marker so the rule can be tested directly.
 */

const SINGLE_LETTER_TOKEN = /^[A-Za-z]{12,}$/

function caseFlips(value: string): number {
  let flips = 0
  for (let i = 1; i < value.length; i += 1) {
    const previousUpper = value[i - 1] === value[i - 1].toUpperCase()
    const currentUpper = value[i] === value[i].toUpperCase()
    if (previousUpper !== currentUpper) flips += 1
  }
  return flips
}

export function isRandomString(value: string | undefined): boolean {
  if (!value) return false
  const trimmed = value.trim()
  return SINGLE_LETTER_TOKEN.test(trimmed) && caseFlips(trimmed) >= 4
}

export const GIBBERISH_FIELD_THRESHOLD = 2

export function looksLikeGibberish(values: (string | undefined)[]): boolean {
  return values.filter(isRandomString).length >= GIBBERISH_FIELD_THRESHOLD
}
