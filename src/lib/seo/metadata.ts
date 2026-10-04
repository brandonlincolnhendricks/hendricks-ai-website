import type { Metadata } from 'next'

import { siteConfig } from '@/config/site'

type BuildMetadataInput = {
  title: string
  description: string
  /** Route path beginning with a slash. Used for the absolute canonical. */
  path: string
  /** Overrides the default OG image for routes that supply their own. */
  ogImage?: string
  /** Set false for routes that must never be indexed. */
  index?: boolean
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  /**
   * Adds `max-image-preview:large` to the robots directive.
   *
   * Restricted to research and definition pages, where the OG image is a
   * generated reading that a search engine may usefully show. Absent on
   * commercial routes so image-heavy previews cannot be mistaken for a product
   * claim or a result the page does not make.
   */
  maxImagePreview?: boolean
}

type BuildResearchCitationMetadataInput = {
  title: string
  author: string
  publicationDate: string
  /** Canonical research route, beginning with a slash. */
  path: string
  /** Optional first-party PDF rendition, beginning with a slash. */
  pdfPath?: string
}

/**
 * Build-time pin for the indexation switch.
 *
 * `VERCEL_ENV` is the system variable Vercel always sets on a deployment.
 * `NEXT_PUBLIC_VERCEL_ENV` is repo-defined: the zod schema in `src/lib/env`
 * defaults it to `development`, and `.env.example` ships that same value. It
 * drives both `robots.txt` and the `index` directive on every page, so copying
 * the example into the production environment, or simply never setting the
 * variable there, deindexes the entire site with no visible symptom on the
 * rendered page.
 *
 * Throwing here converts that silent failure into a failed deploy. Every route
 * imports this module for its `metadata` export, so the throw stops `next build`
 * before anything reaches production.
 */
if (
  process.env.VERCEL_ENV === 'production' &&
  process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production'
) {
  throw new Error(
    `VERCEL_ENV is "production" but NEXT_PUBLIC_VERCEL_ENV is "${
      process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'unset'
    }". NEXT_PUBLIC_VERCEL_ENV controls robots.txt and the index directive on ` +
      'every page, so shipping this pair would serve Disallow: / and noindex ' +
      'across the whole site. Set NEXT_PUBLIC_VERCEL_ENV=production on the ' +
      'production environment.',
  )
}

/**
 * Single metadata builder for every route (docs/06 §3).
 *
 * Indexability is environment-aware: only production emits index directives.
 * Preview and development deployments render `noindex, nofollow` through
 * rendered metadata rather than relying on robots.txt alone (docs/06 §2).
 *
 * The environment read below stays on `process.env` rather than the validated
 * `isProduction` export from `@/lib/env` that `src/app/robots.ts` uses. Two
 * things block the import here, and neither applies to `robots.ts`. That module
 * opens with `import 'server-only'`, a specifier Next aliases but Vite cannot
 * resolve, so importing it fails the whole of `tests/unit/metadata.test.ts` at
 * transform time; `robots.ts` has no unit test to break. It also snapshots its
 * value at module load, while the tests for this builder mutate
 * `NEXT_PUBLIC_VERCEL_ENV` per case.
 *
 * The guard above is what makes the difference in read style safe: it pins the
 * two variables together for both files, because a `next build` that throws
 * never emits either one.
 */
export function buildMetadata({
  title,
  description,
  path,
  ogImage,
  index = true,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  maxImagePreview = false,
}: BuildMetadataInput): Metadata {
  const canonical = new URL(path, siteConfig.url).toString()
  const isProductionEnv = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
  const shouldIndex = index && isProductionEnv
  // Follow is decoupled from index. A production route that opts out of indexing
  // still has outbound links worth crawling, and `/privacy-request` links to
  // `/privacy`. docs/06 §2 constrains nonproduction to `noindex, nofollow` and
  // says nothing about production noindex routes, so follow is gated on the
  // environment alone and nonproduction behaviour is unchanged.
  const shouldFollow = isProductionEnv

  return {
    // Absolute: the approved copy in content/pages/ supplies complete titles that
    // already carry the "| Hendricks" suffix, so the root layout's title template
    // must not append it a second time.
    title: { absolute: title },
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical },
    robots: {
      index: shouldIndex,
      follow: shouldFollow,
      ...(maxImagePreview ? { 'max-image-preview': 'large' as const } : {}),
      googleBot: { index: shouldIndex, follow: shouldFollow },
    },
    openGraph: {
      type,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title,
      description,
      url: canonical,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors ? { authors } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

/**
 * Highwire citation tags for the public research detail pages.
 *
 * Google Scholar reads these tags as bibliographic metadata. The research page
 * remains the canonical full-text source, while `citation_pdf_url` is included
 * only when the study actually publishes a first-party PDF rendition.
 * Dataset DOIs do not belong here: they identify the archived data release,
 * not the research article described by these tags. Technical-report fields
 * are omitted because these pages do not publish a genuine report number; an
 * institution without its paired report number would misclassify the work.
 */
export function buildResearchCitationMetadata({
  title,
  author,
  publicationDate,
  path,
  pdfPath,
}: BuildResearchCitationMetadataInput): NonNullable<Metadata['other']> {
  return {
    citation_title: title,
    citation_author: author,
    citation_publication_date: publicationDate,
    citation_online_date: publicationDate,
    citation_language: 'en',
    citation_fulltext_html_url: new URL(path, siteConfig.url).toString(),
    ...(pdfPath
      ? { citation_pdf_url: new URL(pdfPath, siteConfig.url).toString() }
      : {}),
  }
}
