import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import nextConfig from '../../next.config'
import { isGone } from '@/proxy'
import {
  findDraftRow,
  nextStatus,
  parseStoredState,
  QUESTIONNAIRE_HEADER,
  QUESTIONNAIRE_ROW_LENGTH,
  QUESTIONNAIRE_STATUS,
  questionnaireEmailBody,
  questionnaireEmailSubject,
  questionnaireRow,
} from '@/lib/questionnaire/rows'
import { questionnaireSaveSchema, type QuestionnaireSave } from '@/lib/questionnaire/schema'

vi.mock('@/lib/crm/google-sheets', () => ({
  CRM_TABS: { leads: 'Leads', visibilityChecks: 'Visibility Checks', questionnaires: 'Questionnaires' },
  readSheetRows: vi.fn(),
  updateSheetRow: vi.fn(),
  appendSheetRow: vi.fn(),
  createSheetTab: vi.fn(),
}))

const sheets = await import('@/lib/crm/google-sheets')
const { saveQuestionnaire, loadQuestionnaireDraft } = await import('@/lib/questionnaire/store')

const DRAFT = '0123456789abcdef0123456789abcdef'
const NOW = new Date('2026-09-21T18:00:00.000Z')

function save(overrides: Partial<QuestionnaireSave> = {}): QuestionnaireSave {
  return questionnaireSaveSchema.parse({
    slug: 'brandon-washington',
    draftId: DRAFT,
    kind: 'backup',
    savedAt: NOW.getTime() - 1_000,
    answered: 2,
    answers: [
      ['6. Why Now', 'Ordering eats my Sunday nights'],
      ['8. Jobs Wanted', 'Placing orders automatically; Recipe and plate costing'],
    ],
    state: {
      'v::6. Why Now': 'Ordering eats my Sunday nights',
      'c::8. Jobs Wanted::Placing orders automatically': 1,
      'c::8. Jobs Wanted::Recipe and plate costing': 1,
    },
    ...overrides,
  })
}

function storedRow(savedAt: number, status: string = QUESTIONNAIRE_STATUS.inProgress): string[] {
  return [
    '2026-09-21T17:00:00.000Z',
    '2026-09-21T17:30:00.000Z',
    'brandon-washington',
    DRAFT,
    status,
    '1',
    '4',
    '6. Why Now: earlier',
    JSON.stringify({ savedAt, state: { 'v::6. Why Now': 'earlier' } }),
  ]
}

describe('questionnaire schema', () => {
  it('accepts a normal backup', () => {
    expect(() => save()).not.toThrow()
  })

  it('refuses a questionnaire that is not registered', () => {
    expect(questionnaireSaveSchema.safeParse({ ...save(), slug: 'someone-else' }).success).toBe(false)
  })

  it('refuses a guessable or malformed draft id', () => {
    expect(questionnaireSaveSchema.safeParse({ ...save(), draftId: '1234' }).success).toBe(false)
    expect(questionnaireSaveSchema.safeParse({ ...save(), draftId: DRAFT.toUpperCase() }).success).toBe(false)
  })

  it('refuses a draft too large for one sheet cell', () => {
    const state: Record<string, string> = {}
    for (let i = 0; i < 10; i++) state[`v::field ${i}`] = 'x'.repeat(5_000)
    expect(questionnaireSaveSchema.safeParse({ ...save(), state }).success).toBe(false)
  })
})

describe('questionnaire rows', () => {
  it('matches the header, column for column', () => {
    expect(QUESTIONNAIRE_ROW_LENGTH).toBe(9)
    expect(questionnaireRow({ input: save(), existing: null, now: NOW, savedAt: 1 })).toHaveLength(
      QUESTIONNAIRE_HEADER.length,
    )
  })

  it('opens a new draft as in progress with one save', () => {
    const row = questionnaireRow({ input: save(), existing: null, now: NOW, savedAt: 5 })
    expect(row[0]).toBe(NOW.toISOString())
    expect(row[3]).toBe(DRAFT)
    expect(row[4]).toBe('In progress')
    expect(row[6]).toBe('1')
    expect(row[7]).toContain('6. Why Now: Ordering eats my Sunday nights')
    expect(parseStoredState(row[8]!)).toEqual({ savedAt: 5, state: save().state })
  })

  it('keeps the first-saved time and counts saves on an existing draft', () => {
    const existing = findDraftRow([storedRow(10)], 'brandon-washington', DRAFT)
    const row = questionnaireRow({ input: save(), existing, now: NOW, savedAt: 20 })
    expect(row[0]).toBe('2026-09-21T17:00:00.000Z')
    expect(row[6]).toBe('5')
  })

  it('neutralizes an answer block a spreadsheet could read as a formula', () => {
    const input = save({ answers: [['=IMPORTXML("x")', 'y']] })
    const row = questionnaireRow({ input, existing: null, now: NOW, savedAt: 1 })
    expect(row[7]!.startsWith("'")).toBe(true)
  })

  it('keeps a submitted draft marked submitted', () => {
    expect(nextStatus('final')).toBe('Submitted')
    expect(nextStatus('backup', 'Submitted')).toBe('Submitted, edited after')
    expect(nextStatus('backup', 'Submitted, edited after')).toBe('Submitted, edited after')
    expect(nextStatus('backup', 'In progress')).toBe('In progress')
  })

  it('finds the newest matching row and its sheet row number', () => {
    const rows = [
      storedRow(30),
      ['x', 'x', 'brandon-washington', 'f'.repeat(32), 'In progress', '0', '1', '', '{}'],
      storedRow(50),
      storedRow(40),
    ]
    const found = findDraftRow(rows, 'brandon-washington', DRAFT)
    expect(found?.savedAt).toBe(50)
    expect(found?.rowNumber).toBe(4)
  })

  it('ignores a row whose restore cell was damaged by hand', () => {
    const damaged = storedRow(10)
    damaged[8] = 'not json'
    expect(findDraftRow([damaged], 'brandon-washington', DRAFT)).toBeNull()
  })

  it('writes an email with every answer', () => {
    expect(questionnaireEmailSubject('brandon-washington')).toBe(
      'Restaurant AI Agent Questionnaire - Brandon Washington',
    )
    const body = questionnaireEmailBody({ input: save({ kind: 'final' }), requestId: 'q-1' })
    expect(body).toContain('Brandon Washington submitted the Restaurant AI Agent Questionnaire.')
    expect(body).toContain('8. Jobs Wanted:\nPlacing orders automatically; Recipe and plate costing')
  })
})

describe('questionnaire store', () => {
  const read = vi.mocked(sheets.readSheetRows)
  const update = vi.mocked(sheets.updateSheetRow)
  const append = vi.mocked(sheets.appendSheetRow)
  const create = vi.mocked(sheets.createSheetTab)

  beforeEach(() => {
    update.mockResolvedValue('success')
    append.mockResolvedValue('success')
    create.mockResolvedValue('success')
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('appends the first backup of a draft', async () => {
    read.mockResolvedValue({ status: 'success', rows: [] })
    const result = await saveQuestionnaire(save(), 'q-1', NOW)
    expect(result).toEqual({ sheet: 'success', email: 'not-sent' })
    expect(append).toHaveBeenCalledOnce()
    expect(update).not.toHaveBeenCalled()
  })

  it('creates the tab with its header the first time it is needed', async () => {
    read.mockResolvedValue({ status: 'missing-tab' })
    await saveQuestionnaire(save(), 'q-1', NOW)
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ tab: 'Questionnaires', header: QUESTIONNAIRE_HEADER }),
    )
    expect(append).toHaveBeenCalledOnce()
  })

  it('updates the same row on later backups', async () => {
    read.mockResolvedValue({ status: 'success', rows: [storedRow(10), storedRow(20)] })
    await saveQuestionnaire(save(), 'q-1', NOW)
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ rowNumber: 3 }))
    expect(append).not.toHaveBeenCalled()
  })

  it('never lets an older backup overwrite a newer one', async () => {
    read.mockResolvedValue({ status: 'success', rows: [storedRow(NOW.getTime())] })
    const result = await saveQuestionnaire(save({ savedAt: NOW.getTime() - 60_000 }), 'q-1', NOW)
    expect(result.sheet).toBe('stale')
    expect(update).not.toHaveBeenCalled()
  })

  it('always writes a final submission', async () => {
    read.mockResolvedValue({ status: 'success', rows: [storedRow(NOW.getTime())] })
    const result = await saveQuestionnaire(
      save({ kind: 'final', savedAt: NOW.getTime() - 60_000 }),
      'q-1',
      NOW,
    )
    expect(update).toHaveBeenCalledOnce()
    // Resend is not configured under test, so the email is skipped, not sent.
    expect(result).toEqual({ sheet: 'success', email: 'skipped' })
  })

  it('clamps a browser clock set in the future', async () => {
    read.mockResolvedValue({ status: 'success', rows: [] })
    await saveQuestionnaire(save({ savedAt: NOW.getTime() + 86_400_000 }), 'q-1', NOW)
    const values = append.mock.calls[0]![0].values as string[]
    expect(parseStoredState(values[8]!)?.savedAt).toBe(NOW.getTime() + 5 * 60 * 1000)
  })

  it('reports the sheet as unavailable rather than pretending to save', async () => {
    read.mockResolvedValue({ status: 'failed' })
    expect((await saveQuestionnaire(save(), 'q-1', NOW)).sheet).toBe('failed')
    expect(append).not.toHaveBeenCalled()
  })

  it('hands a draft back by its id', async () => {
    read.mockResolvedValue({ status: 'success', rows: [storedRow(10, 'Submitted')] })
    const lookup = await loadQuestionnaireDraft('brandon-washington', DRAFT, 'q-1')
    expect(lookup).toEqual({
      status: 'found',
      draft: { savedAt: 10, answered: 1, submitted: true, state: { 'v::6. Why Now': 'earlier' } },
    })
    expect(await loadQuestionnaireDraft('brandon-washington', 'f'.repeat(32), 'q-1')).toEqual({
      status: 'not-found',
    })
  })
})

describe('the /questionnaire route', () => {
  it('is served, while the retired client paths beneath it stay gone', () => {
    expect(isGone('/questionnaire')).toBe(false)
    expect(isGone('/questionnaire/brandon-washington.html')).toBe(true)
  })

  it('rewrites to the static page', async () => {
    const rewrites = await nextConfig.rewrites!()
    expect(rewrites).toContainEqual({
      source: '/questionnaire',
      destination: '/questionnaire/brandon-washington.html',
    })
  })

  it('is noindex in the response header', async () => {
    const headers = await nextConfig.headers!()
    const rule = headers.find((entry) => entry.source === '/questionnaire')
    expect(rule?.headers).toContainEqual({ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' })
  })

  it('is noindex in the page itself, and backs up to the site', () => {
    const html = readFileSync(
      path.join(process.cwd(), 'public/questionnaire/brandon-washington.html'),
      'utf8',
    )
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">')
    expect(html).toContain("var API    = '/api/questionnaire';")
    expect(html).not.toContain('—')
  })
})
