import { features } from './feature-flags'
import { isBuilt, routes } from './routes'

export type NavigationItem = {
  label: string
  href: string
}

/**
 * Primary navigation (redesign 03 section 2; docs/03 section 2; decisions D-F
 * and D-G).
 *
 * Six routes in the D-F order, every one a real route and never an in-page
 * anchor, plus the header CTA. No entry carries children.
 *
 * Deliberately excluded: The Search Economy, Platform, Pricing, Methodology,
 * Contact and the definition pages. The Search Economy is an external
 * publication and may appear only inside Brandon's biography on /about; the
 * rest are reachable from the footer on every route.
 *
 * Every list is filtered through `isBuilt` so navigation never advertises a
 * route that does not exist yet. Without this, Next.js prefetches the link on
 * hover and the browser records a 404. Entries defined here reappear
 * automatically when their route lands.
 */
function built(items: NavigationItem[]): NavigationItem[] {
  return items.filter((item) => isBuilt(item.href))
}

/** The four solution pages. Footer only: D-G keeps them out of the header. */
export const solutionsNavigation: NavigationItem[] = built([
  { label: 'Search Demand Intelligence', href: routes.searchDemandIntelligence.path },
  { label: 'Selection Intelligence', href: routes.selectionIntelligence.path },
  { label: 'Search Presence Engineering', href: routes.searchPresenceEngineering.path },
  { label: 'Search Impact Measurement', href: routes.searchImpactMeasurement.path },
])

export const primaryNavigation: NavigationItem[] = built([
  /*
    Decision D-G (2026-09-02): Solutions is a plain link to the hub, not a
    dropdown, and the four solution names do not appear in the header. A
    dropdown asks a visitor to choose between four terms before the page has
    taught them, which is the comprehension failure the audit recorded on the
    live site. The four pages stay reachable from the hub and from the footer.
  */
  { label: 'Solutions', href: routes.solutions.path },
  { label: 'How It Works', href: routes.howItWorks.path },
  { label: 'For Brands', href: routes.forBrands.path },
  { label: 'For Agencies', href: routes.forAgencies.path },
  /*
    Restored with the header rebuild (CANON R6 default; redesign 03 section 2).

    content/pages/12-research.md line 88 gated this link on publishing at
    least three category foundation pages. The four definition pages are
    built and indexed and five studies are registered under /research, so the
    gate is met under both readings. Closing CONTENT_VERIFICATION R6 is
    Brandon's act, not a build commit. See the matching note on
    `routes.research` in ./routes.ts.
  */
  { label: 'Research', href: routes.research.path },
  { label: 'About', href: routes.about.path },
])

/**
 * Whether `href` is the current route or an ancestor of it, for
 * `aria-current="page"` (16 KF-10). The homepage matches only itself, so the
 * wordmark link and a `/` entry never light up on every route.
 */
export function isCurrentRoute(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
}

/**
 * The two in-page anchors on /diagnostic. Each section that owns an id renders
 * it from the constant here, so a target and the link to it cannot drift
 * (14 DX-25). They live in the config rather than beside the page copy because
 * the header reads one of them on every route.
 */
export const DIAGNOSTIC_FIT_ID = 'fit'
export const DIAGNOSTIC_FIT_ANCHOR = `#${DIAGNOSTIC_FIT_ID}`
export const DIAGNOSTIC_APPLY_ID = 'apply'
export const DIAGNOSTIC_APPLY_ANCHOR = `#${DIAGNOSTIC_APPLY_ID}`

/**
 * The header button's destination (redesign 03 section 2; 14 DX-05; register
 * B1). On /diagnostic it points at the application, per 15 section 1: the most
 * persistent CTA never reloads the page the visitor is converting on, and its
 * words are an instruction to apply. The hero's own CTA is the one that goes
 * to the fit check first (15 decision 2). The label never varies by route
 * (WCAG 3.2.4).
 */
export function headerCtaHref(pathname: string): string {
  return pathname === routes.diagnostic.path ? DIAGNOSTIC_APPLY_ANCHOR : routes.diagnostic.path
}

/** Footer architecture (redesign 03 section 3). Results appears only when enabled. */
export const footerNavigation = {
  solutions: {
    heading: 'Solutions',
    items: built([
      ...solutionsNavigation,
      { label: 'Search Intelligence Diagnostic', href: routes.diagnostic.path },
      /* The free instrument sits under Solutions so every route links to it
         once, which is the sitewide internal link the check page needs. */
      { label: 'Free AI Visibility Check', href: routes.aiVisibilityCheck.path },
    ]),
  },
  audiences: {
    heading: 'Who We Help',
    items: built([
      { label: 'For Brands', href: routes.forBrands.path },
      { label: 'For Agencies', href: routes.forAgencies.path },
    ]),
  },
  company: {
    heading: 'Company',
    items: built([
      { label: 'How It Works', href: routes.howItWorks.path },
      { label: 'About', href: routes.about.path },
      { label: 'Contact', href: routes.contact.path },
      ...(features.showResults ? [{ label: 'Results', href: routes.results.path }] : []),
    ]),
  },
  /**
   * Definition pages live here rather than in primary navigation.
   *
   * Primary navigation is the commercial path and every entry on it is a page a
   * buyer converts from. The definition pages are read before a buyer knows what
   * Hendricks is called, so they belong in the persistent footer, which appears
   * on every route and therefore gives each one a sitewide internal link. The
   * two entry-vocabulary pages are listed on the same terms as the four that
   * preceded them: reachability, not promotion.
   */
  research: {
    heading: 'Research',
    items: built([
      { label: 'Research Hub', href: routes.research.path },
      {
        label: 'What Is Search Intelligence Engineering?',
        href: routes.whatIsSearchIntelligenceEngineering.path,
      },
      {
        label: 'What Is Selection Intelligence?',
        href: routes.whatIsSelectionIntelligence.path,
      },
      {
        label: 'What Is AI-Mediated Search?',
        href: routes.whatIsAiMediatedSearch.path,
      },
      {
        label: 'What Is Generative Engine Optimization?',
        href: routes.whatIsGenerativeEngineOptimization.path,
      },
      { label: 'The AI Selection Problem', href: routes.aiSelectionProblem.path },
      {
        label: 'AI Visibility Tool or Partner',
        href: routes.aiVisibilityToolOrPartner.path,
      },
      { label: 'Methodology', href: routes.methodology.path },
    ]),
  },
} as const

/**
 * Footer legal row (legal/01 section 11).
 *
 * Deliberately omits a "Do Not Sell or Share My Personal Information" link:
 * Hendricks neither sells personal information nor shares it for cross-context
 * behavioral advertising at launch, so the link would misdescribe the site. It
 * becomes required before any advertising, retargeting, or audience-matching
 * technology is introduced.
 *
 * The Privacy Choices control is not listed here because it is a button that
 * reopens the consent manager, not a route. The footer inserts it at
 * `PRIVACY_CHOICES_POSITION` on every route (09 5.4, SM-07).
 */
export const legalNavigation = built([
  { label: 'Privacy Notice', href: routes.privacy.path },
  { label: 'Terms of Use', href: routes.terms.path },
  { label: 'Privacy Request', href: routes.privacyRequest.path },
  { label: 'Corrections', href: routes.corrections.path },
])

/**
 * Index of the Privacy Choices button in the legal row: fourth, after Privacy
 * Request and before Corrections. A position rather than a neighbour, so the
 * consent withdrawal path survives a neighbouring route being unbuilt or the
 * list being reordered.
 */
export const PRIVACY_CHOICES_POSITION = 3
