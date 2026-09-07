import { z } from 'zod'

import { normalizeWebsite } from '@/lib/forms/lead-schema'

/**
 * The input contract of the AI Visibility Check (Brandon, 2026-09-07).
 *
 * Six answers and the same three anti-abuse controls the lead forms carry. The
 * market phrase is the load-bearing field: the five questions are built from
 * it, so its bounds are what keep a probe from being an arbitrary prompt
 * relayed to four paid endpoints under the Hendricks account.
 *
 * Every message names the field and the fix, because it renders inline and in
 * the error summary and has to make sense read alone.
 */

const requiredText = (max: number, message: string) => z.string().trim().min(1, message).max(max)

/**
 * A market phrase is a noun phrase, not a prompt. The upper bound and the
 * character class keep it one: no line breaks, no angle brackets, no braces,
 * and short enough that the templates around it still read as a question.
 */
const marketPhrase = z
  .string()
  .trim()
  .min(4, 'Describe what you sell in a few words, for example commercial HVAC maintenance.')
  .max(120, 'Keep the description under 120 characters.')
  .regex(/^[^\n\r<>{}[\]`]+$/, 'Use plain words, without brackets or line breaks.')

const locationPhrase = z
  .string()
  .trim()
  .max(80, 'Keep the location under 80 characters.')
  .regex(/^[^\n\r<>{}[\]`]*$/, 'Use plain words, without brackets or line breaks.')
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional()

const website = z
  .string()
  .trim()
  .min(1, 'Enter your website address, for example https://example.com.')
  .max(500)
  .transform(normalizeWebsite)
  .pipe(z.url({ error: 'Enter a website address, for example https://example.com.' }))

export const visibilityCheckInputSchema = z.object({
  brandName: requiredText(80, 'Enter the brand name the way a customer would say it.'),
  website,
  market: marketPhrase,
  location: locationPhrase,
  name: requiredText(120, 'Enter your name.'),
  workEmail: z
    .string()
    .trim()
    .max(254)
    .pipe(z.email('Enter a valid email address, for example name@company.com.')),
  marketingOptIn: z.boolean().default(false),
  honeypot: z.string().max(0),
  startedAt: z.number().int().positive(),
})

export type VisibilityCheckInput = z.infer<typeof visibilityCheckInputSchema>

/** The four systems, in the order the site names them everywhere. */
export const engineIds = ['google_aio', 'chat_gpt', 'perplexity', 'gemini'] as const
export type EngineId = (typeof engineIds)[number]

/** The public product name, as a buyer would type it. */
export const engineNames: Record<EngineId, string> = {
  google_aio: 'Google AI Overviews',
  chat_gpt: 'ChatGPT',
  perplexity: 'Perplexity',
  gemini: 'Gemini',
}

export type CellStatus = 'measured' | 'failed'

export type Cell = {
  engine: EngineId
  questionId: string
  status: CellStatus
  /**
   * Whether the answer text named the brand. `null` on Google AI Overviews,
   * where the panel text is not read (see engines.ts), and on a failed cell.
   */
  mentioned: boolean | null
  /** Whether a cited source resolved to the brand's own domain. False on a failed cell. */
  cited: boolean
  /** Every domain the answer cited, owned or not, deduped, in order. */
  citedDomains: string[]
  citationCount: number
  answerLength: number
  /** Google AI Overviews only: whether a panel rendered at all. */
  panel?: 'shown' | 'none'
  /** Read from the API response, never estimated. USD. */
  cost: number
  /** A category, never the provider's message. */
  failure?: 'timeout' | 'api' | 'unconfigured'
}

export type Question = {
  id: string
  shape: string
  text: string
}

export type Summary = {
  cellsTotal: number
  cellsMeasured: number
  cellsFailed: number
  /** Cells where a mention could be read: measured cells on the three assistants. */
  mentionDenominator: number
  mentioned: number
  citedDenominator: number
  cited: number
  /** Domains ranked by the number of measured cells that cited them. */
  topDomains: { domain: string; cells: number; owned: boolean }[]
  reading: 'cited' | 'mentioned' | 'absent' | 'unmeasured'
  /** One sentence, with its denominators and its run time. */
  sentence: string
  costUsd: number
}

export type VisibilityCheckResult = {
  requestId: string
  runAt: string
  brandName: string
  website: string
  domain: string
  market: string
  location?: string
  questions: Question[]
  cells: Cell[]
  summary: Summary
}
