import type { Metadata } from 'next'
import Link from 'next/link'

import { Answer } from '@/components/canvas/answer'
import { Byline } from '@/components/canvas/byline'
import { ChangeHistory } from '@/components/canvas/change-history'
import { ClosingStation } from '@/components/canvas/closing-station'
import { DefinitionList } from '@/components/canvas/definition-list'
import { Limitations } from '@/components/canvas/limitations'
import { MethodList } from '@/components/canvas/method-list'
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
  agenticPipeline,
  brandImplications,
  changeHistory,
  closing,
  contents,
  disciplineRelationship,
  directAnswer,
  faq,
  foundationalAndExpert,
  framework,
  hero,
  illustratedBy,
  limitations,
  meta,
  operatingModel,
  outcomes,
  pilot,
  related,
  relatedSection,
  reproducibility,
  sources,
  whyItExists,
} from '@/content/pages/what-is-search-intelligence-engineering'
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
 * /what-is-search-intelligence-engineering, rebuilt on the approved canvas
 * (`07-hifi/definition-page.html`, which is drawn from this route) station for
 * station.
 *
 * The definition-page shape, in order: the hero carries the term and the
 * one-sentence definition as the answer-first block, the byline resolves to the
 * one Person node (D-B), and the body sits beside a sticky table of contents.
 * The tail is what makes the page citable and is required on every interior
 * route by D-E: sources with their review date, the change history, the related
 * terms and the related work.
 */

export const metadata: Metadata = buildMetadata({
  title: meta.title,
  description: meta.description,
  path: routes.whatIsSearchIntelligenceEngineering.path,
  maxImagePreview: true,
})

const relatedTerms = related.filter((entry) => isDefinitionRoute(entry.href))
const relatedWork = related.filter((entry) => !isDefinitionRoute(entry.href))
const supportingCitations = [
  new URL(routes.researchHendricksSelectionBaseline.path, siteConfig.url).toString(),
  new URL(routes.researchTheAnswerIndex.path, siteConfig.url).toString(),
  reproducibility.dataset.href,
] as const

export default function WhatIsSearchIntelligenceEngineeringPage() {
  return (
    <div className="wrap">
      <JsonLd
        data={jsonLdGraph(
          webPageSchema({
            path: routes.whatIsSearchIntelligenceEngineering.path,
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
            citation: supportingCitations,
          }),
          definedTermSetSchema(DEFINED_TERM_MEMBERS),
          definedTermSchema({
            path: routes.whatIsSearchIntelligenceEngineering.path,
            term: directAnswer.term,
            directAnswer: directAnswer.answer,
          }),
        )}
      />

      {/* 1. Page hero */}
      <CanvasPageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        path={routes.whatIsSearchIntelligenceEngineering.path}
        breadcrumbs={[
          { label: routes.home.label, href: routes.home.path },
          { label: routes.whatIsSearchIntelligenceEngineering.label },
        ]}
        primaryCta={hero.primaryCta}
        foot={<span className="text-caption text-ink-2">{siteConfig.categoryLine}</span>}
      >
        <Answer
          id="answer"
          className="answer-lead mt-[30px]"
          label={directAnswer.term}
          labelId="direct-answer-label"
          paragraphs={[directAnswer.answer]}
        />

        <p className="text-small mt-[16px] max-w-[60ch] text-ink-2">{directAnswer.note}</p>

        <div className="prose mt-[26px]">
          <p>{illustratedBy.body}</p>
          <RuleLink cta={illustratedBy.study} />
          <p>{illustratedBy.roleNaming.body}</p>
          <p>
            <a
              href={illustratedBy.roleNaming.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {illustratedBy.roleNaming.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>

        <Byline reviewed={sources.reviewed} reviewedLabel="last-reviewed" showDates={false} />

        <p className="text-lead mt-[26px] max-w-[60ch] text-ink">{hero.lead[0]}</p>
      </CanvasPageHero>

      {/* The body, beside its own contents. */}
      <div className="bodywrap">
        <RailColumn sections={contents}>
          {/* 01. Why a larger discipline is needed */}
          <Station id="why-it-exists" ariaLabelledBy="why-exists-title" stack>
            <p className="text-eyebrow text-ink-2">{whyItExists.eyebrow}</p>
            <h2 id="why-exists-title" className="text-h2 text-ink">
              {whyItExists.title}
            </h2>

            <div className="prose">
              {whyItExists.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p className="pull">{whyItExists.question}</p>
            </div>

            <RuleList items={whyItExists.events} ariaLabel={whyItExists.question} />
          </Station>

          {/* 02. Four-layer framework */}
          <Station id="four-layer-framework" ariaLabelledBy="framework-title" stack>
            <p className="text-eyebrow text-ink-2">{framework.eyebrow}</p>
            <h2 id="framework-title" className="text-h2 text-ink">
              {framework.title}
            </h2>
            <p className="text-lead text-ink">{framework.lead}</p>

            <MethodList steps={framework.layers} ariaLabel={framework.title} />

            <h3 className="text-h3 text-ink">Observable selection classes</h3>
            <DefinitionList definitions={framework.selectionClasses} />

            <h3 className="text-h3 text-ink">Revenue evidence tiers</h3>
            <DefinitionList definitions={framework.revenueEvidence} />
          </Station>

          {/* 03. Agentic-search pipeline */}
          <Station id="agentic-search-pipeline" ariaLabelledBy="pipeline-title" stack>
            <p className="text-eyebrow text-ink-2">{agenticPipeline.eyebrow}</p>
            <h2 id="pipeline-title" className="text-h2 text-ink">
              {agenticPipeline.title}
            </h2>
            <p className="text-lead text-ink">{agenticPipeline.lead}</p>

            <RuleList items={agenticPipeline.steps} ariaLabel={agenticPipeline.title} />

            <div className="prose">
              {agenticPipeline.closing.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </Station>

          {/* 04. Foundational and expert views */}
          <Station id="foundational-expert" ariaLabelledBy="views-title" stack>
            <p className="text-eyebrow text-ink-2">{foundationalAndExpert.eyebrow}</p>
            <h2 id="views-title" className="text-h2 text-ink">
              {foundationalAndExpert.title}
            </h2>

            <TableRegion
              caption={foundationalAndExpert.caption}
              columns={foundationalAndExpert.columns}
              rows={foundationalAndExpert.rows}
            />
          </Station>

          {/* 05. Brand implications */}
          <Station id="brand-implications" ariaLabelledBy="brand-title" stack>
            <p className="text-eyebrow text-ink-2">{brandImplications.eyebrow}</p>
            <h2 id="brand-title" className="text-h2 text-ink">
              {brandImplications.title}
            </h2>
            <p id="brand-lead" className="text-lead text-ink">
              {brandImplications.lead}
            </p>

            <RuleList items={brandImplications.items} ariaLabelledBy="brand-lead" />
            <p className="opline">{brandImplications.closing}</p>
          </Station>

          {/* 06. Relationship to adjacent disciplines */}
          <Station id="related-disciplines" ariaLabelledBy="disciplines-title" stack>
            <p className="text-eyebrow text-ink-2">{disciplineRelationship.eyebrow}</p>
            <h2 id="disciplines-title" className="text-h2 text-ink">
              {disciplineRelationship.title}
            </h2>

            <TableRegion
              caption={disciplineRelationship.caption}
              columns={disciplineRelationship.columns}
              rows={disciplineRelationship.rows}
            />

            <div className="prose">
              {disciplineRelationship.closing.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </Station>

          {/* 07. Four outcomes and solution links */}
          <Station id="four-outcomes" ariaLabelledBy="outcomes-title" stack>
            <p className="text-eyebrow text-ink-2">{outcomes.eyebrow}</p>
            <h2 id="outcomes-title" className="text-h2 text-ink">
              {outcomes.title}
            </h2>

            <ol className="ledger" aria-label={outcomes.title}>
              {outcomes.items.map((item) => (
                <li key={item.name}>
                  <span className="k">
                    <span className="ix" aria-hidden="true">
                      {item.number}
                    </span>
                    {item.name}
                  </span>
                  <span className="v">{item.description}</span>
                  <span className="n">
                    <Link href={item.solution.href}>{item.solution.label}</Link>
                  </span>
                </li>
              ))}
            </ol>

            <p className="opline">{siteConfig.operatingLine}</p>
          </Station>

          {/* 08. Seven-step operating model */}
          <Station id="operating-model" ariaLabelledBy="operating-model-title" stack>
            <p className="text-eyebrow text-ink-2">{operatingModel.eyebrow}</p>
            <h2 id="operating-model-title" className="text-h2 text-ink">
              {operatingModel.title}
            </h2>

            <MethodList steps={operatingModel.steps} ariaLabel={operatingModel.title} />
            <RuleLink cta={operatingModel.cta} />
          </Station>

          {/* 09. Pilot protocol */}
          <Station id="pilot-protocol" ariaLabelledBy="pilot-title" stack>
            <p className="text-eyebrow text-ink-2">{pilot.eyebrow}</p>
            <h2 id="pilot-title" className="text-h2 text-ink">
              {pilot.title}
            </h2>

            <div className="prose">
              <p className="text-coordinate text-ink-2">{pilot.status}</p>
              <p className="text-lead text-ink">{pilot.hypothesis}</p>
            </div>

            <MethodList steps={pilot.steps} ariaLabel={pilot.title} />

            <div className="prose">
              <p>{pilot.falsification}</p>
              <p>{pilot.interpretation}</p>
            </div>
          </Station>

          {/* 10. Limitations */}
          <Station id="limitations" ariaLabelledBy="limitations-title" stack>
            <p className="text-eyebrow text-ink-2">{limitations.eyebrow}</p>
            <h2 id="limitations-title" className="text-h2 text-ink">
              {limitations.title}
            </h2>

            <Limitations label={limitations.label} items={limitations.items} />
            <p className="opline">{limitations.closing}</p>
          </Station>

          {/* 11. Reproducibility and The Answer Index */}
          <Station id="reproducibility" ariaLabelledBy="reproducibility-title" stack>
            <p className="text-eyebrow text-ink-2">{reproducibility.eyebrow}</p>
            <h2 id="reproducibility-title" className="text-h2 text-ink">
              {reproducibility.title}
            </h2>
            <p className="text-lead text-ink">{reproducibility.lead}</p>

            <RuleList items={reproducibility.requirements} ariaLabel={reproducibility.title} />

            <div className="prose">
              {reproducibility.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <RuleLink cta={reproducibility.study} />
            <RuleLink cta={reproducibility.dataset} />
          </Station>

          {/* 12. Visible FAQ, deliberately without FAQPage markup */}
          <Station id="faq" ariaLabelledBy="faq-title" stack>
            <p className="text-eyebrow text-ink-2">{faq.eyebrow}</p>
            <h2 id="faq-title" className="text-h2 text-ink">
              {faq.title}
            </h2>

            <DefinitionList definitions={faq.entries} />
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
            <ChangeHistory entries={changeHistory} />
          </Station>

          {/* 08. Related terms */}
          <Station id="related-terms" ariaLabelledBy="terms-title" stack>
            <p className="text-eyebrow text-ink-2">{publicationChrome.relatedTerms.eyebrow}</p>
            <h2 id="terms-title" className="text-h2 text-ink">
              {publicationChrome.relatedTerms.title}
            </h2>
            <RelatedTerms terms={relatedTerms} />
          </Station>

          {/* 09. Related solutions and methodology */}
          <Station id="related" ariaLabelledBy="related-title" stack>
            <p className="text-eyebrow text-ink-2">{relatedSection.eyebrow}</p>
            <h2 id="related-title" className="text-h2 text-ink">
              {relatedSection.title}
            </h2>

            <RelatedRules entries={relatedWork} ariaLabel={relatedSection.title} />
          </Station>
        </RailColumn>
      </div>

      {/* The close */}
      <ClosingStation
        id="close"
        eyebrow={closing.eyebrow}
        title={closing.title}
        primaryCta={closing.primaryCta}
        body={[siteConfig.categoryLine]}
      />
    </div>
  )
}
