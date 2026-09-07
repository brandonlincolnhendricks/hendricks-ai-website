import type { VisibilityCheckResult } from '@/lib/visibility-check/schema'

/**
 * The state a run returns to the form. A module of its own because a
 * `'use server'` file may export nothing but async functions, and both the
 * action and the client island need this shape.
 *
 * Every field is safe to render. `result` is the reading itself, which is the
 * whole point of the page; nothing in it is a provider error or a credential.
 */

export type VisibilityCheckStatus =
  | 'idle'
  | 'complete'
  | 'invalid'
  | 'rate-limited'
  | 'capped'
  | 'unavailable'
  | 'duplicate'
  | 'error'

export type VisibilityCheckState = {
  status: VisibilityCheckStatus
  fieldErrors?: Record<string, string>
  /** Echoed so a recoverable error never costs the visitor what they typed. */
  values?: Record<string, string>
  retryAfterSeconds?: number
  result?: VisibilityCheckResult
}

export const initialVisibilityCheckState: VisibilityCheckState = { status: 'idle' }
