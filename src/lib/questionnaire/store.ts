import 'server-only'

import {
  appendSheetRow,
  createSheetTab,
  CRM_TABS,
  readSheetRows,
  type SheetAppendStatus,
  updateSheetRow,
} from '@/lib/crm/google-sheets'
import { env } from '@/lib/env'
import {
  type DraftState,
  findDraftRow,
  QUESTIONNAIRE_HEADER,
  questionnaireEmailBody,
  questionnaireEmailSubject,
  questionnaireRow,
} from '@/lib/questionnaire/rows'
import type { QuestionnaireSave, QuestionnaireSlug } from '@/lib/questionnaire/schema'

/**
 * Where a questionnaire's answers go: one row per draft in the CRM sheet,
 * updated on every automatic backup, and an email to Brandon on Submit.
 *
 * The sheet row is the backup the respondent never has to think about. It is
 * what lets a half-finished questionnaire survive a cleared browser, and what
 * lets the same link resume on another device.
 */

const TAB = CRM_TABS.questionnaires
const ROWS_RANGE = 'A2:I'

/** How far ahead of the server a browser clock may claim to be before it is clamped. */
const CLOCK_SKEW_MS = 5 * 60 * 1000

type DraftRows = { status: 'success'; rows: string[][] } | { status: 'failed' | 'skipped' }

async function draftRows(requestId: string): Promise<DraftRows> {
  const read = await readSheetRows({ tab: TAB, a1: ROWS_RANGE, requestId })

  if (read.status === 'missing-tab') {
    const created = await createSheetTab({ tab: TAB, header: QUESTIONNAIRE_HEADER, requestId })
    return created === 'success' ? { status: 'success', rows: [] } : { status: created }
  }

  return read
}

async function sendQuestionnaireEmail(
  input: QuestionnaireSave,
  requestId: string,
): Promise<SheetAppendStatus> {
  const apiKey = env.RESEND_API_KEY
  const from = env.LEAD_FROM_EMAIL
  const to = env.LEAD_NOTIFICATION_EMAIL

  if (!apiKey || !from || !to) {
    console.error(`[questionnaire] ${requestId} was not emailed: Resend is unconfigured.`)
    return 'skipped'
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: questionnaireEmailSubject(input.slug),
        text: questionnaireEmailBody({
          input,
          requestId,
          sheetUrl: env.CRM_SHEET_ID
            ? `https://docs.google.com/spreadsheets/d/${env.CRM_SHEET_ID}`
            : undefined,
        }),
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error(`[questionnaire] ${requestId} email failed with ${response.status}.`)
      return 'failed'
    }

    return 'success'
  } catch {
    // The caught value can carry the answers, so it is not logged.
    console.error(`[questionnaire] ${requestId} email threw.`)
    return 'failed'
  }
}

export type QuestionnaireSaveResult = {
  /** `stale` means the sheet already holds a newer snapshot, which is a success for the caller. */
  sheet: SheetAppendStatus | 'stale'
  email: SheetAppendStatus | 'not-sent'
}

export async function saveQuestionnaire(
  input: QuestionnaireSave,
  requestId: string,
  now: Date = new Date(),
): Promise<QuestionnaireSaveResult> {
  const savedAt = Math.min(input.savedAt, now.getTime() + CLOCK_SKEW_MS)

  let sheet: QuestionnaireSaveResult['sheet']
  const read = await draftRows(requestId)

  if (read.status !== 'success') {
    sheet = read.status
  } else {
    const existing = findDraftRow(read.rows, input.slug, input.draftId)

    // A backup can arrive out of order, for example the one sent as the tab
    // closes. It must never overwrite a newer snapshot. A final submission is
    // always written, because it is the respondent's own statement of done.
    if (input.kind === 'backup' && existing && existing.savedAt > savedAt) {
      sheet = 'stale'
    } else {
      const values = questionnaireRow({ input, existing, now, savedAt })
      sheet = existing
        ? await updateSheetRow({ tab: TAB, rowNumber: existing.rowNumber, values, requestId })
        : await appendSheetRow({ tab: TAB, values, requestId })
    }
  }

  const email = input.kind === 'final' ? await sendQuestionnaireEmail(input, requestId) : 'not-sent'

  return { sheet, email }
}

export type QuestionnaireDraftLookup =
  | {
      status: 'found'
      draft: { savedAt: number; answered: number; submitted: boolean; state: DraftState }
    }
  | { status: 'not-found' }
  | { status: 'unavailable' }

export async function loadQuestionnaireDraft(
  slug: QuestionnaireSlug,
  draftId: string,
  requestId: string,
): Promise<QuestionnaireDraftLookup> {
  const read = await readSheetRows({ tab: TAB, a1: ROWS_RANGE, requestId })

  if (read.status === 'missing-tab') return { status: 'not-found' }
  if (read.status !== 'success') return { status: 'unavailable' }

  const found = findDraftRow(read.rows, slug, draftId)
  if (!found) return { status: 'not-found' }

  return {
    status: 'found',
    draft: {
      savedAt: found.savedAt,
      answered: found.answered,
      submitted: found.status.startsWith('Submitted'),
      state: found.state,
    },
  }
}
