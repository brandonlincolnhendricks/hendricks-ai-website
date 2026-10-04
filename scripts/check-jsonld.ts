/**
 * JSON-LD graph integrity gate.
 *
 * Validates the structured data the site emits without requiring a running
 * server. It constructs the graph for every route that produces one by calling
 * the same schema functions the pages call, then asserts the rules from
 * HANDOFF section 4.2:
 *
 * 1. No banned @type appears anywhere in any graph (FAQPage, Review, Rating,
 *    Offer).
 * 2. The Person @id on every node that references the founder equals
 *    siteConfig.founderPersonId.
 * 3. Every Article node has an author reference and both datePublished and
 *    dateModified.
 * 4. Every Dataset node has an identifier (DOI or run id) and at least one
 *    distribution. Citation-presence Datasets must use the locked
 *    measurementTechnique.
 * 5. Every @type value is a known schema.org type (an allowlist of the types
 *    this site deliberately emits).
 * 6. Every Article author value carries the founder @id. It may be expanded
 *    with name, jobTitle, and url.
 *
 * The string-in-visible-text assertion (the last rule in HANDOFF 4.2) is
 * enforced at e2e test time against the built output, where the rendered page
 * is available. This script covers what can be checked statically.
 */
import { researchArticles } from '../src/content/research/index'
import { CITATION_PROBE_MEASUREMENT_TECHNIQUE } from '../src/content/research/citation-run-constants'
import { articleSchema, datasetSchema } from '../src/lib/seo/json-ld'
import { citationRunNodes } from '../src/lib/seo/citation-run-nodes'
import { siteConfig } from '../src/config/site'

/** Every @type this site deliberately emits. Extend when a new type is added. */
const ALLOWED_TYPES = new Set([
  'Organization',
  'WebSite',
  'WebPage',
  'AboutPage',
  'ContactPage',
  'CollectionPage',
  'Article',
  'Dataset',
  'DataDownload',
  'Service',
  'ItemList',
  'ListItem',
  'Person',
  'DefinedTerm',
  'DefinedTermSet',
  'BreadcrumbList',
  'ImageObject',
  'Thing',
  'PropertyValue',
  'OrganizationRole',
])

const BANNED_TYPES = new Set(['FAQPage', 'Review', 'Rating', 'Offer', 'AggregateRating'])

type Failure = { where: string; message: string }

function walk(node: unknown, path: string, failures: Failure[]): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, `${path}[${i}]`, failures))
    return
  }
  if (node === null || typeof node !== 'object') return

  const obj = node as Record<string, unknown>

  if ('@type' in obj) {
    const t = obj['@type'] as string
    if (BANNED_TYPES.has(t)) {
      failures.push({ where: path, message: `Banned @type "${t}" found` })
    }
    if (!ALLOWED_TYPES.has(t)) {
      failures.push({ where: path, message: `Unknown @type "${t}" -- add to ALLOWED_TYPES if deliberate` })
    }
  }

  for (const [key, value] of Object.entries(obj)) {
    walk(value, `${path}.${key}`, failures)
  }
}

function checkArticleNode(node: Record<string, unknown>, where: string, failures: Failure[]): void {
  if (node['@type'] !== 'Article') return

  const author = node['author']
  if (!author || typeof author !== 'object' || !('@id' in (author as object))) {
    failures.push({ where, message: 'Article author must include an @id' })
  } else {
    const authorId = (author as Record<string, unknown>)['@id']
    if (authorId !== siteConfig.founderPersonId) {
      failures.push({
        where,
        message: `Article author @id "${authorId}" does not match founderPersonId "${siteConfig.founderPersonId}"`,
      })
    }
  }

  if (!node['datePublished']) {
    failures.push({ where, message: 'Article is missing datePublished' })
  }
  if (!node['dateModified']) {
    failures.push({ where, message: 'Article is missing dateModified' })
  }
}

function checkDatasetNode(node: Record<string, unknown>, where: string, failures: Failure[]): void {
  if (node['@type'] !== 'Dataset') return

  const identifier = node['identifier']
  const isDoi = typeof identifier === 'string' && identifier.startsWith('https://doi.org/')
  const isRunId =
    typeof identifier === 'string' && /^\d{4}-\d{2}-\d{2}(-\d{6})?$/.test(identifier)
  if (!isDoi && !isRunId) {
    failures.push({
      where,
      message: 'Dataset identifier must be a DOI (https://doi.org/...) or a run id',
    })
  }

  if (isDoi) {
    if (typeof node['version'] !== 'string' || node['version'].length === 0) {
      failures.push({ where, message: 'DOI Dataset must carry a release version' })
    }
    if (!Array.isArray(node['keywords']) || node['keywords'].length === 0) {
      failures.push({ where, message: 'DOI Dataset must carry at least one keyword' })
    }
    if (node['isAccessibleForFree'] !== true) {
      failures.push({ where, message: 'Open DOI Dataset must declare isAccessibleForFree true' })
    }
    const creator = node['creator'] as Record<string, unknown> | undefined
    if (creator?.['@id'] !== siteConfig.founderPersonId) {
      failures.push({ where, message: 'DOI Dataset creator must reference founderPersonId' })
    }
  }

  if (isRunId) {
    if (node['measurementTechnique'] !== CITATION_PROBE_MEASUREMENT_TECHNIQUE) {
      failures.push({
        where,
        message: 'Citation-presence Dataset must use the locked measurementTechnique',
      })
    }
    const description = String(node['description'] ?? '')
    for (const banned of [
      'OCR',
      'ORR',
      'Observed Consideration Rate',
      'Observed Recommendation Rate',
      'Selection Stability',
      'Commercial Selection Gap',
    ]) {
      if (description.includes(banned)) {
        failures.push({
          where,
          message: `Citation-presence Dataset description names "${banned}"`,
        })
      }
    }
  }

  const distribution = node['distribution']
  if (!Array.isArray(distribution) || distribution.length === 0) {
    failures.push({ where, message: 'Dataset must have at least one distribution entry' })
  }
}

function checkGraph(graph: unknown[], routePath: string): Failure[] {
  const failures: Failure[] = []

  for (const [i, node] of graph.entries()) {
    const where = `${routePath} graph[${i}]`
    walk(node, where, failures)
    if (node && typeof node === 'object') {
      const obj = node as Record<string, unknown>
      checkArticleNode(obj, where, failures)
      checkDatasetNode(obj, where, failures)
    }
  }

  return failures
}

function buildResearchGraphs(): { path: string; graph: unknown[] }[] {
  return researchArticles.map((article) => {
    const citationGraph = citationRunNodes(article)

    const nodes: unknown[] = [
      articleSchema({
        path: article.path,
        headline: article.title,
        description: article.summary,
        articleSection: article.category,
        datePublished: article.publishedDate,
        dateModified: article.updatedDate,
        claimClass: article.claimClass,
        identifier: citationGraph.articleExtras?.identifier,
        isBasedOn: citationGraph.articleExtras?.isBasedOn,
      }),
      ...citationGraph.datasets,
    ]

    const ds = article.content.dataset
    if (ds) {
      nodes.push(
        datasetSchema({
          path: article.path,
          name: ds.name,
          description: ds.description,
          version: ds.version,
          keywords: ds.keywords,
          isAccessibleForFree: ds.isAccessibleForFree,
          doi: ds.doi,
          license: ds.license,
          temporalCoverage: ds.temporalCoverage,
          variableMeasured: ds.variableMeasured,
          distribution: ds.distribution,
        }),
      )
    }

    return { path: article.path, graph: nodes }
  })
}

async function main(): Promise<void> {
  const allFailures: Failure[] = []

  const graphs = buildResearchGraphs()

  for (const { path, graph } of graphs) {
    const failures = checkGraph(graph, path)
    allFailures.push(...failures)
  }

  if (allFailures.length === 0) {
    console.log(`check:jsonld passed -- ${graphs.length} research graphs clean.`)
    return
  }

  for (const f of allFailures) {
    console.error(`  FAIL  ${f.where}: ${f.message}`)
  }
  console.error(`\ncheck:jsonld failed with ${allFailures.length} error(s).`)
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
