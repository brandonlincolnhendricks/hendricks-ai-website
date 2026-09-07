import { expect, test, type Page } from '@playwright/test'

import { indexableBuiltRoutes, routes } from '@/config/routes'
import { siteConfig } from '@/config/site'
import * as about from '@/content/pages/about'
import * as aiSelectionProblem from '@/content/pages/ai-selection-problem'
import * as avc from '@/content/pages/ai-visibility-check'
import * as avtop from '@/content/pages/ai-visibility-tool-or-partner'
import * as contact from '@/content/pages/contact'
import * as diagnostic from '@/content/pages/diagnostic'
import * as forAgencies from '@/content/pages/for-agencies'
import * as forBrands from '@/content/pages/for-brands'
import * as howItWorks from '@/content/pages/how-it-works'
import * as methodology from '@/content/pages/methodology'
import * as observe from '@/content/pages/observe'
import * as sdi from '@/content/pages/search-demand-intelligence'
import * as sim from '@/content/pages/search-impact-measurement'
import * as spe from '@/content/pages/search-presence-engineering'
import * as si from '@/content/pages/selection-intelligence'
import * as solutions from '@/content/pages/solutions'
import * as wiams from '@/content/pages/what-is-ai-mediated-search'
import * as wgeo from '@/content/pages/what-is-generative-engine-optimization'
import * as wisie from '@/content/pages/what-is-search-intelligence-engineering'
import * as wisi from '@/content/pages/what-is-selection-intelligence'
import { researchArticles } from '@/content/research'
import * as researchHub from '@/content/research/hub'

/**
 * Route sweep for every built page, commercial and editorial.
 *
 * Titles and H1s are read from the content objects rather than duplicated here,
 * so this suite verifies that the approved copy actually reaches the rendered
 * document. The unit suite is what pins the copy itself. axe runs over the
 * whole registry in `axe.spec.ts`.
 */

/**
 * The text a page's H1 renders: the title alone. The eyebrow is a `p` sibling
 * of the heading, outside its accessible name (16 SM-02; `PageHero`), so the
 * approved title is what the only level-1 heading says.
 */
function headingText(hero: { readonly title: string }): string {
  return hero.title
}

const commercialRoutes = [
  { path: '/solutions', meta: solutions.solutionsMeta, h1: headingText(solutions.solutionsHero) },
  { path: '/solutions/search-demand-intelligence', meta: sdi.meta, h1: headingText(sdi.hero) },
  { path: '/solutions/selection-intelligence', meta: si.meta, h1: headingText(si.hero) },
  { path: '/solutions/search-presence-engineering', meta: spe.meta, h1: headingText(spe.hero) },
  { path: '/solutions/search-impact-measurement', meta: sim.meta, h1: headingText(sim.hero) },
  { path: '/how-it-works', meta: howItWorks.meta, h1: headingText(howItWorks.hero) },
  { path: '/for-brands', meta: forBrands.meta, h1: headingText(forBrands.hero) },
  { path: '/for-agencies', meta: forAgencies.meta, h1: headingText(forAgencies.hero) },
  { path: '/about', meta: about.meta, h1: headingText(about.hero) },
  { path: '/diagnostic', meta: diagnostic.meta, h1: headingText(diagnostic.hero) },
  { path: '/ai-visibility-check', meta: avc.meta, h1: headingText(avc.hero) },
  { path: '/contact', meta: contact.meta, h1: headingText(contact.hero) },
  { path: '/observe', meta: observe.meta, h1: headingText(observe.hero) },
] as const

const editorialRoutes = [
  {
    path: '/what-is-search-intelligence-engineering',
    meta: wisie.meta,
    h1: headingText(wisie.hero),
    reviewed: wisie.sources.reviewed,
  },
  {
    path: '/what-is-selection-intelligence',
    meta: wisi.meta,
    h1: headingText(wisi.hero),
    reviewed: wisi.sources.reviewed,
  },
  {
    path: '/what-is-ai-mediated-search',
    meta: wiams.meta,
    h1: headingText(wiams.hero),
    reviewed: wiams.sources.reviewed,
  },
  {
    path: '/what-is-generative-engine-optimization',
    meta: wgeo.meta,
    h1: headingText(wgeo.hero),
    reviewed: wgeo.sources.reviewed,
  },
  {
    path: '/ai-selection-problem',
    meta: aiSelectionProblem.meta,
    h1: headingText(aiSelectionProblem.hero),
    reviewed: aiSelectionProblem.sources.reviewed,
  },
  {
    path: '/methodology',
    meta: methodology.meta,
    h1: headingText(methodology.hero),
    reviewed: methodology.sources.reviewed,
  },
  // Buyer-decision route rather than a definition page. It shares the sweep
  // because it shares the shape: the canvas page hero, the answer-first block,
  // question-shaped H2s, the sources station and the closing station.
  {
    path: '/ai-visibility-tool-or-partner',
    meta: avtop.meta,
    h1: headingText(avtop.hero),
    reviewed: avtop.sources.reviewed,
  },
] as const

/**
 * The research hub and every published article.
 *
 * Built from the registry rather than listed, so a second article joins the
 * sweep by being published. They sit outside `editorialRoutes` on purpose: that
 * list drives the "one machine-readable review date" assertion below, and a
 * study renders four dates by design, one for each of published, updated, data
 * through, and last reviewed.
 */
const researchRoutes = [
  {
    path: routes.research.path,
    meta: researchHub.meta,
    h1: headingText(researchHub.hero),
  },
  ...researchArticles.map((article) => ({
    path: article.path,
    meta: article.content.meta,
    h1: headingText(article.content.hero),
  })),
]

const builtRoutes = [...commercialRoutes, ...editorialRoutes, ...researchRoutes]

/**
 * Every JSON-LD node on the page, unioned across all ld+json blocks.
 *
 * A parser reads the whole document, not one block. `SiteShell` emits the
 * Organization and WebSite graph (docs/06 §8), and it renders ahead of the page
 * body, so the first block on every route is the global one rather than the
 * page's own. Reading positionally therefore asserts against the wrong graph:
 * it fails a page that does emit its node, and it passes a page that emits one
 * it should not. Both failure modes were live before this helper existed.
 *
 * Only top-level `@graph` members are returned. Nested `{ '@id': ... }` values
 * are references to a node declared elsewhere, not declarations, so leaving them
 * out is what makes the "exactly once" count below mean what it says. A block
 * may also be a bare node instead of an `@graph` wrapper, which is why the
 * fallback wraps it.
 */
async function jsonLdNodes(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()

  return blocks.flatMap((raw) => {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return (parsed['@graph'] as Record<string, unknown>[] | undefined) ?? [parsed]
  })
}

for (const route of builtRoutes) {
  test.describe(route.path, () => {
    test('renders the approved title, description, canonical, and H1', async ({ page }) => {
      const response = await page.goto(route.path)
      expect(response?.status()).toBe(200)

      await expect(page).toHaveTitle(route.meta.title)

      const description = page.locator('head meta[name="description"]')
      await expect(description).toHaveAttribute('content', route.meta.description)

      // Compared as a pathname so the assertion holds whatever origin the
      // environment configures.
      const canonical = await page
        .locator('head link[rel="canonical"]')
        .getAttribute('href')
      expect(new URL(canonical ?? '').pathname).toBe(route.path)

      const h1 = page.getByRole('heading', { level: 1 })
      await expect(h1).toHaveCount(1)
      await expect(h1).toHaveText(route.h1)
    })

    test('exposes one main landmark and a breadcrumb trail', async ({ page }) => {
      await page.goto(route.path)

      await expect(page.getByRole('main')).toHaveCount(1)
      await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible()
    })

    test('mentions The Search Economy only on /about', async ({ page }) => {
      // docs/10 §2.
      await page.goto(route.path)
      const body = page.locator('body')

      if (route.path === '/about') {
        await expect(body).toContainText('The Search Economy')
      } else {
        await expect(body).not.toContainText('Search Economy')
      }
    })

    test('offers a way to convert', async ({ page }) => {
      await page.goto(route.path)

      const main = page.getByRole('main')

      // A route either points at a form or carries one. /diagnostic,
      // /for-agencies and /contact each carry the form that qualifies their
      // own audience (15 section 1), so the link they used to carry upward is
      // now the thing itself.
      const links = await main.locator('a[href="/diagnostic"], a[href="/contact"]').count()
      const forms = await main.locator('form').count()

      expect(links + forms).toBeGreaterThan(0)
    })

    test('renders without console errors', async ({ page }) => {
      const errors: string[] = []
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })
      page.on('pageerror', (error) => errors.push(error.message))

      await page.goto(route.path)
      expect(errors).toEqual([])
    })
  })
}

test.describe('Hairline-marked blocks', () => {
  /*
    canvas.md section 2: a background, a radius, or a border wider than one
    hairline makes an element a control, an instrument surface, a knockout mark
    or a defect. `.answer` and `.limits` are neither controls nor instruments,
    so all three are forbidden on them. This is the assertion the unit suite
    cannot make: jsdom carries no stylesheet, so a fill added to either class
    would pass every class-name check in `tests/unit/canvas-primitives.test.tsx`.
  */
  const markedBlockRoutes = [
    { path: '/what-is-selection-intelligence', selector: '.answer' },
    { path: '/what-is-selection-intelligence', selector: '.limits' },
    { path: '/what-is-ai-mediated-search', selector: '.limits' },
    { path: researchArticles[0].path, selector: '.answer' },
  ] as const

  for (const { path, selector } of markedBlockRoutes) {
    test(`${path} draws ${selector} as a hairline rather than a card`, async ({ page }) => {
      await page.goto(path)

      const block = page.locator(`main ${selector}`).first()
      await expect(block).toBeVisible()

      const box = await block.evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          background: style.backgroundColor,
          backgroundImage: style.backgroundImage,
          radius: style.borderTopLeftRadius,
          widths: [
            style.borderTopWidth,
            style.borderRightWidth,
            style.borderBottomWidth,
            style.borderLeftWidth,
          ],
        }
      })

      // Transparent, in whichever of the two forms the engine reports it.
      expect(['rgba(0, 0, 0, 0)', 'transparent']).toContain(box.background)
      expect(box.backgroundImage).toBe('none')
      expect(box.radius).toBe('0px')

      // One left rule at the accent width, nothing on the other three sides.
      const [top, right, bottom, left] = box.widths.map((width) => Number.parseFloat(width))
      expect([top, right, bottom]).toEqual([0, 0, 0])
      expect(left).toBeGreaterThan(0)
      expect(left).toBeLessThanOrEqual(1.5)
    })
  }
})

test.describe('The table of contents disclosure', () => {
  /*
    D-E: the outline collapses on a phone, but every entry is in the document at
    first paint and the control only hides what is already there. The assertion
    is on the link count inside the collapsed list, not on the control.
  */
  test.use({ viewport: { width: 390, height: 844 } })

  test('/for-brands keeps every contents entry in the document while collapsed', async ({
    page,
  }) => {
    await page.goto('/for-brands')

    const toggle = page.getByRole('button', { name: 'On this page' })
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    const listId = await toggle.getAttribute('aria-controls')
    const list = page.locator(`#${listId}`)
    await expect(list).toBeHidden()
    expect(await list.locator('a').count()).toBeGreaterThan(0)

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(list).toBeVisible()
  })
})

test.describe('Narrow viewport integrity', () => {
  test.use({ viewport: { width: 320, height: 800 } })

  for (const route of builtRoutes) {
    test(`${route.path} does not overflow horizontally at 320px`, async ({ page }) => {
      await page.goto(route.path)

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
    })
  }
})

test.describe('Wide tables', () => {
  const tableRoutes = [
    { path: '/solutions/search-impact-measurement', caption: sim.evidenceGrades.caption },
    { path: '/methodology', caption: methodology.evidenceGrades.caption },
    { path: '/what-is-search-intelligence-engineering', caption: wisie.whyItExists.caption },
    // Two tables on this route. The surfaces table renders first and is the one
    // that carries the observed-scope column, so it is the one pinned here; the
    // caption test below still iterates both.
    { path: '/what-is-ai-mediated-search', caption: wiams.surfaces.caption },
    { path: '/what-is-generative-engine-optimization', caption: wgeo.versusSie.caption },
    // Two tables on this route as well. The monitoring-versus-measurement table
    // renders first, so it is the one pinned; the caption test iterates both.
    { path: '/ai-visibility-tool-or-partner', caption: avtop.monitoringVsMeasurement.caption },
  ] as const

  for (const route of tableRoutes) {
    test(`${route.path} keeps its table reachable by keyboard on a narrow viewport`, async ({
      page,
    }) => {
      // The table is wider than a phone, so its wrapper must be a focusable
      // scroll region rather than silently clipping rows (WCAG 2.1.1).
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(route.path)

      await expect(page.getByRole('table').first()).toBeVisible()

      const region = page.getByRole('region', { name: route.caption })
      await expect(region).toHaveAttribute('tabindex', '0')
    })

    test(`${route.path} gives every table a caption`, async ({ page }) => {
      await page.goto(route.path)

      const tables = page.getByRole('table')
      const count = await tables.count()
      expect(count).toBeGreaterThan(0)

      for (let index = 0; index < count; index += 1) {
        await expect(tables.nth(index).locator('caption')).not.toBeEmpty()
      }
    })
  }
})

test.describe('Definition pages', () => {
  test.describe.configure({ mode: 'parallel' })

  for (const route of editorialRoutes) {
    /*
      Every date these pages print is machine readable, and the review date is
      one of them. The count is not pinned at one: the canvas byline states the
      review date beside the author as well, which is a second rendering of the
      same fact rather than a second date, and D-B put it there on purpose.
    */
    test(`${route.path} dates its review in machine-readable form`, async ({ page }) => {
      await page.goto(route.path)

      const times = page.getByRole('main').locator('time')
      const count = await times.count()
      expect(count).toBeGreaterThan(0)

      for (let index = 0; index < count; index += 1) {
        await expect(times.nth(index)).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/)
      }

      await expect(
        page.getByRole('main').locator(`time[datetime="${route.reviewed}"]`).first(),
      ).toBeVisible()
    })
  }

  for (const page_ of [
    { path: '/what-is-search-intelligence-engineering', content: wisie },
    { path: '/what-is-selection-intelligence', content: wisi },
    { path: '/what-is-ai-mediated-search', content: wiams },
    { path: '/what-is-generative-engine-optimization', content: wgeo },
  ] as const) {
    test(`${page_.path} shows the direct answer above every other section`, async ({ page }) => {
      await page.goto(page_.path)

      const answer = page.getByText(page_.content.directAnswer.answer, { exact: true })
      await expect(answer).toBeVisible()

      // It must sit high enough to be the first thing read after the H1.
      const answerBox = await answer.boundingBox()
      const h1Box = await page.getByRole('heading', { level: 1 }).boundingBox()
      const firstH2Box = await page.getByRole('heading', { level: 2 }).first().boundingBox()

      expect(answerBox!.y).toBeGreaterThan(h1Box!.y)
      expect(answerBox!.y).toBeLessThan(firstH2Box!.y)
    })

    test(`${page_.path} emits a DefinedTerm that matches the visible answer`, async ({ page }) => {
      // docs/06 §8 — the markup may only reproduce visible content.
      await page.goto(page_.path)

      const term = (await jsonLdNodes(page)).find((node) => node['@type'] === 'DefinedTerm')

      expect(term).toBeDefined()
      expect(term!.name).toBe(page_.content.directAnswer.term)
      expect(term!.description).toBe(page_.content.directAnswer.answer)
    })
  }

  test('/methodology presents outcome classifications as a set, not a sequence', async ({
    page,
  }) => {
    // The ten classifications are categories one observation can carry several of
    // at once. CompletePath renders an ordered list, which would assert a
    // progression the copy does not describe; ChipSet renders an unordered one.
    await page.goto('/methodology')

    const section = page.locator('section', { has: page.locator('#classification-title') })
    await expect(section.locator('ol')).toHaveCount(0)

    const chips = section.locator('ul > li')
    await expect(chips).toHaveCount(10)
    await expect(chips.last()).toHaveText('Uncertain')
  })

  test('the three non-definition editorial routes emit no DefinedTerm', async ({ page }) => {
    // None of these pages defines a term, so the markup would not reproduce
    // visible content. Emitting it anyway is the failure docs/06 §8 warns
    // against. /ai-visibility-tool-or-partner is the one to watch: it renders a
    // DirectAnswer block whose `term` prop is the decision label "Tool or
    // partner", and a DefinedTerm node named after a purchase decision would
    // state a claim the page does not make.
    for (const path of [
      '/ai-selection-problem',
      '/methodology',
      '/ai-visibility-tool-or-partner',
    ]) {
      await page.goto(path)
      // Read across every block, not the first one. `SiteShell`'s global graph
      // sits ahead of the page's own and never contains a DefinedTerm, so a
      // first-block read passed here no matter what these pages emitted.
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
      expect(blocks.join('\n'), path).not.toContain('DefinedTerm')
    }
  })
})

test.describe('Entity graph', () => {
  test('declares the Organization and WebSite nodes exactly once on every route', async ({
    page,
  }) => {
    // `webPageSchema` points `isPartOf` and `about` at these two `@id`s on every
    // page, so both have to resolve or the graph terminates in a pointer to
    // nothing (docs/06 §8). Exactly once, not merely present: `SiteShell` is the
    // single emitter, and a page that also emitted them would publish the same
    // two `@id`s twice on one document, which is a duplicate entity declaration
    // rather than a second reference to one entity.
    const organizationId = `${siteConfig.url}/#organization`
    const websiteId = `${siteConfig.url}/#website`

    for (const route of [{ path: '/' }, ...builtRoutes]) {
      await page.goto(route.path)
      const ids = (await jsonLdNodes(page)).map((node) => node['@id'])

      expect(ids.filter((id) => id === organizationId), route.path).toHaveLength(1)
      expect(ids.filter((id) => id === websiteId), route.path).toHaveLength(1)
    }
  })
})

test.describe('Internal link integrity', () => {
  async function internalLinksOn(page: Page, path: string): Promise<string[]> {
    await page.goto(path)
    return page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')].map(
        (anchor) => anchor.getAttribute('href') ?? '',
      ),
    )
  }

  test('every internal link across the built site resolves', async ({ page, request }) => {
    const hrefs = new Set<string>()

    for (const route of [{ path: '/' }, ...builtRoutes]) {
      for (const href of await internalLinksOn(page, route.path)) {
        hrefs.add(href.split('#')[0] || '/')
      }
    }

    const broken: string[] = []
    for (const href of hrefs) {
      const status = (await request.get(href)).status()
      if (status !== 200) broken.push(`${href} → ${status}`)
    }

    expect(broken, broken.join('\n')).toEqual([])
  })
})

test.describe('Sitemap', () => {
  test('advertises exactly the built, indexable routes', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text()
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => new URL(match[1]).pathname,
    )

    const expected = indexableBuiltRoutes().map((route) => route.path)

    expect(paths.sort()).toEqual(expected.sort())
  })

  test('omits routes that are not built yet', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text()

    // /privacy-request is built but deliberately not indexable (docs/16 §9), so
    // it belongs on this list for a different reason than /results, which is
    // feature-flagged off until verified case studies exist. /research and
    // /corrections were here while both were unbuilt; both shipped in Phase 6.
    for (const path of ['/results', '/privacy-request']) {
      expect(xml, `sitemap advertises unbuilt ${path}`).not.toContain(`${path}</loc>`)
    }

    // A dynamic segment must never be advertised as a literal URL.
    expect(xml, 'sitemap advertises a dynamic route pattern').not.toContain('[slug]')
  })
})
