import { describe, expect, it } from 'vitest'

import { cellText, leadRow, LEAD_ROW_LENGTH, visibilityCheckRow, VISIBILITY_CHECK_ROW_LENGTH } from '@/lib/crm/rows'
import type { LeadSubmissionRecord } from '@/lib/forms/lead-record'
import { parseAio, parseLlm } from '@/lib/visibility-check/engines'
import { buildQuestions, questionShapes } from '@/lib/visibility-check/questions'
import type { Cell } from '@/lib/visibility-check/schema'
import {
  brandDomain,
  citedDomains,
  isOwnedHost,
  mentionsBrand,
  summarize,
} from '@/lib/visibility-check/scoring'

describe('buildQuestions', () => {
  it('builds five questions in the five panel shapes, in order', () => {
    const questions = buildQuestions('commercial HVAC maintenance')
    expect(questions).toHaveLength(5)
    expect(questions.map((q) => q.shape)).toEqual([...questionShapes])
    expect(questions.map((q) => q.id)).toEqual(['q1', 'q2', 'q3', 'q4', 'q5'])
    for (const question of questions) expect(question.text).toContain('commercial HVAC maintenance')
  })

  it('never names the brand, so a mention measures the market and not the prompt', () => {
    const questions = buildQuestions('CRM software for small law firms')
    for (const question of questions) expect(question.text).not.toMatch(/hendricks/i)
  })

  it('places a bare location with "in", and leaves a prepositioned one alone', () => {
    expect(buildQuestions('roof repair', 'Houston')[0]!.text).toBe(
      'Who are the best providers of roof repair in Houston?',
    )
    expect(buildQuestions('roof repair', 'near Austin')[0]!.text).toBe(
      'Who are the best providers of roof repair near Austin?',
    )
    expect(buildQuestions('roof repair', '   ')[0]!.text).toBe('Who are the best providers of roof repair?')
  })

  it('keeps a long phrase readable by never using it as an attributive noun', () => {
    const [, comparison, , , trust] = buildQuestions('AI search visibility measurement for B2B brands', 'Houston')
    expect(comparison!.text).toBe(
      'How do the leading providers of AI search visibility measurement for B2B brands in Houston compare?',
    )
    expect(trust!.text).toBe(
      'Which providers of AI search visibility measurement for B2B brands in Houston are the most trusted, and why?',
    )
  })

  it('strips trailing punctuation and collapses whitespace in the phrase', () => {
    expect(buildQuestions('  managed   IT services. ')[2]!.text).toBe(
      'How much does managed IT services cost?',
    )
  })
})

describe('scoring', () => {
  it('reads the registrable host without www', () => {
    expect(brandDomain('https://www.example.com/path?x=1')).toBe('example.com')
    expect(brandDomain('https://blog.example.co.uk')).toBe('blog.example.co.uk')
  })

  it('treats a subdomain as owned and a look-alike as not', () => {
    expect(isOwnedHost('example.com', 'example.com')).toBe(true)
    expect(isOwnedHost('docs.example.com', 'example.com')).toBe(true)
    expect(isOwnedHost('notexample.com', 'example.com')).toBe(false)
    expect(isOwnedHost('example.com.evil.net', 'example.com')).toBe(false)
  })

  it('matches the brand as a word, case-insensitively, and not as a fragment', () => {
    expect(mentionsBrand('Firms like Hendricks, and others.', 'Hendricks')).toBe(true)
    expect(mentionsBrand('(hendricks) is one option', 'Hendricks')).toBe(true)
    expect(mentionsBrand('Hendrickson Trucking is one option', 'Hendricks')).toBe(false)
    expect(mentionsBrand('Try FUSE   Workspace in Austin', 'Fuse Workspace')).toBe(true)
    expect(mentionsBrand('', 'Hendricks')).toBe(false)
  })

  it('dedupes cited hosts in first-seen order and drops unparseable URLs', () => {
    expect(
      citedDomains([
        'https://www.a.com/1',
        'https://a.com/2',
        'https://b.org/x',
        'not a url',
        'https://B.org/y',
      ]),
    ).toEqual(['a.com', 'b.org'])
  })

  function cell(overrides: Partial<Cell>): Cell {
    return {
      engine: 'perplexity',
      questionId: 'q1',
      status: 'measured',
      mentioned: false,
      cited: false,
      citedDomains: [],
      citationCount: 0,
      answerLength: 100,
      cost: 0.006,
      ...overrides,
    }
  }

  const runAt = '2026-09-07T12:34:56.000Z'

  it('keeps mention and citation denominators apart, and excludes AIO from mentions', () => {
    const cells = [
      cell({ engine: 'chat_gpt', mentioned: true }),
      cell({ engine: 'perplexity', cited: true, citedDomains: ['example.com', 'g2.com'] }),
      cell({ engine: 'gemini' }),
      cell({ engine: 'google_aio', mentioned: null, panel: 'shown', citedDomains: ['g2.com'] }),
    ]

    const summary = summarize({ cells, brandName: 'Example', domain: 'example.com', runAt })

    expect(summary.cellsTotal).toBe(4)
    expect(summary.cellsMeasured).toBe(4)
    expect(summary.mentionDenominator).toBe(3)
    expect(summary.mentioned).toBe(1)
    expect(summary.citedDenominator).toBe(4)
    expect(summary.cited).toBe(1)
    expect(summary.reading).toBe('cited')
    expect(summary.sentence).toContain('cited as a source in 1 of 4 answers')
    expect(summary.sentence).toContain('named in 1 of 3')
    expect(summary.sentence).toContain('4 of 4 cells measured on 2026-09-07 12:34 UTC')
  })

  it('ranks who was cited instead by cells, marking the own domain', () => {
    const cells = [
      cell({ questionId: 'q1', citedDomains: ['g2.com', 'reddit.com'] }),
      cell({ questionId: 'q2', citedDomains: ['g2.com'] }),
      cell({ questionId: 'q3', cited: true, citedDomains: ['example.com', 'reddit.com'] }),
    ]

    const { topDomains } = summarize({ cells, brandName: 'Example', domain: 'example.com', runAt })

    expect(topDomains[0]).toEqual({ domain: 'g2.com', cells: 2, owned: false })
    expect(topDomains[1]).toEqual({ domain: 'reddit.com', cells: 2, owned: false })
    expect(topDomains[2]).toEqual({ domain: 'example.com', cells: 1, owned: true })
  })

  it('reads mentioned, absent, and unmeasured with honest denominators', () => {
    const mentioned = summarize({
      cells: [cell({ mentioned: true }), cell({})],
      brandName: 'Example',
      domain: 'example.com',
      runAt,
    })
    expect(mentioned.reading).toBe('mentioned')
    expect(mentioned.sentence).toContain('cited as a source in 0 of 2')

    const absent = summarize({ cells: [cell({}), cell({})], brandName: 'Example', domain: 'example.com', runAt })
    expect(absent.reading).toBe('absent')
    expect(absent.sentence).toContain('neither named nor cited in any of the 2 measured answers')

    const failed = cell({ status: 'failed', mentioned: null, failure: 'timeout', cost: 0 })
    const unmeasured = summarize({
      cells: [cell({}), failed, failed, failed],
      brandName: 'Example',
      domain: 'example.com',
      runAt,
    })
    expect(unmeasured.reading).toBe('unmeasured')
    expect(unmeasured.cellsFailed).toBe(3)
    expect(unmeasured.sentence).toContain('1 of 4 cells measured')
  })

  it('sums the cost the API reported rather than an estimate', () => {
    const summary = summarize({
      cells: [cell({ cost: 0.07 }), cell({ cost: 0.006 }), cell({ status: 'failed', cost: 0 })],
      brandName: 'Example',
      domain: 'example.com',
      runAt,
    })
    expect(summary.costUsd).toBe(0.076)
  })
})

describe('engine parsers, ported from the Answer Index collector', () => {
  it('resolves a Gemini grounding redirect from its bare-domain title and drops the rest', () => {
    const parsed = parseLlm({
      items: [
        {
          sections: [
            {
              text: 'Hendricks is one option.',
              annotations: [
                { url: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc', title: 'hendricks.ai' },
                { url: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/def', title: 'Some Article Title' },
                { url: 'https://example.com/page', title: 'Example' },
              ],
            },
          ],
        },
      ],
    })

    expect(parsed.answer).toBe('Hendricks is one option.')
    expect(parsed.urls).toEqual(['https://hendricks.ai', 'https://example.com/page'])
  })

  it('reads an AI Overview on both surfaces: the reference cards and the inline links', () => {
    const parsed = parseAio({
      items: [
        { type: 'organic' },
        {
          type: 'ai_overview',
          references: [{ url: 'https://a.com/card' }],
          items: [{ links: [{ url: 'https://b.com/inline' }, { url: 'https://a.com/card' }] }],
        },
      ],
    })

    expect(parsed.panel).toBe('shown')
    expect(parsed.urls).toEqual(['https://a.com/card', 'https://b.com/inline'])
  })

  it('reports no panel when nothing rendered, and an unresolved async panel as none', () => {
    expect(parseAio({ items: [{ type: 'organic' }] })).toEqual({ panel: 'none', urls: [] })
    expect(
      parseAio({ items: [{ type: 'ai_overview', asynchronous_ai_overview: true, references: [], items: [] }] }),
    ).toEqual({ panel: 'none', urls: [] })
  })
})

describe('CRM rows', () => {
  const record: LeadSubmissionRecord = {
    requestId: 'LEAD-2026-000001',
    formName: 'diagnostic',
    audienceType: 'brand',
    submittedAt: '2026-09-07T10:00:00.000Z',
    privacyNoticeVersion: '2026-08-16',
    formCopyVersion: '2026-09-03',
    fields: {
      firstName: 'Ada',
      lastName: 'Lovelace',
      workEmail: 'ada@example.com',
      organization: 'Example Co',
      website: 'https://example.com',
      role: '=CEO',
      primaryMarket: 'Observability software',
      primaryQuestion: 'Why are we absent?',
    },
    marketingOptIn: true,
    attribution: { utmSource: 'linkedin', landingPage: 'https://hendricks.ai/', currentPage: 'https://hendricks.ai/diagnostic' },
  }

  it('lays a lead out in the header order of the Leads tab', () => {
    const row = leadRow(record)
    expect(row).toHaveLength(LEAD_ROW_LENGTH)
    expect(row.slice(0, 8)).toEqual([
      '2026-09-07T10:00:00.000Z',
      'LEAD-2026-000001',
      'diagnostic',
      'brand',
      'Ada',
      'Lovelace',
      'ada@example.com',
      'Example Co',
    ])
    expect(row[9]).toBe("'=CEO")
    expect(row[18]).toBe('yes')
    expect(row[21]).toBe('linkedin')
    expect(row[26]).toBe('https://hendricks.ai/diagnostic')
    expect(row[28]).toBe('New')
  })

  it('lays a check out in the header order of the Visibility Checks tab', () => {
    const row = visibilityCheckRow({
      submittedAt: '2026-09-07T10:00:00.000Z',
      requestId: 'CHECK-2026-000002',
      name: 'Ada',
      workEmail: 'ada@example.com',
      brandName: 'Example',
      website: 'https://example.com',
      domain: 'example.com',
      market: 'observability software',
      location: '',
      cellsMeasured: 19,
      cellsTotal: 20,
      mentioned: 2,
      mentionDenominator: 14,
      cited: 0,
      citedDenominator: 19,
      reading: 'mentioned',
      topDomains: ['g2.com (7)', 'reddit.com (5)'],
      questions: ['Q1?', 'Q2?'],
      marketingOptIn: false,
      attribution: { utmSource: 'x' },
      resultJson: '{}',
    })

    expect(row).toHaveLength(VISIBILITY_CHECK_ROW_LENGTH)
    expect(row[1]).toBe('CHECK-2026-000002')
    expect(row[9]).toBe(19)
    expect(row[13]).toBe(0)
    expect(row[15]).toBe('mentioned')
    expect(row[16]).toBe('g2.com (7), reddit.com (5)')
    expect(row[17]).toBe('Q1? | Q2?')
    expect(row[24]).toBe('New')
    expect(row[27]).toBe('{}')
  })

  it('neutralizes a cell a spreadsheet would read as a formula', () => {
    expect(cellText('=1+1')).toBe("'=1+1")
    expect(cellText('+15551234567')).toBe("'+15551234567")
    expect(cellText('plain')).toBe('plain')
    expect(cellText(undefined)).toBe('')
  })
})
