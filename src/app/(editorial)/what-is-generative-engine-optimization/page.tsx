import type { Metadata } from 'next'

import { Answer } from '@/components/canvas/answer'
import { Byline } from '@/components/canvas/byline'
import { ChangeHistory } from '@/components/canvas/change-history'
import { ClosingStation } from '@/components/canvas/closing-station'
import { Ledger } from '@/components/canvas/ledger'
import { Limitations } from '@/components/canvas/limitations'
import { CanvasPageHero } from '@/components/canvas/page-hero'
import { RailColumn } from '@/components/canvas/rail-column'
import { RelatedRules } from '@/components/canvas/related-list'
import { RelatedTerms } from '@/components/canvas/related-terms'
import { RuleList } from '@/components/canvas/rule-list'
import { SourcesStation } from '@/components/canvas/sources-station'
import { TableRegion } from '@/components/canvas/table-region'
import { Station } from '@/components/sections/station'
import { JsonLd } from '@/components/seo/json-ld'
import { RuleLink } from '@/components/ui/cta'
import { routes } from '@/config/routes'
import { siteConfig } from '@/config/site'
import {
  closing,
  contents,
  directAnswer,
  hero,
  inPractice,
  limitation,
  meta,
  observed,
  related,
  relatedSection,
  runsOut,
  sameAsSeo,
  sources,
  versusSie,
} from '@/content/pages/what-is-generative-engine-optimization'
import { isDefinitionRoute } from '@/content/shared/definition-routes'
import { publicationChrome } from '@/content/shared/publication-record'
import { definedTermSchema, jsonLdGraph, personAuthor, webPageSchema } from '@/lib/seo/json-ld'
import { buildMetadata } from '@/lib/seo/metadata'

/**
 * /what-is-generative-engine-optimization, rebuilt on the approved canvas
 * (`07-hifi/definition-page.html`) station for station.
 *
 * The structural limits render as a ledger rather than as a numbered card grid:
 * each item is a named limit and one sentence, which is exactly the row this
 * system already has, and a grid of boxed items is the thing the canvas removes.
 */

export const metadata: Metadata = buildMetadata({
  title: meta.title,
  description: meta.description,
  path: routes.whatIsGenerativeEngineOptimization.path,
  maxImagePreview: true,
})

const relatedTerms = related.filter((entry) => isDefinitionRoute(entry.href))
const relatedWork = related.filter((entry) => !isDefinitionRoute(entry.href))

export default function WhatIsGenerativeEngineOptimizationPage() {
  return (
    <div className="wrap">
      <JsonLd
        data={jsonLdGraph(
          webPageSchema({
            path: routes.whatIsGenerativeEngineOptimization.path,
            title: meta.title,
            description: meta.description,
            mainEntityFragment: 'term',
            about: null,
            hasBreadcrumb: true,
            dateModified: sources.reviewed,
            author: personAuthor(),
            citation: [
              new URL(routes.researchNoSharedSourceAcrossEngines.path, siteConfig.url).toString(),
              new URL(routes.researchWhoGetsCitedInAiAnswers.path, siteConfig.url).toString(),
            ],
          }),
          definedTermSchema({
            path: routes.whatIsGenerativeEngineOptimization.path,
            term: directAnswer.term,
            directAnswer: directAnswer.answer,
          }),
        )}
      />

      {/* 1. Page hero */}
      <CanvasPageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        path={routes.whatIsGenerativeEngineOptimization.path}
        breadcrumbs={[
          { label: routes.home.label, href: routes.home.path },
          { label: routes.whatIsGenerativeEngineOptimization.label },
        ]}
        primaryCta={hero.primaryCta}
      >
        <Answer
          id="answer"
          className="answer-lead mt-[30px]"
          label={directAnswer.term}
          labelId="direct-answer-label"
          paragraphs={[directAnswer.answer]}
        />

        <Byline reviewed={sources.reviewed} reviewedLabel="last-reviewed" showDates={false} />

        <div className="mt-[26px] max-w-[60ch]">
          {hero.lead.map((paragraph) => (
            <p key={paragraph} className="text-lead mt-3 text-ink">
              {paragraph}
            </p>
          ))}
        </div>
      </CanvasPageHero>

      <div className="bodywrap">
        <RailColumn sections={contents}>
          {/* 01. What the work covers */}
          <Station id="in-practice" ariaLabelledBy="practice-title" stack>
            <p className="text-eyebrow text-ink-2">{inPractice.eyebrow}</p>
            <h2 id="practice-title" className="text-h2 text-ink">
              {inPractice.title}
            </h2>
            <p className="text-lead text-ink">{inPractice.lead}</p>

            <RuleList items={inPractice.items} ariaLabel={inPractice.title} />

            <p className="text-lead measure text-ink-3">{inPractice.closing}</p>
          </Station>

          {/* 02. Is it the same as SEO */}
          <Station id="same-as-seo" ariaLabelledBy="seo-title" stack>
            <p className="text-eyebrow text-ink-2">{sameAsSeo.eyebrow}</p>
            <h2 id="seo-title" className="text-h2 text-ink">
              {sameAsSeo.title}
            </h2>

            <div className="prose">
              {sameAsSeo.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Station>

          {/* 03. Where the framing runs out */}
          <Station id="runs-out" ariaLabelledBy="runs-out-title" stack>
            <p className="text-eyebrow text-ink-2">{runsOut.eyebrow}</p>
            <h2 id="runs-out-title" className="text-h2 text-ink">
              {runsOut.title}
            </h2>
            <p className="text-lead text-ink">{runsOut.lead}</p>

            <Ledger
              ariaLabel={runsOut.title}
              rows={runsOut.items.map((item) => ({
                key: item.name,
                label: (
                  <>
                    <span className="ix" aria-hidden="true">
                      {item.number}
                    </span>
                    {item.name}
                  </>
                ),
                value: item.description,
              }))}
            />

            <div className="prose">
              <p>{runsOut.citationPresence.body}</p>
            </div>
            <RuleLink cta={runsOut.citationPresence.noShared} />
            <RuleLink cta={runsOut.citationPresence.whoGetsCited} />
          </Station>

          {/* 04. What Hendricks observes */}
          <Station id="observed" ariaLabelledBy="observed-title" stack>
            <p className="text-eyebrow text-ink-2">{observed.eyebrow}</p>
            <h2 id="observed-title" className="text-h2 text-ink">
              {observed.title}
            </h2>

            <div className="prose">
              {observed.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Station>

          {/* 05. Against Search Intelligence Engineering */}
          <Station id="comparison" ariaLabelledBy="comparison-title" stack>
            <p className="text-eyebrow text-ink-2">{versusSie.eyebrow}</p>
            <h2 id="comparison-title" className="text-h2 text-ink">
              {versusSie.title}
            </h2>

            <TableRegion
              caption={versusSie.caption}
              columns={versusSie.columns}
              rows={versusSie.rows}
            />

            <div className="prose">
              {versusSie.closing.map((line) => (
                <p key={line} className="text-lead text-ink-3">
                  {line}
                </p>
              ))}
            </div>
          </Station>

          {/* 06. The honest limitation */}
          <Station id="limitation" ariaLabelledBy="limitation-title" stack>
            <h2 id="limitation-title" className="text-h2 text-ink">
              {limitation.title}
            </h2>
            <Limitations label={limitation.label} items={limitation.body} />
          </Station>

          {/* 07. Sources and references */}
          <SourcesStation
            reviewed={sources.reviewed}
            basis={sources.basis}
            appliedIn={sources.appliedIn}
            citations={sources.citations}
          />

          {/* 08. Change history */}
          <Station id="change-history" ariaLabelledBy="changes-title" stack>
            <p className="text-eyebrow text-ink-2">{publicationChrome.changeHistory.eyebrow}</p>
            <h2 id="changes-title" className="text-h2 text-ink">
              {publicationChrome.changeHistory.title}
            </h2>
            <ChangeHistory />
          </Station>

          {/* 09. Related terms */}
          <Station id="related-terms" ariaLabelledBy="terms-title" stack>
            <p className="text-eyebrow text-ink-2">{publicationChrome.relatedTerms.eyebrow}</p>
            <h2 id="terms-title" className="text-h2 text-ink">
              {publicationChrome.relatedTerms.title}
            </h2>
            <RelatedTerms terms={relatedTerms} />
          </Station>

          {/* 10. Where to go next */}
          <Station id="related" ariaLabelledBy="related-title" stack>
            <p className="text-eyebrow text-ink-2">{relatedSection.eyebrow}</p>
            <h2 id="related-title" className="text-h2 text-ink">
              {relatedSection.title}
            </h2>
            <RelatedRules entries={relatedWork} ariaLabel={relatedSection.title} />
          </Station>
        </RailColumn>
      </div>

      <ClosingStation id="close" title={closing.title} primaryCta={closing.primaryCta} />
    </div>
  )
}
