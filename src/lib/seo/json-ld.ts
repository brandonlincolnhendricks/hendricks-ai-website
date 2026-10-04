import { siteConfig } from '@/config/site'
import { CITATION_PROBE_MEASUREMENT_TECHNIQUE } from '@/content/research/citation-run-constants'

/**
 * Escapes characters that could break out of a <script> context.
 *
 * `<` is the critical one — an unescaped `</script>` inside a string value would
 * terminate the block early (docs/06 §9). U+2028/U+2029 are escaped because they
 * are valid JSON but invalid in JavaScript string literals.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/**
 * Organization node.
 *
 * Founding date, address, and contact point stay omitted until verified.
 * sameAs is the company LinkedIn URL only. The Search Economy is a separate
 * organization Brandon founded (see `foundedOrganizationSchema`), not a
 * Hendricks profile, so it never appears here.
 */
export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    /*
      The registered entity behind the trade name, confirmed in
      LEGAL_ENTITY_UPDATE.md and already published in visible copy: /terms opens
      "The Site is operated by Hendricks Agency LLC, doing business as
      Hendricks", and /privacy names the same entity in its controller block.

      This is the one identity field that resolves the "Hendricks" collision
      against a filing a machine can check, which is why it belongs here while
      address, contactPoint, and foundingDate stay omitted: those are still
      unverified per CONTENT_VERIFICATION.md O1-O3. sameAs is the confirmed
      company LinkedIn URL only.
    */
    legalName: 'Hendricks Agency LLC',
    sameAs: [...siteConfig.organizationSameAs],
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: new URL('/brand/hendricks-wordmark-light.png', siteConfig.url).toString(),
      width: 2346,
      height: 507,
    },
    description: siteConfig.description,
    /*
      "Hendricks" collides with a gin brand, a NASCAR team, an Indiana county,
      and a hospital system. Nothing in the graph currently tells a resolver
      which subject area this one occupies, so the name alone has to do all the
      disambiguating work and cannot.

      Every term below names a discipline the site visibly describes across
      /solutions, /methodology, and the definition pages. The two expanded
      abbreviations are the standard expansions of "GEO/AEO", which renders
      visibly in the discipline table at
      `content/pages/what-is-search-intelligence-engineering.ts:52`.

      None of these asserts a credential, a client, or a result, so none is
      gated on CONTENT_VERIFICATION.md. `slogan` is the visible homepage h1
      verbatim.
    */
    slogan: siteConfig.categoryLine,
    knowsAbout: [
      'Search Intelligence Engineering',
      'Selection Intelligence',
      'Answer engine optimization',
      'Generative engine optimization',
      'AI search visibility',
      'Search demand analysis',
      'Search impact measurement',
      'Organic search',
      'Paid search',
    ],
    founder: {
      '@type': 'Person',
      '@id': siteConfig.founderPersonId,
      name: siteConfig.founder,
    },
  }
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { '@id': `${siteConfig.url}/#organization` },
    inLanguage: 'en-US',
  }
}

/**
 * WebPage node, or a supported subtype.
 *
 * `type` exists because docs/06 §8 names `AboutPage` for /about, and because a
 * bare `WebPage` on every route tells a parser nothing about what any page is.
 * Only subtypes schema.org actually defines are accepted.
 *
 * `mainEntity` is what declares a page's subject. Without it the only thing the
 * graph says about a definition page is that it belongs to a website.
 *
 * `datePublished` and `dateModified` are optional and must be passed ONLY for
 * pages carrying a visible date a reader can check. Stamping the rest with a
 * build date asserts a review that nobody performed.
 *
 * Supporting studies belong on this WebPage through `citation`. They are works
 * the page cites, not alternate identities for the DefinedTerm it describes.
 */
export function webPageSchema({
  path,
  title,
  description,
  type = 'WebPage',
  about,
  mainEntity,
  mainEntityFragment,
  hasBreadcrumb = false,
  datePublished,
  dateModified,
  author,
  citation,
}: {
  path: string
  title: string
  description: string
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage'
  /** Overrides the default `about: Organization`. Pass null to omit it entirely. */
  about?: { '@id': string } | null
  mainEntity?: { '@id': string }
  /**
   * Shorthand for a subject node defined on this same page, such as `service`
   * or `term`. Saves every caller from rebuilding the absolute URL, which is
   * where `@id` mismatches creep in.
   */
  mainEntityFragment?: string
  /** Set when the page renders <Breadcrumbs>, which emits the matching node. */
  hasBreadcrumb?: boolean
  datePublished?: string
  dateModified?: string
  /** Expanded Person author. sameAs stays on /about#person only. */
  author?: ReturnType<typeof personAuthor>
  /** Visible supporting works cited by this CreativeWork. */
  citation?: string | readonly string[]
}) {
  const url = new URL(path, siteConfig.url).toString()
  const aboutNode = about === undefined ? { '@id': `${siteConfig.url}/#organization` } : about
  const subject = mainEntity ?? (mainEntityFragment ? { '@id': `${url}#${mainEntityFragment}` } : undefined)
  const citations = citation
    ? typeof citation === 'string'
      ? citation
      : [...citation]
    : undefined

  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    ...(aboutNode ? { about: aboutNode } : {}),
    ...(subject ? { mainEntity: subject } : {}),
    ...(hasBreadcrumb ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(author ? { author } : {}),
    ...(citations ? { citation: citations } : {}),
    inLanguage: 'en-US',
  }
}

/**
 * Service node for a solution page.
 *
 * docs/06 §8 requires this on the solution pages and specifies that it use the
 * visible service description and provider information. Nothing in the graph
 * currently states what Hendricks sells.
 *
 * Commercial and reputation fields are deliberately absent, and must stay that
 * way: no `offers`, `hasOfferCatalog`, `priceSpecification`, `price`,
 * `priceRange`, `areaServed`, `aggregateRating`, or `review`.
 *
 * The pricing half is settled, not pending: CONTENT_VERIFICATION.md P1–P3
 * resolved every fee as withheld, so no page renders an amount, a currency, or
 * a catalog of purchasable items. Markup that named one would be the only place
 * on the site asserting a price, which is exactly the drift docs/06 §9 forbids.
 * The rating half is worse than unsupported: `aggregateRating` and `review`
 * assert third-party testimony, and the site publishes none.
 *
 * `mainEntityOfPage` closes the loop with `webPageSchema({ mainEntityFragment:
 * 'service' })` so the page and its subject reference each other rather than
 * leaving the Service floating in the graph.
 */
export function serviceSchema({
  path,
  name,
  description,
  serviceOutput,
}: {
  path: string
  name: string
  description: string
  /** Deliverable names, taken verbatim from the page's rendered list. */
  serviceOutput?: readonly string[]
}) {
  const url = new URL(path, siteConfig.url).toString()
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    description,
    url,
    serviceType: siteConfig.category,
    provider: { '@id': `${siteConfig.url}/#organization` },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    ...(serviceOutput?.length
      ? { serviceOutput: serviceOutput.map((item) => ({ '@type': 'Thing', name: item })) }
      : {}),
  }
}

/**
 * ItemList for an ordered sequence rendered visibly on the page.
 *
 * `ItemList` rather than `HowTo`: Google retired HowTo rich results, and these
 * are steps Hendricks performs, not steps the reader performs.
 */
export function itemListSchema({
  path,
  name,
  items,
}: {
  path: string
  name: string
  items: readonly { name: string; description?: string }[]
}) {
  const url = new URL(path, siteConfig.url).toString()
  return {
    '@type': 'ItemList',
    '@id': `${url}#${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
    })),
  }
}

/**
 * Expanded Person author for page and article graphs.
 *
 * sameAs is omitted here. It is emitted only on the /about#person node.
 */
export function personAuthor() {
  return {
    '@type': 'Person',
    '@id': siteConfig.founderPersonId,
    name: siteConfig.founder,
    jobTitle: siteConfig.founderRole,
    url: new URL('/about', siteConfig.url).toString(),
  }
}

export type AlumniRole = {
  name: string
  jobTitle: string
}

/**
 * Person node for the founder, emitted on /about only.
 *
 * `@id` is https://hendricks.ai/about#person. sameAs is the Person-level join
 * list in `siteConfig.personSameAs`: the personal site, personal LinkedIn, X,
 * GitHub, Medium, and ORCID. Company LinkedIn stays off this node. Authored
 * datasets connect to this Person through Dataset.creator; they are neither
 * alternate identities nor works about Brandon.
 */
export function personSchema({
  jobTitle,
  imagePath,
  alumniOf,
}: {
  jobTitle: string
  imagePath: string
  /**
   * Former employers, verified per CONTENT_VERIFICATION.md F3 and F4.
   *
   * Only organizations Brandon was employed by belong here. Brands reached as
   * clients through a former employer are excluded by docs/12 §6, so this list
   * must never grow to include them.
   */
  alumniOf?: readonly AlumniRole[]
}) {
  return {
    '@type': 'Person',
    '@id': siteConfig.founderPersonId,
    name: siteConfig.founder,
    jobTitle,
    url: new URL('/about', siteConfig.url).toString(),
    image: new URL(imagePath, siteConfig.url).toString(),
    worksFor: { '@id': `${siteConfig.url}/#organization` },
    sameAs: [...siteConfig.personSameAs],
    ...(alumniOf?.length
      ? {
          alumniOf: alumniOf.map((role) => ({
            '@type': 'OrganizationRole',
            roleName: role.jobTitle,
            alumniOf: { '@type': 'Organization', name: role.name },
          })),
        }
      : {}),
  }
}

/**
 * Organization the founder started outside Hendricks, emitted on /about only.
 *
 * Declares the founding relationship the biography states in visible copy,
 * which is the accurate join: sameAs would claim the publication's homepage
 * identifies Brandon himself. The `@id` is the same IRI the publication's own
 * site uses for its organization node, so both sites describe one entity.
 * Name and URL come from the About content object rather than literals.
 */
export function foundedOrganizationSchema({
  name,
  url,
  type = 'Organization',
}: {
  name: string
  url: string
  type?: 'Organization' | 'NewsMediaOrganization'
}) {
  return {
    '@type': type,
    '@id': new URL('/#organization', url).toString(),
    name,
    url,
    founder: { '@id': siteConfig.founderPersonId },
  }
}

/**
 * DefinedTerm node for a definition page.
 *
 * docs/06 §8 allows this only where it reproduces visible content, and warns
 * against expecting a rich result from it. `description` is therefore the page's
 * visible direct answer verbatim, not a summary written for crawlers.
 *
 * The terms are grouped into one `DefinedTermSet` so the vocabulary reads as a
 * deliberate set rather than four unrelated pages.
 *
 * A DefinedTerm intentionally carries neither `sameAs` nor `citation`. A study
 * can support the page that defines a term without being the same entity as the
 * term, and WebPage is the CreativeWork that performs the citation.
 */
export function definedTermSchema({
  path,
  term,
  directAnswer,
}: {
  path: string
  term: string
  directAnswer: string
}) {
  const url = new URL(path, siteConfig.url).toString()
  return {
    '@type': 'DefinedTerm',
    '@id': `${url}#term`,
    name: term,
    description: directAnswer,
    url,
    // Reference only. The set itself is emitted once, by definedTermSetSchema,
    // so the vocabulary resolves to a single node that actually lists members
    // rather than to an inline stub repeated on each page with none.
    inDefinedTermSet: { '@id': `${siteConfig.url}/#vocabulary` },
  }
}

/**
 * The vocabulary node itself, emitted alongside a DefinedTerm.
 *
 * Previously the set was inlined into every `DefinedTerm` with no
 * `hasDefinedTerm`, so it declared a named vocabulary containing nothing. The
 * members below are the definition pages that are actually built and live;
 * `isBuilt` keeps a term from being advertised before its page exists.
 */
export function definedTermSetSchema(terms: readonly { name: string; path: string }[]) {
  return {
    '@type': 'DefinedTermSet',
    '@id': `${siteConfig.url}/#vocabulary`,
    name: 'Search Intelligence Engineering vocabulary',
    url: siteConfig.url,
    publisher: { '@id': `${siteConfig.url}/#organization` },
    hasDefinedTerm: terms.map((term) => ({
      '@type': 'DefinedTerm',
      '@id': `${new URL(term.path, siteConfig.url).toString()}#term`,
      name: term.name,
      url: new URL(term.path, siteConfig.url).toString(),
    })),
  }
}

export type BreadcrumbEntry = { label: string; href?: string }

export function breadcrumbSchema(items: BreadcrumbEntry[], path?: string) {
  // The `@id` lets a page's WebPage node reference this list by `breadcrumb`
  // instead of leaving it floating unattached in the document.
  const id = path ? `${new URL(path, siteConfig.url).toString()}#breadcrumb` : undefined
  return {
    '@type': 'BreadcrumbList',
    ...(id ? { '@id': id } : {}),
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: new URL(item.href, siteConfig.url).toString() } : {}),
    })),
  }
}

/**
 * Article node for a research study.
 *
 * `author` is always an `@id` reference to the one Person node (D-B). It is
 * never a repeated inline person object, which would create a second unlinked
 * Person rather than pointing at the one already in the graph.
 *
 * `about` carries the claim class as a DefinedTerm reference so a resolver
 * knows what kind of claim the study makes without reading the page. It is
 * omitted when the caller passes no claim class.
 *
 * `dateModified` is derived from the last change-history entry rather than
 * authored. The caller passes the already-derived value (latestChangeDate),
 * which keeps this function free of the content import cycle.
 *
 * Commercial and reputation fields are absent for the same reason they are
 * absent from serviceSchema: no offers, aggregateRating, or review.
 */
export function articleAuthor() {
  return personAuthor()
}

export function articleSchema({
  path,
  headline,
  description,
  articleSection,
  datePublished,
  dateModified,
  claimClass,
  identifier,
  isBasedOn,
}: {
  path: string
  headline: string
  description: string
  articleSection: string
  datePublished: string
  dateModified: string
  claimClass?: string
  /** Primary run id or ids this article is read from. */
  identifier?: string | readonly string[]
  /** Dataset nodes this article is based on. */
  isBasedOn?: readonly { '@id': string }[]
}) {
  const url = new URL(path, siteConfig.url).toString()
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline,
    description,
    url,
    articleSection,
    datePublished,
    dateModified,
    author: articleAuthor(),
    publisher: { '@id': `${siteConfig.url}/#organization` },
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    inLanguage: 'en-US',
    ...(identifier
      ? { identifier: typeof identifier === 'string' ? identifier : [...identifier] }
      : {}),
    ...(isBasedOn?.length ? { isBasedOn: [...isBasedOn] } : {}),
    ...(claimClass
      ? {
          about: {
            '@type': 'DefinedTerm',
            name: claimClass,
            inDefinedTermSet: { '@id': `${siteConfig.url}/#vocabulary` },
          },
        }
      : {}),
  }
}

/**
 * Dataset node for a study that publishes a data package (17 S-10).
 *
 * All values are read from the study's own typed `ResearchDataset` record so
 * the graph and the page carry identical text. The licence is read from the
 * content rather than assumed; the DOI is the version DOI, carried as both
 * `identifier` and `sameAs` so resolvers that use either property find it;
 * and `distribution` matches the files the page links to.
 *
 * `temporalCoverage`, `variableMeasured`, and both distribution entries are
 * required by the HANDOFF section 4.2 validator, so a Dataset without them
 * fails `check:jsonld` rather than silently omitting machine-readable metadata.
 *
 * `creator` points at the one Person node (D-B), matching `articleSchema`'s
 * author convention.
 */
export function datasetSchema({
  path,
  name,
  description,
  version,
  keywords,
  isAccessibleForFree,
  doi,
  license,
  temporalCoverage,
  variableMeasured,
  distribution,
}: {
  path: string
  name: string
  description: string
  version: string
  keywords: readonly string[]
  isAccessibleForFree: boolean
  doi: { label: string; href: string }
  license: { name: string; href: string }
  temporalCoverage: string
  variableMeasured: readonly string[]
  distribution: {
    contentUrl: string
    encodingFormat: string
    contentSize: number
    sha256: string
  }
}) {
  const url = new URL(path, siteConfig.url).toString()
  return {
    '@type': 'Dataset',
    '@id': `${url}#dataset`,
    name,
    description,
    version,
    keywords: [...keywords],
    isAccessibleForFree,
    identifier: doi.href,
    sameAs: doi.href,
    url,
    license: license.href,
    creator: { '@id': siteConfig.founderPersonId },
    publisher: { '@id': `${siteConfig.url}/#organization` },
    temporalCoverage,
    variableMeasured: variableMeasured.map((v) => ({ '@type': 'PropertyValue', name: v })),
    distribution: [
      {
        '@type': 'DataDownload',
        contentUrl: new URL(distribution.contentUrl, siteConfig.url).toString(),
        encodingFormat: distribution.encodingFormat,
        contentSize: String(distribution.contentSize),
      },
    ],
    isPartOf: { '@id': `${url}#article` },
  }
}

/**
 * Dataset node for a first-party citation-presence run archive.
 *
 * Identifier is the run id, not a DOI. measurementTechnique is the locked
 * citation-presence sentence. Description must name citation presence and must
 * not name consideration, OCR, ORR, Selection Stability, or Commercial
 * Selection Gap.
 */
export function citationDatasetSchema({
  path,
  runId,
  name,
  description,
  temporalCoverage,
  contentUrl,
  hasPart,
}: {
  path: string
  runId: string
  name: string
  description: string
  temporalCoverage: string
  contentUrl: string
  hasPart?: readonly { '@id': string }[]
}) {
  const url = new URL(path, siteConfig.url).toString()
  return {
    '@type': 'Dataset',
    '@id': `${url}#dataset-${runId}`,
    name,
    description,
    identifier: runId,
    url: new URL(contentUrl, siteConfig.url).toString(),
    creator: articleAuthor(),
    publisher: { '@id': `${siteConfig.url}/#organization` },
    measurementTechnique: CITATION_PROBE_MEASUREMENT_TECHNIQUE,
    temporalCoverage,
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'Citation presence' },
      { '@type': 'PropertyValue', name: 'Cited URL host' },
    ],
    distribution: [
      {
        '@type': 'DataDownload',
        contentUrl: new URL(contentUrl, siteConfig.url).toString(),
        encodingFormat: 'application/json',
      },
    ],
    isPartOf: { '@id': `${url}#article` },
    ...(hasPart?.length ? { hasPart: [...hasPart] } : {}),
  }
}

/** Wraps nodes in a single @graph so each page emits one script tag. */
export function jsonLdGraph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes }
}
