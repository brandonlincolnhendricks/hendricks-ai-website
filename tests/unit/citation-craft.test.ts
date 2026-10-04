import { describe, expect, it } from 'vitest'

import { routes } from '@/config/routes'
import { siteConfig } from '@/config/site'
import * as asp from '@/content/pages/ai-selection-problem'
import * as methodology from '@/content/pages/methodology'
import * as wiams from '@/content/pages/what-is-ai-mediated-search'
import * as wgeo from '@/content/pages/what-is-generative-engine-optimization'
import * as wisie from '@/content/pages/what-is-search-intelligence-engineering'
import * as wisi from '@/content/pages/what-is-selection-intelligence'
import { definedTermSchema, webPageSchema } from '@/lib/seo/json-ld'

const VENDOR_FRAGMENTS = ['ForSEO', 'optimization api']

describe('citation craft on definition pages', () => {
  it('prints the self-baseline run after the SIE definition', () => {
    expect(wisie.illustratedBy.body).toContain('2026-08-19-110930')
    expect(wisie.illustratedBy.body).toContain('citation presence')
    expect(wisie.illustratedBy.body).toContain('not consideration')
    expect(wisie.illustratedBy.study.href).toBe(routes.researchHendricksSelectionBaseline.path)
    expect(wisie.illustratedBy.roleNaming.href).toContain('medium.com/@brandonlincolnhendricks')
    expect(wisie.illustratedBy.roleNaming.body).toContain('names the role')
    expect(wisie.illustratedBy.roleNaming.body).not.toContain('measurement of')
  })

  it('states the selection-intelligence self-run measured citation presence only', () => {
    expect(wisi.citationPresenceOnly.body).toContain('2026-08-19-110930')
    expect(wisi.citationPresenceOnly.body).toContain('citation presence only')
    expect(wisi.citationPresenceOnly.body).toContain('Observed Consideration Rate')
    expect(wisi.citationPresenceOnly.body).toContain('does not report')
    expect(wisi.citationPresenceOnly.body).not.toMatch(/\d+\s*%/)
    expect(wisi.citationPresenceOnly.cta.href).toBe(routes.researchHendricksSelectionBaseline.path)
  })

  it('keeps 110930 on AI-mediated search and adds the 110653 citation-presence sentence', () => {
    expect(wiams.absence.body[0]).toContain('2026-08-19-110930')
    expect(wiams.absence.body.join(' ')).toContain('2026-08-20-110653')
    expect(wiams.absence.body.join(' ')).toContain('2 of 17')
    expect(wiams.absence.body.join(' ')).toContain('same two questions')
    expect(wiams.absence.body.join(' ')).toContain('citation presence only')
    expect(wiams.absence.laterRun.href).toBe(routes.researchNoSharedSourceAcrossEngines.path)
  })

  it('joins the two citation-presence runs under the GEO framing-runs-out block', () => {
    expect(wgeo.runsOut.citationPresence.body).toContain('2026-08-20-110653')
    expect(wgeo.runsOut.citationPresence.body).toContain('zero domains cited by all three')
    expect(wgeo.runsOut.citationPresence.body).toContain('2026-08-19-110930')
    expect(wgeo.runsOut.citationPresence.body).toContain('247')
    expect(wgeo.runsOut.citationPresence.body).toContain('308')
    expect(wgeo.runsOut.citationPresence.body).toContain('86 percent')
    expect(wgeo.runsOut.citationPresence.body).toContain('Neither run shows that GEO tactics produce citations')
    expect(wgeo.runsOut.citationPresence.noShared.href).toBe(
      routes.researchNoSharedSourceAcrossEngines.path,
    )
    expect(wgeo.runsOut.citationPresence.whoGetsCited.href).toBe(
      routes.researchWhoGetsCitedInAiAnswers.path,
    )
  })

  it('defines the AI Selection Problem and prints run 110930 next to 247/308/212', () => {
    expect(asp.termDefinition.answer).toContain('loss of control over the path between being discovered and being chosen')
    expect(asp.competitorRecommendation.body[0]).toContain('2026-08-19-110930')
    expect(asp.competitorRecommendation.body[0]).toContain('247')
    expect(asp.competitorRecommendation.body[0]).toContain('308')
    expect(asp.competitorRecommendation.body[0]).toContain('212')
    expect(asp.competitorRecommendation.cta.href).toBe(routes.researchWhoGetsCitedInAiAnswers.path)
  })

  it('prints the methodology self-run id and drops the end-to-end overclaim', () => {
    expect(methodology.publishedSelfRun.body).toContain('2026-08-19-110930')
    expect(methodology.publishedSelfRun.body).toContain('citation presence only')
    expect(methodology.publishedSelfRun.body).toContain('not a full Selection Intelligence baseline')
    expect(methodology.publishedSelfRun.cta.href).toBe(routes.researchHendricksSelectionBaseline.path)
    expect(methodology.related[0].description).toContain('2026-08-19-110930')
    expect(methodology.related[0].description.toLowerCase()).not.toContain('run end to end')
    expect(methodology.related[0].description.toLowerCase()).not.toContain('ask for by id')
  })

  it('attaches supporting studies to the WebPage rather than treating them as the term', () => {
    const studyUrl = new URL(
      routes.researchHendricksSelectionBaseline.path,
      siteConfig.url,
    ).toString()
    const page = webPageSchema({
      path: routes.whatIsSearchIntelligenceEngineering.path,
      title: wisie.meta.title,
      description: wisie.meta.description,
      citation: [studyUrl],
    })
    const term = definedTermSchema({
      path: routes.whatIsSearchIntelligenceEngineering.path,
      term: wisie.directAnswer.term,
      directAnswer: wisie.directAnswer.answer,
    })

    expect(page.citation).toEqual([studyUrl])
    expect(term).not.toHaveProperty('sameAs')
    expect(term).not.toHaveProperty('citation')
  })

  it('keeps vendor product names out of the new copy', () => {
    const blobs = [
      wisie.illustratedBy.body,
      wisi.citationPresenceOnly.body,
      wiams.absence.body.join(' '),
      wgeo.runsOut.citationPresence.body,
      asp.termDefinition.answer,
      asp.competitorRecommendation.body[0],
      methodology.publishedSelfRun.body,
      methodology.related[0].description,
    ]
    for (const blob of blobs) {
      const lower = blob.toLowerCase()
      for (const fragment of VENDOR_FRAGMENTS) {
        expect(lower).not.toContain(fragment.toLowerCase())
      }
      expect(blob).not.toContain('—')
      expect(blob).not.toContain('**')
    }
  })
})
