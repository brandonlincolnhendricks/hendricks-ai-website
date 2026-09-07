/**
 * Canonical route paths (docs/03 §3).
 *
 * Centralised so that navigation, content objects, the sitemap, and the link
 * checker all read the same strings. `built` marks whether the route exists in
 * the app today; the sitemap and link checker use it so an unbuilt route can
 * never be advertised to crawlers or linked from a page.
 */
export type RouteDefinition = {
  path: string
  /** Short label used in breadcrumbs and related-content lists. */
  label: string
  indexable: boolean
  built: boolean
}

export const routes = {
  home: { path: '/', label: 'Home', indexable: true, built: true },

  solutions: { path: '/solutions', label: 'Solutions', indexable: true, built: true },
  searchDemandIntelligence: {
    path: '/solutions/search-demand-intelligence',
    label: 'Search Demand Intelligence',
    indexable: true,
    built: true,
  },
  selectionIntelligence: {
    path: '/solutions/selection-intelligence',
    label: 'Selection Intelligence',
    indexable: true,
    built: true,
  },
  searchPresenceEngineering: {
    path: '/solutions/search-presence-engineering',
    label: 'Search Presence Engineering',
    indexable: true,
    built: true,
  },
  searchImpactMeasurement: {
    path: '/solutions/search-impact-measurement',
    label: 'Search Impact Measurement',
    indexable: true,
    built: true,
  },

  diagnostic: {
    path: '/diagnostic',
    label: 'Search Intelligence Diagnostic',
    indexable: true,
    built: true,
  },
  /**
   * Public observation shell. Brand plus category in, queued confirmation out.
   * Not a home embed and not part of the Diagnostic body. This route does not
   * call a probe in the shell PR; live pulls land later. Stay out of the
   * sitemap until Brand and QA sign the /observe copy.
   */
  observe: {
    path: '/observe',
    label: 'Observation',
    indexable: false,
    built: true,
  },
  /**
   * The free instrument (Brandon, 2026-09-07). A visitor enters a website and a
   * market phrase; the page runs five buyer questions through the four
   * observed systems and shows the reading, and Hendricks records the contact.
   * Indexable on purpose: "free AI visibility check" is a buyer's own phrase,
   * and the page answers it in visible copy before the form.
   *
   * OVERLAPS /observe ABOVE, AND BRANDON HAS NOT RULED. Both are public
   * surfaces that observe a brand across the answer engines. They differ in
   * three ways that matter: this one takes a contact and is a lead
   * instrument, /observe takes brand and category only; this one probes the
   * four observed systems synchronously, /observe queues three and leaves
   * Gemini unmeasured; this one is indexable, /observe is not. They should
   * converge into one instrument. Until that ruling, do not link them to each
   * other and do not describe either as the other.
   */
  aiVisibilityCheck: {
    path: '/ai-visibility-check',
    label: 'AI Visibility Check',
    indexable: true,
    built: true,
  },
  howItWorks: { path: '/how-it-works', label: 'How It Works', indexable: true, built: true },
  forBrands: { path: '/for-brands', label: 'For Brands', indexable: true, built: true },
  forAgencies: { path: '/for-agencies', label: 'For Agencies', indexable: true, built: true },
  about: { path: '/about', label: 'About', indexable: true, built: true },
  contact: { path: '/contact', label: 'Contact', indexable: true, built: true },

  // Definition pages (HEN-0604). Version-controlled rather than in Sanity, which
  // docs/11 permits and which keeps the category vocabulary off the CMS critical path.
  //
  // The vocabulary set now covers two registers rather than one. The first two
  // entries define the Hendricks category in Hendricks language. The two that
  // follow define the buyer-facing entry terms, the words a buyer already types
  // before they have heard of Search Intelligence Engineering. A page cannot be
  // retrieved for a term it never contains, so the entry terms need routes of
  // their own. They are bridges into the category, not renames of it: no route
  // here describes a Hendricks service as GEO, AEO, or AI-mediated search work.
  whatIsSearchIntelligenceEngineering: {
    path: '/what-is-search-intelligence-engineering',
    label: 'What Is Search Intelligence Engineering?',
    indexable: true,
    built: true,
  },
  whatIsSelectionIntelligence: {
    path: '/what-is-selection-intelligence',
    label: 'What Is Selection Intelligence?',
    indexable: true,
    built: true,
  },
  whatIsAiMediatedSearch: {
    path: '/what-is-ai-mediated-search',
    label: 'What Is AI-Mediated Search?',
    indexable: true,
    built: true,
  },
  whatIsGenerativeEngineOptimization: {
    path: '/what-is-generative-engine-optimization',
    label: 'What Is Generative Engine Optimization?',
    indexable: true,
    built: true,
  },
  aiSelectionProblem: {
    path: '/ai-selection-problem',
    label: 'The AI Selection Problem',
    indexable: true,
    built: true,
  },

  /**
   * Buyer-decision route, cluster C10 (docs/17 §4.10, specified in §5.3). It
   * sits in `(editorial)` beside the definition pages, but it defines no term
   * and emits no `DefinedTerm` node.
   *
   * The path deliberately names a decision rather than a comparison. A URL that
   * promises a vendor ranking will be read as one, and docs/17 §4.11 X1 concedes
   * tool-comparison listicles outright.
   */
  aiVisibilityToolOrPartner: {
    path: '/ai-visibility-tool-or-partner',
    label: 'AI Visibility Tool or Partner',
    indexable: true,
    built: true,
  },
  methodology: { path: '/methodology', label: 'Methodology', indexable: true, built: true },

  /**
   * Research hub, shipped from `src/content/research/` rather than from Sanity.
   *
   * CONTENT_VERIFICATION.md R5 records this route as blocked on Sanity
   * credentials. docs/17 section 7 wave 2.1 reverses that: the block was a
   * sequencing assumption rather than a credential, and the definition pages
   * above had already proved that version-controlled editorial content ships
   * fine. A dated measurement with a stated method is, if anything, the content
   * that least belongs behind an editor with no diff.
   *
   * The hub sits in primary navigation between For Agencies and About (CANON
   * R6 default; redesign 03 section 2), restored with the header rebuild.
   * `content/pages/12-research.md` gated that link on publishing three category
   * foundation pages; the four definition pages are built and five studies are
   * published under this route, so the gate is met. Closing CONTENT_VERIFICATION
   * R6 is Brandon's act, not a build commit. The hub is also reachable from the
   * persistent footer research column and from the related list on
   * `/corrections`. No commercial page yet links to the research in body copy;
   * that placement lands with the page rebuilds. The matching note sits on
   * `primaryNavigation` in `src/config/navigation.ts`.
   */
  research: { path: '/research', label: 'Research Hub', indexable: true, built: true },

  /**
   * The first research article.
   *
   * Registered by its concrete path even though it is served by the dynamic
   * `research/[slug]` segment, because the registry is what the sitemap,
   * `llms.txt`, and every `isBuilt`-filtered link list read. A dynamic pattern
   * registered here would advertise a literal `[slug]` URL to crawlers; leaving
   * the article unregistered would keep a published page out of the sitemap and
   * make it unlinkable from any related-content list. `scripts/check-links.ts`
   * resolves a concrete path against the dynamic directory that serves it.
   *
   * The slug is mirrored in `src/content/research/index.ts`, which reads `path`
   * from here rather than restating it. Adding an article means adding a route
   * entry and a registry entry, in that order.
   */
  researchHendricksSelectionBaseline: {
    path: '/research/hendricks-selection-baseline',
    label: 'Hendricks Selection Baseline',
    indexable: true,
    built: true,
  },

  /**
   * The answer-stability study.
   *
   * Registered the same way and for the same reasons as the article above: a
   * concrete path, because this registry is what the sitemap, `llms.txt`,
   * `check:links`, and every `isBuilt`-filtered link list read, and a dynamic
   * pattern here would advertise a literal `[slug]` URL to crawlers.
   *
   * Publishing this article and the citation-structure study alongside it
   * brought the section to three published assets. `content/pages/12-research.md`
   * line 88 gates primary navigation on three category FOUNDATION pages, a
   * different count from three studies, so this article did not move the link
   * on its own; the foundation pages did, and `src/config/navigation.ts` carries
   * the entry with the note on `research` above.
   */
  researchAnswerStabilityTwoRuns: {
    path: '/research/answer-stability-two-runs',
    label: 'Answer Stability, Two Runs',
    indexable: true,
    built: true,
  },

  /**
   * The citation-set structure study, E1 in docs/17 §8.1.
   *
   * Registered by concrete path for the same reasons as the two articles above.
   * The slug names the buyer question rather than the measure, because the
   * question is what a reader types and the measure is what the page answers it
   * with.
   *
   * It reads the same run of record as the self-baseline study,
   * 2026-08-19-110930, for a different question. That page asks whether one
   * brand appeared in the citation set. This one describes the structure of the
   * set itself: how many domains filled how many slots, how little any of them
   * recurred, and how little the engines had in common. Two studies on one run
   * is not duplication as long as neither restates the other's answer, and the
   * two link to each other.
   */
  researchWhoGetsCitedInAiAnswers: {
    path: '/research/who-gets-cited-in-ai-answers',
    label: 'Who Gets Cited in AI Answers',
    indexable: true,
    built: true,
  },

  /**
   * The third research article.
   *
   * The two studies before this one read a citation set to ask who was in it.
   * This one makes the engines the subject and asks whether they agree, which is
   * the assumption every blended cross-engine visibility score rests on. It is
   * the first study in the section to publish an `errorsFound` section, because
   * two instrument defects were found while producing its run and both had
   * already generated a wrong reading.
   *
   * A fourth engine, Gemini, was probed in that run and nothing from it is
   * published on the page. CONTENT_VERIFICATION A1 added Gemini to the observed
   * set on 2026-09-01, in A1 and in `src/content/shared/observed-systems.ts`
   * first, never in an article. The study renders the shared scope sentence as
   * it stands today and records the change under Corrections; its figures still
   * count the three engines the run compared.
   */
  researchNoSharedSourceAcrossEngines: {
    path: '/research/no-shared-source-across-engines',
    label: 'No Shared Source Across Engines',
    indexable: true,
    built: true,
  },

  /**
   * The fifth research article and the first from the 480-question corpus.
   * Registered by concrete path like the four before it, because this registry
   * is what the sitemap, llms.txt, and check:links read. The slug carries the
   * report's own name rather than a finding, because the same corpus is also
   * published as a PDF and a data package under that name and the three
   * artifacts cite one URL.
   */
  researchTheAnswerIndex: {
    path: '/research/the-answer-index',
    label: 'The Answer Index',
    indexable: true,
    built: true,
  },

  /**
   * Corrections policy and log.
   *
   * CONTENT_VERIFICATION.md R6 recorded this as blocked on missing copy rather
   * than on a credential, and docs/17 wave 0 item 0.4 costed the unblock at
   * roughly 200 words. The copy now exists in `src/content/pages/corrections.ts`
   * and the route is built, which turns on the footer legal link and repoints
   * the corrections link on every research article away from its `ctaHref`
   * fallback with no edit to the article.
   */
  corrections: { path: '/corrections', label: 'Corrections', indexable: true, built: true },

  // Feature-flagged off until verified case studies exist.
  results: { path: '/results', label: 'Results', indexable: false, built: false },

  // Legal routes. Approved copy arrived with the privacy and legal addendum;
  // remaining launch conditions are operational, not editorial, and are tracked
  // in CONTENT_VERIFICATION.md L6–L9.
  privacy: { path: '/privacy', label: 'Privacy Notice', indexable: true, built: true },
  terms: { path: '/terms', label: 'Terms of Use', indexable: true, built: true },
  /**
   * Linked from the footer and the Privacy Notice, never from primary
   * navigation (docs/16 §9). Left out of the sitemap because it is a
   * transactional form rather than a page worth ranking.
   */
  privacyRequest: {
    path: '/privacy-request',
    label: 'Privacy Request',
    indexable: false,
    built: true,
  },
} as const satisfies Record<string, RouteDefinition>

export type RouteKey = keyof typeof routes

/** Every route that should appear in sitemap.xml. */
export function indexableBuiltRoutes(): RouteDefinition[] {
  return Object.values(routes).filter((route) => route.built && route.indexable)
}

export function isBuilt(path: string): boolean {
  // A fragment or a query names a place on a route, not a route, so both are
  // stripped before the lookup. Without this an in-page anchor such as
  // `/diagnostic#fit` reads as an unbuilt route and is filtered out of every
  // link list that guards on this.
  const [withoutFragment = ''] = path.split('#')
  const [routePath = ''] = withoutFragment.split('?')
  return Object.values(routes).some((route) => route.path === routePath && route.built)
}

/**
 * Resolves a CTA destination while its canonical route is still unbuilt.
 *
 * Approved copy sometimes points a CTA at an editorial route that does not land
 * until Phase 6. Recording the canonical target here, rather than rewriting the
 * content object, means the link works today and reverts to its intended
 * destination the moment that route is marked `built` — no copy change required.
 */
export function ctaHref(canonical: string, fallback: string): string {
  return isBuilt(canonical) ? canonical : fallback
}
