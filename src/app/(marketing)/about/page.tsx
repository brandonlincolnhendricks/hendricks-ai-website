import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Answer } from '@/components/canvas/answer'
import { Byline } from '@/components/canvas/byline'
import { ClosingStation } from '@/components/canvas/closing-station'
import { DefinitionList } from '@/components/canvas/definition-list'
import { Ledger } from '@/components/canvas/ledger'
import { MethodList } from '@/components/canvas/method-list'
import { CanvasPageHero } from '@/components/canvas/page-hero'
import { TableRegion } from '@/components/canvas/table-region'
import { Station } from '@/components/sections/station'
import { JsonLd } from '@/components/seo/json-ld'
import { RuleLink } from '@/components/ui/cta'
import { TwoTone } from '@/components/ui/two-tone'
import { isBuilt, routes } from '@/config/routes'
import { siteConfig } from '@/config/site'
import {
  closing,
  closingEyebrow,
  experience,
  externalVenture,
  hero,
  meta,
  pointOfView,
  principles,
  related,
} from '@/content/pages/about'
import { hero as researchHero } from '@/content/research/hub'
import {
  foundedOrganizationSchema,
  jsonLdGraph,
  personSchema,
  webPageSchema,
} from '@/lib/seo/json-ld'
import { buildMetadata } from '@/lib/seo/metadata'

/**
 * /about, rebuilt on the approved canvas (`07-hifi/about.html`) station for
 * station.
 *
 * Two things the design records and this page keeps. D-D: the portrait renders
 * in colour, which `.portrait img` sets explicitly. D-B: the byline resolves to
 * the one Person node, the same node this page's `Person` schema declares, so a
 * machine reading the biography and a machine reading a research byline resolve
 * to the same entity.
 *
 * Two departures from the design page, both recorded. Its "Design notes"
 * station is hi-fi chrome rather than site copy and its own comment says so, so
 * it is not shipped. Its hero drops the opening clause of the second approved
 * lead sentence; that sentence is published on this route today and D-E keeps
 * it, so the answer-first block carries it in full.
 */

export const metadata: Metadata = buildMetadata({
  title: meta.title,
  description: meta.description,
  path: routes.about.path,
})

export default function AboutPage() {
  return (
    <div className="wrap">
      <JsonLd
        data={jsonLdGraph(
          webPageSchema({
            path: routes.about.path,
            title: meta.title,
            description: meta.description,
            // docs/06 §8 names AboutPage for this route. `mainEntity` points at
            // the Person node below, which is what declares that this page is
            // about Brandon Lincoln Hendricks rather than merely mentioning him.
            type: 'AboutPage',
            mainEntity: { '@id': siteConfig.founderPersonId },
            hasBreadcrumb: true,
          }),
          personSchema({
            jobTitle: siteConfig.founderRole,
            imagePath: hero.portrait.src,
            // Must match the employers rendered in the visible role timeline.
            // "Dentsu" was asserted here while `about.ts` records the opposite
            // decision: the employer is Merkle alone, because that is what the
            // public record shows (CONTENT_VERIFICATION.md F4).
            alumniOf: [
              { name: 'Merkle', jobTitle: 'Global Paid Search Director' },
              { name: 'SolarWinds', jobTitle: 'Global Search and Innovation Lead' },
            ],
          }),
          // The publication the "Also founded by Brandon" station names, with
          // founder pointing at the Person node above.
          foundedOrganizationSchema({
            name: externalVenture.name,
            url: externalVenture.cta.href,
            type: 'NewsMediaOrganization',
          }),
        )}
      />

      {/* 1. Page hero */}
      <CanvasPageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lead={hero.leadTwoTone}
        path={routes.about.path}
        breadcrumbs={[
          { label: routes.home.label, href: routes.home.path },
          { label: routes.about.label },
        ]}
        primaryCta={hero.primaryCta}
        foot={
          <>
            <span className="text-caption text-ink-2">{siteConfig.categoryLine}</span>
            <span className="text-caption text-ink-2">{siteConfig.operatingLine}</span>
          </>
        }
      >
        <Byline authorTitle={siteConfig.founderRole} showDates={false} />
      </CanvasPageHero>

      {/* 2. The direct answer */}
      <Station id="answer" ariaLabelledBy="answer-title" className="tight">
        <Answer
          label={hero.answerLabel}
          headingId="answer-title"
          headingText={hero.answerHeading}
          paragraphs={[hero.lead[1]]}
        />
      </Station>

      {/* 3. The founder */}
      <Station id="experience" ariaLabelledBy="experience-title">
        <div className="split flip">
          <div className="figure">
            <figure className="portrait">
              <div className="plate-head">
                <span className="plate-no">Plate 01</span>
                <span className="plate-title">The Founder</span>
              </div>
              <Image
                src={hero.portrait.src}
                alt={hero.portrait.alt}
                width={hero.portrait.width}
                height={hero.portrait.height}
                priority
                sizes="(min-width: 1024px) 420px, 100vw"
              />
              <figcaption className="text-caption text-ink-2">
                {siteConfig.founder}, {siteConfig.founderRole}
              </figcaption>
            </figure>
          </div>

          <div className="words">
            <p className="text-eyebrow text-ink-2">{experience.eyebrow}</p>
            <h2 id="experience-title" className="text-h2 text-ink">
              {experience.title}
            </h2>
            <TwoTone
              sentence={{
                claim: 'Two enterprise search leadership roles, held as an employee,',
                continuation: 'and the firm that followed them.',
              }}
              className="text-caption"
            />
          </div>
        </div>

        <div className="block mt-[52px]">
          <p className="text-caption mb-[10px] max-w-none text-ink-2">{experience.tableNote}</p>

          <TableRegion
            caption={experience.tableCaption}
            columns={[
              { key: 'index', header: experience.tableColumns.index },
              { key: 'organization', header: experience.tableColumns.organization, rowHeader: true },
              { key: 'role', header: experience.tableColumns.role },
              { key: 'period', header: experience.tableColumns.period },
              { key: 'relationship', header: experience.tableColumns.relationship },
            ]}
            rows={experience.roles.map((role, index) => ({
              index: String(index + 1).padStart(2, '0'),
              organization: role.organization,
              role: role.title,
              period: role.period,
              relationship: role.relationship,
            }))}
          />

          {/*
            The design's table carries the record and drops the three role
            descriptions. They are published on this route today, so D-E keeps
            them: each renders against the role it belongs to, once.
          */}
          <DefinitionList
            className="mt-9"
            definitions={experience.roles.map((role) => ({
              term: `${role.organization}, ${role.title}`,
              definition: [role.description],
            }))}
          />
        </div>

        <div className="block">
          <p className="text-coordinate text-ink-2">{externalVenture.label}</p>
          <h3 className="text-h3 mt-3 text-ink">{externalVenture.name}</h3>
          <p className="text-caption mt-3 max-w-[62ch] text-ink-2">
            {externalVenture.description}
          </p>
          <RuleLink cta={externalVenture.cta} />
        </div>
      </Station>

      {/* 4. Point of view */}
      <Station id="point-of-view" ariaLabelledBy="point-of-view-title">
        <p className="text-eyebrow mb-[22px] text-ink-2">{pointOfView.eyebrow}</p>
        <h2 id="point-of-view-title" className="text-h2 text-ink">
          {pointOfView.title}
        </h2>

        {/* The quote is the station's pull sentence, on no border: a bordered
            quote is a box, and this system has none. */}
        <p className="pull">{pointOfView.quote}</p>

        <div className="cols2">
          <div>
            <p className="text-lead text-ink">{pointOfView.body[0]}</p>
            <p className="mt-4 text-[15.5px] text-ink-2">{pointOfView.closing}</p>
          </div>
          <div>
            <p className="text-coordinate text-ink-2">{pointOfView.notListLabel}</p>
            <ul className="ruled mt-[14px]" aria-label={pointOfView.notListLabel}>
              {pointOfView.notList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Station>

      {/* 5. Five principles */}
      <Station id="principles" ariaLabelledBy="principles-title">
        <p className="text-eyebrow mb-[22px] text-ink-2">{principles.eyebrow}</p>
        <h2 id="principles-title" className="text-h2 text-ink">
          {principles.title}
        </h2>

        <MethodList
          className="mt-9"
          ariaLabel={principles.title}
          steps={principles.items.map((principle) => ({
            title: principle.name,
            body: [principle.description],
          }))}
        />
      </Station>

      {/* 6. Capability areas */}
      <Station id="capabilities" ariaLabelledBy="capabilities-title">
        <h2 id="capabilities-title" className="text-h2 text-ink">
          {experience.capabilitiesTitle}
        </h2>

        <div className="cols2">
          <div>
            <p className="text-coordinate text-ink-2">{experience.capabilitiesLabel}</p>
            <ul className="ruled mt-[14px]" aria-label={experience.capabilitiesLabel}>
              {experience.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-coordinate text-ink-2">{experience.researchLabel}</p>
            <p className="mt-[14px] text-[15.5px] text-ink-2">
              {experience.researchIntro}
              <Link href={routes.research.path}>{routes.research.label}</Link>
              {`: ${researchHero.lead[0]}`}
            </p>
          </div>
        </div>

        <Ledger
          ariaLabel={experience.capabilitiesTitle}
          rows={related
            .filter((entry) => isBuilt(entry.href))
            .map((entry) => ({
              key: entry.href,
              label: <Link href={entry.href}>{entry.label}</Link>,
              value: entry.description,
            }))}
        />
      </Station>

      {/* 7. The close */}
      <ClosingStation
        id="close"
        eyebrow={closingEyebrow}
        title={closing.title}
        primaryCta={closing.primaryCta}
      />
    </div>
  )
}
