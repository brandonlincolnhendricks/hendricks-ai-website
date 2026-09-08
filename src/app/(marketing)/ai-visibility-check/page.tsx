import type { Metadata } from 'next'

import { Answer } from '@/components/canvas/answer'
import { ClosingStation } from '@/components/canvas/closing-station'
import { Ledger } from '@/components/canvas/ledger'
import { CanvasPageHero } from '@/components/canvas/page-hero'
import { RailColumn } from '@/components/canvas/rail-column'
import { RuleList } from '@/components/canvas/rule-list'
import { Station } from '@/components/sections/station'
import { JsonLd } from '@/components/seo/json-ld'
import { RuleLink } from '@/components/ui/cta'
import { VisibilityCheckForm } from '@/components/visibility/visibility-check-form'
import { routes } from '@/config/routes'
import {
  check,
  closing,
  contents,
  directAnswer,
  hero,
  meta,
  notMeasured,
  questions,
  reading,
} from '@/content/pages/ai-visibility-check'
import { requestTimestamp } from '@/lib/forms/request-time'
import { jsonLdGraph, webPageSchema } from '@/lib/seo/json-ld'
import { buildMetadata } from '@/lib/seo/metadata'
import { normalizeWebsite } from '@/lib/forms/lead-schema'

/**
 * /ai-visibility-check, on the canvas.
 *
 * The form is the second station, directly under the answer-first block, so a
 * visitor who arrived from the homepage's website field is one screen from
 * running it. Everything below the form is the reading's context: how to read
 * the three states, what the check does not measure, and the questions a
 * careful buyer asks first. That copy renders whether or not anyone runs the
 * check, which is what makes the route worth indexing.
 *
 * The route is dynamic twice over: it stamps `startedAt` for the timing floor
 * and reads `?site=` from the homepage station. The segment's `maxDuration` is
 * the ceiling the server action runs under; twenty parallel probes finish in
 * about the time of the slowest one.
 */

export const maxDuration = 300

export const metadata: Metadata = buildMetadata({
  title: meta.title,
  description: meta.description,
  path: routes.aiVisibilityCheck.path,
})

/** The website the homepage station handed over, normalized or dropped. */
function initialWebsite(site: string | string[] | undefined): string {
  const raw = Array.isArray(site) ? site[0] : site
  if (!raw) return ''
  const trimmed = raw.trim().slice(0, 500)
  if (trimmed.length === 0) return ''
  try {
    return new URL(normalizeWebsite(trimmed)).toString()
  } catch {
    return ''
  }
}

export default async function AiVisibilityCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string | string[] }>
}) {
  const [startedAt, params] = await Promise.all([requestTimestamp(), searchParams])
  const website = initialWebsite(params.site)

  return (
    <div className="wrap">
      <JsonLd
        data={jsonLdGraph(
          webPageSchema({
            path: routes.aiVisibilityCheck.path,
            title: meta.title,
            description: meta.description,
            hasBreadcrumb: true,
          }),
        )}
      />

      <CanvasPageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lead={hero.lead}
        path={routes.aiVisibilityCheck.path}
        breadcrumbs={[
          { label: routes.home.label, href: routes.home.path },
          { label: routes.aiVisibilityCheck.label },
        ]}
      >
        <Answer
          id="answer"
          className="answer-lead mt-[30px]"
          label={directAnswer.term}
          labelId="direct-answer-label"
          paragraphs={directAnswer.paragraphs}
        />
      </CanvasPageHero>

      <div className="bodywrap">
        <RailColumn sections={contents}>
          <Station id="check" ariaLabelledBy="check-title" stack>
            <p className="text-eyebrow text-ink-2">{check.eyebrow}</p>
            <h2 id="check-title" className="text-h2 text-ink">
              {check.title}
            </h2>
            <p className="text-lead measure-wide text-ink-2">{check.lead}</p>

            <VisibilityCheckForm startedAt={startedAt} initialWebsite={website} />
          </Station>

          <Station id="reading" ariaLabelledBy="reading-title" stack>
            <p className="text-eyebrow text-ink-2">{reading.eyebrow}</p>
            <h2 id="reading-title" className="text-h2 text-ink">
              {reading.title}
            </h2>
            <Ledger
              rows={reading.rows}
              fieldLabels={{ value: 'What it means', note: 'Note' }}
              ariaLabel="The three states"
            />
            <p className="text-caption max-w-[62ch] text-ink-2">{reading.closing}</p>
          </Station>

          <Station id="scope" ariaLabelledBy="scope-title" stack>
            <p className="text-eyebrow text-ink-2">{notMeasured.eyebrow}</p>
            <h2 id="scope-title" className="text-h2 text-ink">
              {notMeasured.title}
            </h2>
            <RuleList items={notMeasured.items} ariaLabelledBy="scope-title" />
            <p className="text-caption max-w-[62ch] text-ink-2">{notMeasured.scope.join(' ')}</p>
          </Station>

          <Station id="questions" ariaLabelledBy="questions-title" stack>
            <p className="text-eyebrow text-ink-2">{questions.eyebrow}</p>
            <h2 id="questions-title" className="text-h2 text-ink">
              {questions.title}
            </h2>
            <div className="qa">
              {questions.items.map((item) => (
                <div key={item.question} className="qa-item">
                  <h3 className="text-h3 text-ink">{item.question}</h3>
                  <p className="measure-wide text-ink-2">{item.answer}</p>
                  {'link' in item ? <RuleLink cta={item.link} /> : null}
                </div>
              ))}
            </div>
          </Station>
        </RailColumn>
      </div>

      <ClosingStation
        eyebrow={closing.eyebrow}
        title={closing.title}
        lead={closing.lead}
        primaryCta={closing.primaryCta}
        secondaryLink={closing.secondaryLink}
      />
    </div>
  )
}
