import { cellText } from '@/lib/crm/rows'
import {
  QUESTIONNAIRES,
  type QuestionnaireSave,
  type QuestionnaireSlug,
} from '@/lib/questionnaire/schema'

/**
 * The row shape of the "Questionnaires" tab, in header order. Pure, so a unit
 * test can pin the columns: the header is the only contract the sheet has.
 *
 * Header, tab "Questionnaires" (9 columns):
 *   First saved (UTC), Last saved (UTC), Questionnaire, Draft ID, Status,
 *   Answers filled in, Saves, Answers, Restore state (JSON)
 *
 * One row per draft, overwritten in place by every backup, so the sheet shows
 * where each respondent has got to rather than a stream of snapshots. The
 * last column is what the page restores from when the same link is opened on
 * another device; the "Answers" column is the same content for a person.
 */
export const QUESTIONNAIRE_HEADER = [
  'First saved (UTC)',
  'Last saved (UTC)',
  'Questionnaire',
  'Draft ID',
  'Status',
  'Answers filled in',
  'Saves',
  'Answers',
  'Restore state (JSON)',
] as const

export const QUESTIONNAIRE_ROW_LENGTH = QUESTIONNAIRE_HEADER.length

export const QUESTIONNAIRE_STATUS = {
  inProgress: 'In progress',
  submitted: 'Submitted',
  editedAfterSubmit: 'Submitted, edited after',
} as const

const COLUMN = {
  firstSaved: 0,
  slug: 2,
  draftId: 3,
  status: 4,
  answered: 5,
  saves: 6,
  state: 8,
} as const

export type DraftState = Record<string, string | 1>

export type StoredDraft = {
  /** The 1-based sheet row, given rows read from A2 down. */
  rowNumber: number
  firstSaved: string
  status: string
  saves: number
  answered: number
  savedAt: number
  state: DraftState
}

/** The restore cell, parsed defensively: it is read back from a sheet a person can edit. */
export function parseStoredState(cell: string): { savedAt: number; state: DraftState } | null {
  try {
    const parsed = JSON.parse(cell) as { savedAt?: unknown; state?: unknown }
    if (typeof parsed.savedAt !== 'number' || !parsed.state || typeof parsed.state !== 'object') {
      return null
    }

    const state: DraftState = {}
    for (const [key, value] of Object.entries(parsed.state as Record<string, unknown>)) {
      if (typeof value === 'string' || value === 1) state[key] = value
    }

    return { savedAt: parsed.savedAt, state }
  } catch {
    return null
  }
}

/**
 * The draft's row. Two concurrent first saves can each append a row, so more
 * than one can match; the one holding the newest snapshot wins.
 */
export function findDraftRow(
  rows: readonly (readonly string[])[],
  slug: QuestionnaireSlug,
  draftId: string,
): StoredDraft | null {
  let best: StoredDraft | null = null

  rows.forEach((row, index) => {
    if (row[COLUMN.slug] !== slug || row[COLUMN.draftId] !== draftId) return

    const stored = parseStoredState(row[COLUMN.state] ?? '')
    if (!stored || (best && best.savedAt > stored.savedAt)) return

    best = {
      rowNumber: index + 2,
      firstSaved: row[COLUMN.firstSaved] ?? '',
      status: row[COLUMN.status] ?? '',
      saves: Number(row[COLUMN.saves]) || 0,
      answered: Number(row[COLUMN.answered]) || 0,
      savedAt: stored.savedAt,
      state: stored.state,
    }
  })

  return best
}

/** A submitted draft stays marked submitted, and says so when it changes afterwards. */
export function nextStatus(kind: QuestionnaireSave['kind'], existing?: string): string {
  if (kind === 'final') return QUESTIONNAIRE_STATUS.submitted
  if (
    existing === QUESTIONNAIRE_STATUS.submitted ||
    existing === QUESTIONNAIRE_STATUS.editedAfterSubmit
  ) {
    return QUESTIONNAIRE_STATUS.editedAfterSubmit
  }
  return QUESTIONNAIRE_STATUS.inProgress
}

export function readableAnswers(answers: QuestionnaireSave['answers']): string {
  return answers.map(([name, value]) => `${name}: ${value}`).join('\n')
}

export function questionnaireRow({
  input,
  existing,
  now,
  savedAt,
}: {
  input: QuestionnaireSave
  existing: StoredDraft | null
  now: Date
  savedAt: number
}): string[] {
  return [
    existing?.firstSaved || now.toISOString(),
    now.toISOString(),
    input.slug,
    input.draftId,
    nextStatus(input.kind, existing?.status),
    String(input.answered),
    String((existing?.saves ?? 0) + 1),
    cellText(readableAnswers(input.answers)),
    JSON.stringify({ savedAt, state: input.state }),
  ]
}

export function questionnaireEmailSubject(slug: QuestionnaireSlug): string {
  const questionnaire = QUESTIONNAIRES[slug]
  return `${questionnaire.title} - ${questionnaire.label}`
}

export function questionnaireEmailBody({
  input,
  requestId,
  sheetUrl,
}: {
  input: QuestionnaireSave
  requestId: string
  sheetUrl?: string
}): string {
  const questionnaire = QUESTIONNAIRES[input.slug]

  const lines = [
    `${questionnaire.label} submitted the ${questionnaire.title}.`,
    '',
    `Answers filled in: ${input.answered}`,
    `Draft ID: ${input.draftId}`,
    `Request ID: ${requestId}`,
  ]
  if (sheetUrl) lines.push(`CRM sheet, tab "Questionnaires": ${sheetUrl}`)
  lines.push('')

  for (const [name, value] of input.answers) {
    lines.push(`${name}:`, value, '')
  }

  return lines.join('\n')
}
