import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { PrimaryNav } from '@/components/layout/primary-nav'

/**
 * The mobile route menu used to call `close` on every link click. That removes
 * `data-open` and sets the panel to `display: none` in the same turn as the
 * tap, which on mobile WebKit cancels the link before Next.js navigation runs.
 *
 * Cross-route taps must leave the panel open until `pathname` changes.
 * Same-route taps still close it, because that navigation changes nothing.
 */

const pathname = vi.hoisted(() => ({ current: '/' }))

vi.mock('next/navigation', () => ({
  usePathname: () => pathname.current,
}))

vi.mock('next/link', () => ({
  default({ href, onClick, children, ...props }: ComponentProps<'a'> & { href: string }) {
    return (
      <a
        href={href}
        onClick={(event) => {
          event.preventDefault()
          onClick?.(event)
        }}
        {...props}
      >
        {children}
      </a>
    )
  },
}))

function openMenu() {
  render(<PrimaryNav />)
  fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
  return {
    toggle: screen.getByRole('button', { name: 'Menu' }),
    nav: screen.getByRole('navigation', { name: 'Primary' }),
  }
}

describe('PrimaryNav route-menu clicks', () => {
  it('does not hide the panel when a different route is activated', () => {
    pathname.current = '/'
    const { toggle, nav } = openMenu()

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(nav).toHaveAttribute('data-open')

    fireEvent.click(screen.getByRole('link', { name: 'For Brands' }))

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(nav).toHaveAttribute('data-open')
  })

  it('hides the panel when the already-current route is activated', () => {
    pathname.current = '/about'
    const { toggle, nav } = openMenu()

    fireEvent.click(screen.getByRole('link', { name: /^About$/ }))

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(nav).not.toHaveAttribute('data-open')
  })
})
