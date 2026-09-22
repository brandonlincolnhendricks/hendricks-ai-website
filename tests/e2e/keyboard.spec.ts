import { expect, test, type Locator, type Page } from '@playwright/test'

import { headerCtaHref } from '@/config/navigation'
import { banner, preferences } from '@/content/consent'

/**
 * Keyboard and focus requirements KF-01 to KF-10 (redesign 16 section 2),
 * measured on the canvas shell: skip link, masthead, route menu, footer,
 * consent sheet and preferences dialog. Everything inside `main` belongs to the
 * page rebuilds and is measured by their own specs. The KF-04 modal inventory
 * is a source check and lives in `tests/unit/modal-inventory.test.ts`.
 *
 * Two rows read differently after the canvas rebuild, and both are amendments
 * the design package makes rather than regressions:
 *
 * - KF-08 was the Solutions disclosure. Decision D-G removed it: Solutions is a
 *   plain link to the hub and no solution name appears in the header. The row
 *   now covers the disclosure the canvas does add, the route menu that restores
 *   the six routes below 900 px, where the approved page left a phone with no
 *   route out of the header at all.
 * - KF-04 named the mobile sheet as a Radix modal. The canvas replaced it with
 *   that same route menu, which covers nothing and traps nothing, so the
 *   preferences dialog is the site's only modal.
 */

/** The canvas collapses the six route links into the menu below 900 px. */
const PHONE = { width: 390, height: 844 }
const DESKTOP = { width: 1440, height: 900 }

const ROUTE_LABELS = [
  'Solutions',
  'How It Works',
  'For Brands',
  'For Agencies',
  'Research',
  'About',
]

/**
 * `--focus` is `--hx-cyan-500` on the canvas ground and stays that value inside
 * `.on-plate`, because the canvas has one ground. The ring is 2 px at a 3 px
 * offset, from the `:focus-visible` rule in globals.css.
 */
const FOCUS_RING = 'rgb(0, 194, 216)'
const FOCUS_RING_WIDTH = '2px'
const FOCUS_RING_OFFSET = '3px'

/** The site target rule: 44 by 44 CSS px at every width (KF-09). */
const TARGET = 44

const sheet = (page: Page) => page.getByRole('region', { name: banner.title })

/**
 * Sequential keyboard navigation to a link or a button, and click-to-focus on a
 * button, are macOS platform behaviours gated by Full Keyboard Access, which is
 * off by default. Playwright's WebKit build honours the setting and exposes no
 * way to turn it on, so the mobile (Mobile Safari) project cannot measure tab
 * order or focus restoration at all. Document order, focusability and every
 * geometric assertion below still run there; the sequence itself is proven on
 * chromium-desktop, firefox-desktop and tablet.
 */
const KEYBOARD_IS_PLATFORM_GATED = 'Mobile Safari: Full Keyboard Access is off and cannot be set'

async function box(locator: Locator) {
  const rect = await locator.boundingBox()
  expect(rect, 'element has no box').not.toBeNull()
  return rect!
}

/**
 * Every visible link and button inside `root`, with its box. A link inside a
 * paragraph is running copy and exempt under the 2.5.8 inline exception; the
 * consent body's Privacy Notice link is the one the shell carries.
 */
function controlBoxes(root: Locator) {
  return root.locator('a, button').evaluateAll((nodes) =>
    nodes
      .filter((node) => node.getClientRects().length > 0 && !node.closest('p'))
      .map((node) => {
        const rect = node.getBoundingClientRect()
        return {
          name: (node.getAttribute('aria-label') ?? node.textContent ?? '').trim(),
          width: rect.width,
          height: rect.height,
        }
      }),
  )
}

function undersized(boxes: Array<{ name: string; width: number; height: number }>) {
  return boxes.filter((item) => item.width < TARGET - 0.5 || item.height < TARGET - 0.5)
}

test.describe('KF-01 skip link', () => {
  for (const route of ['/', '/diagnostic', '/privacy', '/no-such-route']) {
    test(`${route}: first tab stop targets main`, async ({ page, browserName }) => {
      test.skip(browserName === 'webkit', KEYBOARD_IS_PLATFORM_GATED)
      await page.goto(route)

      // Nothing steals focus on load (KF-02).
      expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY')

      await page.keyboard.press('Tab')
      const skipLink = page.getByRole('link', { name: 'Skip to main content' })
      await expect(skipLink).toBeFocused()
      await expect(skipLink).toBeVisible()

      await page.keyboard.press('Enter')
      await expect(page.locator('main#main')).toBeFocused()
      await expect(page.locator('main#main')).toHaveAttribute('tabindex', '-1')
    })
  }
})

test.describe('KF-02 document order', () => {
  test('skip link, header, main, live region, footer, then the consent sheet', async ({ page }) => {
    await page.goto('/')
    await expect(sheet(page)).toBeVisible()
    const sheetTitleId = await sheet(page).getAttribute('aria-labelledby')

    const order = await page.evaluate((titleId) => {
      const nodes = [
        document.querySelector('a[href="#main"]'),
        document.querySelector('header'),
        document.querySelector('main'),
        document.querySelector('[role="status"]'),
        document.querySelector('footer'),
        document.querySelector(`section[aria-labelledby="${titleId}"]`),
      ]
      return nodes.map((node, index) => {
        const next = nodes[index + 1]
        if (!node) return 'missing'
        if (!next) return 'end'
        return node.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING
          ? 'before'
          : 'after'
      })
    }, sheetTitleId)

    expect(order).toEqual(['before', 'before', 'before', 'before', 'before', 'end'])
  })

  test('the tab sequence runs skip link, wordmark, primary navigation, header button', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', KEYBOARD_IS_PLATFORM_GATED)
    await page.goto('/')

    // The menu button is display:none from 900 px, so it is not a tab stop, and
    // no solution name is in the header at all (D-G).
    const expected = [
      'Skip to main content',
      'Hendricks, home',
      ...ROUTE_LABELS,
      'Start with a Diagnostic',
    ]

    for (const name of expected) {
      await page.keyboard.press('Tab')
      const active = await page.evaluate(() => {
        const node = document.activeElement
        return (node?.getAttribute('aria-label') ?? node?.textContent ?? '').trim()
      })
      expect(active).toBe(name)
    }
  })
})

test.describe('KF-03 consent sheet', () => {
  test('is a labelled region with three real buttons of one variant and height', async ({
    page,
  }) => {
    await page.goto('/')
    const region = sheet(page)
    await expect(region).toBeVisible()

    const buttons = region.getByRole('button')
    await expect(buttons).toHaveText([banner.reject, banner.manage, banner.accept])

    const styles = await buttons.evaluateAll((nodes) =>
      nodes.map((node) => {
        const style = getComputedStyle(node)
        return {
          tag: node.tagName,
          height: node.getBoundingClientRect().height,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          background: style.backgroundColor,
          color: style.color,
          border: style.borderColor,
        }
      }),
    )

    expect(styles.map((style) => style.tag)).toEqual(['BUTTON', 'BUTTON', 'BUTTON'])
    expect(new Set(styles.map((style) => style.height)).size).toBe(1)
    expect(new Set(styles.map((style) => style.fontSize)).size).toBe(1)
    const variants = styles.map(({ fontSize, fontWeight, background, color, border }) =>
      JSON.stringify({ fontSize, fontWeight, background, color, border }),
    )
    expect(new Set(variants).size).toBe(1)
    expect(styles[0].height).toBeGreaterThanOrEqual(TARGET)
  })

  test('tabs Reject, Manage, Accept in that order and opens the dialog from a button', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', KEYBOARD_IS_PLATFORM_GATED)
    await page.goto('/')
    const region = sheet(page)

    await region.getByRole('button', { name: banner.reject }).focus()
    await page.keyboard.press('Tab')
    await expect(region.getByRole('button', { name: banner.manage })).toBeFocused()
    await expect(region.getByRole('button', { name: banner.manage })).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    )
    await page.keyboard.press('Tab')
    await expect(region.getByRole('button', { name: banner.accept })).toBeFocused()

    await expect(region.getByRole('link', { name: banner.manage })).toHaveCount(0)
  })

  test('Escape on the dialog records nothing and returns focus to Manage choices', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', KEYBOARD_IS_PLATFORM_GATED)
    await page.goto('/')
    const manage = sheet(page).getByRole('button', { name: banner.manage })
    await manage.click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(manage).toBeFocused()
    await expect(sheet(page)).toBeVisible()
    expect(await page.evaluate(() => window.localStorage.length)).toBe(0)
  })
})

test.describe('KF-05 and KF-06 focus ring', () => {
  /*
   * Two of the three reads need no key press, so they run on every project
   * rather than sharing the tab-order skip: the ring colour is the whole point
   * of KF-06 and Mobile Safari resolves it the same way every other engine
   * does.
   */
  test('is set at rest and re-scopes inside .on-plate through one token', async ({ page }) => {
    await page.goto('/')

    // The resting outline colour is the ring colour on every element, so the
    // ring never fades in from currentColor (KF-06). The masthead and the
    // footer both carry the wordmark link, so this reads the first.
    const resting = await page
      .locator('header')
      .getByRole('link', { name: 'Hendricks, home' })
      .evaluate((node) => getComputedStyle(node).outlineColor)
    expect(resting).toBe(FOCUS_RING)

    // A control inside a plate reads the same ring through one token, no
    // variant: the canvas has one ground, so the re-scope changes nothing today
    // and this is what proves it.
    const plate = await page.evaluate(() => {
      const wrapper = document.createElement('div')
      wrapper.className = 'on-plate'
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = 'probe'
      wrapper.append(button)
      document.querySelector('main')?.append(wrapper)
      return getComputedStyle(button).outlineColor
    })
    expect(plate).toBe(FOCUS_RING)
  })

  test('is Insight Cyan, solid, 2 px at a 3 px offset when focus lands', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', KEYBOARD_IS_PLATFORM_GATED)
    await page.goto('/')

    await page.keyboard.press('Tab')
    const focused = await page
      .getByRole('link', { name: 'Skip to main content' })
      .evaluate((node) => {
        const style = getComputedStyle(node)
        return {
          color: style.outlineColor,
          style: style.outlineStyle,
          width: style.outlineWidth,
          offset: style.outlineOffset,
        }
      })
    expect(focused).toEqual({
      color: FOCUS_RING,
      style: 'solid',
      width: FOCUS_RING_WIDTH,
      offset: FOCUS_RING_OFFSET,
    })
  })
})

test.describe('KF-07 focus not obscured', () => {
  test.use({ viewport: PHONE })

  test('every focusable element in main lands between the header and the open sheet', async ({
    page,
    browserName,
  }) => {
    // Programmatic focus does not move on Mobile Safari with Full Keyboard
    // Access off, so nothing scrolls and every box reads its unscrolled offset.
    test.skip(browserName === 'webkit', KEYBOARD_IS_PLATFORM_GATED)
    await page.goto('/')
    await expect(sheet(page)).toBeVisible()

    const count = await page
      .locator('main')
      .locator('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex="0"]')
      .count()
    expect(count).toBeGreaterThan(0)

    const sheetTitleId = await sheet(page).getAttribute('aria-labelledby')
    const failures = await page.evaluate((titleId) => {
      const header = document.querySelector('header')!.getBoundingClientRect()
      const sheetRect = document
        .querySelector(`section[aria-labelledby="${titleId}"]`)!
        .getBoundingClientRect()
      const focusables = document
        .querySelector('main')!
        .querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex="0"]',
        )
      const problems: string[] = []

      for (const node of focusables) {
        if (node.getClientRects().length === 0) continue
        node.focus()
        const rect = node.getBoundingClientRect()
        const label = (node.getAttribute('aria-label') ?? node.textContent ?? '').trim().slice(0, 40)
        if (rect.top < header.bottom) problems.push(`${label}: under the header (${rect.top})`)
        if (rect.bottom > sheetRect.top) problems.push(`${label}: under the sheet (${rect.bottom})`)
      }
      return problems
    }, sheetTitleId)

    expect(failures, failures.join('\n')).toEqual([])
  })

  /*
   * The route menu is absolutely positioned over the page, so anything focused
   * beneath it is obscured (2.4.11). It closes when focus leaves the group, so
   * the panel and the focused element never share a box. /about is the
   * reproduction: its breadcrumb trail sits directly under the open panel.
   */
  test('the open route menu never covers what focus lands on', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', KEYBOARD_IS_PLATFORM_GATED)
    await page.goto('/about')

    const toggle = page.getByRole('button', { name: 'Menu' })
    const nav = page.getByRole('navigation', { name: 'Primary' })

    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(nav).toBeVisible()

    const obscured: string[] = []
    let closed = false

    for (let step = 0; step < ROUTE_LABELS.length + 4 && !closed; step += 1) {
      await page.keyboard.press('Tab')
      const reading = await page.evaluate(() => {
        const panel = document.getElementById('route-menu')!
        const active = document.activeElement
        if (!panel.hasAttribute('data-open')) return { open: false, overlaps: false, label: '' }
        if (!(active instanceof HTMLElement) || active === document.body) {
          return { open: true, overlaps: false, label: '' }
        }
        const label = (active.getAttribute('aria-label') ?? active.textContent ?? '').trim().slice(0, 40)
        // A link inside the panel is not under it.
        if (panel.contains(active)) return { open: true, overlaps: false, label }
        const box = active.getBoundingClientRect()
        const over = panel.getBoundingClientRect()
        return {
          open: true,
          overlaps:
            box.left < over.right &&
            box.right > over.left &&
            box.top < over.bottom &&
            box.bottom > over.top,
          label,
        }
      })

      if (reading.overlaps) obscured.push(`${reading.label}: under the open route menu`)
      closed = !reading.open
    }

    expect(obscured, obscured.join('\n')).toEqual([])
    // Tabbing off the last route link reaches the masthead button, which is
    // outside the group, so the panel is gone by then rather than left open
    // over the page.
    expect(closed, 'the panel closed once focus left it').toBe(true)
    await expect(nav).toBeHidden()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('KF-08 the route menu', () => {
  test.use({ viewport: DESKTOP })

  test('from 900 px the six routes are in the bar and the menu button is gone', async ({
    page,
  }) => {
    await page.goto('/')

    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link')).toHaveText(ROUTE_LABELS)
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden()

    // Solutions is a plain link to the hub, with no control beside it (D-G).
    await expect(nav.getByRole('link', { name: 'Solutions' })).toHaveAttribute(
      'href',
      '/solutions',
    )
    await expect(nav.getByRole('button')).toHaveCount(0)
  })
})

test.describe('KF-08 the route menu below 900 px', () => {
  test.use({ viewport: PHONE })

  test('opens from the button, closes on Escape and restores focus to it', async ({ page }) => {
    await page.goto('/')

    const toggle = page.getByRole('button', { name: 'Menu' })
    const nav = page.getByRole('navigation', { name: 'Primary' })

    await expect(box(toggle)).resolves.toMatchObject({ height: TARGET })
    await expect(toggle).toHaveAttribute('aria-controls', 'route-menu')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(nav).toBeHidden()

    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link')).toHaveText(ROUTE_LABELS)

    // The panel opens below the bar, never over it.
    const bar = (await box(page.locator('header')))!
    expect((await box(nav)).y).toBeGreaterThanOrEqual(bar.height - 1)

    await page.keyboard.press('Escape')
    await expect(nav).toBeHidden()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toBeFocused()
  })

  test('Escape from a route link returns focus to the button', async ({ page }) => {
    await page.goto('/')

    const toggle = page.getByRole('button', { name: 'Menu' })
    const nav = page.getByRole('navigation', { name: 'Primary' })

    await toggle.click()
    await nav.getByRole('link', { name: 'Research' }).focus()

    // Hiding the panel would otherwise drop focus to body (2.4.3).
    await page.keyboard.press('Escape')
    await expect(nav).toBeHidden()
    await expect(toggle).toBeFocused()
  })

  test('the closed panel holds no tab stop, and the button precedes it', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', KEYBOARD_IS_PLATFORM_GATED)
    await page.goto('/')

    for (const name of ['Skip to main content', 'Hendricks, home', 'Menu', 'Start with a Diagnostic']) {
      await page.keyboard.press('Tab')
      const active = await page.evaluate(() => {
        const node = document.activeElement
        return (node?.getAttribute('aria-label') ?? node?.textContent ?? '').trim()
      })
      expect(active).toBe(name)
    }
  })

  test('a route taken from the panel closes it', async ({ page }) => {
    await page.goto('/')

    const toggle = page.getByRole('button', { name: 'Menu' })
    const nav = page.getByRole('navigation', { name: 'Primary' })

    await toggle.click()
    await nav.getByRole('link', { name: 'For Agencies' }).click()
    await expect(page).toHaveURL(/\/for-agencies$/)
    await expect(nav).toBeHidden()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('For Brands from the panel navigates and closes it', async ({ page }) => {
    await page.goto('/')

    const toggle = page.getByRole('button', { name: 'Menu' })
    const nav = page.getByRole('navigation', { name: 'Primary' })

    await toggle.click()
    await nav.getByRole('link', { name: 'For Brands' }).click()
    await expect(page).toHaveURL(/\/for-brands$/)
    await expect(nav).toBeHidden()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('the current route from the panel closes it without leaving the page', async ({
    page,
  }) => {
    await page.goto('/about')

    const toggle = page.getByRole('button', { name: 'Menu' })
    const nav = page.getByRole('navigation', { name: 'Primary' })

    await toggle.click()
    await expect(nav).toBeVisible()
    await nav.getByRole('link', { name: 'About', exact: true }).click()
    await expect(page).toHaveURL(/\/about$/)
    await expect(nav).toBeHidden()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('KF-09 target size', () => {
  for (const viewport of [PHONE, DESKTOP]) {
    test(`shell controls are at least 44 px at ${viewport.width}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/')

      const header = await controlBoxes(page.locator('header'))
      const footer = await controlBoxes(page.locator('footer'))
      const consent = await controlBoxes(sheet(page))

      expect(header.length + footer.length + consent.length).toBeGreaterThan(20)
      expect(undersized([...header, ...footer, ...consent])).toEqual([])

      if (viewport.width < 900) {
        await page.getByRole('button', { name: 'Menu' }).click()
        const nav = page.getByRole('navigation', { name: 'Primary' })
        await expect(nav).toBeVisible()
        expect(undersized(await controlBoxes(nav))).toEqual([])
        await page.keyboard.press('Escape')
      }

      await sheet(page).getByRole('button', { name: banner.manage }).click()
      const dialog = page.getByRole('dialog', { name: preferences.title })
      await expect(dialog).toBeVisible()
      expect(undersized(await controlBoxes(dialog))).toEqual([])
    })
  }
})

test.describe('DX-05 header button on /diagnostic', () => {
  test.use({ viewport: PHONE })

  test('targets an anchor that exists and lands clear of the header with the sheet open', async ({
    page,
  }) => {
    await page.goto('/diagnostic')
    await expect(sheet(page)).toBeVisible()

    const href = headerCtaHref('/diagnostic')
    expect(href.startsWith('#')).toBe(true)

    const button = page.locator('header').getByRole('link', { name: 'Start with a Diagnostic' })
    await expect(button).toHaveAttribute('href', href)

    const target = page.locator(href)
    await expect(target).toHaveCount(1)
    await expect(target).toHaveAttribute('tabindex', '-1')

    // The canvas keeps one button, in the bar at every width, so there is no
    // second copy of it to drift (09 5.2).
    await expect(page.getByRole('link', { name: 'Start with a Diagnostic' })).toHaveCount(1)

    await button.click()
    await expect(target).toBeFocused()

    // KF-07: the jump inherits the header offset from `scroll-padding-top`, so
    // the focused target starts below the sticky header, not under it.
    const gap = await target.evaluate((node) => {
      const header = document.querySelector('header')!.getBoundingClientRect()
      return node.getBoundingClientRect().top - header.bottom
    })
    expect(gap).toBeGreaterThan(0)
  })
})

test.describe('KF-10 aria-current', () => {
  const routes = [
    { path: '/about', header: 'About', footer: 'About' },
    { path: '/research', header: 'Research', footer: 'Research Hub' },
    { path: '/solutions/selection-intelligence', header: 'Solutions', footer: 'Selection Intelligence' },
    { path: '/for-agencies', header: 'For Agencies', footer: 'For Agencies' },
  ]

  for (const route of routes) {
    test(`${route.path} marks its link in the header and footer`, async ({ page }) => {
      await page.goto(route.path)

      // Below 900 px the six routes live in the menu, so the mark is only
      // reachable once it is open.
      if ((page.viewportSize()?.width ?? 0) < 900) {
        await page.getByRole('button', { name: 'Menu' }).click()
      }

      const header = page.locator('header')
      await expect(header.getByRole('link', { name: route.header, exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      )
      await expect(header.locator('a[aria-current="page"]:visible')).toHaveCount(1)

      const footer = page.locator('footer')
      await expect(footer.getByRole('link', { name: route.footer, exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      )
      await expect(footer.locator('a[aria-current="page"]')).toHaveCount(1)
    })
  }

  test('marks the current page in the route menu', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await page.goto('/about')

    await page.getByRole('button', { name: 'Menu' }).click()
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link', { name: 'About', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1)
  })
})
