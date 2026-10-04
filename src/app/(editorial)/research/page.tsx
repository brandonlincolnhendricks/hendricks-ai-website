import type { Metadata } from 'next'
import Link from 'next/link'

import { Answer } from '@/components/canvas/answer'
import { Byline } from '@/components/canvas/byline'
import { ClosingStation } from '@/components/canvas/closing-station'
import { CanvasPageHero } from '@/components/canvas/page-hero'
import { RelatedRules } from '@/components/canvas/related-list'
import { RelatedTerms } from '@/components/canvas/related-terms'
import { Station } from '@/components/sections/station'
import { JsonLd } from '@/components/seo/json-ld'
import { PrimaryCta, RuleLink } from '@/components/ui/cta'
import { TwoTone } from '@/components/ui/two-tone'
import { isBuilt, routes } from '@/config/routes'
import { siteConfig } from '@/config/site'
import {
  furtherResearchArticles,
  latestResearchArticle,
  type ResearchArticle,
} from '@/content/research'
import {
  closing,
  coverage,
  foundations,
  foundationsSection,
  hero,
  latest,
  meta,
  related,
  relatedSection,
  standards,
  supporting,
} from '@/content/research/hub'
import { downloads, series } from '@/content/research/the-answer-index'
import { diagnosticCta } from '@/content/shared/ctas'
import { evidenceRule } from '@/content/shared/evidence-rule'
import { observedSystemsSentence } from '@/content/shared/observed-systems'
import { itemListSchema, jsonLdGraph, webPageSchema } from '@/lib/seo/json-ld'
import { buildMetadata } from '@/lib/seo/metadata'
import { formatLongDate } from '@/lib/utils/format-date'

/**
 * /research, rebuilt on the approved canvas (`07-hifi/research-hub.html`)
 * station for station.
 *
 * Three tiers, in the order the section is meant to be read: the flagship study
 * with its record and its downloads, the studies behind it, and the category
 * pages the studies are written in. D-C makes The Answer Index a quarterly
 * series, so the edition label, exact release date, package version and cadence
 * render; no next-capture date does, because none has been scheduled.
 *
 * Each supporting study names its relation to the flagship in the flagship's
 * own words, read from `the-answer-index.ts` `related[]` by destination, so no
 * relation sentence is authored twice.
 */

export const metadata: Metadata = buildMetadata({
  title: meta.title,
  description: meta.description,
  path: routes.research.path,
})

/** The one mono line of study metadata: category, kind, and claim class. */
function metaLine(article: ResearchArticle): string {
  return [article.category, article.designation, article.claimClass].join('. ').concat('.')
}

export default function ResearchHubPage() {
  const availableFoundations = foundations.filter((link) => isBuilt(link.href))
  const relationOf = new Map(
    (latestResearchArticle?.content.related ?? []).map((entry) => [entry.href, entry.description]),
  )

  return (
    <div className="wrap">
      <JsonLd
        data={jsonLdGraph(
          webPageSchema({
            path: routes.research.path,
            title: meta.title,
            description: meta.description,
            type: 'CollectionPage',
            mainEntityFragment: 'studies',
            hasBreadcrumb: true,
          }),
          itemListSchema({
            path: routes.research.path,
            name: latest.title,
            items: [latestResearchArticle, ...furtherResearchArticles]
              .filter((article): article is ResearchArticle => Boolean(article))
              .map((article) => ({ name: article.title, description: article.summary })),
          }),
        )}
      />

      {/* 1. Page hero */}
      <CanvasHubHero />

      {/* 2. Tier 1, the flagship */}
      {latestResearchArticle ? (
        <Station id="flagship" ariaLabelledBy="latest-title">
          <p className="text-eyebrow mb-[22px] text-ink-2">{latest.eyebrow}</p>
          <h2 id="latest-title" className="text-h2 text-ink">
            {latest.title}
          </h2>

          <article className="grid12 mt-9" aria-labelledby="flagship-title">
            <div className="sp-12">
              <ul className="series" aria-label={series.name}>
                <li>{series.name}</li>
                <li>{series.edition}</li>
                <li>
                  {series.labels.packageVersion} {series.packageVersion}
                </li>
                <li>
                  {series.labels.releaseDate} {formatLongDate(series.releaseDate)}
                </li>
                <li>{series.cadence}</li>
              </ul>
              <h3 className="flagship-title" id="flagship-title">
                <Link href={latestResearchArticle.path}>{latestResearchArticle.title}</Link>
              </h3>
            </div>

            <div className="sp-7">
              <p className="text-lead mt-6 max-w-[60ch] text-ink-3">
                {latestResearchArticle.summary}
              </p>
              <p className="meta-line mt-[22px]">
                {metaLine(latestResearchArticle)} {series.name} is published{' '}
                {series.cadence.toLowerCase()}.
              </p>
              <Byline
                authorName={latestResearchArticle.content.byline.author}
                authorTitle={`${siteConfig.founderRole}, ${siteConfig.name}`}
                published={latestResearchArticle.publishedDate}
                updated={latestResearchArticle.updatedDate}
              />
              <p className="byline">
                <span>
                  {supporting.dataThroughLabel}{' '}
                  <time dateTime={latestResearchArticle.dataThroughDate}>
                    {formatLongDate(latestResearchArticle.dataThroughDate)}
                  </time>
                </span>
              </p>
            </div>

            <div className="sp-5">
              <h4 className="text-h4 mb-3 text-ink">{downloads.title}</h4>
              <ul className="downloads">
                {downloads.items.map((item) => (
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
                    {/* The file's note is a sentence rather than a format and a
                        size, so it sits under the link instead of in the meta
                        column, where a digest would not wrap. */}
                    <p className="dl-note">{item.note}</p>
                  </li>
                ))}
              </ul>

              <dl className="pubrec mt-8">
                <div className="pubrec-row">
                  <dt>{series.labels.edition}</dt>
                  <dd>{series.edition}</dd>
                </div>
                <div className="pubrec-row">
                  <dt>{series.labels.packageVersion}</dt>
                  <dd>{series.packageVersion}</dd>
                </div>
                <div className="pubrec-row">
                  <dt>{series.labels.releaseDate}</dt>
                  <dd>
                    <time dateTime={series.releaseDate}>{formatLongDate(series.releaseDate)}</time>
                  </dd>
                </div>
                <div className="pubrec-row">
                  <dt>{series.labels.cadence}</dt>
                  <dd>{series.cadence}</dd>
                </div>
                <div className="pubrec-row">
                  <dt>{series.labels.dataDoi}</dt>
                  <dd>
                    <a href={series.dataDoi.href}>{series.dataDoi.label}</a>
                  </dd>
                </div>
                <div className="pubrec-row">
                  <dt>{series.labels.latestVersion}</dt>
                  <dd>
                    <a href={series.latestVersionDoi.href}>{series.latestVersionDoi.label}</a>
                  </dd>
                </div>
                <div className="pubrec-row">
                  <dt>{series.labels.relatedSolution}</dt>
                  <dd>
                    <Link href={latestResearchArticle.relatedSolution.href}>
                      {latestResearchArticle.relatedSolution.label}
                    </Link>
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        </Station>
      ) : null}

      {/* 3. Tier 2, the supporting studies */}
      {furtherResearchArticles.length > 0 ? (
        <Station id="supporting-studies" ariaLabelledBy="supporting-title">
          <p className="text-eyebrow mb-[22px] text-ink-2">{supporting.eyebrow}</p>
          <h2 id="supporting-title" className="text-h2 text-ink">
            {supporting.title}
          </h2>
          <p className="text-lead mt-[22px] text-ink">{supporting.lead}</p>

          <ol className="studies">
            {furtherResearchArticles.map((article, index) => (
              <li key={article.slug}>
                <div>
                  <span className="idx" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="meta-line mb-4">{metaLine(article)}</p>
                  <dl className="fields">
                    <div>
                      <dt>{supporting.authorLabel}</dt>
                      <dd>
                        <a href={siteConfig.founderPersonId} rel="author">
                          {article.content.byline.author}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>{supporting.publishedLabel}</dt>
                      <dd>
                        <time dateTime={article.publishedDate}>
                          {formatLongDate(article.publishedDate)}
                        </time>
                      </dd>
                    </div>
                    <div>
                      <dt>{supporting.updatedLabel}</dt>
                      <dd>
                        <time dateTime={article.updatedDate}>
                          {formatLongDate(article.updatedDate)}
                        </time>
                      </dd>
                    </div>
                    <div>
                      <dt>{supporting.dataThroughLabel}</dt>
                      <dd>
                        <time dateTime={article.dataThroughDate}>
                          {formatLongDate(article.dataThroughDate)}
                        </time>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3>
                    <Link href={article.path}>{article.title}</Link>
                  </h3>
                  <p className="desc">{article.summary}</p>
                  {relationOf.get(article.path) ? (
                    <p className="note">
                      {supporting.relationLabel} {relationOf.get(article.path)}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </Station>
      ) : null}

      {/* 4. Tier 3, the foundation pages */}
      {availableFoundations.length > 0 ? (
        <Station id="foundations" ariaLabelledBy="foundations-title">
          <p className="text-eyebrow mb-[22px] text-ink-2">{foundationsSection.eyebrow}</p>
          <h2 id="foundations-title" className="text-h2 text-ink">
            {foundationsSection.title}
          </h2>
          <p className="text-lead mt-[22px] text-ink">{foundationsSection.description}</p>

          <div className="mt-9">
            <RelatedTerms terms={availableFoundations} />
          </div>
        </Station>
      ) : null}

      {/* 5. Coverage */}
      <Station id="coverage" ariaLabelledBy="coverage-title">
        <div className="split">
          <div className="words">
            <p className="text-eyebrow text-ink-2">{coverage.eyebrow}</p>
            <h2 id="coverage-title" className="text-h2 text-ink">
              {coverage.title}
            </h2>
            <p className="text-lead text-ink">{coverage.description}</p>
          </div>
          <div className="figure">
            <p className="text-coordinate text-ink-2">{coverage.categoriesLabel}</p>
            <ul className="plainlist mt-[14px]" aria-label={coverage.categoriesLabel}>
              {coverage.categories.map((category) => (
                <li key={category}>{category}</li>
              ))}
            </ul>
          </div>
        </div>
      </Station>

      {/* 6. Publication standards */}
      <Station id="publication-standards" ariaLabelledBy="standards-title">
        <p className="text-eyebrow mb-[22px] text-ink-2">{standards.eyebrow}</p>
        <h2 id="standards-title" className="text-h2 text-ink">
          {standards.title}
        </h2>
        <TwoTone sentence={standards.descriptionTwoTone} className="text-lead mt-[22px] max-w-[62ch]" />

        <ol className="olist mt-[34px]" aria-label={standards.title}>
          {standards.items.map((item, index) => (
            <li key={item}>
              <span className="n" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </Station>

      {/* 7. Related */}
      <Station id="related" ariaLabelledBy="related-title">
        <h2 id="related-title" className="text-h2 text-ink">
          {relatedSection.title}
        </h2>
        <RelatedRules className="mt-8" entries={related} ariaLabel={relatedSection.title} />
        <p className="text-caption mt-[22px] max-w-[62ch] text-ink-2">{observedSystemsSentence}</p>
      </Station>

      {/* 8. The close */}
      <ClosingStation
        id="close"
        eyebrow={closing.eyebrow}
        title={closing.title}
        primaryCta={closing.secondaryCta}
        secondaryLink={closing.primaryCta}
      />

      <Station id="evidence-rule" ariaLabel={evidenceRule.heading} className="hinge">
        <TwoTone sentence={evidenceRule} />
      </Station>
    </div>
  )
}

/**
 * The hub's hero. Split out because the flagship resolution above reads better
 * without the hero's markup between the registry lookup and its use.
 */
function CanvasHubHero() {
  return (
    <CanvasPageHero
      eyebrow={hero.eyebrow}
      title={hero.title}
      path={routes.research.path}
      breadcrumbs={[
        { label: routes.home.label, href: routes.home.path },
        { label: routes.research.label },
      ]}
      foot={<p className="text-caption max-w-none text-ink-2">{observedSystemsSentence}</p>}
    >
      <Answer className="mt-[26px]" label={hero.answerLabel} paragraphs={hero.lead} />

      <div className="cta-row mt-[30px]">
        <PrimaryCta cta={diagnosticCta('research_hub_hero')} />
        <RuleLink cta={{ label: hero.primaryCtaLabel, href: '#flagship' }} />
      </div>
    </CanvasPageHero>
  )
}
