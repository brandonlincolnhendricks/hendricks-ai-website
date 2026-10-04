import type { Metadata } from 'next'

import { Answer } from '@/components/canvas/answer'
import { Byline } from '@/components/canvas/byline'
import { ChangeHistory } from '@/components/canvas/change-history'
import { ClosingStation } from '@/components/canvas/closing-station'
import { DefinitionList } from '@/components/canvas/definition-list'
import { Limitations } from '@/components/canvas/limitations'
import { CanvasPageHero } from '@/components/canvas/page-hero'
import { RailColumn } from '@/components/canvas/rail-column'
import { RelatedRules } from '@/components/canvas/related-list'
import { RelatedTerms } from '@/components/canvas/related-terms'
import { RuleList } from '@/components/canvas/rule-list'
import { SourcesStation } from '@/components/canvas/sources-station'
import { Station } from '@/components/sections/station'
import { JsonLd } from '@/components/seo/json-ld'
import { RuleLink } from '@/components/ui/cta'
import { routes } from '@/config/routes'
import { siteConfig } from '@/config/site'
import {
  citationPresenceOnly,
  closing,
  contents,
  directAnswer,
  hero,
  limitation,
  meta,
  metrics,
  questions,
  related,
  relatedSection,
  sources,
  versusRankTracking,
  whyContext,
} from '@/content/pages/what-is-selection-intelligence'
import { DEFINED_TERM_MEMBERS, isDefinitionRoute } from '@/content/shared/definition-routes'
import { publicationChrome } from '@/content/shared/publication-record'
import {
  definedTermSchema,
  definedTermSetSchema,
  jsonLdGraph,
  personAuthor,
  webPageSchema,
} from '@/lib/seo/json-ld'
import { buildMetadata } from '@/lib/seo/metadata'

/**
 * /what-is-selection-intelligence, rebuilt on the approved canvas
 * (`07-hifi/definition-page.html`) station for station.
 *
 * The contrast with rank tracking renders as two quoted questions across one
 * hairline rather than as two bordered quotes: the system has no box, and the
 * difference the section exists to draw is between the two questions, which the
 * ink tiers carry.
 */

export const metadata: Metadata = buildMetadata({
  title: meta.title,
  description: meta.description,
  path: routes.whatIsSelectionIntelligence.path,
  maxImagePreview: true,
})

const relatedTerms = related.filter((entry) => isDefinitionRoute(entry.href))
const relatedWork = related.filter((entry) => !isDefinitionRoute(entry.href))

export default function WhatIsSelectionIntelligencePage() {
  return (
    <div className="wrap">
      <JsonLd
        data={jsonLdGraph(
          webPageSchema({
            path: routes.whatIsSelectionIntelligence.path,
            title: meta.title,
            description: meta.description,
            // The subject of a definition page is the term it defines, not the
            // firm. Without mainEntity the graph never says what this page is about.
            mainEntityFragment: 'term',
            about: null,
            hasBreadcrumb: true,
            // Emitted only because this page renders the same date visibly in
            // its sources station. Pages without a visible date get none.
            dateModified: sources.reviewed,
            author: personAuthor(),
            citation: new URL(
              routes.researchHendricksSelectionBaseline.path,
              siteConfig.url,
            ).toString(),
          }),
          definedTermSetSchema(DEFINED_TERM_MEMBERS),
          definedTermSchema({
            path: routes.whatIsSelectionIntelligence.path,
            term: directAnswer.term,
            directAnswer: directAnswer.answer,
          }),
        )}
      />

      {/* 1. Page hero */}
      <CanvasPageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        path={routes.whatIsSelectionIntelligence.path}
        breadcrumbs={[
          { label: routes.home.label, href: routes.home.path },
          { label: routes.whatIsSelectionIntelligence.label },
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

        <p className="text-lead mt-[26px] max-w-[60ch] text-ink">{hero.lead[0]}</p>
      </CanvasPageHero>

      <div className="bodywrap">
        <RailColumn sections={contents}>
          {/* 01. The questions it answers */}
          <Station id="questions" ariaLabelledBy="questions-title" stack>
            <p className="text-eyebrow text-ink-2">{questions.eyebrow}</p>
            <h2 id="questions-title" className="text-h2 text-ink">
              {questions.title}
            </h2>
            <RuleList items={questions.items} ariaLabel={questions.title} />
          </Station>

          {/* 02. Against rank tracking */}
          <Station id="versus-rank-tracking" ariaLabelledBy="versus-title" stack>
            <p className="text-eyebrow text-ink-2">{versusRankTracking.eyebrow}</p>
            <h2 id="versus-title" className="text-h2 text-ink">
              {versusRankTracking.title}
            </h2>

            <div className="cols2">
              {[versusRankTracking.rankTracking, versusRankTracking.selectionIntelligence].map(
                (side, index) => (
                  <div key={side.label}>
                    <p className="text-coordinate text-ink-2">{side.label}</p>
                    {/* The Hendricks question at full ink, the one it replaces
                        at the quiet tier: the contrast is the point, and the ink
                        tiers carry it without a second border. */}
                    <p className={index === 1 ? 'qline mt-3' : 'qline mt-3 text-ink-2'}>
                      {side.question}
                    </p>
                  </div>
                ),
              )}
            </div>
          </Station>

          {/* 03. Why context decides */}
          <Station id="why-context" ariaLabelledBy="context-title" stack>
            <p className="text-eyebrow text-ink-2">{whyContext.eyebrow}</p>
            <h2 id="context-title" className="text-h2 text-ink">
              {whyContext.title}
            </h2>
            <p className="text-lead text-ink">{whyContext.lead}</p>

            <p className="text-coordinate text-ink-2">{whyContext.testsLead}</p>
            <RuleList items={whyContext.tests} ariaLabel={whyContext.testsLead} />

            <p className="text-lead measure text-ink-3">{whyContext.closing}</p>
          </Station>

          {/* 04. Metric definitions */}
          <Station id="metric-definitions" ariaLabelledBy="metrics-title" stack>
            <p className="text-eyebrow text-ink-2">{metrics.eyebrow}</p>
            <h2 id="metrics-title" className="text-h2 text-ink">
              {metrics.title}
            </h2>
            <DefinitionList
              definitions={metrics.items.map((metric) => ({
                term: metric.name,
                definition: [metric.definition],
              }))}
            />

            <div className="prose">
              <p>{citationPresenceOnly.body}</p>
            </div>
            <RuleLink cta={citationPresenceOnly.cta} />
          </Station>

          {/* 05. The honest limitation */}
          <Station id="limitation" ariaLabelledBy="limitation-title" stack>
            <h2 id="limitation-title" className="text-h2 text-ink">
              {limitation.title}
            </h2>
            <Limitations label={limitation.label} body={limitation.body} />
          </Station>

          <SourcesStation
            reviewed={sources.reviewed}
            basis={sources.basis}
            appliedIn={sources.appliedIn}
          />

          {/* 07. Change history */}
          <Station id="change-history" ariaLabelledBy="changes-title" stack>
            <p className="text-eyebrow text-ink-2">{publicationChrome.changeHistory.eyebrow}</p>
            <h2 id="changes-title" className="text-h2 text-ink">
              {publicationChrome.changeHistory.title}
            </h2>
            <ChangeHistory />
          </Station>

          {/* 08. Related terms */}
          <Station id="related-terms" ariaLabelledBy="terms-title" stack>
            <p className="text-eyebrow text-ink-2">{publicationChrome.relatedTerms.eyebrow}</p>
            <h2 id="terms-title" className="text-h2 text-ink">
              {publicationChrome.relatedTerms.title}
            </h2>
            <RelatedTerms terms={relatedTerms} />
          </Station>

          {/* 09. Where to go next */}
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
