import type { Metadata } from 'next'

import { FounderNote } from '@/components/sections/founder-note'
import { Station } from '@/components/sections/station'
import { JsonLd } from '@/components/seo/json-ld'
import { Button } from '@/components/ui/button'
import { PrimaryCta, RuleLink } from '@/components/ui/cta'
import { TwoTone } from '@/components/ui/two-tone'
import { ArtifactPreviewDrawing } from '@/components/visuals/artifact-previews'
import { ConsiderationLadder } from '@/components/visuals/consideration-ladder'
import { EvidenceClasses } from '@/components/visuals/evidence-classes'
import { IllustrativeLegend } from '@/components/visuals/illustrative-legend'
import { PhaseRail } from '@/components/visuals/phase-rail'
import { SelectionMapPlate } from '@/components/visuals/selection-map-plate'
import { TwoPathsPlate } from '@/components/visuals/two-paths-plate'
import { selectionMapData } from '@/content/instruments/selection-map-data'
import {
  check,
  diagnostic,
  evidence,
  evidenceRule,
  finalCta,
  founder,
  hero,
  homeMeta,
  ladder,
  outputs,
  pathways,
  problem,
  stations,
  system,
} from '@/content/pages/home'
import { buildMetadata } from '@/lib/seo/metadata'
import { jsonLdGraph, webPageSchema } from '@/lib/seo/json-ld'

/**
 * The homepage, rebuilt on the approved canvas (`07-hifi/home-v3.html`,
 * decision D-A) station for station.
 *
 * Ten stations on one continuous ground. No station has a background, a card,
 * a panel or a tinted band: they are separated by space and by hairlines, and
 * the drawings run wide against a narrow measure of words rather than sitting
 * in a centred column of equal items.
 *
 * The hero's instrument is Plate 01, the Selection Map, which server-renders
 * its whole resting frame and hands one client island the job of changing
 * frames. It is the only client bundle this route loads for a figure.
 *
 * Copy is in `@/content/pages/home`, where every line the redesign marks new
 * or variant runs through the content gate and renders the approved line it
 * replaces until its CONTENT_VERIFICATION row is approved. A `null` from the
 * gate means the line adds to the page rather than replacing one, so this file
 * checks for it rather than rendering an empty element.
 */

export const metadata: Metadata = buildMetadata({
  title: homeMeta.title,
  description: homeMeta.description,
  path: '/',
})

const HERO_DEFINER_ID = 'hero-definer'

export default function HomePage() {
  return (
    <div className="wrap">
      <JsonLd
        // Organization and WebSite are emitted site-wide by SiteShell, so the
        // homepage carries only its own WebPage node. Emitting them here too
        // would duplicate both nodes on this one document.
        data={jsonLdGraph(
          webPageSchema({ path: '/', title: homeMeta.title, description: homeMeta.description }),
        )}
      />

      {/* 1. Hero */}
      <Station id={stations.hero} ariaLabelledBy="hero-title" className="hero">
        <p className="text-eyebrow mb-[22px] text-ink-2">{hero.eyebrow}</p>
        <h1 id="hero-title" className="text-h1 mb-5 text-ink">
          {hero.title}
        </h1>
        <TwoTone sentence={hero.lead} className="text-lead mb-7 max-w-[80ch]" />
        <p className="measure-wide text-ink-2 mb-7">{hero.boundary}</p>

        <div className="cta-row mb-10">
          <PrimaryCta
            cta={hero.primaryCta}
            describedBy={hero.definer ? HERO_DEFINER_ID : undefined}
          />
          <RuleLink cta={hero.secondaryCta} />
        </div>
        {hero.definer ? (
          <p className="sr-only" id={HERO_DEFINER_ID}>
            {hero.definer}
          </p>
        ) : null}

        <SelectionMapPlate data={selectionMapData} />
        <IllustrativeLegend />

        <p className="mt-4">
          <RuleLink cta={hero.observeLink} />
        </p>

        <p className="hero-foot text-coordinate text-ink-2">
          <span className="op">{hero.operatingLine}</span>
          <span>{hero.proofLine}</span>
        </p>
      </Station>

      {/*
        1a. The free check (Brandon, 2026-09-07). One field, a GET to the
        instrument's own route, so it works without JavaScript and collects
        nothing personal here. The station is the homepage's one addition
        since the canvas was approved; the height budgets in
        tests/e2e/homepage.spec.ts were raised by its measured height.
      */}
      <Station id={stations.check} ariaLabelledBy="check-title">
        <div className="split">
          <div className="words">
            <p className="text-eyebrow text-ink-2">{check.eyebrow}</p>
            <h2 id="check-title" className="text-h2 text-ink">
              {check.title}
            </h2>
            <TwoTone sentence={check.lead} className="text-lead" />
          </div>
          <div className="figure">
            <form action={check.href} method="get" className="checkform" aria-labelledby="check-title">
              <label htmlFor="home-check-site" className="label">
                {check.label}
              </label>
              <div className="checkrow">
                <input
                  id="home-check-site"
                  name="site"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  placeholder={check.placeholder}
                  required
                  maxLength={500}
                  className="input min-w-0"
                />
                <Button type="submit">{check.submit}</Button>
              </div>
              <p className="text-caption mt-3 max-w-[48ch] text-ink-2">{check.foot}</p>
            </form>
          </div>
        </div>
      </Station>

      {/* 2. The loss before the click */}
      <Station id={stations.problem} ariaLabelledBy="problem-title">
        <div className="split flip">
          <div className="figure">
            <TwoPathsPlate plate={problem.plate} />
          </div>
          <div className="words">
            <p className="text-eyebrow text-ink-2">{problem.eyebrow}</p>
            <h2 id="problem-title" className="text-h2 text-ink">
              {problem.title}
            </h2>
            {problem.body.map((paragraph) => (
              <p key={paragraph} className="measure text-ink-2">
                {paragraph}
              </p>
            ))}
            <TwoTone sentence={problem.lead} className="text-lead" />
            <RuleLink cta={problem.cta} />
          </div>
        </div>
      </Station>

      {/* 3. The system. Live sections 3 and 6 merged (audit decision 17). */}
      <Station id={stations.system} ariaLabelledBy="system-title">
        <p className="text-eyebrow mb-[22px] text-ink-2">{system.eyebrow}</p>
        <h2 id="system-title" className="text-h2 text-ink">
          {system.title}
        </h2>
        <TwoTone sentence={system.lead} className="text-lead mt-[22px] max-w-[56ch]" />

        <PhaseRail
          id={stations.solutions}
          phases={system.phases}
          returnLabel={system.returnLabel}
          ariaLabelledBy="system-title"
        />

        {/*
          The scope boundary renders once per page, here, where "observe" first
          appears as an activity. Sentence case rather than the mono coordinate
          treatment: it is a claim about what Hendricks measures, not a label.
        */}
        <p className="text-caption measure-wide mt-[26px] text-ink-2">
          {system.scope.join(' ')}
        </p>
      </Station>

      {/* 4. Beyond visibility */}
      <Station id={stations.ladder} ariaLabelledBy="ladder-title">
        <p className="text-eyebrow mb-[22px] text-ink-2">{ladder.eyebrow}</p>
        <h2 id="ladder-title" className="text-h2 text-ink">
          {ladder.title}
        </h2>
        <TwoTone sentence={ladder.lead} className="text-lead mt-[22px]" />

        <ConsiderationLadder rungs={ladder.rungs} />

        {ladder.note ? (
          <p className="text-caption mt-5 max-w-[62ch] text-ink-2">{ladder.note}</p>
        ) : null}
        <p className="text-caption mt-5 max-w-[62ch] text-ink-2">{ladder.closing}</p>
        <RuleLink cta={ladder.cta} />
      </Station>

      {/* 5. The evidence rule. One station, one sentence. */}
      <Station
        id={stations.evidenceRule}
        ariaLabelledBy="evidence-rule-title"
        className="hinge"
      >
        <h2 id="evidence-rule-title" className="sr-only">
          {evidenceRule.heading}
        </h2>
        <TwoTone sentence={evidenceRule} />
      </Station>

      {/* 6. Evidence and outputs */}
      <Station id={stations.outputs} ariaLabelledBy="outputs-title">
        <p className="text-eyebrow mb-[22px] text-ink-2">{outputs.eyebrow}</p>
        <h2 id="outputs-title" className="text-h2 text-ink">
          {outputs.title}
        </h2>
        {outputs.lead ? (
          <p className="text-lead mt-[22px] max-w-[56ch] text-ink">{outputs.lead}</p>
        ) : null}

        <div className="figrow">
          {outputs.items.map((item) => (
            <figure key={item.name}>
              <ArtifactPreviewDrawing preview={item.preview} alt={item.alt} />
              <p className="fig-number text-coordinate text-ink-2">{item.number}</p>
              <h3 className="fig-title">{item.name}</h3>
              {item.decision ? <p className="fig-note">{item.decision}</p> : null}
            </figure>
          ))}
        </div>

        {outputs.closing ? (
          <p className="text-caption mt-[22px] max-w-[60ch] text-ink-2">{outputs.closing}</p>
        ) : null}
      </Station>

      {/* 7. Audience pathways */}
      <Station id={stations.pathways} ariaLabelledBy="pathways-title">
        <p className="text-eyebrow mb-[22px] text-ink-2">{pathways.eyebrow}</p>
        <h2 id="pathways-title" className="text-h2 text-ink">
          {pathways.title}
        </h2>

        <div className="cols2">
          {pathways.columns.map((column) => (
            <div key={column.label}>
              <p className="text-coordinate text-ink-2">{column.label}</p>
              <h3 className="text-h3 my-[12px] text-ink">{column.title}</h3>
              <TwoTone sentence={column.body} className="text-[15.5px] leading-[1.5]" />
              {'models' in column ? (
                <p className="text-coordinate mt-3 text-ink-2">{column.models.join(' / ')}</p>
              ) : null}
              <RuleLink cta={column.cta} />
            </div>
          ))}
        </div>
      </Station>

      {/* 8. How Hendricks knows */}
      <Station id={stations.evidence} ariaLabelledBy="evidence-title">
        <p className="text-eyebrow mb-[22px] text-ink-2">{evidence.eyebrow}</p>
        <h2 id="evidence-title" className="text-h2 text-ink">
          {evidence.title}
        </h2>

        <EvidenceClasses classes={evidence.classes} ariaLabel="The four evidence classes" />
        <p className="sr-only">{evidence.alt}</p>

        <TwoTone sentence={evidence.pull} className="pull" />
        <RuleLink cta={evidence.cta} />
      </Station>

      {/* 9. The entry point, with the founder note beside it */}
      <Station id={stations.diagnostic} ariaLabelledBy="diagnostic-title">
        <div className="split">
          <div className="words">
            <p className="text-eyebrow text-ink-2">{diagnostic.eyebrow}</p>
            <h2 id="diagnostic-title" className="text-h2 text-ink">
              {diagnostic.title}
            </h2>
            <p className="text-lead measure text-ink-3">{diagnostic.lead}</p>
            <p className="text-caption text-ink-2">{diagnostic.timing}</p>
            <div className="cta-row">
              <PrimaryCta cta={diagnostic.cta} />
            </div>
          </div>
          <div className="figure">
            <p className="text-coordinate text-ink-2">{diagnostic.outputsLabel}</p>
            <ol className="olist mt-[14px]">
              {diagnostic.outputs.map((output, index) => (
                <li key={output}>
                  <span className="n" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {output}
                </li>
              ))}
            </ol>
            <FounderNote founder={founder} id={stations.founder} />
          </div>
        </div>
      </Station>

      {/* 10. The close */}
      <Station id={stations.close} ariaLabelledBy="close-title" className="closing">
        <p className="text-eyebrow mb-[22px] text-ink-2">{finalCta.eyebrow}</p>
        <h2 id="close-title" className="text-h2 text-ink">
          {finalCta.title}
        </h2>
        <TwoTone sentence={finalCta.lead} className="text-lead mt-6 max-w-[58ch]" />
        <div className="cta-row mt-8">
          <PrimaryCta cta={finalCta.primaryCta} />
          <PrimaryCta cta={finalCta.secondaryCta} variant="secondary" />
        </div>
      </Station>
    </div>
  )
}
