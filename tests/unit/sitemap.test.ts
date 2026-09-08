import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { indexableBuiltRoutes, routes } from '@/config/routes'
import { siteConfig } from '@/config/site'
import { privacyNotice } from '@/content/legal/privacy'
import { termsOfUse } from '@/content/legal/terms'
import { sources as aiSelectionProblemSources } from '@/content/pages/ai-selection-problem'
import { sources as aiVisibilityToolOrPartnerSources } from '@/content/pages/ai-visibility-tool-or-partner'
import { sources as correctionsSources } from '@/content/pages/corrections'
import { sources as methodologySources } from '@/content/pages/methodology'
import { sources as aiMediatedSearchSources } from '@/content/pages/what-is-ai-mediated-search'
import { sources as generativeEngineOptimizationSources } from '@/content/pages/what-is-generative-engine-optimization'
import { sources as searchIntelligenceEngineeringSources } from '@/content/pages/what-is-search-intelligence-engineering'
import { sources as selectionIntelligenceSources } from '@/content/pages/what-is-selection-intelligence'
import { researchArticles } from '@/content/research'

/** A plain ISO calendar date. Deliberately not a full timestamp (docs/06 §6). */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const entries = sitemap()

function absolute(path: string): string {
  return new URL(path, siteConfig.url).toString()
}

/** Reads one route's advertised date, failing loudly if the route is absent. */
function dateFor(path: string): string {
  const entry = entries.find((candidate) => candidate.url === absolute(path))
  expect(entry, `no sitemap entry for ${path}`).toBeDefined()

  const value = entry?.lastModified
  expect(typeof value, `lastModified for ${path} must be a string, not a Date`).toBe('string')

  return value as string
}

/**
 * The routes that carry a real, sourced date, rebuilt here from the same
 * constants `src/app/sitemap.ts` imports.
 *
 * Duplicating the wiring is the point: if the sitemap ever stops reading the
 * constant a page renders and starts keeping its own copy of the date, the two
 * fall out of step and these assertions fail. That is the drift this file
 * exists to catch.
 */
const sourcedDates: Record<string, string> = {
  [routes.whatIsSearchIntelligenceEngineering.path]: searchIntelligenceEngineeringSources.reviewed,
  [routes.whatIsSelectionIntelligence.path]: selectionIntelligenceSources.reviewed,
  [routes.aiSelectionProblem.path]: aiSelectionProblemSources.reviewed,
  [routes.methodology.path]: methodologySources.reviewed,
  [routes.whatIsAiMediatedSearch.path]: aiMediatedSearchSources.reviewed,
  [routes.whatIsGenerativeEngineOptimization.path]: generativeEngineOptimizationSources.reviewed,
  [routes.aiVisibilityToolOrPartner.path]: aiVisibilityToolOrPartnerSources.reviewed,
  [routes.about.path]: '2026-08-17',
  // The check was published on 2026-09-07 and the homepage gained its station
  // the same day. Both are commit-sourced for the same reason /about is:
  // neither renders a date constant this file could read instead.
  [routes.aiVisibilityCheck.path]: '2026-09-07',
  [routes.home.path]: '2026-09-07',
  [routes.corrections.path]: correctionsSources.reviewed,
  [routes.terms.path]: termsOfUse.lastUpdated,
  [routes.privacy.path]: privacyNotice.lastUpdated,
  // Research. Each article advertises its own `byline.updated`, and the hub
  // advertises the newest article's, because the hub's content is the index.
  ...Object.fromEntries(
    researchArticles.map((article) => [article.path, article.updatedDate] as const),
  ),
  ...(researchArticles.length > 0
    ? { [routes.research.path]: researchArticles[0].updatedDate }
    : {}),
}

describe('sitemap', () => {
  it('advertises the research hub and its published articles', () => {
    // docs/06 §6 requires published research articles in the sitemap. Articles
    // are registered by concrete path in src/config/routes.ts, so they arrive
    // here through `indexableBuiltRoutes()` like any other route rather than
    // through a second code path that could fall out of step with the registry.
    const advertised = new Set(entries.map((entry) => entry.url))

    expect(advertised.has(absolute(routes.research.path))).toBe(true)
    expect(advertised.has(absolute(routes.researchHendricksSelectionBaseline.path))).toBe(true)

    // A dynamic pattern must never reach a crawler.
    for (const entry of entries) {
      expect(entry.url, 'sitemap advertises a dynamic route pattern').not.toContain('[')
    }
  })

  it('advertises exactly the routes that are both built and indexable', () => {
    const advertised = entries.map((entry) => entry.url).sort()
    const expected = indexableBuiltRoutes()
      .map((route) => absolute(route.path))
      .sort()

    expect(advertised).toEqual(expected)
  })

  it('omits every unbuilt, flagged-off, and noindex route', () => {
    const advertised = new Set(entries.map((entry) => entry.url))

    // Flagged off until verified case studies exist, and the only route left in
    // the registry that is neither built nor indexable. /research and
    // /corrections held the unbuilt slots here until both shipped in Phase 6.
    expect(advertised.has(absolute(routes.results.path))).toBe(false)
    // Built, but a transactional form rather than a page worth ranking.
    expect(advertised.has(absolute(routes.privacyRequest.path))).toBe(false)
    // Built, but /observe copy is still waiting on Brand and QA.
    expect(advertised.has(absolute(routes.observe.path))).toBe(false)
  })

  it('never advertises the same URL twice', () => {
    const advertised = entries.map((entry) => entry.url)

    expect(new Set(advertised).size).toBe(advertised.length)
  })

  it('emits a plain ISO calendar date for every URL, so a placeholder cannot ship', () => {
    expect(entries.length).toBeGreaterThan(0)

    for (const entry of entries) {
      expect(typeof entry.lastModified, `${entry.url} must advertise a string date`).toBe('string')
      expect(entry.lastModified as string, `${entry.url} advertises a malformed date`).toMatch(
        ISO_DATE,
      )
    }
  })

  it('reads each definition page date from the constant that page renders', () => {
    // Each of these pages shows `sources.reviewed` in a visible <time>. Reading
    // the same constant is what makes the visible date and the sitemap unable to
    // disagree.
    expect(dateFor(routes.whatIsSearchIntelligenceEngineering.path)).toBe(
      searchIntelligenceEngineeringSources.reviewed,
    )
    expect(dateFor(routes.whatIsSelectionIntelligence.path)).toBe(
      selectionIntelligenceSources.reviewed,
    )
    expect(dateFor(routes.aiSelectionProblem.path)).toBe(aiSelectionProblemSources.reviewed)
    expect(dateFor(routes.methodology.path)).toBe(methodologySources.reviewed)
    expect(dateFor(routes.whatIsAiMediatedSearch.path)).toBe(aiMediatedSearchSources.reviewed)
    expect(dateFor(routes.whatIsGenerativeEngineOptimization.path)).toBe(
      generativeEngineOptimizationSources.reviewed,
    )
  })

  it('gives the two entry-vocabulary pages a date later than the transcription floor', () => {
    // These two were written on 2026-08-17 rather than transcribed on 2026-08-16
    // with the rest of the corpus, so they are the only definition pages
    // entitled to a later date. Asserting the direction rather than the literal
    // keeps this from becoming a second hand-maintained copy of the date.
    const floor = Date.parse('2026-08-16')

    expect(Date.parse(dateFor(routes.whatIsAiMediatedSearch.path))).toBeGreaterThan(floor)
    expect(Date.parse(dateFor(routes.whatIsGenerativeEngineOptimization.path))).toBeGreaterThan(
      floor,
    )
  })

  it('reads each legal route date from the document it publishes', () => {
    expect(dateFor(routes.terms.path)).toBe(termsOfUse.lastUpdated)
    expect(dateFor(routes.privacy.path)).toBe(privacyNotice.lastUpdated)
  })

  it('carries the About content diff date rather than the transcription floor', () => {
    // Commit 2cfcb05 published the founder career record on 2026-08-17, one day
    // after the copy was transcribed. The route changed materially, so it is
    // entitled to its own date (docs/06 §15).
    expect(dateFor(routes.about.path)).toBe('2026-08-17')
  })

  it('leaves every unsourced route on a single shared fallback date', () => {
    // docs/06 §15 permits a date only where content changed. Routes with no
    // recorded diff must therefore all share one floor rather than each
    // acquiring an invented per-route date.
    const unsourced = entries.filter((entry) =>
      Object.keys(sourcedDates).every((path) => entry.url !== absolute(path)),
    )

    expect(unsourced.length).toBeGreaterThan(0)

    const fallbacks = new Set(unsourced.map((entry) => entry.lastModified as string))

    expect(fallbacks.size).toBe(1)
    expect([...fallbacks][0]).toMatch(ISO_DATE)
  })

  it('does not backfill the shared fallback onto a route that has its own date', () => {
    for (const [path, expected] of Object.entries(sourcedDates)) {
      expect(dateFor(path), `${path} lost its sourced date`).toBe(expected)
    }
  })
})
