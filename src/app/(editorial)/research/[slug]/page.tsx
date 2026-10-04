import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Answer } from '@/components/canvas/answer'
import { Byline } from '@/components/canvas/byline'
import { CiteThis, type Citation } from '@/components/canvas/cite-this'
import { ClosingStation } from '@/components/canvas/closing-station'
import { DefinitionList } from '@/components/canvas/definition-list'
import { Limitations } from '@/components/canvas/limitations'
import { MethodList } from '@/components/canvas/method-list'
import { CanvasPageHero } from '@/components/canvas/page-hero'
import { RailColumn } from '@/components/canvas/rail-column'
import { RelatedRules } from '@/components/canvas/related-list'
import { RuleList } from '@/components/canvas/rule-list'
import { SourcesStation } from '@/components/canvas/sources-station'
import { TableRegion } from '@/components/canvas/table-region'
import { Station } from '@/components/sections/station'
import { JsonLd } from '@/components/seo/json-ld'
import { RuleLink } from '@/components/ui/cta'
import { ctaHref, isBuilt, routes } from '@/config/routes'
import { siteConfig } from '@/config/site'
import {
  findResearchArticle,
  researchArticles,
  type ResearchArticle,
  type ResearchNumberedItem,
} from '@/content/research'
import { series } from '@/content/research/the-answer-index'
import { publicationChrome } from '@/content/shared/publication-record'
import { archiveFileExists, historyRunsHref } from '@/content/research/citation-runs'
import { citationRunNodes } from '@/lib/seo/citation-run-nodes'
import {
  articleSchema,
  datasetSchema,
  jsonLdGraph,
  webPageSchema,
} from '@/lib/seo/json-ld'
import { buildMetadata, buildResearchCitationMetadata } from '@/lib/seo/metadata'
import { formatLongDate } from '@/lib/utils/format-date'

/**
 * The article template for `/research/<slug>`, rebuilt on the approved canvas
 * (`07-hifi/research-article.html`) station for station.
 *
 * Every published slug comes from the registry in `src/content/research`, and
 * `dynamicParams = false` makes anything else a 404 rather than a page rendered
 * from a URL a visitor invented.
 *
 * The render order is the fifteen-item research format in `docs/06` §12, and
 * that ordering is deliberate rather than a template default: the finding, its
 * evidence and its limits come first, and the provenance block sits at the point
 * where a reader who has read the study wants to know who produced it and when.
 * The canvas adds one item, the citation, composed from the study's own record
 * so a citation and the page it cites cannot disagree.
 *
 * One rule governs every optional section. A section is rendered only when the
 * article carries it, and nothing is stubbed, so the table of contents is built
 * from the sections that actually rendered rather than from a fixed list.
 */

export const dynamicParams = false

export function generateStaticParams() {
  return researchArticles.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = findResearchArticle(slug)
  if (!article) return {}

  const pdfPath = article.content.downloads?.items.find(({ cta }) =>
    cta.href.endsWith('.pdf'),
  )?.cta.href

  return {
    ...buildMetadata({
      title: article.content.meta.title,
      description: article.content.meta.description,
      path: article.path,
      maxImagePreview: true,
    }),
    other: buildResearchCitationMetadata({
      title: article.title,
      author: article.content.byline.author,
      publicationDate: article.publishedDate,
      path: article.path,
      ...(pdfPath ? { pdfPath } : {}),
    }),
  }
}

/**
 * The `Article` node for a published study. Delegates to the shared builder in
 * `src/lib/seo/json-ld.ts` so all Article nodes across the site share one
 * definition and one test.
 */
function researchArticleSchema(
  article: ResearchArticle,
  extras?: {
    identifier?: string | readonly string[]
    isBasedOn?: readonly { '@id': string }[]
  },
) {
  return articleSchema({
    path: article.path,
    headline: article.title,
    description: article.summary,
    articleSection: article.category,
    datePublished: article.publishedDate,
    dateModified: article.updatedDate,
    claimClass: article.claimClass,
    identifier: extras?.identifier,
    isBasedOn: extras?.isBasedOn,
  })
}

/** Findings, checks, method steps and limits all render as the method list. */
function numberedSteps(items: readonly ResearchNumberedItem[]) {
  return items.map((item) => ({
    marker: item.number,
    title: item.name,
    body: [item.description],
  }))
}

/**
 * The citation, composed from the study's record.
 *
 * The series and the DOIs belong to The Answer Index alone, so they are attached
 * to that study and omitted everywhere else rather than being invented for a
 * study that publishes neither.
 */
function citationOf(article: ResearchArticle): Citation {
  const isAnswerIndex = article.slug === 'the-answer-index'

  return {
    author: article.content.byline.author,
    year: article.publishedDate.slice(0, 4),
    title: article.title,
    ...(isAnswerIndex
      ? {
          series: `${series.name}, ${series.edition}, package ${series.packageVersion}`,
          doi: series.dataDoi,
          latestVersionDoi: series.latestVersionDoi,
        }
      : {}),
    publisher: siteConfig.name,
    url: new URL(article.path, siteConfig.url).toString(),
  }
}

export default async function ResearchArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = findResearchArticle(slug)
  if (!article) notFound()

  const content = article.content

  /*
    Item 14. The article records its canonical corrections destination and the
    fallback to use while that route is unbuilt, and `ctaHref` picks between
    them. The link repoints itself the moment `/corrections` is marked built.
  */
  const correctionsHref = ctaHref(content.corrections.href, content.corrections.fallbackHref)

  /*
    The breadcrumb crumb is the route registry's short label rather than the
    article headline, which is a full sentence.
  */
  const breadcrumbLabel =
    Object.values(routes).find((route) => route.path === article.path)?.label ?? article.title

  const appliedIn = content.sources.appliedIn.filter((item) => isBuilt(item.href))
  const isAnswerIndex = article.slug === 'the-answer-index'
  const citationGraph = citationRunNodes(article)

  /*
    The contents list, built from the sections that actually render. A fixed
    list would advertise a downloads or errors-found section on a study that
    carries neither.
  */
  const contents = [
    { id: 'summary', label: content.executiveSummary.eyebrow },
    { id: 'key-findings', label: content.keyFindings.eyebrow },
    { id: 'definitions', label: content.definitions.eyebrow },
    { id: 'data', label: content.data.eyebrow },
    ...(content.errorsFound ? [{ id: 'errors-found', label: content.errorsFound.eyebrow }] : []),
    ...(content.downloads ? [{ id: 'downloads', label: content.downloads.eyebrow }] : []),
    { id: 'methodology', label: content.methodology.eyebrow },
    { id: 'sample', label: content.sample.eyebrow },
    { id: 'assumptions', label: content.assumptions.eyebrow },
    { id: 'limitations', label: content.limitations.eyebrow },
    { id: 'sources', label: publicationChrome.sources.title },
    { id: 'record', label: publicationChrome.record.title },
    { id: 'corrections', label: content.corrections.eyebrow },
    { id: 'cite', label: publicationChrome.cite.label },
    { id: 'related-solution', label: content.relatedSolution.eyebrow },
    { id: 'related', label: 'Related research' },
  ]

  return (
    <div className="wrap">
      <JsonLd
        data={jsonLdGraph(
          researchArticleSchema(article, citationGraph.articleExtras),
          ...citationGraph.datasets,
          ...(content.dataset
            ? [
                datasetSchema({
                  path: article.path,
                  name: content.dataset.name,
                  description: content.dataset.description,
                  version: content.dataset.version,
                  keywords: content.dataset.keywords,
                  isAccessibleForFree: content.dataset.isAccessibleForFree,
                  doi: content.dataset.doi,
                  license: content.dataset.license,
                  temporalCoverage: content.dataset.temporalCoverage,
                  variableMeasured: content.dataset.variableMeasured,
                  distribution: content.dataset.distribution,
                }),
              ]
            : []),
          webPageSchema({
            path: article.path,
            title: content.meta.title,
            description: content.meta.description,
            mainEntityFragment: 'article',
            hasBreadcrumb: true,
            datePublished: article.publishedDate,
            dateModified: article.updatedDate,
          }),
        )}
      />

      {/* 1. Page hero */}
      <CanvasPageHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        path={article.path}
        breadcrumbs={[
          { label: routes.home.label, href: routes.home.path },
          { label: routes.research.label, href: routes.research.path },
          { label: breadcrumbLabel },
        ]}
        primaryCta={content.hero.primaryCta}
      >
        {isAnswerIndex ? (
          <ul className="series" aria-label={series.name}>
            <li>{series.name}</li>
            <li>{series.edition}</li>
            <li>
              {series.labels.packageVersion} {series.packageVersion}
            </li>
            <li>{series.cadence}</li>
          </ul>
        ) : null}

        {/* Item 1a. The finding, before any explanation. */}
        <Answer
          id="direct-answer"
          className="answer-lead answer-lead-study mt-8"
          label={content.directAnswer.term}
          labelId="direct-answer-label"
          paragraphs={[content.directAnswer.answer]}
        />

        <Byline
          authorName={content.byline.author}
          authorTitle={content.byline.authorRole}
          published={article.publishedDate}
          updated={article.updatedDate}
        />

        <CiteThis className="mt-9" citation={citationOf(article)} />

        <div className="prose mt-9">
          {content.hero.lead.map((paragraph) => (
            <p key={paragraph} className="text-lead text-ink">
              {paragraph}
            </p>
          ))}
        </div>

        {/*
          The Results gate, in visible copy, above the body. A research
          experiment counts toward the gate only if it is clearly labeled, so
          the label is a block with its own heading rather than a badge. Do not
          move it below the fold and do not reduce it to a chip.
        */}
        <div className="markblock mt-9" role="note" aria-labelledby="experiment-label-title">
          <p className="text-coordinate text-ink-2">{content.experimentLabel.label}</p>
          <h2 id="experiment-label-title" className="text-ink">
            {content.experimentLabel.title}
          </h2>
          {content.experimentLabel.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </CanvasPageHero>

      <div className="bodywrap">
        <RailColumn sections={contents}>
          {/* Item 1b. Executive summary */}
          <Station id="summary" ariaLabelledBy="summary-title" stack>
            <p className="text-eyebrow text-ink-2">{content.executiveSummary.eyebrow}</p>
            <h2 id="summary-title" className="text-h2 text-ink">
              {content.executiveSummary.title}
            </h2>
            <div className="prose">
              {content.executiveSummary.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Station>

          {/* Item 2. Key findings */}
          <Station id="key-findings" ariaLabelledBy="findings-title" stack>
            <p className="text-eyebrow text-ink-2">{content.keyFindings.eyebrow}</p>
            <h2 id="findings-title" className="text-h2 text-ink">
              {content.keyFindings.title}
            </h2>
            {content.keyFindings.lead ? (
              <p className="text-lead text-ink">{content.keyFindings.lead}</p>
            ) : null}

            <MethodList
              ariaLabel={content.keyFindings.title}
              steps={numberedSteps(content.keyFindings.items)}
            />

            {content.keyFindings.closing ? (
              <div className="prose">
                {content.keyFindings.closing.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}
          </Station>

          {/* Item 3. Definitions */}
          <Station id="definitions" ariaLabelledBy="definitions-title" stack>
            <p className="text-eyebrow text-ink-2">{content.definitions.eyebrow}</p>
            <h2 id="definitions-title" className="text-h2 text-ink">
              {content.definitions.title}
            </h2>
            {content.definitions.lead ? (
              <p className="text-lead text-ink">{content.definitions.lead}</p>
            ) : null}

            <DefinitionList
              definitions={content.definitions.items.map((item) => ({
                term: item.name,
                definition: [item.definition],
              }))}
            />
          </Station>

          {/* Item 4. The data */}
          <Station id="data" ariaLabelledBy="data-title" stack>
            <p className="text-eyebrow text-ink-2">{content.data.eyebrow}</p>
            <h2 id="data-title" className="text-h2 text-ink">
              {content.data.title}
            </h2>
            {content.data.lead ? (
              <p className="text-lead text-ink">{content.data.lead}</p>
            ) : null}

            {content.data.tables.map((table) => (
              <div key={table.caption} className="block">
                <TableRegion
                  caption={table.caption}
                  columns={table.columns}
                  rows={table.rows}
                />
                {table.summary ? (
                  <p className="text-caption mt-3 max-w-[74ch] text-ink-2">{table.summary}</p>
                ) : null}
              </div>
            ))}

            {content.data.note ? (
              <div className="prose">
                {content.data.note.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}

            {content.data.archiveLinks?.length ? (
              <ul className="downloads">
                {content.data.archiveLinks.map((item) => {
                  const href = historyRunsHref(item.filename)
                  const available = archiveFileExists(item.filename)
                  return (
                    <li key={item.filename}>
                      {available ? (
                        <a href={href}>
                          <span className="dl-name">{item.label}</span>
                        </a>
                      ) : (
                        <span className="dl-name">{item.label}</span>
                      )}
                      <p className="dl-note">
                        {item.note} Public path: {href}.
                      </p>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </Station>

          {/* Item 4b. Errors found, on the studies that publish the checked half. */}
          {content.errorsFound ? (
            <Station id="errors-found" ariaLabelledBy="errors-title" stack>
              <p className="text-eyebrow text-ink-2">{content.errorsFound.eyebrow}</p>
              <h2 id="errors-title" className="text-h2 text-ink">
                {content.errorsFound.title}
              </h2>
              {content.errorsFound.lead ? (
                <p className="text-lead text-ink">{content.errorsFound.lead}</p>
              ) : null}

              <MethodList
                ariaLabel={content.errorsFound.title}
                steps={numberedSteps(content.errorsFound.items)}
              />

              {content.errorsFound.closing ? (
                <div className="prose">
                  {content.errorsFound.closing.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ) : null}
            </Station>
          ) : null}

          {/* Item 4c. Downloads */}
          {content.downloads ? (
            <Station id="downloads" ariaLabelledBy="downloads-title" stack>
              <p className="text-eyebrow text-ink-2">{content.downloads.eyebrow}</p>
              <h2 id="downloads-title" className="text-h2 text-ink">
                {content.downloads.title}
              </h2>
              {content.downloads.lead ? (
                <p className="text-lead text-ink">{content.downloads.lead}</p>
              ) : null}

              <ul className="downloads">
                {content.downloads.items.map((item) => (
                  <li key={item.cta.href}>
                    <a
                      href={item.cta.href}
                      {...(item.cta.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      <span className="dl-name">{item.cta.label}</span>
                      {item.cta.external ? (
                        <span className="sr-only"> (opens in a new tab)</span>
                      ) : null}
                    </a>
                    <p className="dl-note">{item.note}</p>
                  </li>
                ))}
              </ul>
            </Station>
          ) : null}

          {/* Item 5. Methodology */}
          <Station id="methodology" ariaLabelledBy="methodology-title" stack>
            <p className="text-eyebrow text-ink-2">{content.methodology.eyebrow}</p>
            <h2 id="methodology-title" className="text-h2 text-ink">
              {content.methodology.title}
            </h2>
            {content.methodology.lead ? (
              <p className="text-lead text-ink">{content.methodology.lead}</p>
            ) : null}

            {content.methodology.items ? (
              <MethodList
                ariaLabel={content.methodology.title}
                steps={numberedSteps(content.methodology.items)}
              />
            ) : null}

            {content.methodology.closing ? (
              <div className="prose">
                {content.methodology.closing.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}

            {content.methodology.cta ? <RuleLink cta={content.methodology.cta} /> : null}
          </Station>

          {/* Item 6. Sample and date range */}
          <Station id="sample" ariaLabelledBy="sample-title" stack>
            <p className="text-eyebrow text-ink-2">{content.sample.eyebrow}</p>
            <h2 id="sample-title" className="text-h2 text-ink">
              {content.sample.title}
            </h2>

            <RuleList items={content.sample.items} ariaLabel={content.sample.title} />

            {content.sample.note ? (
              <div className="prose">
                {content.sample.note.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}
          </Station>

          {/* Item 7. Assumptions */}
          <Station id="assumptions" ariaLabelledBy="assumptions-title" stack>
            <p className="text-eyebrow text-ink-2">{content.assumptions.eyebrow}</p>
            <h2 id="assumptions-title" className="text-h2 text-ink">
              {content.assumptions.title}
            </h2>
            {content.assumptions.lead ? (
              <p className="text-lead text-ink">{content.assumptions.lead}</p>
            ) : null}

            <MethodList
              ariaLabel={content.assumptions.title}
              steps={numberedSteps(content.assumptions.items)}
            />
          </Station>

          {/*
            Item 8, a full station rather than an aside. On a page whose whole
            claim is that the firm reports its own numbers straight, the limits
            of the numbers are section-level content.
          */}
          <Station id="limitations" ariaLabelledBy="limitations-title" stack>
            <p className="text-eyebrow text-ink-2">{content.limitations.eyebrow}</p>
            <h2 id="limitations-title" className="text-h2 text-ink">
              {content.limitations.title}
            </h2>

            {content.limitations.lead ? <Limitations body={[content.limitations.lead]} /> : null}

            <MethodList
              ariaLabel={content.limitations.title}
              steps={numberedSteps(content.limitations.items)}
            />
          </Station>

          {/*
            Item 9. The applied-in sentence reads "This measurement is applied
            in" rather than the definition pages' wording, because this page
            reports a measurement rather than stating a definition.
          */}
          <SourcesStation
            reviewed={content.sources.reviewed}
            basis={content.sources.basis}
            appliedIn={appliedIn}
            appliedInLead={publicationChrome.sources.measurementAppliedInLead}
          />

          {/* Items 10 to 15, as one extractable block. */}
          <Station id="record" ariaLabelledBy="record-title" stack>
            <p className="text-eyebrow text-ink-2">{publicationChrome.record.eyebrow}</p>
            <h2 id="record-title" className="text-h2 text-ink">
              {publicationChrome.record.title}
            </h2>

            <dl className="pubrec">
              <div className="pubrec-row">
                <dt>{publicationChrome.record.labels.author}</dt>
                <dd>
                  <a href={content.byline.authorHref} rel="author">
                    {content.byline.author}
                  </a>
                  , {content.byline.authorRole}
                </dd>
              </div>
              <div className="pubrec-row">
                <dt>{publicationChrome.record.labels.studyType}</dt>
                <dd>{article.designation}</dd>
              </div>
              <div className="pubrec-row">
                <dt>{publicationChrome.record.labels.claimClass}</dt>
                <dd>{article.claimClass}</dd>
              </div>
              <div className="pubrec-row">
                <dt>{publicationChrome.record.labels.category}</dt>
                <dd>{article.category}</dd>
              </div>
              <div className="pubrec-row">
                <dt>{publicationChrome.record.labels.published}</dt>
                <dd>
                  <time dateTime={article.publishedDate}>
                    {formatLongDate(article.publishedDate)}
                  </time>
                </dd>
              </div>
              <div className="pubrec-row">
                <dt>{publicationChrome.record.labels.updated}</dt>
                <dd>
                  <time dateTime={article.updatedDate}>{formatLongDate(article.updatedDate)}</time>
                </dd>
              </div>
              <div className="pubrec-row">
                <dt>{publicationChrome.record.labels.dataThrough}</dt>
                <dd>
                  <time dateTime={article.dataThroughDate}>
                    {formatLongDate(article.dataThroughDate)}
                  </time>
                </dd>
              </div>
              {isAnswerIndex ? (
                <>
                  <div className="pubrec-row">
                    <dt>{series.labels.edition}</dt>
                    <dd>{series.edition}</dd>
                  </div>
                  <div className="pubrec-row">
                    <dt>{series.labels.packageVersion}</dt>
                    <dd>{series.packageVersion}</dd>
                  </div>
                  <div className="pubrec-row">
                    <dt>{series.labels.cadence}</dt>
                    <dd>{series.cadence}</dd>
                  </div>
                  {content.dataset ? (
                    <>
                      <div className="pubrec-row">
                        <dt>{series.labels.keywords}</dt>
                        <dd>{content.dataset.keywords.join(', ')}</dd>
                      </div>
                      <div className="pubrec-row">
                        <dt>{series.labels.access}</dt>
                        <dd>{content.dataset.isAccessibleForFree ? 'Open access' : 'Restricted'}</dd>
                      </div>
                    </>
                  ) : null}
                </>
              ) : null}
              <div className="pubrec-row">
                <dt>{publicationChrome.record.labels.relatedSolution}</dt>
                <dd>
                  <Link href={article.relatedSolution.href}>
                    {article.relatedSolution.label}
                  </Link>
                </dd>
              </div>
              <div className="pubrec-row">
                <dt>{publicationChrome.record.labels.corrections}</dt>
                <dd>
                  <Link href={correctionsHref}>{content.corrections.label}</Link>
                </dd>
              </div>
            </dl>

            {content.byline.note ? (
              <p className="measure-wide text-ink-2">{content.byline.note}</p>
            ) : null}
          </Station>

          {/* Item 14, as a station. */}
          <Station id="corrections" ariaLabelledBy="corrections-title" stack>
            <p className="text-eyebrow text-ink-2">{content.corrections.eyebrow}</p>
            <h2 id="corrections-title" className="text-h2 text-ink">
              {content.corrections.title}
            </h2>

            <div className="prose">
              {content.corrections.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <RuleLink cta={{ label: content.corrections.label, href: correctionsHref }} />
          </Station>

          {/* The citation, composed from the record above it. */}
          <Station id="cite" ariaLabelledBy="cite-title" stack>
            <p className="text-eyebrow text-ink-2">{publicationChrome.cite.eyebrow}</p>
            <h2 id="cite-title" className="text-h2 text-ink">
              {publicationChrome.cite.label}
            </h2>
            <CiteThis citation={citationOf(article)} />
          </Station>

          {/* Item 15, as a station. */}
          <Station
            id="related-solution"
            ariaLabelledBy="related-solution-title"
            stack
          >
            <p className="text-eyebrow text-ink-2">{content.relatedSolution.eyebrow}</p>
            <h2 id="related-solution-title" className="text-h2 text-ink">
              {content.relatedSolution.title}
            </h2>

            <div className="prose">
              {content.relatedSolution.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {content.relatedSolution.ctas
              ? content.relatedSolution.ctas.map((cta) => <RuleLink key={cta.href} cta={cta} />)
              : null}
          </Station>

          {/* Item 16. Related research */}
          <Station id="related" ariaLabelledBy="related-title" stack>
            <h2 id="related-title" className="text-h2 text-ink">
              Related research
            </h2>
            <RelatedRules entries={content.related} ariaLabel="Related research" />
          </Station>
        </RailColumn>
      </div>

      <ClosingStation
        id="close"
        title={content.closing.title}
        primaryCta={content.closing.primaryCta}
      />
    </div>
  )
}
