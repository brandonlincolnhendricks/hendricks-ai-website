/**
 * Canonical site constants. Safe for both server and client.
 *
 * Wordmark note: `Hendricks.` with the signal dot is the *visual* wordmark only.
 * Prose, metadata, and accessibility labels use `Hendricks` without the period
 * (docs/01 §4).
 */
export const siteConfig = {
  name: 'Hendricks',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hendricks.ai',
  locale: 'en_US',
  category: 'Search Intelligence Engineering',
  categoryLine: 'Search Intelligence Engineering for the AI Era.',
  operatingLine:
    'Measure demand. Understand AI visibility. Engineer selection. Prove business impact.',
  problemCategory: 'The AI Selection Problem',
  visibilityTerm: 'AI Search Visibility',
  visibilityDefinition:
    'The presence of a brand in the answers AI systems compose and in the sources those answers cite.',
  description:
    'Hendricks maps valuable search demand, measures whether brands enter consideration across Google and AI search, engineers search-presence gaps, and connects the work to business impact.',
  founder: 'Brandon Lincoln Hendricks',
  // CONTENT_VERIFICATION.md F9 — confirm this is the title to publish.
  founderRole: 'Search Intelligence Engineer',
  /*
    The Person node lives on /about. jobTitle is JSON-LD only. Visible bylines
    print the name and stop.
  */
  founderPersonId: 'https://hendricks.ai/about#person',
  /**
   * Organization sameAs. Company LinkedIn only. The Search Economy is a
   * separate organization Brandon founded, not a Hendricks profile, so it
   * never appears here.
   */
  organizationSameAs: ['https://www.linkedin.com/company/hendricksai'] as const,
  /**
   * Person sameAs on /about#person only. Profiles that identify Brandon
   * himself: the personal site that is his entity home (its Person node lists
   * /about back, so the two nodes join), ORCID, personal LinkedIn, X, GitHub,
   * and the Medium profile. Company LinkedIn stays off this list.
   *
   * Publications and articles are not sameAs targets, because sameAs asserts
   * the URL identifies the same entity. The Search Economy is declared instead
   * as an organization he founded (`foundedOrganizationSchema` on /about).
   */
  personSameAs: [
    'https://brandonlincolnhendricks.com',
    'https://orcid.org/0009-0001-5728-0790',
    'https://www.linkedin.com/in/brandonlincolnhendricks',
    'https://x.com/BrandonLincolnH',
    'https://github.com/brandonlincolnhendricks',
    'https://medium.com/@brandonlincolnhendricks',
  ] as const,
} as const

export const primaryCta = {
  label: 'Start with a Diagnostic',
  href: '/diagnostic',
} as const

export type SiteConfig = typeof siteConfig
