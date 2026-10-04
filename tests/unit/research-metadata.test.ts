import { describe, expect, it } from 'vitest'

import { siteConfig } from '@/config/site'
import { researchArticles } from '@/content/research'
import { buildResearchCitationMetadata } from '@/lib/seo/metadata'

describe('research citation metadata', () => {
  const answerIndex = researchArticles.find((article) => article.slug === 'the-answer-index')!

  it('publishes the core Google Scholar bibliographic fields', () => {
    const metadata = buildResearchCitationMetadata({
      title: answerIndex.title,
      author: answerIndex.content.byline.author,
      publicationDate: answerIndex.publishedDate,
      path: answerIndex.path,
    })

    expect(metadata).toMatchObject({
      citation_title: answerIndex.title,
      citation_author: answerIndex.content.byline.author,
      citation_publication_date: answerIndex.publishedDate,
      citation_online_date: answerIndex.publishedDate,
      citation_language: 'en',
      citation_fulltext_html_url: new URL(answerIndex.path, siteConfig.url).toString(),
    })
    expect(metadata.citation_technical_report_institution).toBeUndefined()
    expect(metadata.citation_technical_report_number).toBeUndefined()
  })

  it('turns a first-party PDF rendition into an absolute citation URL', () => {
    const pdfPath = answerIndex.content.downloads?.items.find(({ cta }) =>
      cta.href.endsWith('.pdf'),
    )?.cta.href

    expect(pdfPath).toBeTruthy()

    const metadata = buildResearchCitationMetadata({
      title: answerIndex.title,
      author: answerIndex.content.byline.author,
      publicationDate: answerIndex.publishedDate,
      path: answerIndex.path,
      pdfPath,
    })

    expect(metadata.citation_pdf_url).toBe(new URL(pdfPath!, siteConfig.url).toString())
  })

  it('omits optional PDF and article DOI tags when the article does not carry them', () => {
    const metadata = buildResearchCitationMetadata({
      title: answerIndex.title,
      author: answerIndex.content.byline.author,
      publicationDate: answerIndex.publishedDate,
      path: answerIndex.path,
    })

    expect(metadata.citation_pdf_url).toBeUndefined()
    expect(metadata.citation_doi).toBeUndefined()
  })
})
