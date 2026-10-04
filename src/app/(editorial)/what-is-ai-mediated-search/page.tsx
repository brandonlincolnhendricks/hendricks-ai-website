import type { Metadata } from 'next'

import { Answer } from '@/components/canvas/answer'
import { Byline } from '@/components/canvas/byline'
import { ChangeHistory } from '@/components/canvas/change-history'
import { ClosingStation } from '@/components/canvas/closing-station'
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
  absence,
  closing,
  comparison,
  contents,
  diagnosis,
  directAnswer,
  hero,
  limitation,
  meta,
  related,
  relatedSection,
  sources,
  surfaces,
  upstream,
  vocabulary,
} from '@/content/pages/what-is-ai-mediated-search'
import { isDefinitionRoute } from '@/content/shared/definition-routes'
import { publicationChrome } from '@/content/shared/publication-record'
import {
  definedTermSchema,
  jsonLdGraph,
  personAuthor,
  webPageSchema,
} from '@/lib/seo/json-ld'
import { buildMetadata } from '@/lib/seo/metadata'

/**
 * /what-is-ai-mediated-search, rebuilt on the approved canvas
 * (`07-hifi/definition-page.html`) station for station.
 *
 * This is the one editorial route that cites anything external, so its sources
 * station carries a numbered reference list beside the review date. Every claim
 * it makes about a platform is traceable to that platform's own documentation,
 * and D-E keeps every one of those references on the page.
 *
 * The observed-scope block keeps its own heading rather than becoming an aside:
 * naming a public product as part of the information environment is a factual
 * statement, measuring it is a capability claim, and everything else on this
 * page depends on the two never blurring.
 */

export const metadata: Metadata = buildMetadata({
  title: meta.title,
  description: meta.description,
  path: routes.whatIsAiMediatedSearch.path,
  maxImagePreview: true,
})

const relatedTerms = related.filter((entry) => isDefinitionRoute(entry.href))
const relatedWork = related.filter((entry) => !isDefinitionRoute(entry.href))

export default function WhatIsAiMediatedSearchPage() {
  return (
    <div className="wrap">
      <JsonLd
        data={jsonLdGraph(
          webPageSchema({
            path: routes.whatIsAiMediatedSearch.path,
            title: meta.title,
            description: meta.description,
            mainEntityFragment: 'term',
            about: null,
            hasBreadcrumb: true,
            dateModified: sources.reviewed,
            author: personAuthor(),
            citation: [
              new URL(routes.researchHendricksSelectionBaseline.path, siteConfig.url).toString(),
              new URL(routes.researchNoSharedSourceAcrossEngines.path, siteConfig.url).toString(),
            ],
          }),
          definedTermSchema({
            path: routes.whatIsAiMediatedSearch.path,
            term: directAnswer.term,
            directAnswer: directAnswer.answer,
          }),
        )}
      />

      {/* 1. Page hero */}
      <CanvasPageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        path={routes.whatIsAiMediatedSearch.path}
        breadcrumbs={[
          { label: routes.home.label, href: routes.home.path },
          { label: routes.whatIsAiMediatedSearch.label },
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
          {/* 01. The surfaces */}
          <Station id="surfaces" ariaLabelledBy="surfaces-title" stack>
            <p className="text-eyebrow text-ink-2">{surfaces.eyebrow}</p>
            <h2 id="surfaces-title" className="text-h2 text-ink">
              {surfaces.title}
            </h2>
            <p className="text-lead text-ink">{surfaces.lead}</p>

            <div className="cols2">
              {surfaces.groups.map((group) => (
                <div key={group.name}>
                  <h3 className="text-h3 text-ink">{group.name}</h3>
                  <p className="mt-3 text-[14.5px] text-ink-2">{group.description}</p>
                  <RuleList className="mt-4" items={group.items} ariaLabel={group.name} />
                </div>
              ))}
            </div>

            <TableRegion
              caption={surfaces.caption}
              columns={surfaces.columns}
              rows={surfaces.rows}
            />

            {/*
              The one block on the page that separates the environment from the
              engagement. The table's third column says it per surface; this says
              it in one sentence, under a heading of its own, so a reader
              skimming the surface names cannot miss it.
            */}
            <div className="block">
              <h3 className="text-h3 text-ink">{surfaces.observed.title}</h3>
              {surfaces.observed.body.map((paragraph) => (
                <p key={paragraph} className="measure-wide mt-3 text-ink-2">
                  {paragraph}
                </p>
              ))}
            </div>
          </Station>

          {/* 02. Ranking versus appearing */}
          <Station id="ranking-gap" ariaLabelledBy="ranking-gap-title" stack>
            <p className="text-eyebrow text-ink-2">{upstream.eyebrow}</p>
            <h2 id="ranking-gap-title" className="text-h2 text-ink">
              {upstream.title}
            </h2>
            <p className="text-lead text-ink">{upstream.lead}</p>

            <RuleList items={upstream.items} ariaLabel={upstream.title} />

            <div className="prose">
              {upstream.closing.map((line) => (
                <p key={line} className="text-lead text-ink-3">
                  {line}
                </p>
              ))}
            </div>

            <RuleLink cta={upstream.cta} />
          </Station>

          {/* 03. Absence versus no sources */}
          <Station id="absence" ariaLabelledBy="absence-title" stack>
            <p className="text-eyebrow text-ink-2">{absence.eyebrow}</p>
            <h2 id="absence-title" className="text-h2 text-ink">
              {absence.title}
            </h2>
            <p className="text-lead text-ink">{absence.lead}</p>

            <div className="prose">
              {absence.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <RuleLink cta={absence.cta} />
            <RuleLink cta={absence.laterRun} />
          </Station>

          {/* 04. Ruling causes out */}
          <Station id="diagnosis" ariaLabelledBy="diagnosis-title" stack>
            <p className="text-eyebrow text-ink-2">{diagnosis.eyebrow}</p>
            <h2 id="diagnosis-title" className="text-h2 text-ink">
              {diagnosis.title}
            </h2>
            <p className="text-lead text-ink">{diagnosis.lead}</p>

            <TableRegion
              caption={diagnosis.caption}
              columns={diagnosis.columns}
              rows={diagnosis.rows}
            />

            <div className="prose">
              {diagnosis.closing.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <RuleLink cta={diagnosis.cta} />
          </Station>

          {/* 05. Traditional versus AI-mediated */}
          <Station id="comparison" ariaLabelledBy="comparison-title" stack>
            <p className="text-eyebrow text-ink-2">{comparison.eyebrow}</p>
            <h2 id="comparison-title" className="text-h2 text-ink">
              {comparison.title}
            </h2>
            <p className="text-lead text-ink">{comparison.lead}</p>

            <TableRegion
              caption={comparison.caption}
              columns={comparison.columns}
              rows={comparison.rows}
            />

            <p className="text-lead measure text-ink-3">{comparison.closing}</p>
          </Station>

          {/* 06. Vocabulary */}
          <Station id="vocabulary" ariaLabelledBy="vocabulary-title" stack>
            <p className="text-eyebrow text-ink-2">{vocabulary.eyebrow}</p>
            <h2 id="vocabulary-title" className="text-h2 text-ink">
              {vocabulary.title}
            </h2>

            <div className="prose">
              {vocabulary.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <RuleLink cta={vocabulary.cta} />
          </Station>

          {/*
            07. The honest limitation. Everything this page says about surfaces
            Hendricks does not control depends on this qualification, so it is a
            section-level statement rather than a subsection aside.
          */}
          <Station id="limitation" ariaLabelledBy="limitation-title" stack>
            <h2 id="limitation-title" className="text-h2 text-ink">
              {limitation.title}
            </h2>
            <Limitations label={limitation.label} items={limitation.body} />
          </Station>

          {/* 08. Sources and references */}
          <SourcesStation
            reviewed={sources.reviewed}
            basis={sources.basis}
            appliedIn={sources.appliedIn}
            citations={sources.citations}
          />

          {/* 09. Change history */}
          <Station id="change-history" ariaLabelledBy="changes-title" stack>
            <p className="text-eyebrow text-ink-2">{publicationChrome.changeHistory.eyebrow}</p>
            <h2 id="changes-title" className="text-h2 text-ink">
              {publicationChrome.changeHistory.title}
            </h2>
            <ChangeHistory />
          </Station>

          {/* 10. Related terms */}
          <Station id="related-terms" ariaLabelledBy="terms-title" stack>
            <p className="text-eyebrow text-ink-2">{publicationChrome.relatedTerms.eyebrow}</p>
            <h2 id="terms-title" className="text-h2 text-ink">
              {publicationChrome.relatedTerms.title}
            </h2>
            <RelatedTerms terms={relatedTerms} />
          </Station>

          {/* 11. Where to go next */}
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
