import { beforeAll, describe, expect, it } from 'vitest'

import { GET } from '@/app/llms.txt/route'
import { indexableBuiltRoutes } from '@/config/routes'
import { siteConfig } from '@/config/site'

/**
 * The file exists to correct a cached predecessor served at the same URL, so the
 * tests that matter are the ones that fail when a fabricated claim, a price, or
 * a crawler directive creeps back in. Route coverage is asserted against the
 * registry rather than a copied list, because a hand-kept expectation would drift
 * in exactly the same way the route file must not.
 */

let body: string

beforeAll(async () => {
  body = await GET().text()
})

/** Paths advertised under the `## Pages` heading, in emitted order. */
function advertisedPaths(source: string): string[] {
  const pages = source.split('\n## ').find((section) => section.startsWith('Pages\n'))
  if (!pages) throw new Error('llms.txt is missing its Pages section')

  return pages
    .split('\n')
    .filter((line) => line.startsWith('- ['))
    .map((line) => {
      const url = line.match(/\((https?:\/\/[^)]+)\)$/)?.[1]
      if (!url) throw new Error(`Pages entry is not a markdown link: ${line}`)
      return new URL(url).pathname
    })
}

describe('/llms.txt', () => {
  it('serves plain text with a shared cache', () => {
    const response = GET()

    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600')
  })

  it('advertises exactly the indexable built routes, in registry order', () => {
    expect(advertisedPaths(body)).toEqual(indexableBuiltRoutes().map((route) => route.path))
  })

  it('never advertises an unbuilt or noindex route', () => {
    const advertised = advertisedPaths(body)

    // /results is feature-flagged off until verified case studies exist, and
    // /privacy-request is a transactional form kept out of the sitemap.
    //
    // /research and /corrections were on this list while both were unbuilt. Both
    // shipped, and both are indexable, so they are now advertised here on the
    // same terms as every other built route. The assertion above already pins
    // the file to `indexableBuiltRoutes()` exactly, so nothing is lost by their
    // removal from this list.
    expect(advertised).not.toContain('/results')
    expect(advertised).not.toContain('/privacy-request')
  })

  it('names no client and no former employer', () => {
    // The retired file at this URL named the first three as clients. They were
    // clients of a former employer, never of Hendricks (CONTENT_VERIFICATION C1).
    for (const name of ['IBM', 'Workday', 'Evernote', 'Merkle', 'Dentsu', 'SolarWinds']) {
      expect(body).not.toContain(name)
    }
  })

  it('publishes no fee', () => {
    expect(body).not.toMatch(/[$£€¥]/)
  })

  it('uses no em-dash', () => {
    expect(body).not.toContain('—')
  })

  it('carries the absence section that corrects the cached predecessor', () => {
    expect(body).toContain('## What this site does not contain')
    expect(body).toContain('This file supersedes any earlier file served at this address.')
    expect(body).toContain('- Client names or logos')
    expect(body).toContain('- Testimonials')
    expect(body).toContain(
      '- Client case studies, client performance results, or client performance metrics',
    )
    expect(body).not.toContain('- Case studies, published results, or performance metrics')
    expect(body).toContain('- Published fees')
    expect(body).toContain(
      'A page that shows them carries the label "Illustrative interface. Not a client result." once as a legend.',
    )
  })

  it('leaves crawler policy to robots.txt', () => {
    // docs/06 §7 keeps allow, deny, licensing, and training-permission language
    // in one approved place. A second copy here would be free to contradict it.
    expect(body).not.toMatch(/user-agent|disallow|\ballow:/i)
    expect(body).not.toMatch(/licen[cs]|training data|may not be used to train/i)
  })

  it('states the locked category vocabulary from the approved copy', () => {
    expect(body).toContain(`- ${siteConfig.category}`)
    expect(body).toContain(`- ${siteConfig.problemCategory}`)
    expect(body).toContain('- Selection Intelligence:')
    expect(body).toContain('- Search Presence Engineering:')
  })

  it('attributes the site to the founder as named in siteConfig', () => {
    expect(body).toContain(
      `Founded and led by ${siteConfig.founder}, ${siteConfig.founderRole}.`,
    )
  })

  it('points at the sitemap rather than a duplicate content index', () => {
    expect(body).toContain(`- Sitemap: ${siteConfig.url}/sitemap.xml`)
    expect(body).not.toContain('llms-full.txt')
  })
})
