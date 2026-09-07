'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'

import { describedBy, Field, Honeypot, MarketingOptIn, NoticeAtCollection, SubmitButton } from '@/components/forms/form-parts'
import { useFirstTouchAttribution } from '@/components/forms/use-first-touch-attribution'
import { VisibilityCheckResults } from '@/components/visibility/visibility-check-results'
import { check as copy } from '@/content/pages/ai-visibility-check'
import { submitVisibilityCheck } from '@/lib/visibility-check/actions'
import { initialVisibilityCheckState, type VisibilityCheckState } from '@/lib/visibility-check/state'

/**
 * The AI Visibility Check form (Brandon, 2026-09-07).
 *
 * The same frame as the lead forms: the action handed to `<form action>` is
 * the one `useActionState` returned, unwrapped, so the form still posts
 * without JavaScript and the page re-renders with the reading. JavaScript adds
 * three things: the elapsed counter while the run is in flight, the focus move
 * onto the summary or the reading when the action returns, and the first-touch
 * attribution field.
 *
 * `noValidate` with `required` still on each control is deliberate, for the
 * reasons `lead-form-shell.tsx` records.
 */

function minutesFrom(seconds: number | undefined): number {
  return Math.max(1, Math.ceil((seconds ?? 60) / 60))
}

function summaryMessage(state: VisibilityCheckState): string | undefined {
  switch (state.status) {
    case 'rate-limited':
      return copy.errors.rateLimited(minutesFrom(state.retryAfterSeconds))
    case 'capped':
      return copy.errors.capped
    case 'unavailable':
      return copy.errors.unavailable
    case 'duplicate':
      return copy.errors.duplicate
    case 'error':
      return copy.errors.generic
    default:
      return undefined
  }
}

/**
 * Mounted only while the action is pending, so mounting is the reset: the
 * start is read once and the interval only moves the clock forward.
 */
function ElapsedClock() {
  const [start] = useState(() => Date.now())
  const [now, setNow] = useState(start)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const seconds = Math.max(0, Math.floor((now - start) / 1000))
  const minutes = Math.floor(seconds / 60)
  const rest = String(seconds % 60).padStart(2, '0')

  return (
    <p className="text-coordinate mt-3 text-ink-2" aria-live="off">
      Elapsed {minutes}:{rest}
    </p>
  )
}

export function VisibilityCheckForm({
  startedAt,
  initialWebsite = '',
}: {
  startedAt: number
  /** Prefilled from the homepage station's `?site=` query. */
  initialWebsite?: string
}) {
  const [state, action, pending] = useActionState(submitVisibilityCheck, initialVisibilityCheckState)
  const ids = useId()
  const fieldId = (name: string) => `${ids}-${name}`
  const summaryId = `${ids}-summary`
  const resultsId = `${ids}-results`
  const attributionId = `${ids}-attribution`
  const reported = useRef<VisibilityCheckState | null>(null)

  useFirstTouchAttribution(attributionId)

  const errorFor = (name: string) => state.fieldErrors?.[name]
  const valueFor = (name: string, fallback = '') => state.values?.[name] ?? fallback

  const message = summaryMessage(state)
  const hasSummary = state.status === 'invalid' || message !== undefined

  useEffect(() => {
    if (reported.current === state || state.status === 'idle') return
    reported.current = state
    const target = state.status === 'complete' ? resultsId : hasSummary ? summaryId : null
    if (target) document.getElementById(target)?.focus()
  }, [state, hasSummary, summaryId, resultsId])

  if (state.status === 'complete' && state.result) {
    return <VisibilityCheckResults result={state.result} id={resultsId} />
  }

  return (
    <form action={action} noValidate className="form vform" aria-busy={pending}>
      <input type="hidden" name="startedAt" value={startedAt} />
      <input id={attributionId} type="hidden" name="attribution" defaultValue="" />
      <Honeypot id={fieldId('honeypot')} />

      {hasSummary ? (
        <div id={summaryId} tabIndex={-1} role="alert" className="errsum">
          <h2>{copy.errors.summaryTitle}</h2>
          {state.status === 'invalid' && state.fieldErrors ? (
            <>
              <p className="mt-3 text-ink-2">{copy.errors.invalid}</p>
              <ul>
                {Object.entries(state.fieldErrors).map(([field, text]) => (
                  <li key={field}>
                    <a href={`#${fieldId(field)}`}>{text}</a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-3 text-ink-2">{message}</p>
          )}
        </div>
      ) : null}

      <fieldset className="fset">
        <legend>{copy.legends.market}</legend>

        <Field
          label={copy.labels.brandName}
          htmlFor={fieldId('brandName')}
          hint={copy.hints.brandName}
          error={errorFor('brandName')}
          required
        >
          <input
            id={fieldId('brandName')}
            name="brandName"
            type="text"
            autoComplete="organization"
            required
            maxLength={80}
            defaultValue={valueFor('brandName')}
            aria-invalid={Boolean(errorFor('brandName'))}
            aria-describedby={describedBy(fieldId('brandName'), { hint: true, error: Boolean(errorFor('brandName')) })}
            className="input min-w-0"
          />
        </Field>

        <Field
          label={copy.labels.website}
          htmlFor={fieldId('website')}
          error={errorFor('website')}
          required
        >
          <input
            id={fieldId('website')}
            name="website"
            type="text"
            inputMode="url"
            autoComplete="url"
            required
            maxLength={500}
            defaultValue={valueFor('website', initialWebsite)}
            aria-invalid={Boolean(errorFor('website'))}
            aria-describedby={describedBy(fieldId('website'), { error: Boolean(errorFor('website')) })}
            className="input min-w-0"
          />
        </Field>

        <Field
          label={copy.labels.market}
          htmlFor={fieldId('market')}
          hint={copy.hints.market}
          error={errorFor('market')}
          required
        >
          <input
            id={fieldId('market')}
            name="market"
            type="text"
            required
            maxLength={120}
            defaultValue={valueFor('market')}
            aria-invalid={Boolean(errorFor('market'))}
            aria-describedby={describedBy(fieldId('market'), { hint: true, error: Boolean(errorFor('market')) })}
            className="input min-w-0"
          />
        </Field>

        <Field
          label={copy.labels.location}
          htmlFor={fieldId('location')}
          hint={copy.hints.location}
          error={errorFor('location')}
        >
          <input
            id={fieldId('location')}
            name="location"
            type="text"
            maxLength={80}
            defaultValue={valueFor('location')}
            aria-invalid={Boolean(errorFor('location'))}
            aria-describedby={describedBy(fieldId('location'), { hint: true, error: Boolean(errorFor('location')) })}
            className="input min-w-0"
          />
        </Field>
      </fieldset>

      <fieldset className="fset">
        <legend>{copy.legends.contact}</legend>

        <div className="fieldpair">
          <Field label={copy.labels.name} htmlFor={fieldId('name')} error={errorFor('name')} required>
            <input
              id={fieldId('name')}
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={120}
              defaultValue={valueFor('name')}
              aria-invalid={Boolean(errorFor('name'))}
              aria-describedby={describedBy(fieldId('name'), { error: Boolean(errorFor('name')) })}
              className="input min-w-0"
            />
          </Field>

          <Field
            label={copy.labels.workEmail}
            htmlFor={fieldId('workEmail')}
            error={errorFor('workEmail')}
            required
          >
            <input
              id={fieldId('workEmail')}
              name="workEmail"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              defaultValue={valueFor('workEmail')}
              aria-invalid={Boolean(errorFor('workEmail'))}
              aria-describedby={describedBy(fieldId('workEmail'), { error: Boolean(errorFor('workEmail')) })}
              className="input min-w-0"
            />
          </Field>
        </div>
      </fieldset>

      <div className="field">
        <MarketingOptIn
          id={fieldId('marketingOptIn')}
          text={copy.marketingOptIn}
          checked={valueFor('marketingOptIn') === 'on'}
        />
      </div>

      <NoticeAtCollection text={copy.notice} />

      <div className="cta-row">
        <SubmitButton label={copy.submit} pendingLabel={copy.submitting} pending={pending} />
      </div>

      {pending ? (
        <div role="status" className="vpending">
          <p className="measure-wide text-ink-2">{copy.pending}</p>
          <ElapsedClock />
        </div>
      ) : null}
    </form>
  )
}
