import 'server-only'

import { env } from '@/lib/env'
import { hashIdentifier } from '@/lib/forms/rate-limit'
import { withSharedStore } from '@/lib/forms/shared-store'

/**
 * Spend ceilings for the free check. Each run is twenty paid probes, so these
 * are money limits wearing the rate limiter's interface.
 *
 * Two buckets. The visitor bucket is per hashed identifier, the same hash the
 * lead forms use, so no address is stored. The daily bucket is one key for the
 * whole site per UTC day and is what caps the worst day at a known figure:
 * `VISIBILITY_CHECK_DAILY_CAP` runs at roughly seventy cents each.
 *
 * Both fall back to the in-memory store when no shared store is configured,
 * which is per instance and therefore a floor rather than a ceiling. That is
 * the same honest degradation the lead forms accept, and it is logged there.
 */

/** Three runs per visitor per day. Enough to check a brand and two competitors. */
export const VISITOR_LIMIT = { limit: 3, windowSeconds: 24 * 60 * 60 } as const

const VISITOR_PREFIX = 'hx:rl:vischeck:v1:'
const DAILY_PREFIX = 'hx:cap:vischeck:v1:'

export type CheckAllowance =
  | { allowed: true }
  | { allowed: false; reason: 'visitor'; retryAfterSeconds: number }
  | { allowed: false; reason: 'daily' }

export async function checkAllowance({
  identifier,
  now = new Date(),
}: {
  identifier: string
  now?: Date
}): Promise<CheckAllowance> {
  const visitorKey = `${VISITOR_PREFIX}${hashIdentifier(identifier)}`
  const visitor = await withSharedStore(
    (store) => store.increment(visitorKey, VISITOR_LIMIT.windowSeconds),
    'the visibility check visitor limit',
  )

  if (visitor.count > VISITOR_LIMIT.limit) {
    return {
      allowed: false,
      reason: 'visitor',
      retryAfterSeconds: Math.max(1, Math.ceil(visitor.ttlMs / 1000)),
    }
  }

  const day = now.toISOString().slice(0, 10)
  const daily = await withSharedStore(
    (store) => store.increment(`${DAILY_PREFIX}${day}`, 24 * 60 * 60),
    'the visibility check daily cap',
  )

  if (daily.count > env.VISIBILITY_CHECK_DAILY_CAP) {
    console.error(`[visibility-check] daily cap of ${env.VISIBILITY_CHECK_DAILY_CAP} reached on ${day}.`)
    return { allowed: false, reason: 'daily' }
  }

  return { allowed: true }
}
