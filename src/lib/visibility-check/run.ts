import 'server-only'

import { randomInt } from 'node:crypto'

import { probe } from '@/lib/visibility-check/engines'
import { buildQuestions } from '@/lib/visibility-check/questions'
import {
  engineIds,
  type Cell,
  type VisibilityCheckInput,
  type VisibilityCheckResult,
} from '@/lib/visibility-check/schema'
import { brandDomain, summarize } from '@/lib/visibility-check/scoring'

/**
 * One run of the AI Visibility Check: five questions on four systems, twenty
 * cells, in one capture.
 *
 * Every probe is started at once. The slowest cell is usually the ChatGPT
 * endpoint at thirty to ninety seconds, so running the twenty in series would
 * blow through any function ceiling; in parallel the run takes about as long
 * as its slowest cell. Nothing is retried: the run is one capture, and a cell
 * that failed is reported as failed so the denominator says so.
 */

export function generateCheckRequestId(now: Date = new Date()): string {
  const suffix = String(randomInt(0, 1_000_000)).padStart(6, '0')
  return `CHECK-${now.getUTCFullYear()}-${suffix}`
}

export async function runVisibilityCheck(
  input: Pick<VisibilityCheckInput, 'brandName' | 'website' | 'market' | 'location'>,
  { requestId, now = new Date() }: { requestId: string; now?: Date },
): Promise<VisibilityCheckResult> {
  const domain = brandDomain(input.website)
  const questions = buildQuestions(input.market, input.location)
  const runAt = now.toISOString()

  const cells: Cell[] = await Promise.all(
    questions.flatMap((question) =>
      engineIds.map((engine) =>
        probe({ engine, question, brandName: input.brandName, domain }),
      ),
    ),
  )

  return {
    requestId,
    runAt,
    brandName: input.brandName,
    website: input.website,
    domain,
    market: input.market,
    location: input.location,
    questions,
    cells,
    summary: summarize({ cells, brandName: input.brandName, domain, runAt }),
  }
}
