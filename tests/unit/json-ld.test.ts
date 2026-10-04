import { describe, expect, it } from 'vitest'

import {
  breadcrumbSchema,
  datasetSchema,
  definedTermSchema,
  definedTermSetSchema,
  jsonLdGraph,
  organizationSchema,
  personSchema,
  serializeJsonLd,
  serviceSchema,
  webPageSchema,
  websiteSchema,
} from '@/lib/seo/json-ld'
import { routes } from '@/config/routes'
import { siteConfig } from '@/config/site'
import { termsOfUse } from '@/content/legal/terms'
import { experience } from '@/content/pages/about'
import { DEFINED_TERM_MEMBERS } from '@/content/shared/definition-routes'
import { dataset as answerIndexDataset } from '@/content/research/the-answer-index'
import * as sdi from '@/content/pages/search-demand-intelligence'
import * as sim from '@/content/pages/search-impact-measurement'
import * as spe from '@/content/pages/search-presence-engineering'
import * as si from '@/content/pages/selection-intelligence'
import * as wisi from '@/content/pages/what-is-selection-intelligence'

describe('serializeJsonLd', () => {
  it('escapes a closing script tag so it cannot break out of the script block', () => {
    const output = serializeJsonLd({ name: '</script><img onerror=alert(1)>' })

    expect(output).not.toContain('</script>')
    expect(output).not.toContain('<')
    expect(output).toContain('\\u003c')
  })

  it('escapes line and paragraph separators that are valid JSON but invalid JS', () => {
    const output = serializeJsonLd({ note: 'a\u2028b\u2029c' })

    expect(output).toContain('\\u2028')
    expect(output).toContain('\\u2029')
  })

  it('still produces valid JSON after escaping', () => {
    const output = serializeJsonLd({ name: 'Hendricks & Co <test>' })

    expect(() => JSON.parse(output)).not.toThrow()
    expect(JSON.parse(output)).toEqual({ name: 'Hendricks & Co <test>' })
  })
})

describe('organizationSchema', () => {
  it('omits fields that have not been verified', () => {
    // CONTENT_VERIFICATION.md O1–O3 — these may not be emitted until approved.
    const schema = organizationSchema() as Record<string, unknown>

    expect(schema).not.toHaveProperty('foundingDate')
    expect(schema).not.toHaveProperty('address')
    expect(schema).not.toHaveProperty('contactPoint')
  })

  it('puts only the company LinkedIn URL on Organization sameAs', () => {
    const schema = organizationSchema() as { sameAs?: unknown }

    expect(schema.sameAs).toEqual(['https://www.linkedin.com/company/hendricksai'])
  })

  it('includes the verified core identity fields', () => {
    const schema = organizationSchema() as Record<string, unknown>

    expect(schema.name).toBe('Hendricks')
    expect(schema['@type']).toBe('Organization')
    expect(schema.url).toContain('hendricks.ai')
  })

  /**
   * The trade name alone cannot disambiguate "Hendricks" from a gin brand, a
   * NASCAR team, and a county. The registered entity can, because it is a
   * filing. It is publishable precisely because it is already visible: /terms
   * opens with it and /privacy names it as the controller. This test ties the
   * markup to that copy, so the entity can never be changed in one place only.
   */
  it('publishes the registered entity that the visible legal copy already names', () => {
    const schema = organizationSchema() as Record<string, unknown>
    const visibleTermsIntro = termsOfUse.intro.join(' ').replace(/\*\*/g, '')

    expect(schema.legalName).toBe('Hendricks Agency LLC')
    expect(visibleTermsIntro).toContain(schema.legalName as string)
  })
})

describe('serviceSchema', () => {
  const example = () =>
    serviceSchema({
      path: '/solutions/selection-intelligence',
      name: 'Selection Intelligence',
      description: 'A visible sentence from the page.',
    }) as Record<string, unknown>

  it('types the offering and resolves its own absolute URL and id', () => {
    const schema = example()

    expect(schema['@type']).toBe('Service')
    expect(schema['@id']).toBe('https://hendricks.ai/solutions/selection-intelligence#service')
    expect(schema.url).toBe('https://hendricks.ai/solutions/selection-intelligence')
    expect(schema.name).toBe('Selection Intelligence')
    expect(schema.description).toBe('A visible sentence from the page.')
  })

  it('attributes the service to the Organization node the page also emits', () => {
    const schema = example()
    const graph = jsonLdGraph(organizationSchema(), websiteSchema(), schema)
    const ids = new Set(graph['@graph'].map((node) => (node as { '@id'?: string })['@id']))

    expect(ids).toContain((schema.provider as { '@id': string })['@id'])
  })

  it('points mainEntityOfPage at the WebPage node emitted for the same route', () => {
    const path = '/solutions/search-presence-engineering'
    const schema = serviceSchema({ path, name: 'Search Presence Engineering', description: 'D' })
    const page = webPageSchema({
      path,
      title: 'T',
      description: 'D',
      mainEntityFragment: 'service',
    }) as { '@id': string; mainEntity: { '@id': string } }

    // Both directions, so the page and its subject cannot drift apart.
    expect(schema.mainEntityOfPage['@id']).toBe(page['@id'])
    expect(page.mainEntity['@id']).toBe(schema['@id'])
  })

  /**
   * The hard boundary. CONTENT_VERIFICATION.md P1–P3 resolved every fee as
   * withheld, so no page renders a price, and a price in the markup would be
   * the only place on the site asserting one. `aggregateRating` and `review`
   * are worse: they assert third-party testimony the site does not publish.
   * Both classes are the kind of unsupported claim docs/06 §9 exists to stop,
   * and they are exactly what a "richer schema" edit reaches for first.
   */
  it('never asserts a price, a catalog, a service area, or third-party ratings', () => {
    const withOutput = serviceSchema({
      path: '/solutions/search-demand-intelligence',
      name: 'Search Demand Intelligence',
      description: 'D',
      serviceOutput: ['A deliverable rendered on the page'],
    }) as Record<string, unknown>

    for (const schema of [example(), withOutput]) {
      for (const forbidden of [
        'offers',
        'hasOfferCatalog',
        'priceSpecification',
        'price',
        'priceRange',
        'areaServed',
        'aggregateRating',
        'review',
      ]) {
        expect(schema, `serviceSchema must not emit ${forbidden}`).not.toHaveProperty(forbidden)
      }
    }
  })

  it('omits serviceOutput entirely rather than emitting an empty list', () => {
    expect(example()).not.toHaveProperty('serviceOutput')
    expect(
      serviceSchema({ path: '/solutions/selection-intelligence', name: 'N', description: 'D', serviceOutput: [] }),
    ).not.toHaveProperty('serviceOutput')
  })
})

describe('solution pages describe their service with visible copy', () => {
  /**
   * docs/06 §8 requires Service on the solution pages, and §9 allows it to
   * reproduce visible content and nothing else. Each page therefore passes its
   * own rendered hero lead, not the meta description written for search
   * results. The category names are locked, so they come from the route label
   * rather than being retyped into four separate files.
   */
  const solutions = [
    { route: routes.searchDemandIntelligence, hero: sdi.hero },
    { route: routes.selectionIntelligence, hero: si.hero },
    { route: routes.searchPresenceEngineering, hero: spe.hero },
    { route: routes.searchImpactMeasurement, hero: sim.hero },
  ] as const

  it.each(solutions)('names and describes $route.label from the page itself', ({ route, hero }) => {
    const schema = serviceSchema({
      path: route.path,
      name: route.label,
      description: hero.lead.join(' '),
    })

    expect(schema.name).toBe(route.label)
    // Every sentence in the description is one a reader sees in the hero.
    for (const paragraph of hero.lead) {
      expect(schema.description).toContain(paragraph)
    }
    expect(schema['@id']).toBe(`https://hendricks.ai${route.path}#service`)
  })

  it('gives each solution page a distinct service node', () => {
    const ids = solutions.map(
      ({ route, hero }) =>
        serviceSchema({ path: route.path, name: route.label, description: hero.lead.join(' ') })[
          '@id'
        ],
    )

    expect(new Set(ids).size).toBe(solutions.length)
  })
})

describe('breadcrumbSchema', () => {
  it('numbers positions from one and resolves absolute item URLs', () => {
    const schema = breadcrumbSchema([
      { label: 'Home', href: '/' },
      { label: 'Solutions', href: '/solutions' },
      { label: 'Selection Intelligence' },
    ])

    expect(schema.itemListElement).toHaveLength(3)
    expect(schema.itemListElement[0].position).toBe(1)
    expect(schema.itemListElement[1]).toMatchObject({
      position: 2,
      name: 'Solutions',
      item: 'https://hendricks.ai/solutions',
    })
    // The current page carries no item URL.
    expect(schema.itemListElement[2]).not.toHaveProperty('item')
  })
})

describe('definedTermSchema', () => {
  it('describes the term with the answer visible on the page', () => {
    // docs/06 §8 — the markup may only reproduce visible content. Passing the
    // page's own directAnswer through is what keeps that true.
    const schema = definedTermSchema({
      path: '/what-is-selection-intelligence',
      term: wisi.directAnswer.term,
      directAnswer: wisi.directAnswer.answer,
    })

    expect(schema.name).toBe('Selection Intelligence')
    expect(schema.description).toBe(wisi.directAnswer.answer)
    expect(schema.url).toBe('https://hendricks.ai/what-is-selection-intelligence')
    expect(schema).not.toHaveProperty('sameAs')
    expect(schema).not.toHaveProperty('citation')
  })

  it('groups every term into one shared vocabulary set', () => {
    const a = definedTermSchema({ path: '/a', term: 'A', directAnswer: 'A is a thing.' })
    const b = definedTermSchema({ path: '/b', term: 'B', directAnswer: 'B is a thing.' })

    expect(a['@id']).not.toBe(b['@id'])
    expect(a.inDefinedTermSet['@id']).toBe(b.inDefinedTermSet['@id'])
  })

  it('lists every live term that references the shared vocabulary', () => {
    const set = definedTermSetSchema(DEFINED_TERM_MEMBERS)

    expect(set.hasDefinedTerm).toEqual(
      DEFINED_TERM_MEMBERS.map(({ name, path }) => {
        const url = new URL(path, siteConfig.url).toString()
        return {
          '@type': 'DefinedTerm',
          '@id': `${url}#term`,
          name,
          url,
        }
      }),
    )
  })
})

describe('webPageSchema citations', () => {
  it('places visible supporting works on the WebPage CreativeWork', () => {
    const citations = [
      'https://hendricks.ai/research/hendricks-selection-baseline',
      'https://hendricks.ai/research/the-answer-index',
    ]
    const schema = webPageSchema({
      path: routes.whatIsSearchIntelligenceEngineering.path,
      title: 'What Is Search Intelligence Engineering?',
      description: 'A visible definition.',
      citation: citations,
    })

    expect(schema.citation).toEqual(citations)
  })
})

describe('jsonLdGraph', () => {
  it('wraps nodes in a single context and graph', () => {
    const graph = jsonLdGraph({ '@type': 'WebPage' }, { '@type': 'Organization' })

    expect(graph['@context']).toBe('https://schema.org')
    expect(graph['@graph']).toHaveLength(2)
  })
})

describe('datasetSchema', () => {
  const schema = datasetSchema({
    path: routes.researchTheAnswerIndex.path,
    name: answerIndexDataset.name,
    description: answerIndexDataset.description,
    version: answerIndexDataset.version,
    datePublished: answerIndexDataset.datePublished,
    keywords: answerIndexDataset.keywords,
    isAccessibleForFree: answerIndexDataset.isAccessibleForFree,
    doi: answerIndexDataset.doi,
    license: answerIndexDataset.license,
    temporalCoverage: answerIndexDataset.temporalCoverage,
    variableMeasured: answerIndexDataset.variableMeasured,
    distribution: answerIndexDataset.distribution,
  })

  it('publishes the archived release version, keywords, and access state', () => {
    expect(schema.version).toBe('v2026.09.2')
    expect(schema.datePublished).toBe('2026-10-04')
    expect(schema.identifier).toBe('https://doi.org/10.5281/zenodo.23132107')
    expect(answerIndexDataset.latestVersionDoi?.href).toBe(
      'https://doi.org/10.5281/zenodo.22242102',
    )
    expect(answerIndexDataset.distribution).toMatchObject({
      contentUrl: '/research/the-answer-index/the-answer-index-2026-09-v2026.09.2.zip',
      contentSize: 336595,
      sha256: '592535c770319b14d3fcebb51c3a41e30d390c75c80ecaca54583309709403b0',
    })
    expect(schema.keywords).toEqual(answerIndexDataset.keywords)
    expect(schema.isAccessibleForFree).toBe(true)
  })

  it('attributes the release to the canonical Person node', () => {
    expect(schema.creator).toEqual({ '@id': siteConfig.founderPersonId })
  })
})

describe('personSchema alumniOf', () => {
  /**
   * The published markup asserted "Dentsu" as an employer while the visible
   * role timeline named Merkle and SolarWinds only, and while about.ts and
   * CONTENT_VERIFICATION.md F4 both recorded the decision to publish Merkle
   * alone. Structured data that contradicts the page it ships on is the worst
   * class of defect on a site whose product is honest machine representation.
   *
   * This test, rather than the one-line deletion, is the actual fix: it makes
   * the drift impossible to reintroduce.
   */
  it('names only employers rendered in the visible role timeline', () => {
    const visibleEmployers = new Set(experience.roles.map((role) => role.organization))

    const schema = personSchema({
      jobTitle: siteConfig.founderRole,
      imagePath: '/images/brandon-lincoln-hendricks-portrait.jpg',
      alumniOf: [
        { name: 'Merkle', jobTitle: 'Global Paid Search Director' },
        { name: 'SolarWinds', jobTitle: 'Global Search and Innovation Lead' },
      ],
    }) as {
      alumniOf?: { alumniOf?: { name: string }; roleName?: string }[]
    }

    const names = (schema.alumniOf ?? []).map((role) => role.alumniOf?.name)
    for (const name of names) {
      expect(visibleEmployers, `"${name}" is in alumniOf but not on the page`).toContain(name)
    }

    expect(names).toEqual(['Merkle', 'SolarWinds'])
    expect(schema.alumniOf?.map((role) => role.roleName)).toEqual([
      'Global Paid Search Director',
      'Global Search and Innovation Lead',
    ])
    expect(JSON.stringify(schema)).not.toContain('Ahrefs')
    expect(JSON.stringify(schema)).not.toContain('Dentsu')
    expect(schema).not.toHaveProperty('memberOf')
  })
})

describe('page graphs are self-contained', () => {
  /**
   * Organization and WebSite used to be emitted on the homepage alone while 17
   * other pages referenced them by `@id` through `isPartOf` and `about`. A
   * crawler or answer engine fetches one URL at a time, so every deep link
   * resolved to a graph naming no organization. SiteShell now emits both on
   * every route.
   */
  it('defines the nodes that webPageSchema references', () => {
    const graph = jsonLdGraph(
      organizationSchema(),
      websiteSchema(),
      webPageSchema({ path: '/solutions', title: 'T', description: 'D' }),
    )

    const ids = new Set(graph['@graph'].map((node) => (node as { '@id'?: string })['@id']))
    const page = graph['@graph'][2] as {
      isPartOf: { '@id': string }
      about: { '@id': string }
    }

    expect(ids).toContain(page.isPartOf['@id'])
    expect(ids).toContain(page.about['@id'])
  })

  it('points breadcrumb at the id the BreadcrumbList actually carries', () => {
    const page = webPageSchema({
      path: '/solutions',
      title: 'T',
      description: 'D',
      hasBreadcrumb: true,
    }) as { breadcrumb: { '@id': string } }

    const list = breadcrumbSchema([{ label: 'Home', href: '/' }], '/solutions') as {
      '@id': string
    }

    expect(page.breadcrumb['@id']).toBe(list['@id'])
  })
})
