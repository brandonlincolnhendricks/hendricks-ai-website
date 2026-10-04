/**
 * Research article content contract gate.
 *
 * Every study in the registry must satisfy the fifteen-item research format
 * (`docs/06` §12, mirrored in `src/content/research/types.ts`). The TypeScript
 * types enforce presence at compile time; this test enforces what types cannot:
 *
 * 1. The byline author, role, and `authorHref` are non-empty strings.
 * 2. `byline.published`, `byline.dataThrough` and the last change entry's
 *    `date` are all real ISO date strings (YYYY-MM-DD), and they are in
 *    ascending order: published <= dataThrough, and published <= updatedDate.
 * 3. The `changes` array is non-empty (types already require at least one entry;
 *    this ensures the test fails loudly if the type contract ever weakens).
 * 4. Every `ChangeEntry.date` is a real ISO date string.
 * 5. Every source citation (when present) carries a non-empty title, publisher,
 *    ISO date, and URL.
 * 6. The `methodology` section has at least one item or a non-empty `lead`.
 * 7. The `limitations` section has at least one item.
 * 8. `byline.dataThrough` is a non-empty string.
 * 9. Studies carrying a `dataset` have a DOI href, release version, discovery
 *    keywords, explicit open-access state, a non-empty licence href, a
 *    non-empty `temporalCoverage`, at least one `variableMeasured` entry, and a
 *    distribution with a non-empty `contentUrl`.
 *
 * The contract for sections 1-8 is also enforced by the TypeScript type at
 * compile time; the assertions here add two things the type cannot: (a)
 * non-emptiness of string fields, and (b) ISO date validity. A content file
 * that sets `byline.published = ''` would satisfy the type but fail here.
 */
import { describe, expect, it } from 'vitest'

import { researchArticles } from '@/content/research/index'
import { latestChangeDate } from '@/content/shared/publication-record'

// ---- helpers ------------------------------------------------------------- //

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false
  const d = new Date(value)
  return !isNaN(d.getTime())
}

// ---- tests --------------------------------------------------------------- //

describe('research article contract', () => {
  for (const article of researchArticles) {
    describe(`/${article.slug}`, () => {
      const content = article.content
      const slug = article.slug

      it('has a non-empty byline with valid fields', () => {
        expect(content.byline.author, `${slug}: byline.author`).toBeTruthy()
        expect(content.byline.authorRole, `${slug}: byline.authorRole`).toBeTruthy()
        expect(content.byline.authorHref, `${slug}: byline.authorHref`).toBeTruthy()
        expect(content.byline.dataThrough, `${slug}: byline.dataThrough`).toBeTruthy()
      })

      it('byline.published is a valid ISO date', () => {
        expect(
          isIsoDate(content.byline.published),
          `${slug}: byline.published "${content.byline.published}" is not a valid ISO date`,
        ).toBe(true)
      })

      it('byline.dataThrough is a valid ISO date', () => {
        expect(
          isIsoDate(content.byline.dataThrough),
          `${slug}: byline.dataThrough "${content.byline.dataThrough}" is not a valid ISO date`,
        ).toBe(true)
      })

      it('has at least one change entry and the last entry is a valid ISO date', () => {
        expect(content.changes.length, `${slug}: changes must be non-empty`).toBeGreaterThan(0)

        const updatedDate = latestChangeDate(content.changes)
        expect(
          isIsoDate(updatedDate),
          `${slug}: last change date "${updatedDate}" is not a valid ISO date`,
        ).toBe(true)
      })

      it('all change entry dates are valid ISO dates in ascending order', () => {
        const dates = content.changes.map((c) => c.date)
        for (const date of dates) {
          expect(
            isIsoDate(date),
            `${slug}: change entry date "${date}" is not a valid ISO date`,
          ).toBe(true)
        }

        for (let i = 1; i < dates.length; i++) {
          expect(
            dates[i]! >= dates[i - 1]!,
            `${slug}: change entries are not in ascending date order at index ${i}: ${dates[i - 1]} > ${dates[i]}`,
          ).toBe(true)
        }
      })

      it('dataThrough date is not after published date', () => {
        /*
         * Data collection must precede or coincide with publication.
         * `no-shared-source-across-engines` documents the one-day gap in its
         * byline.note verbatim: the run was 2026-08-20 and the page went live
         * 2026-08-21. The invariant is therefore dataThrough <= published, not
         * the reverse.
         */
        expect(
          content.byline.dataThrough <= content.byline.published,
          `${slug}: dataThrough "${content.byline.dataThrough}" is after published "${content.byline.published}"`,
        ).toBe(true)
      })

      it('published date is not after the last change date', () => {
        const updatedDate = latestChangeDate(content.changes)
        expect(
          content.byline.published <= updatedDate,
          `${slug}: published "${content.byline.published}" is after the last change date "${updatedDate}"`,
        ).toBe(true)
      })

      it('methodology section is non-empty', () => {
        const hasItems = content.methodology.items && content.methodology.items.length > 0
        const hasLead = content.methodology.lead && content.methodology.lead.trim().length > 0
        expect(
          hasItems || hasLead,
          `${slug}: methodology must have at least one item or a non-empty lead`,
        ).toBe(true)
      })

      it('limitations section has at least one item', () => {
        expect(
          content.limitations.items.length,
          `${slug}: limitations must have at least one item`,
        ).toBeGreaterThan(0)
      })

      it('source citations (when present) carry required fields', () => {
        if (!content.sources.citations || content.sources.citations.length === 0) return

        for (const citation of content.sources.citations) {
          expect(citation.title, `${slug}: citation.title`).toBeTruthy()
          expect(citation.publisher, `${slug}: citation.publisher`).toBeTruthy()
          expect(citation.url, `${slug}: citation.url`).toBeTruthy()
          expect(
            isIsoDate(citation.date),
            `${slug}: citation.date "${citation.date}" is not a valid ISO date`,
          ).toBe(true)
        }
      })

      it('sources.reviewed is a valid ISO date', () => {
        expect(
          isIsoDate(content.sources.reviewed),
          `${slug}: sources.reviewed "${content.sources.reviewed}" is not a valid ISO date`,
        ).toBe(true)
      })

      it('dataset (when present) satisfies the data package contract', () => {
        const ds = content.dataset
        if (!ds) return

        expect(
          ds.doi.href.startsWith('https://doi.org/'),
          `${slug}: dataset.doi.href must start with https://doi.org/`,
        ).toBe(true)
        expect(ds.license.href, `${slug}: dataset.license.href`).toBeTruthy()
        expect(ds.license.name, `${slug}: dataset.license.name`).toBeTruthy()
        expect(ds.version, `${slug}: dataset.version`).toBeTruthy()
        expect(ds.keywords.length, `${slug}: dataset.keywords`).toBeGreaterThan(0)
        expect(ds.isAccessibleForFree, `${slug}: dataset.isAccessibleForFree`).toBe(true)
        expect(ds.temporalCoverage, `${slug}: dataset.temporalCoverage`).toBeTruthy()
        expect(
          ds.variableMeasured.length,
          `${slug}: dataset must have at least one variableMeasured`,
        ).toBeGreaterThan(0)
        expect(
          ds.distribution.contentUrl,
          `${slug}: dataset.distribution.contentUrl`,
        ).toBeTruthy()
        expect(
          ds.distribution.sha256,
          `${slug}: dataset.distribution.sha256 must be non-empty`,
        ).toBeTruthy()
      })

      it('registry dates match the content module dates', () => {
        expect(
          article.publishedDate,
          `${slug}: registry.publishedDate does not match content.byline.published`,
        ).toBe(content.byline.published)

        expect(
          article.dataThroughDate,
          `${slug}: registry.dataThroughDate does not match content.byline.dataThrough`,
        ).toBe(content.byline.dataThrough)

        const updatedDate = latestChangeDate(content.changes)
        expect(
          article.updatedDate,
          `${slug}: registry.updatedDate does not match derived update date "${updatedDate}"`,
        ).toBe(updatedDate)
      })
    })
  }
})
