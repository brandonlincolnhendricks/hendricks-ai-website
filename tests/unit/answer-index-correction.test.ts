import { describe, expect, it } from 'vitest'

import { routes } from '@/config/routes'
import { log, sources as correctionSources } from '@/content/pages/corrections'
import {
  changes,
  corrections as answerIndexCorrections,
} from '@/content/research/the-answer-index'

describe('The Answer Index v2026.09.2 correction record', () => {
  const entry = log.entries[0]!

  it('records the release change as a correction on the study page', () => {
    expect(changes[changes.length - 1]).toEqual({
      date: '2026-10-04',
      kind: 'correction',
      summary:
        'Corrected the release documentation and methodology record in data package v2026.09.2; the questions, observations, classifications, analytic tables, reported findings, panel version, and panel hash did not change.',
    })
    expect(answerIndexCorrections.title).toContain('One documentation and methodology correction')

    const body = answerIndexCorrections.body.join(' ')
    expect(body).not.toContain('corrected zero times')
    expect(body).toContain('10.5281/zenodo.22242103')
    expect(body).toContain('10.5281/zenodo.23132107')
    expect(body).toContain('No question, captured observation')
  })

  it('puts the same dated correction first in the global log', () => {
    expect(log.entries).toHaveLength(7)
    expect(log.lead).toContain('Seven entries, newest first')
    expect(entry).toMatchObject({
      id: 'answer-index-v2026-09-2-release-record',
      published: '2026-09-01',
      corrected: '2026-10-04',
      page: {
        label: 'The Answer Index',
        href: routes.researchTheAnswerIndex.path,
      },
    })
    expect(entry.claim).toContain('10.5281/zenodo.22242103')
    expect(entry.change).toContain('10.5281/zenodo.23132107')
    expect(entry.change).toContain('The v2026.09.1 record remains preserved at its exact DOI')
    expect(correctionSources.reviewed).toBe('2026-10-04')
  })

  it('states explicitly that the correction did not change results', () => {
    expect(entry.fault).toContain('analytic corpus and reported findings were unchanged')
    expect(entry.change).toContain(
      'No question, captured observation, source classification, analytic table, reported finding, panel version, or panel hash changed.',
    )
  })
})
