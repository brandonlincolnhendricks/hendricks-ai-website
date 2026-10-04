import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import nextConfig from '../../next.config'
import {
  GONE_EXACT_PATHS,
  GONE_INDUSTRY_PATHS,
  GONE_INSIGHT_PATHS,
  GONE_INTERNAL_PATHS,
  GONE_LINE_PATHS,
  GONE_PATH_PREFIXES,
  GONE_PREFIX_EXCEPTIONS,
  GONE_STANDALONE_PATHS,
  config as proxyConfig,
  isGone,
} from '@/proxy'
import { indexableBuiltRoutes, isBuilt, routes } from '@/config/routes'

/**
 * A 410 is as unrecoverable as a permanent redirect. Crawlers drop the URL on
 * seeing it, so a path that lands in the Gone list by mistake is not repaired by
 * shipping a fix later. Every rule below is therefore asserted against the live
 * route registry and the live Next config rather than against a copy of either.
 */

const ON_THESIS_SOURCE = '/insights/how-ai-search-engines-cite-mid-market-firms-2026'
const ON_THESIS_DESTINATION = 'https://hendricks.ai/solutions/selection-intelligence'
const LEGACY_SIE_GLOSSARY_SOURCE = '/glossary/search-intelligence-engineering'
const LEGACY_SIE_GLOSSARY_DESTINATION =
  'https://hendricks.ai/what-is-search-intelligence-engineering'
const LEGACY_AI_VISIBILITY_SOURCE = '/glossary/ai-search-visibility'
const LEGACY_AI_VISIBILITY_DESTINATION =
  'https://hendricks.ai/what-is-ai-mediated-search#vocabulary'

const allRoutePaths: string[] = Object.values(routes).map((route) => route.path)
const builtRoutePaths: string[] = Object.values(routes)
  .filter((route) => route.built)
  .map((route) => route.path)

const redirectRules = nextConfig.redirects
  ? await nextConfig.redirects()
  : ([] as Awaited<ReturnType<NonNullable<typeof nextConfig.redirects>>>)

/** Sources that name one concrete path, so the host catch-all is left out. */
const literalRedirectSources = redirectRules
  .filter((rule) => !rule.source.includes(':') && !rule.has)
  .map((rule) => rule.source)

/**
 * Models how Next expands a matcher entry. Every entry in the proxy config is
 * either a literal path or a `/base/:path*` form, and path-to-regexp matches the
 * latter against the base itself and anything beneath it.
 */
function matcherCovers(matcher: string, pathname: string): boolean {
  const suffix = '/:path*'

  if (matcher.endsWith(suffix)) {
    const base = matcher.slice(0, -suffix.length)
    return pathname === base || pathname.startsWith(`${base}/`)
  }

  return pathname === matcher
}

const matchers = Array.isArray(proxyConfig.matcher)
  ? (proxyConfig.matcher as string[])
  : [proxyConfig.matcher as string]

function isMatched(pathname: string): boolean {
  return matchers.some((matcher) => matcherCovers(matcher, pathname))
}

describe('Gone list shape', () => {
  it('holds every group exactly once', () => {
    expect(GONE_EXACT_PATHS).toEqual([
      ...GONE_INTERNAL_PATHS,
      ...GONE_INSIGHT_PATHS,
      ...GONE_INDUSTRY_PATHS,
      ...GONE_LINE_PATHS,
      ...GONE_STANDALONE_PATHS,
    ])
    expect(new Set(GONE_EXACT_PATHS).size).toBe(GONE_EXACT_PATHS.length)
  })

  it('keeps the counts the CSV records', () => {
    // Drift here means the arrays and migration/redirect-map.csv have parted
    // company. Re-derive both rather than editing the number.
    expect(GONE_INTERNAL_PATHS).toHaveLength(26)
    expect(GONE_INSIGHT_PATHS).toHaveLength(72)
    expect(GONE_INDUSTRY_PATHS).toHaveLength(10)
    expect(GONE_LINE_PATHS).toHaveLength(4)
    expect(GONE_STANDALONE_PATHS).toHaveLength(1)
    expect(GONE_EXACT_PATHS).toHaveLength(113)
  })

  it('uses absolute paths with no trailing slash', () => {
    for (const gone of GONE_EXACT_PATHS) {
      expect(gone.startsWith('/'), gone).toBe(true)
      expect(gone.endsWith('/'), gone).toBe(false)
    }
  })

  it('anchors every prefix on a trailing slash so it can only take children', () => {
    for (const prefix of GONE_PATH_PREFIXES) {
      expect(prefix.startsWith('/'), prefix).toBe(true)
      expect(prefix.endsWith('/'), prefix).toBe(true)
    }
  })
})

describe('Gone list against the route registry', () => {
  it('never names a built, indexable route', () => {
    const live = new Set(indexableBuiltRoutes().map((route) => route.path))

    for (const gone of GONE_EXACT_PATHS) {
      expect(live.has(gone), `410 would remove a live indexable route: ${gone}`).toBe(false)
    }
  })

  it('never names any route in the registry, built or not', () => {
    // An unbuilt route is a route that ships later. A 410 on it would be cached
    // by crawlers before the page exists.
    const registry = new Set(allRoutePaths)

    for (const gone of GONE_EXACT_PATHS) {
      expect(registry.has(gone), `410 shadows a registered route: ${gone}`).toBe(false)
    }
  })

  it('leaves every built route reachable, with or without a trailing slash', () => {
    for (const route of builtRoutePaths) {
      expect(isGone(route), `410 rule swallows a built route: ${route}`).toBe(false)
      expect(isGone(`${route}/`), `410 rule swallows a built route: ${route}/`).toBe(false)
    }
  })

  it('keeps no prefix in front of a registered route', () => {
    for (const prefix of GONE_PATH_PREFIXES) {
      for (const route of allRoutePaths) {
        expect(
          route.startsWith(prefix),
          `prefix ${prefix} would 410 the registered route ${route}`,
        ).toBe(false)
      }
    }
  })

  it('keeps the proxy matcher off every built route', () => {
    // The matcher is only a gate, but a live page has no reason to pay for the
    // proxy on every request.
    for (const route of builtRoutePaths) {
      expect(isMatched(route), `matcher puts the proxy in front of ${route}`).toBe(false)
    }
  })
})

/**
 * The case that pays for this whole file. `/solutions` and its four children are
 * the commercial core of the site, and `/solutions/engineering` is a retired
 * sibling one segment away from all of them. Any prefix-shaped rule takes the
 * live pages down with the dead one.
 */
describe('Solutions', () => {
  const liveSolutions = [
    '/solutions',
    '/solutions/search-demand-intelligence',
    '/solutions/selection-intelligence',
    '/solutions/search-presence-engineering',
    '/solutions/search-impact-measurement',
  ]

  it('serves the hub and all four children', () => {
    for (const live of liveSolutions) {
      expect(isBuilt(live), `${live} is not a built route`).toBe(true)
      expect(isGone(live), `${live} is 410`).toBe(false)
      expect(isMatched(live), `${live} is behind the proxy`).toBe(false)
    }
  })

  it('routes /solutions/engineering through the redirect map, not the Gone list', () => {
    // The base config already 308s it to /solutions/search-presence-engineering,
    // its true equivalent. Next evaluates redirects before the proxy, so a 410
    // entry here would be dead code that misreports production, and a redirect
    // to a live page beats a 410 on a URL that has one.
    expect(literalRedirectSources).toContain('/solutions/engineering')
    expect(GONE_EXACT_PATHS).not.toContain('/solutions/engineering')
    expect(isGone('/solutions/engineering')).toBe(false)
  })

  it('mentions no /solutions path in any matcher entry', () => {
    for (const matcher of matchers) {
      expect(matcher.startsWith('/solutions'), `matcher touches solutions: ${matcher}`).toBe(false)
    }
  })
})

describe('The one surviving insight', () => {
  it('is redirected rather than removed', () => {
    const rule = redirectRules.find((candidate) => candidate.source === ON_THESIS_SOURCE)

    expect(rule, 'the on-thesis insight has no redirect').toBeDefined()
    expect(rule?.destination).toBe(ON_THESIS_DESTINATION)
    // permanent:true emits 308, which is what migration/redirect-map.csv records.
    expect(rule?.permanent).toBe(true)
  })

  it('is absent from the Gone list and from the archive array', () => {
    expect(GONE_EXACT_PATHS).not.toContain(ON_THESIS_SOURCE)
    expect(GONE_INSIGHT_PATHS).not.toContain(ON_THESIS_SOURCE)
    expect(isGone(ON_THESIS_SOURCE)).toBe(false)
  })

  it('lands on a built route', () => {
    const destination = new URL(ON_THESIS_DESTINATION).pathname

    expect(isBuilt(destination), `redirect destination is unbuilt: ${destination}`).toBe(true)
  })

  it('resolves in one hop from www', () => {
    // A relative destination would keep a www request on www and hand it to the
    // host catch-all for a second hop, so the destination has to be absolute on
    // the apex and the rule has to sit ahead of that catch-all.
    expect(ON_THESIS_DESTINATION.startsWith('https://hendricks.ai/')).toBe(true)

    const ownIndex = redirectRules.findIndex((rule) => rule.source === ON_THESIS_SOURCE)
    const hostIndex = redirectRules.findIndex((rule) =>
      rule.has?.some((condition) => condition.type === 'host'),
    )

    expect(ownIndex).toBeGreaterThanOrEqual(0)
    expect(hostIndex).toBeGreaterThanOrEqual(0)
    expect(ownIndex).toBeLessThan(hostIndex)
  })
})

describe('Gone list against next.config.ts', () => {
  it('never 410s a path that already redirects', () => {
    // Next runs redirects before the proxy. A path in both places would never
    // reach the 410, so the entry would be a lie about production behaviour.
    for (const source of literalRedirectSources) {
      expect(GONE_EXACT_PATHS, `${source} both redirects and 410s`).not.toContain(source)
      expect(isGone(source), `${source} both redirects and 410s`).toBe(false)
    }
  })

  it('leaves the redirect sources the base ships intact', () => {
    // Two of them sit one segment from a Gone path, so a regression here is the
    // likely way a redirect gets clobbered.
    expect(literalRedirectSources).toContain('/glossary')
    expect(literalRedirectSources).toContain('/faq-brandon-hendricks')
    expect(isGone('/glossary')).toBe(false)
    expect(isGone('/faq-brandon-hendricks')).toBe(false)
    // The retired child of /glossary has no rule of its own, so it is a 410.
    expect(literalRedirectSources).not.toContain('/glossary/multi-engine-visibility-index')
    expect(isGone('/glossary/multi-engine-visibility-index')).toBe(true)
  })

  it('preserves the retired Search Intelligence Engineering glossary URL', () => {
    const rule = redirectRules.find(
      (candidate) => candidate.source === LEGACY_SIE_GLOSSARY_SOURCE,
    )

    expect(rule, 'the retired canonical glossary URL has no redirect').toBeDefined()
    expect(rule?.destination).toBe(LEGACY_SIE_GLOSSARY_DESTINATION)
    expect(rule?.permanent).toBe(true)
    expect(isBuilt(new URL(LEGACY_SIE_GLOSSARY_DESTINATION).pathname)).toBe(true)
    expect(isGone(LEGACY_SIE_GLOSSARY_SOURCE)).toBe(false)
    expect(literalRedirectSources).not.toContain(
      new URL(LEGACY_SIE_GLOSSARY_DESTINATION).pathname,
    )
  })

  it('resolves the retired glossary URL in one hop from www', () => {
    expect(LEGACY_SIE_GLOSSARY_DESTINATION.startsWith('https://hendricks.ai/')).toBe(true)

    const ownIndex = redirectRules.findIndex(
      (rule) => rule.source === LEGACY_SIE_GLOSSARY_SOURCE,
    )
    const hostIndex = redirectRules.findIndex((rule) =>
      rule.has?.some((condition) => condition.type === 'host'),
    )

    expect(ownIndex).toBeGreaterThanOrEqual(0)
    expect(hostIndex).toBeGreaterThanOrEqual(0)
    expect(ownIndex).toBeLessThan(hostIndex)
  })

  it('preserves the retired AI search visibility definition at its canonical section', () => {
    const rule = redirectRules.find(
      (candidate) => candidate.source === LEGACY_AI_VISIBILITY_SOURCE,
    )

    expect(rule, 'the retired AI search visibility URL has no redirect').toBeDefined()
    expect(rule?.destination).toBe(LEGACY_AI_VISIBILITY_DESTINATION)
    expect(rule?.permanent).toBe(true)
    expect(isBuilt(new URL(LEGACY_AI_VISIBILITY_DESTINATION).pathname)).toBe(true)
    expect(isGone(LEGACY_AI_VISIBILITY_SOURCE)).toBe(false)
  })

  it('keeps every authority-bearing legacy route ahead of the www catch-all', () => {
    const oneHopSources = [
      '/search-intelligence-engineering',
      '/ai-search-intelligence',
      '/glossary',
      LEGACY_SIE_GLOSSARY_SOURCE,
      LEGACY_AI_VISIBILITY_SOURCE,
      '/insights/ai-search-visibility-revenue-impact',
    ]
    const hostIndex = redirectRules.findIndex((rule) =>
      rule.has?.some((condition) => condition.type === 'host'),
    )

    expect(hostIndex).toBeGreaterThanOrEqual(0)

    for (const source of oneHopSources) {
      const ownIndex = redirectRules.findIndex((rule) => rule.source === source)
      const destination = redirectRules[ownIndex]?.destination

      expect(ownIndex, `${source} has no redirect`).toBeGreaterThanOrEqual(0)
      expect(ownIndex, `${source} follows the host catch-all`).toBeLessThan(hostIndex)
      expect(destination, `${source} does not land directly on the apex`).toMatch(
        /^https:\/\/hendricks\.ai\//,
      )
    }
  })
})

describe('isGone', () => {
  it('recognises each group', () => {
    expect(isGone('/insights/why-ai-pilots-fail-mid-market')).toBe(true)
    expect(isGone('/industries')).toBe(true)
    expect(isGone('/industries/law-firms')).toBe(true)
    expect(isGone('/lines/operations')).toBe(true)
    expect(isGone('/login')).toBe(true)
    expect(isGone('/preview/insights')).toBe(true)
  })

  it('covers the bracketed CSV patterns by prefix', () => {
    expect(isGone('/dashboard/any-client')).toBe(true)
    expect(isGone('/portal/any-client-id')).toBe(true)
    expect(isGone('/questionnaire/any-client-slug')).toBe(true)
  })

  it('ignores a trailing slash', () => {
    expect(isGone('/login/')).toBe(true)
    expect(isGone('/industries/law-firms/')).toBe(true)
  })

  it('leaves undisposed paths alone', () => {
    // These two are still Brandon's call and must keep returning 404 rather
    // than the unrecoverable 410. `/insights` used to sit here; it is disposed
    // now and has its own describe block below.
    expect(isGone('/pricing')).toBe(false)
    expect(isGone('/security')).toBe(false)
  })

  it('leaves unrelated paths alone', () => {
    expect(isGone('/')).toBe(false)
    expect(isGone('/not-a-route')).toBe(false)
    expect(isGone('/insights-hub')).toBe(false)
    expect(isGone('/industries-report')).toBe(false)
  })
})

describe('Proxy matcher', () => {
  it('reaches every path the Gone list names', () => {
    // A Gone path the matcher misses never reaches the proxy and 404s instead.
    for (const gone of GONE_EXACT_PATHS) {
      expect(isMatched(gone), `matcher never sees ${gone}`).toBe(true)
    }
  })

  it('reaches the children each prefix stands for', () => {
    for (const prefix of GONE_PATH_PREFIXES) {
      expect(isMatched(`${prefix}sample-segment`), `matcher never sees ${prefix}*`).toBe(true)
    }
  })

  it('uses only absolute literals and trailing :path* forms', () => {
    for (const matcher of matchers) {
      expect(matcher.startsWith('/'), matcher).toBe(true)
      expect(
        !matcher.includes(':') || matcher.endsWith('/:path*'),
        `unexpected matcher shape: ${matcher}`,
      ).toBe(true)
    }
  })
})

/**
 * migration/redirect-map.csv is named as the source of truth in src/proxy.ts, so
 * the claim is enforced rather than left as a comment.
 */
describe('Redirect map', () => {
  const csv = readFileSync(path.join(process.cwd(), 'migration/redirect-map.csv'), 'utf8')
  const rows = csv
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => {
      const [old_url, new_url, redirect_type, rationale, , , qa_status] = line.split(',')
      return { old_url, new_url, redirect_type, rationale, qa_status }
    })

  const byPath = new Map(rows.map((row) => [row.old_url, row]))
  /** The three bracketed sources are Next route patterns, covered by prefixes. */
  const bracketed = rows.filter((row) => row.old_url.includes('['))

  it('parses as seven columns on every row', () => {
    for (const line of csv.trim().split('\n')) {
      expect(line.split(','), line).toHaveLength(7)
    }
  })

  it('records a 410 row for every Gone path, marked passed', () => {
    for (const gone of GONE_EXACT_PATHS) {
      const row = byPath.get(gone)

      expect(row, `no CSV row for ${gone}`).toBeDefined()
      expect(row?.redirect_type, `CSV does not record ${gone} as 410`).toBe('410')
      expect(row?.new_url, `a 410 has no destination: ${gone}`).toBe('')
      expect(row?.qa_status, `${gone} is shipped but not marked passed`).toBe('passed')
    }
  })

  it('has no 410 row the proxy does not serve', () => {
    for (const row of rows.filter((candidate) => candidate.redirect_type === '410')) {
      if (bracketed.includes(row)) {
        const prefix = `${row.old_url.slice(0, row.old_url.indexOf('/['))}/`
        expect(GONE_PATH_PREFIXES, `no prefix covers ${row.old_url}`).toContain(prefix)
        continue
      }

      expect(isGone(row.old_url), `CSV says 410 but the proxy does not: ${row.old_url}`).toBe(true)
    }
  })

  it('records the surviving insight as a 308 to Selection Intelligence', () => {
    const row = byPath.get(ON_THESIS_SOURCE)

    expect(row?.redirect_type).toBe('308')
    expect(row?.new_url).toBe('/solutions/selection-intelligence')
    expect(row?.qa_status).toBe('passed')
  })

  it('records the hub as a shipped 308 to the research hub', () => {
    // This row read blocked until /research shipped. If it ever reverts to an
    // empty disposition, the redirect in next.config.ts has been dropped and
    // the hub is 404ing again.
    const row = byPath.get('/insights')

    expect(row?.redirect_type).toBe('308')
    expect(row?.new_url).toBe('/research')
    expect(row?.qa_status).toBe('passed')
  })

  it('records the retired Search Intelligence Engineering glossary URL', () => {
    const row = byPath.get(LEGACY_SIE_GLOSSARY_SOURCE)

    expect(row?.redirect_type).toBe('308')
    expect(row?.new_url).toBe(new URL(LEGACY_SIE_GLOSSARY_DESTINATION).pathname)
    expect(row?.qa_status).toBe('passed')
  })

  it('records the retired AI search visibility definition', () => {
    const row = byPath.get(LEGACY_AI_VISIBILITY_SOURCE)

    expect(row?.redirect_type).toBe('308')
    expect(row?.new_url).toBe('/what-is-ai-mediated-search#vocabulary')
    expect(row?.qa_status).toBe('passed')
  })

  it('inventories every public route from the retired glossary', () => {
    const glossaryRows = rows.filter(
      (row) => row.old_url === '/glossary' || row.old_url.startsWith('/glossary/'),
    )
    const pendingChildren = glossaryRows.filter(
      (row) => row.old_url !== '/glossary' && row.qa_status === 'pending',
    )

    // The archive held one hub plus 126 unique term slugs. A missing row is a
    // silent migration decision, which is how the 124 production 404s formed.
    expect(glossaryRows).toHaveLength(127)
    expect(new Set(glossaryRows.map((row) => row.old_url)).size).toBe(127)
    expect(pendingChildren).toHaveLength(123)
    expect(
      redirectRules.some((rule) => rule.source === '/glossary/:path*'),
      'unrelated glossary terms must not be bulk redirected',
    ).toBe(false)
  })

  it('leaves the two undisposed URLs undisposed', () => {
    for (const undisposed of ['/pricing', '/security']) {
      const row = byPath.get(undisposed)

      expect(row?.redirect_type, `${undisposed} was disposed of`).toBe('')
      expect(row?.new_url, `${undisposed} was given a destination`).toBe('')
      expect(row?.qa_status).toBe('pending')
    }
  })
})

/**
 * The /insights section is retired by prefix rather than by enumerating slugs.
 *
 * Enumeration left real holes: Search Console holds indexed /insights URLs that
 * exist in neither the retired repo nor migration/redirect-map.csv, because the
 * CSV was built from a filesystem rather than from Search Console. These tests
 * pin the two properties that make a prefix safe here.
 */
describe('Retired /insights section', () => {
  it('retires an insight URL that nobody enumerated', () => {
    // Indexed and 404ing in production before the prefix rule landed.
    expect(isGone('/insights/what-is-search-intelligence-engineer')).toBe(true)
    expect(isGone('/insights/a-slug-that-never-existed')).toBe(true)
  })

  it('retires every enumerated insight too, with or without a trailing slash', () => {
    for (const insight of GONE_INSIGHT_PATHS) {
      expect(isGone(insight)).toBe(true)
      expect(isGone(`${insight}/`)).toBe(true)
    }
  })

  it('spares both exempted articles the prefix would otherwise take', () => {
    for (const exception of GONE_PREFIX_EXCEPTIONS) {
      expect(isGone(exception)).toBe(false)
      expect(isGone(`${exception}/`)).toBe(false)
    }
  })

  it('keeps every exception out of the enumerated Gone list', () => {
    // Belt and braces: an exception that also sat in GONE_EXACT_PATHS would be
    // decided by ordering inside isGone rather than by intent.
    for (const exception of GONE_PREFIX_EXCEPTIONS) {
      expect(GONE_EXACT_PATHS).not.toContain(exception)
    }
  })

  it('sends every exception somewhere real', () => {
    // An exemption is only safe if something else actually handles the path.
    // Exempting a URL from the 410 with no redirect behind it turns a decisive
    // Gone into a soft 404, which is strictly worse than either.
    for (const exception of GONE_PREFIX_EXCEPTIONS) {
      expect(literalRedirectSources).toContain(exception)
    }
  })
})

/**
 * The hub and the section beneath it now hold opposite dispositions, and one
 * character separates them: the trailing slash on the `/insights/` prefix.
 *
 * `/insights` was held at 404 while nothing had replaced it, on the recorded
 * reasoning that it was the natural redirect target for `/research` once that
 * route shipped. `/research` shipped, so the hub now 308s there while every
 * article beneath it stays Gone.
 *
 * Both ways of losing that distinction are one-line edits. Drop the slash from
 * the prefix and the hub starts returning an unrecoverable 410 on a URL that has
 * a live successor. Widen the redirect to `/insights/:path*` and ~100 retired
 * articles get swept into a hub, which is the mass redirect docs/09 section 5
 * forbids and which Google reads as a soft 404. Neither is visible in review, so
 * both are pinned here.
 */
describe('The /insights hub against its children', () => {
  const HUB = '/insights'
  const SUCCESSOR = '/research'

  it('redirects the hub to the research hub, permanently', () => {
    const rule = redirectRules.find((candidate) => candidate.source === HUB)

    expect(rule, 'the /insights hub has no redirect').toBeDefined()
    expect(rule?.destination).toBe(SUCCESSOR)
    // permanent:true emits 308, which is what migration/redirect-map.csv records.
    expect(rule?.permanent).toBe(true)
  })

  it('sends the hub to a route that is actually built', () => {
    // The whole reason the hub stopped being a 404 is that /research exists. If
    // it ever becomes unbuilt, the redirect is a soft 404 and the 410 was better.
    expect(isBuilt(SUCCESSOR), `${SUCCESSOR} is not a built route`).toBe(true)
  })

  it('never 410s the hub, with or without a trailing slash', () => {
    expect(isGone(HUB)).toBe(false)
    expect(isGone(`${HUB}/`)).toBe(false)
    expect(GONE_EXACT_PATHS).not.toContain(HUB)
  })

  it('still 410s any slug beneath the hub, enumerated or not', () => {
    for (const slug of [
      '/insights/why-ai-pilots-fail-mid-market',
      '/insights/what-is-search-intelligence-engineer',
      '/insights/a-slug-that-never-existed',
    ]) {
      expect(isGone(slug), `${slug} should be Gone`).toBe(true)
      expect(isGone(`${slug}/`), `${slug}/ should be Gone`).toBe(true)
    }
  })

  it('redirects the hub without touching either exempted article', () => {
    expect(GONE_PREFIX_EXCEPTIONS).toHaveLength(2)

    for (const exception of GONE_PREFIX_EXCEPTIONS) {
      const rule = redirectRules.find((candidate) => candidate.source === exception)

      expect(rule, `${exception} has no redirect`).toBeDefined()
      if (!rule) continue

      expect(rule.permanent, `${exception} is not a permanent redirect`).toBe(true)

      const destination = rule.destination.startsWith('http')
        ? new URL(rule.destination).pathname
        : rule.destination

      expect(isBuilt(destination), `${exception} points at an unbuilt route`).toBe(true)
      expect(destination, `${exception} was swept into the hub redirect`).not.toBe(SUCCESSOR)
    }
  })

  it('separates the hub from its children on the trailing slash alone', () => {
    // If this prefix ever loses its slash, every assertion above stops meaning
    // anything: the bare hub would match it and 410.
    expect(GONE_PATH_PREFIXES).toContain('/insights/')
    expect(GONE_PATH_PREFIXES).not.toContain(HUB)
  })

  it('keeps the redirect on the bare hub and off the section', () => {
    // A `/insights/:path*` source would carry a colon and drop out of
    // literalRedirectSources, so assert the shape of the rule itself.
    const insightRules = redirectRules.filter((rule) => rule.source.startsWith('/insights'))

    for (const rule of insightRules) {
      expect(rule.source.includes(':'), `bulk redirect of ${rule.source}`).toBe(false)
      expect(rule.source.includes('*'), `bulk redirect of ${rule.source}`).toBe(false)
    }

    // The hub plus the two article exemptions, and nothing else.
    expect(insightRules.map((rule) => rule.source).sort()).toEqual(
      [HUB, ...GONE_PREFIX_EXCEPTIONS].sort(),
    )
  })
})
