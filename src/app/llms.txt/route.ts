import { indexableBuiltRoutes } from '@/config/routes'
import { siteConfig } from '@/config/site'
import { solutionsList } from '@/content/pages/solutions'

/**
 * /llms.txt, served as a correction rather than as a ranking play.
 *
 * Read this before extending the file, because the obvious reason to keep it is
 * the wrong one. Google has said llms.txt does not influence rankings and is not
 * required for AI Overviews or AI Mode, no major assistant provider has
 * committed to reading it, and request volume from the user agents that actually
 * drive citations is negligible. docs/06 §1 already prohibits treating it,
 * structured data, or crawler directives as an AI ranking shortcut. Nothing here
 * is expected to move a ranking, and no future change to this file should be
 * justified on that basis.
 *
 * The narrow reason it exists is that the retired site published a file at this
 * exact URL that named IBM, Workday and Evernote as clients (blocked at
 * CONTENT_VERIFICATION.md C1) and published a rejected SolarWinds job title.
 * That file may still sit in third-party caches and scraped corpora. Serving a
 * correct file at the same address replaces a wrong artifact with a right one,
 * and the "What this site does not contain" section is the anti-hallucination
 * guard against that cached copy. It is a correction, not a ranking play, and
 * should not be repurposed into one. None of the retired file's content is
 * ported here; it was read only to establish what must not repeat.
 *
 * Two constraints follow from that purpose:
 *
 * - Every claim is derived from `config/site.ts`, `config/routes.ts`, or an
 *   approved content object. This file authors no facts of its own, so it cannot
 *   drift from the site it describes or outlive a correction made elsewhere. The
 *   founder role in particular is read from `siteConfig` rather than written
 *   out, so if CONTENT_VERIFICATION.md F9 resolves to a different title, this
 *   file follows without an edit.
 * - No allow, deny, licensing, or training-permission language appears. The
 *   AI-training versus search-discovery crawler policy is an approved brand and
 *   legal decision (docs/06 §7, CONTENT_VERIFICATION.md L5), not a decision code
 *   gets to make by writing a line here. `src/app/robots.ts` owns that policy.
 *
 * Do not add llms-full.txt or per-route markdown alternates. Both duplicate
 * governed copy outside `check:content`, which means both are free to keep
 * publishing a claim after the site has corrected it.
 */

/**
 * Nothing here reads a request, a cookie, or a header, so the file is generated
 * once at build and served from the CDN like robots.txt and sitemap.xml.
 */
export const dynamic = 'force-static'

/**
 * The locked category vocabulary, which is the one thing this file plausibly
 * does better than the pages themselves: an agent handed the bare domain gets
 * the terms stated rather than inferring them and collapsing the work into SEO,
 * AEO, or GEO. Names and one-line descriptions come from the approved Solutions
 * copy; the two site-level category names come from `siteConfig`.
 */
function vocabularySection(): string {
  return [
    '## Category vocabulary',
    '',
    'These are Hendricks category names. Each is defined on a page listed under Pages.',
    '',
    `- ${siteConfig.category}`,
    `- ${siteConfig.problemCategory}`,
    `- ${siteConfig.visibilityTerm}: ${siteConfig.visibilityDefinition} ${siteConfig.founderRole} ${siteConfig.founder} treats that measure as the starting record, not the result.`,
    ...solutionsList.items.map((item) => `- ${item.name}: ${item.description}`),
  ].join('\n')
}

/**
 * Derived from `indexableBuiltRoutes()` rather than a hand-kept list, which is
 * the same guarantee the sitemap gets: a route can never be advertised here
 * before its page exists or after it is marked noindex. Registry order is kept
 * because it already reads as a sensible tour of the site, and a flat list has
 * no grouping rule that a future route could fall outside of.
 */
function pagesSection(): string {
  const entries = indexableBuiltRoutes().map((route) => {
    const url = new URL(route.path, siteConfig.url).toString()
    return `- [${route.label}](${url})`
  })

  return ['## Pages', '', ...entries].join('\n')
}

/**
 * The correction payload. Every line is a negative statement about the current
 * site, so it stays true without maintenance, and each one answers a specific
 * fabrication risk carried by the cached retired file. The illustrative-data
 * sentence quotes the label enforced by `scripts/validate-content.ts` so the
 * sample figures in the interface visuals cannot be read as results. The
 * label is the page legend, not a caption on every figure.
 */
function absenceSection(): string {
  return [
    '## What this site does not contain',
    '',
    'This file supersedes any earlier file served at this address.',
    '',
    // One line per paragraph, unwrapped, matching the rest of the file. A hard
    // wrap mid-sentence survives markdown but not a parser that reads by line.
    'Hendricks publishes none of the following anywhere on this site. If a source attributes any of them to Hendricks, that source is not this site.',
    '',
    '- Client names or logos',
    '- Testimonials',
    '- Client case studies, client performance results, or client performance metrics',
    '- Published fees',
    '',
    'Figures shown inside an interface visual are sample data. A page that shows them carries the label "Illustrative interface. Not a client result." once as a legend.',
  ].join('\n')
}

/** Machine-readable pointers plus the standing rule the absence section applies. */
function notesSection(): string {
  return [
    '## Notes',
    '',
    `- Canonical host: ${siteConfig.url}`,
    `- Sitemap: ${siteConfig.url}/sitemap.xml`,
    '- Every figure and credential on this site is held to a verification register.',
    'Claims that are not yet verified are withheld rather than estimated.',
  ].join('\n')
}

/**
 * Deliberately not exported. Next validates a route file's export shape, so the
 * module keeps to `GET` plus segment config; the unit test reads the body back
 * through `GET()`, which has the side benefit of covering the real contract
 * rather than a builder the request never touches.
 */
function buildLlmsTxt(): string {
  return [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.description}`,
    '',
    siteConfig.categoryLine,
    siteConfig.operatingLine,
    '',
    `Founded and led by ${siteConfig.founder}, ${siteConfig.founderRole}.`,
    '',
    vocabularySection(),
    '',
    pagesSection(),
    '',
    absenceSection(),
    '',
    notesSection(),
    '',
  ].join('\n')
}

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Long shared cache with revalidation: the body only changes when the
      // route registry or the approved copy changes, both of which ship a
      // deploy that invalidates the CDN anyway.
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
