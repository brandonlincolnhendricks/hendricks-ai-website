'use client'

import type { ReactNode } from 'react'

import {
  ErrorSummary,
  Honeypot,
  MarketingOptIn,
  NoticeAtCollection,
  SubmitButton,
  SuccessRegion,
} from '@/components/forms/form-parts'
import { TurnstileWidget } from '@/components/forms/turnstile-widget'
import type { LeadFormController } from '@/components/forms/use-lead-form'
import { useFirstTouchAttribution } from '@/components/forms/use-first-touch-attribution'

/**
 * The frame every lead form is written inside (15 sections 4 to 6).
 *
 * It owns the parts whose order is a rule rather than a preference: the error
 * summary first so focus lands on it, the notice at collection immediately
 * above the submit button (16 FM-05), and the success region replacing the
 * whole form rather than sitting beside it (16 FM-04).
 *
 * `noValidate` with `required` still on each control is deliberate. The
 * attributes are what assistive technology reads and what the server contract
 * mirrors; the browser's own bubbles are suppressed because they are not
 * focusable, not stylable, and disappear on the next keystroke, which is three
 * failures of the error contract at once.
 */
export function LeadFormShell({
  controller,
  startedAt,
  copy,
  children,
}: {
  controller: LeadFormController
  startedAt: number
  copy: {
    notice: string
    marketingOptIn: string
    submit: string
    submitting: string
    confirmationTitle: string
    confirmation: string
    successLink: { label: string; href: string }
  }
  children: ReactNode
}) {
  useFirstTouchAttribution(controller.attributionId)

  if (controller.state.status === 'success') {
    return (
      <SuccessRegion
        id={controller.successId}
        title={copy.confirmationTitle}
        body={copy.confirmation}
        link={copy.successLink}
      />
    )
  }

  return (
    <form
      action={controller.action}
      noValidate
      className="form"
      onFocusCapture={controller.onFirstFocus}
      onSubmit={controller.onSubmit}
    >
      <input type="hidden" name="startedAt" value={startedAt} />
      <input id={controller.attributionId} type="hidden" name="attribution" defaultValue="" />

      <Honeypot id={controller.fieldId('honeypot')} />

      {controller.hasSummary ? (
        <ErrorSummary
          id={controller.summaryId}
          fieldErrors={controller.state.fieldErrors}
          message={controller.summaryMessage}
          fieldId={controller.fieldId}
        />
      ) : null}

      {children}

      <div className="field">
        <MarketingOptIn
          id={controller.fieldId('marketingOptIn')}
          text={copy.marketingOptIn}
          checked={controller.valueFor('marketingOptIn') === 'on'}
        />
      </div>

      <TurnstileWidget resetKey={controller.state} />

      <NoticeAtCollection text={copy.notice} />

      <div className="cta-row">
        <SubmitButton
          label={copy.submit}
          pendingLabel={copy.submitting}
          pending={controller.pending}
        />
      </div>
    </form>
  )
}
