import type { NextConfig } from 'next'
import { describe, expect, it } from 'vitest'

import nextConfig from '../../next.config'
import { ctaHref, indexableBuiltRoutes, isBuilt, routes } from '@/config/routes'
import { footerNavigation, legalNavigation, primaryNavigation } from '@/config/navigation'

describe('Route registry', () => {
  it('uses unique paths', () => {
    const paths = Object.values(routes).map((route) => route.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('starts every path with a slash and never ends with one', () => {
    for (const route of Object.values(routes)) {
      expect(route.path.startsWith('/'), route.path).toBe(true)
      expect(route.path === '/' || !route.path.endsWith('/'), route.path).toBe(true)
    }
  })

  it('marks exactly the routes that have been built', () => {
    // Twelve commercial routes from Phase 4, the six definition pages, the three
    // legal routes, the four routes that closed out Phase 6 (/corrections, the
    // research hub, and the first research article), and every research article
    // published since. Anything else in the registry is still unbuilt, and this
    // list is what stops a route being flagged built before its page exists.
    const built = Object.values(routes)
      .filter((route) => route.built)
      .map((route) => route.path)
      .sort()

    expect(built).toEqual(
      [
        '/',
        '/about',
        '/ai-selection-problem',
        // Buyer-decision route, docs/17 §5.3. It sits in (editorial) with the
        // definition pages and defines no term.
        // The free instrument (Brandon, 2026-09-07): one field on the homepage,
        // the full check on its own commercial route.
        '/ai-visibility-check',
        '/ai-visibility-tool-or-partner',
        '/contact',
        // R6 in CONTENT_VERIFICATION.md was blocked on missing copy rather than
        // on a credential. The copy landed, so the route did.
        '/corrections',
        '/diagnostic',
        '/for-agencies',
        '/for-brands',
        '/how-it-works',
        '/methodology',
        '/observe',
        '/privacy',
        '/privacy-request',
        // R5 recorded the hub as blocked on Sanity credentials. docs/17 §7 wave
        // 2.1 reversed that: it ships from src/content/research/ on the same
        // precedent as the definition pages.
        '/research',
        // Research articles are registered by concrete path, not as a dynamic
        // pattern, because this registry is what the sitemap and llms.txt read.
        // The dynamic segment that serves them is resolved by check:links.
        '/research/answer-stability-two-runs',
        '/research/hendricks-selection-baseline',
        '/research/no-shared-source-across-engines',
        '/research/the-answer-index',
        '/research/who-gets-cited-in-ai-answers',
        '/solutions',
        '/solutions/search-demand-intelligence',
        '/solutions/search-impact-measurement',
        '/solutions/search-presence-engineering',
        '/solutions/selection-intelligence',
        '/terms',
        '/what-is-ai-mediated-search',
        '/what-is-generative-engine-optimization',
        '/what-is-search-intelligence-engineering',
        '/what-is-selection-intelligence',
      ].sort(),
    )
  })

  it('keeps the privacy request form out of the sitemap', () => {
    // docs/16 §9 — reachable from the footer and the Privacy Notice, but a
    // transactional form with no reason to compete in search results.
    expect(routes.privacyRequest.indexable).toBe(false)
    expect(indexableBuiltRoutes().map((route) => route.path)).not.toContain('/privacy-request')
  })

  it('keeps the unreviewed observation shell out of the sitemap', () => {
    expect(routes.observe.indexable).toBe(false)
    expect(indexableBuiltRoutes().map((route) => route.path)).not.toContain('/observe')
  })

  it('keeps the flagged Results route out of the sitemap', () => {
    expect(routes.results.indexable).toBe(false)
    expect(indexableBuiltRoutes().map((route) => route.path)).not.toContain('/results')
  })

  it('lists only built routes in the sitemap', () => {
    for (const route of indexableBuiltRoutes()) {
      expect(route.built, route.path).toBe(true)
    }
  })
})

describe('isBuilt', () => {
  it('recognises built routes and rejects unbuilt or unknown ones', () => {
    expect(isBuilt('/solutions/selection-intelligence')).toBe(true)
    expect(isBuilt('/research')).toBe(true)
    // /results is the remaining unbuilt route: feature-flagged off until
    // verified case studies exist, not merely unwritten.
    expect(isBuilt('/results')).toBe(false)
    expect(isBuilt('/not-a-route')).toBe(false)
  })
})

describe('ctaHref', () => {
  it('prefers the canonical destination once that route is built', () => {
    expect(ctaHref('/diagnostic', '/contact')).toBe('/diagnostic')
  })

  it('falls back while the canonical destination is unbuilt', () => {
    // /results is the live case: it is feature-flagged off until verified case
    // studies exist. /research held this slot until the hub shipped, which is
    // the mechanism working as designed rather than a case going missing.
    expect(ctaHref('/results', '/methodology')).toBe('/methodology')
    expect(ctaHref('/not-a-route', '/methodology')).toBe('/methodology')
  })

  it('reverts a research CTA to its canonical destination now the hub is built', () => {
    expect(ctaHref('/research', '/methodology')).toBe('/research')
    // The corrections link on every research article resolves through this pair.
    expect(ctaHref('/corrections', '/contact')).toBe('/corrections')
  })

  it('has no remaining fallback in use now the definition pages are built', () => {
    // Both homepage CTAs that shipped Phase 4 on a fallback should have reverted
    // to their canonical destination without a copy change.
    expect(ctaHref('/what-is-selection-intelligence', '/solutions/selection-intelligence')).toBe(
      '/what-is-selection-intelligence',
    )
    expect(ctaHref('/methodology', '/solutions/search-impact-measurement')).toBe('/methodology')
  })
})

describe('Navigation link integrity', () => {
  const internalHrefs = [
    ...primaryNavigation.map((item) => item.href),
    ...Object.values(footerNavigation).flatMap((column) => column.items.map((item) => item.href)),
    ...legalNavigation.map((item) => item.href),
  ].filter((href) => href.startsWith('/'))

  it('never links to a route that does not exist yet', () => {
    for (const href of internalHrefs) {
      expect(isBuilt(href), `navigation links to unbuilt route: ${href}`).toBe(true)
    }
  })

  it('still exposes the four solutions and the audience pages', () => {
    expect(internalHrefs).toContain('/solutions/search-demand-intelligence')
    expect(internalHrefs).toContain('/solutions/selection-intelligence')
    expect(internalHrefs).toContain('/solutions/search-presence-engineering')
    expect(internalHrefs).toContain('/solutions/search-impact-measurement')
    expect(internalHrefs).toContain('/for-brands')
    expect(internalHrefs).toContain('/for-agencies')
  })
})

/**
 * Legacy redirects are the one part of the config that cannot be corrected by
 * shipping a fix. They are served `permanent`, browsers cache that aggressively,
 * and a visitor who follows a wrong one may not reach the real page again for a
 * long time. So the rules are asserted rather than reviewed.
 */
describe('Legacy redirects', () => {
  const routePaths = new Set<string>(Object.values(routes).map((route) => route.path))

  const rules = nextConfig.redirects
    ? nextConfig.redirects()
    : Promise.resolve([] as Awaited<ReturnType<NonNullable<NextConfig['redirects']>>>)

  it('never shadows a path in the route registry', async () => {
    // Redirects are evaluated before filesystem routes. A rule for an unbuilt
    // route would silently break that page on the day it ships.
    for (const rule of await rules) {
      expect(routePaths.has(rule.source), `redirect shadows a real route: ${rule.source}`).toBe(
        false,
      )
    }
  })

  it('sends every internal destination to a route that is built', async () => {
    for (const rule of await rules) {
      if (rule.destination.startsWith('http')) continue

      const target = Object.values(routes).find((route) => route.path === rule.destination)
      expect(target, `redirect ${rule.source} points at no known route`).toBeDefined()
      expect(
        target?.built,
        `redirect ${rule.source} points at an unbuilt route: ${rule.destination}`,
      ).toBe(true)
    }
  })

  it('declares each source once', async () => {
    const sources = (await rules).map((rule) => rule.source)
    expect(new Set(sources).size).toBe(sources.length)
  })

  it('redirects the www host to the apex', async () => {
    const hostRule = (await rules).find((rule) =>
      rule.has?.some((condition) => condition.type === 'host'),
    )

    expect(hostRule?.destination).toBe('https://hendricks.ai/:path*')
    expect(hostRule?.permanent).toBe(true)
  })
})
