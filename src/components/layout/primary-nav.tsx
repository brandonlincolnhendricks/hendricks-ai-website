'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { NavLink } from '@/components/layout/nav-link'
import { isCurrentRoute, primaryNavigation } from '@/config/navigation'

/**
 * The masthead's six route links (canvas `_canvas.html`; decisions D-F, D-G).
 *
 * One `nav` serves both widths. From 900 px it is the row of routes in the bar.
 * Below 900 px it is a disclosure panel spanning the masthead, opened by the
 * Menu button that precedes it in the DOM, so the panel follows its own
 * control. The panel is not a modal: it takes no focus trap and steals no
 * focus, because it neither covers the page nor blocks it (KF-04 is amended
 * here; the canvas replaced the sheet with this disclosure and the consent
 * preferences dialog is now the only modal on the site).
 *
 * Solutions is a plain link to the hub. D-G removed the dropdown: choosing
 * between four terms before the page has taught them is the comprehension
 * failure the audit recorded on the live site.
 *
 * The panel closes on Escape with focus restored to the button, on every route
 * change, so a client-side navigation never leaves it open over the page it
 * just loaded, and when focus leaves the group. Tapping the route already open
 * closes it too, since that navigation changes nothing.
 */
const NAV_ID = 'route-menu'

export function PrimaryNav() {
  const toggle = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)
  const pathname = usePathname()
  /*
   * The route the panel was opened on, rather than a boolean. A client-side
   * navigation changes `pathname`, which closes the panel during the same
   * render as the new route rather than in an effect after it.
   */
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const open = openedAt === pathname

  const close = useCallback(() => {
    setOpenedAt(null)
  }, [])

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      // Focus may be on a panel link, which is about to be display:none and
      // would drop focus to body (2.4.3).
      toggle.current?.focus()
      setOpenedAt(null)
    }

    /*
     * The panel is absolutely positioned over the page, so anything focused
     * beneath it would be obscured (2.4.11). Focus leaving the group closes it,
     * which is the behaviour the Solutions disclosure this replaced also had.
     *
     * A null `relatedTarget` is focus leaving for nothing at all: a window
     * blur, or WebKit's click on a link, which does not focus what it clicked.
     * Hiding the panel there would cancel the click before its mouseup.
     */
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget
      if (!(next instanceof Node)) return
      if (toggle.current?.contains(next) || panel.current?.contains(next)) return
      setOpenedAt(null)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [open])

  return (
    <>
      <button
        ref={toggle}
        type="button"
        className="route-menu-toggle"
        aria-expanded={open}
        aria-controls={NAV_ID}
        onClick={() => setOpenedAt(open ? null : pathname)}
      >
        Menu
      </button>

      <nav
        ref={panel}
        id={NAV_ID}
        aria-label="Primary"
        className="route-menu"
        data-open={open || undefined}
      >
        {/*
          Do not hide the panel on every route tap. Removing `data-open` sets
          `display: none` in the same turn as the click, which on mobile WebKit
          cancels the link before Next.js navigation runs. The same trap is why
          `focusout` above ignores a null relatedTarget. Cross-route taps close
          because `openedAt === pathname` becomes false when the route changes.
          Same-route taps still need an explicit close: that navigation changes
          nothing.
        */}
        {primaryNavigation.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            onClick={() => {
              if (isCurrentRoute(pathname, item.href)) close()
            }}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
