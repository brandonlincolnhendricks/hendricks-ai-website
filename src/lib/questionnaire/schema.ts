import { z } from 'zod'

/**
 * Client discovery questionnaires (Brandon, 2026-09-21).
 *
 * Each one is a standalone, noindex page with its own copy, served from
 * `public/questionnaire/` behind a rewrite in `next.config.ts`. This registry
 * is the allowlist the backup endpoint checks, so a request can only ever
 * write rows for a questionnaire that exists.
 *
 * These are private intake forms for individual clients, not positioning. They
 * are unlinked, absent from `routes.ts`, the sitemap and `llms.txt`, and carry
 * `noindex` in both the page and the response header.
 */
export const QUESTIONNAIRES = {
  'brandon-washington': {
    label: 'Brandon Washington',
    title: 'Restaurant AI Agent Questionnaire',
  },
} as const

export type QuestionnaireSlug = keyof typeof QUESTIONNAIRES

export const QUESTIONNAIRE_SLUGS = Object.keys(QUESTIONNAIRES) as [
  QuestionnaireSlug,
  ...QuestionnaireSlug[],
]

export function isQuestionnaireSlug(value: string): value is QuestionnaireSlug {
  return Object.prototype.hasOwnProperty.call(QUESTIONNAIRES, value)
}

/** 128 random bits, hex. The draft id is the only key to a saved draft, so it must not be guessable. */
export const DRAFT_ID_PATTERN = /^[a-f0-9]{32}$/

/**
 * Size ceilings. A Sheets cell holds 50,000 characters, and the readable
 * answers and the restore state each land in one cell, so both stop short of
 * it. The body ceiling is checked before parsing.
 */
export const MAX_BODY_CHARS = 200_000
export const MAX_CELL_CHARS = 45_000

const answerName = z.string().min(1).max(160)
const answerValue = z.string().max(8_000)

export const questionnaireSaveSchema = z
  .object({
    slug: z.enum(QUESTIONNAIRE_SLUGS),
    draftId: z.string().regex(DRAFT_ID_PATTERN),
    /** `backup` is the automatic save; `final` is the Submit button. */
    kind: z.enum(['backup', 'final']),
    /** The browser's clock when the snapshot was taken, in milliseconds. */
    savedAt: z.number().int().positive(),
    answered: z.number().int().min(0).max(2_000),
    /** Question and answer pairs in page order, for the people reading the sheet and the email. */
    answers: z.array(z.tuple([answerName, answerValue])).max(400),
    /** The exact control state the page restores from: `v::<name>` for text, `c::<name>::<value>` for a checked box. */
    state: z.record(z.string().min(1).max(400), z.union([z.string().max(8_000), z.literal(1)])),
  })
  .refine((value) => Object.keys(value.state).length <= 600, {
    message: 'Too many fields.',
    path: ['state'],
  })
  .refine((value) => JSON.stringify(value.state).length <= MAX_CELL_CHARS, {
    message: 'The draft is too large to store.',
    path: ['state'],
  })
  .refine(
    (value) => value.answers.reduce((total, [name, text]) => total + name.length + text.length + 3, 0) <= MAX_CELL_CHARS,
    { message: 'The answers are too long to store.', path: ['answers'] },
  )

export type QuestionnaireSave = z.infer<typeof questionnaireSaveSchema>
