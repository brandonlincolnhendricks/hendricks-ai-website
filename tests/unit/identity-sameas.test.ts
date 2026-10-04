import { describe, expect, it } from 'vitest'

import { siteConfig } from '@/config/site'
import { externalVenture } from '@/content/pages/about'
import {
  foundedOrganizationSchema,
  organizationSchema,
  personAuthor,
  personSchema,
} from '@/lib/seo/json-ld'

const COMPANY_LINKEDIN = 'https://www.linkedin.com/company/hendricksai'
const PERSONAL_SITE = 'https://brandonlincolnhendricks.com'
const ORCID = 'https://orcid.org/0009-0001-5728-0790'
const PERSONAL_LINKEDIN = 'https://www.linkedin.com/in/brandonlincolnhendricks'
const SEARCH_ECONOMY = 'https://thesearcheconomy.com'
const X_PROFILE = 'https://x.com/BrandonLincolnH'
const GITHUB = 'https://github.com/brandonlincolnhendricks'
const MEDIUM = 'https://medium.com/@brandonlincolnhendricks'
const ZENODO_RECORD = 'https://zenodo.org/records/22242103'

function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  if (typeof value === 'string') return [value]
  return []
}

describe('Person and Organization sameAs locks', () => {
  const organization = organizationSchema() as { sameAs?: unknown; legalName?: string }
  const person = personSchema({
    jobTitle: siteConfig.founderRole,
    imagePath: '/images/brandon-lincoln-hendricks-portrait.jpg',
    alumniOf: [
      { name: 'Merkle', jobTitle: 'Global Paid Search Director' },
      { name: 'SolarWinds', jobTitle: 'Global Search and Innovation Lead' },
    ],
  }) as { sameAs?: unknown; '@id'?: string }

  const orgSameAs = asList(organization.sameAs)
  const personSameAs = asList(person.sameAs)

  it('puts company LinkedIn on Organization only', () => {
    expect(orgSameAs).toEqual([COMPANY_LINKEDIN])
    expect(personSameAs).not.toContain(COMPANY_LINKEDIN)
  })

  it('puts the Person join list on Person only', () => {
    expect(personSameAs).toEqual([
      PERSONAL_SITE,
      ORCID,
      PERSONAL_LINKEDIN,
      X_PROFILE,
      GITHUB,
      MEDIUM,
    ])
    expect(orgSameAs).not.toContain(PERSONAL_SITE)
    expect(orgSameAs).not.toContain(ORCID)
    expect(orgSameAs).not.toContain(PERSONAL_LINKEDIN)
    expect(orgSameAs).not.toContain(X_PROFILE)
    expect(orgSameAs).not.toContain(GITHUB)
    expect(orgSameAs).not.toContain(MEDIUM)
  })

  it('lists only profiles of Brandon himself, never an article or a publication', () => {
    for (const url of personSameAs) {
      expect(new URL(url).pathname.split('/').filter(Boolean).length).toBeLessThanOrEqual(2)
    }
    expect(personSameAs).not.toContain(SEARCH_ECONOMY)
    expect(personSameAs).not.toContain(ZENODO_RECORD)
  })

  it('keeps the authored Zenodo dataset off Person identity and subject relationships', () => {
    expect(person).not.toHaveProperty('subjectOf')
    expect(personSameAs).not.toContain(ZENODO_RECORD)
  })

  it('fails if Person and Organization LinkedIn URLs are swapped', () => {
    expect(orgSameAs).toContain(COMPANY_LINKEDIN)
    expect(orgSameAs).not.toContain(PERSONAL_LINKEDIN)
    expect(personSameAs).toContain(PERSONAL_LINKEDIN)
    expect(personSameAs).not.toContain(COMPANY_LINKEDIN)
  })

  it('declares The Search Economy as an organization Brandon founded', () => {
    const publication = foundedOrganizationSchema({
      name: externalVenture.name,
      url: externalVenture.cta.href,
      type: 'NewsMediaOrganization',
    })
    expect(publication['@type']).toBe('NewsMediaOrganization')
    expect(publication['@id']).toBe(`${SEARCH_ECONOMY}/#organization`)
    expect(publication.url).toBe(SEARCH_ECONOMY)
    expect(publication.founder).toEqual({ '@id': siteConfig.founderPersonId })
    expect(orgSameAs).not.toContain(SEARCH_ECONOMY)
    expect(personSameAs).not.toContain(SEARCH_ECONOMY)
  })

  it('points the Person node at /about#person', () => {
    expect(person['@id']).toBe('https://hendricks.ai/about#person')
    expect(siteConfig.founderPersonId).toBe('https://hendricks.ai/about#person')
  })

  it('keeps the registered legal name on Organization', () => {
    expect(organization.legalName).toBe('Hendricks Agency LLC')
  })

  it('keeps sameAs off the expanded Person author used on page graphs', () => {
    expect(personAuthor()).not.toHaveProperty('sameAs')
    expect(personAuthor().jobTitle).toBe(siteConfig.founderRole)
  })
})
