import type { MetadataRoute } from 'next'

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
import { latestResearchArticle, researchArticles } from '@/content/research'

/**
 * Sitemap (docs/06 §6).
 *
 * Derived from `config/routes.ts`, so a route enters the sitemap only once its
 * `built` flag is true. That keeps the sitemap from ever advertising a 404 as
 * later phases land. Studio, draft, preview, and flagged-off routes are excluded
 * because they are not marked indexable.
 *
 * `lastModified` is the route's own content date rather than the deployment
 * time, because docs/06 §6 prohibits stamping every URL with the current build
 * date. Routes with a real, sourced date are listed in the map below. Every
 * other route falls through to the transcription date, which is a floor rather
 * than a per-route freshness claim. The two comment blocks that follow explain
 * what qualifies for each.
 */

/**
 * Routes whose content date is known and sourced.
 *
 * Every value is either imported from the constant the page itself renders or
 * anchored to a recorded commit. Nothing is typed in by hand except where a
 * commit is the only record, and that case carries the commit hash. A date that
 * lived only in this file could drift from the page it describes with nothing
 * failing, which is the defect this map exists to prevent.
 *
 * Do not add a route here to make it look fresh. docs/06 §15 allows updating a
 * date only when the content changed materially, so an entry is earned by a
 * change to the page, not by a review of it.
 */
const lastModified: Record<string, string> = {
  // Every definition page renders `sources.reviewed` inside a visible <time>
  // element. Reading the same constant means the sitemap and the page can never
  // disagree, which is why no date below is typed in by hand.
  [routes.whatIsSearchIntelligenceEngineering.path]: searchIntelligenceEngineeringSources.reviewed,
  [routes.whatIsSelectionIntelligence.path]: selectionIntelligenceSources.reviewed,
  [routes.aiSelectionProblem.path]: aiSelectionProblemSources.reviewed,
  [routes.methodology.path]: methodologySources.reviewed,

  // The two entry-vocabulary definition pages, added 2026-08-17. They read the
  // same constant for the same reason, and they carry a later review date than
  // the other four because they were written on that date rather than reviewed
  // on it. That is a real content diff, not a freshness stamp, so docs/06 §15 is
  // satisfied. If either page is ever published without rendering its
  // `sources.reviewed` in a visible <time>, remove its entry here: an advertised
  // date the reader cannot see is exactly the drift this map exists to prevent.
  [routes.whatIsAiMediatedSearch.path]: aiMediatedSearchSources.reviewed,
  [routes.whatIsGenerativeEngineOptimization.path]: generativeEngineOptimizationSources.reviewed,

  // The buyer-decision route, published 2026-08-19. It is not a definition page
  // and emits no DefinedTerm, but it renders `sources.reviewed` in the same
  // visible <time> through SourcesNote, so it qualifies on the same terms: the
  // date advertised here is the date the reader can see on the page.
  [routes.aiVisibilityToolOrPartner.path]: aiVisibilityToolOrPartnerSources.reviewed,

  // Commit 2cfcb05, dated 2026-08-17, published the founder career record: the
  // About content object grew by 62 lines, the page by 41, and a role-timeline
  // component landed with it. That is a material content diff one day after the
  // transcription date, so this route genuinely changed and says so. There is no
  // date constant on the About content object to read, so the commit is the
  // record and the hash is cited here in place of one.
  [routes.about.path]: '2026-08-17',

  // The corrections policy renders `sources.reviewed` in a visible <time>, the
  // same contract the editorial routes above satisfy.
  [routes.corrections.path]: correctionsSources.reviewed,

  /*
    Research. Every article's date is its own `byline.updated`, read through the
    registry and never retyped, so the date this file advertises is the date the
    reader sees in the article's publication record. The hub carries the newest
    article's date because the hub's content is the index: it changes when a
    study is published or revised and at no other time. Both are spread in rather
    than listed, so a second article needs no edit here.
  */
  ...Object.fromEntries(
    researchArticles.map((article) => [article.path, article.updatedDate] as const),
  ),
  ...(latestResearchArticle
    ? { [routes.research.path]: latestResearchArticle.updatedDate }
    : {}),

  /*
    The AI Visibility Check, published 2026-09-07, and the homepage, which
    gained the check's station on the same day. Both were falling through to
    the transcription fallback below and advertising 2026-08-16, which for the
    check is three weeks before the route existed. docs/06 section 15 allows a
    date only where the content changed materially, and both did: the route is
    new and the homepage grew a station. The commit is the record, as it is for
    /about above, because neither page renders a date constant to read.
  */
  [routes.aiVisibilityCheck.path]: '2026-09-07',
  [routes.home.path]: '2026-09-07',

  // Both legal documents render their own last-updated date, so the sitemap
  // reads that field rather than keeping a second copy of it.
  [routes.terms.path]: termsOfUse.lastUpdated,
  [routes.privacy.path]: privacyNotice.lastUpdated,
}

/**
 * Fallback for every route with no recorded content diff, including the
 * homepage.
 *
 * This is the date the approved copy was transcribed into the repo, which
 * CONTENT_VERIFICATION.md D1 records is explicitly not a date anyone reviewed
 * the substance. It is the honest floor: the content has existed unchanged since
 * then. Raise it for a route only by adding that route to the map above with a
 * real source.
 */
const DEFAULT_LAST_MODIFIED = '2026-08-16'

/** Depth-based priority: the homepage outranks top-level routes, which outrank children. */
function priorityFor(path: string): number {
  if (path === '/') return 1
  return path.split('/').filter(Boolean).length > 1 ? 0.7 : 0.8
}

export default function sitemap(): MetadataRoute.Sitemap {
  return indexableBuiltRoutes().map((route) => ({
    url: new URL(route.path, siteConfig.url).toString(),
    lastModified: lastModified[route.path] ?? DEFAULT_LAST_MODIFIED,
    changeFrequency: 'monthly' as const,
    priority: priorityFor(route.path),
  }))
}
