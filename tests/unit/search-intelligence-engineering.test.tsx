import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import WhatIsSearchIntelligenceEngineeringPage from '@/app/(editorial)/what-is-search-intelligence-engineering/page'
import { routes } from '@/config/routes'
import * as content from '@/content/pages/what-is-search-intelligence-engineering'

describe('Search Intelligence Engineering canonical page', () => {
  it('publishes the canonical direct answer consistently', () => {
    const expected =
      'Search Intelligence Engineering is the evidence-driven discipline of understanding and improving how search and AI systems retrieve, select, cite, and recommend information while measuring how those observable decisions connect to business outcomes.'

    expect(content.directAnswer.answer).toBe(expected)
    expect(content.faq.entries[0]?.definition).toEqual([expected])
    expect(content.directAnswer.note).toBe(
      'Search Intelligence Engineering is a Hendricks-defined operating framework. It is not presented as an established academic field or a universally adopted industry label.',
    )
    expect(content.meta.description).toBe(
      'Search Intelligence Engineering explains how search and AI systems retrieve, select, cite, recommend, and connect observable decisions to business outcomes.',
    )
  })

  it('publishes the four-layer framework and the agentic-search experiment map', () => {
    expect(content.framework.layers.map((layer) => layer.title)).toEqual([
      'Retrieval: what enters the candidate set?',
      'Selection: what survives the decision process?',
      'Citation and recommendation: how is selected evidence exposed?',
      'Revenue measurement: what evidence connects selection to value?',
    ])
    expect(content.agenticPipeline.steps).toHaveLength(9)
    expect(content.framework.lead).toContain('experiment map')
    expect(content.framework.lead).toContain('not a universal list of ranking factors')
  })

  it('keeps identity records out of direct-citation evidence', () => {
    const directCitation = content.framework.selectionClasses.find(
      ({ term }) => term === 'Direct citation',
    )

    expect(directCitation?.definition.join(' ')).toContain('canonical article')
    expect(directCitation?.definition.join(' ')).not.toContain('ORCID')
  })

  it('publishes a bounded pilot, limitations, and the seven-step operating model', () => {
    expect(content.operatingModel.steps).toHaveLength(7)
    expect(content.pilot.title).toContain('pilot')
    expect(content.pilot.title).toContain('not a reported result')
    expect(content.pilot.status).toContain('proposed pilot protocol')
    expect(content.pilot.interpretation).toContain('cannot establish')
    expect(content.limitations.items.length).toBeGreaterThanOrEqual(8)
  })

  it('keeps the Answer Index wording version-neutral while preserving reproducibility links', () => {
    const reproducibility = JSON.stringify(content.reproducibility)

    expect(content.reproducibility.study.href).toBe(routes.researchTheAnswerIndex.path)
    expect(content.reproducibility.dataset.href).toBe(
      'https://doi.org/10.5281/zenodo.22242102',
    )
    expect(reproducibility).not.toContain('v2026.09.1')
    expect(reproducibility).not.toContain('v2026.09.2')
  })

  it('preserves the four solution links and resolves every draft verification marker', () => {
    expect(content.outcomes.items.map((item) => item.solution.href)).toEqual([
      routes.searchDemandIntelligence.path,
      routes.selectionIntelligence.path,
      routes.searchPresenceEngineering.path,
      routes.searchImpactMeasurement.path,
    ])

    const corpus = JSON.stringify(content)
    expect(corpus).not.toContain('[SOURCE TO VERIFY]')
    expect(corpus).not.toContain('—')
    expect(content.faq.entries).toHaveLength(9)
  })

  it('renders the framework note and dated history honestly', () => {
    render(<WhatIsSearchIntelligenceEngineeringPage />)

    expect(screen.getByText(content.directAnswer.note)).toBeInTheDocument()
    expect(content.changeHistory).toEqual([
      {
        date: '2026-08-16',
        kind: 'publication',
        summary: 'First publication of this page.',
      },
      {
        date: '2026-10-03',
        kind: 'update',
        summary:
          "Expanded the framework, methods, and limitations, and corrected the page's structured-data relationships.",
      },
    ])
    expect(screen.getByText('August 16, 2026')).toBeInTheDocument()
    expect(screen.getAllByText('October 3, 2026')).not.toHaveLength(0)
    expect(screen.getByText(content.changeHistory[1].summary)).toBeInTheDocument()
    expect(screen.queryByText('Not yet recorded')).not.toBeInTheDocument()
  })

  it('renders the visible FAQ but keeps FAQPage out of structured data', () => {
    const { container } = render(<WhatIsSearchIntelligenceEngineeringPage />)

    expect(
      screen.getByRole('heading', { name: 'Questions about the framework and its limits.' }),
    ).toBeInTheDocument()
    expect(screen.getByText('How do LLMs choose sources?')).toBeInTheDocument()

    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script?.textContent).toBeTruthy()

    const data = JSON.parse(script!.textContent!) as {
      '@graph': Array<Record<string, unknown>>
    }
    const page = data['@graph'].find((node) => node['@type'] === 'WebPage')
    const term = data['@graph'].find((node) => node['@type'] === 'DefinedTerm')
    const termSet = data['@graph'].find((node) => node['@type'] === 'DefinedTermSet') as
      | { hasDefinedTerm?: Array<{ name?: string }> }
      | undefined

    expect(data['@graph'].some((node) => node['@type'] === 'FAQPage')).toBe(false)
    expect(page?.citation).toEqual([
      'https://hendricks.ai/research/hendricks-selection-baseline',
      'https://hendricks.ai/research/the-answer-index',
      'https://doi.org/10.5281/zenodo.22242102',
    ])
    expect(term).not.toHaveProperty('sameAs')
    expect(term).not.toHaveProperty('citation')
    expect(termSet?.hasDefinedTerm?.map(({ name }) => name)).toEqual([
      'Search Intelligence Engineering',
      'Selection Intelligence',
      'AI-Mediated Search',
      'Generative Engine Optimization',
    ])
  })
})
