'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'

/**
 * Cloudflare Turnstile on the public forms (Brandon, 2026-09-27).
 *
 * Rendered with `appearance: 'interaction-only'`, so a visitor who passes the
 * background check sees nothing; the widget only surfaces when Cloudflare wants
 * an interaction, and that interaction is a single accessible checkbox, not an
 * image puzzle (docs/16 §15 prohibits an inaccessible CAPTCHA).
 *
 * Rendered explicitly rather than by the implicit `cf-turnstile` class scan,
 * because a token is single use: after a submission comes back with a field
 * error the form stays mounted, and the old token would fail verification on
 * the resubmit. `resetKey` changes on every returned state and resets the
 * widget so a fresh token is ready.
 *
 * Renders nothing when no site key is configured, matching the server check,
 * which passes when the keys are absent.
 */

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string
  reset: (widgetId?: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
    onHendricksTurnstileLoad?: () => void
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onHendricksTurnstileLoad'

/** The field name the server reads the token from. */
export const TURNSTILE_FIELD = 'cf-turnstile-response'

export function TurnstileWidget({ resetKey }: { resetKey?: unknown }) {
  const container = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)

  useEffect(() => {
    if (!SITE_KEY) return

    const render = () => {
      if (!container.current || !window.turnstile || widgetId.current) return
      widgetId.current = window.turnstile.render(container.current, {
        sitekey: SITE_KEY,
        appearance: 'interaction-only',
        'response-field-name': TURNSTILE_FIELD,
      })
    }

    if (window.turnstile) {
      render()
    } else {
      const previous = window.onHendricksTurnstileLoad
      window.onHendricksTurnstileLoad = () => {
        previous?.()
        render()
      }
    }

    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current)
      widgetId.current = null
    }
  }, [])

  useEffect(() => {
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current)
  }, [resetKey])

  if (!SITE_KEY) return null

  return (
    <>
      <Script src={SCRIPT_SRC} strategy="afterInteractive" />
      <div ref={container} className="field" />
    </>
  )
}
