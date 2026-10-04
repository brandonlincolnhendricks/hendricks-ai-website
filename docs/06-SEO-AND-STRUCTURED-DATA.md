# 06 — SEO and Structured Data

## 1. SEO objective

The site should make Hendricks understandable to human buyers and machine systems through clear category definitions, visible evidence, structured page relationships, strong technical foundations, and original research.

Do not treat structured data, `llms.txt`, crawler directives, or keyword repetition as special AI-ranking shortcuts.

## 2. Indexation rules

### Production

Index:

- Homepage
- Solution pages
- Diagnostic
- How It Works
- Brand and agency pages
- About
- Research hub and approved articles
- Definition pages
- Methodology
- Results only when enabled and verified
- Privacy, Terms, Corrections

Noindex:

- Sanity Studio
- Draft mode
- Internal preview routes
- Form confirmation routes if separate
- Search/filter parameter combinations that create duplicate pages
- Results preview while the feature is disabled

### Preview and staging

All nonproduction deployments must be `noindex, nofollow` through rendered metadata and protective headers where possible. Do not rely only on robots.txt.

## 3. Metadata system

Create a reusable metadata builder that supports:

- Title
- Description
- Canonical
- Open Graph title and description
- Open Graph image
- Twitter card
- Robots directives
- Authors
- Published and modified times for articles

### Title conventions

- Keep titles descriptive and differentiated.
- Use `| Hendricks` or `— Hendricks` consistently.
- Do not stuff “AI SEO GEO AEO” into titles.

### Default metadata

- Site name: Hendricks
- Domain: `https://hendricks.ai`
- Locale: `en_US`
- Default OG type: website

## 4. Page metadata inventory

See `templates/page-inventory.csv`.

## 5. Canonicals

- Self-reference every indexable page.
- Use absolute URLs.
- Remove tracking parameters from canonicals.
- Research articles use Sanity slug as canonical unless an approved override exists.
- Do not canonicalize distinct solution pages to the homepage.

## 6. Sitemap

Implement `src/app/sitemap.ts`.

Include:

- Static indexable routes
- Published research articles
- Enabled and approved case studies

Exclude:

- Studio
- Draft/preview URLs
- Disabled routes
- Noindex content
- Query parameters

Use accurate `lastModified` values. Do not set every route to the current deployment time if the content did not change.

## 7. Robots

Implement `src/app/robots.ts`.

Production:

- Allow public routes.
- Disallow studio, API, preview, and internal paths.
- Link to sitemap.

Staging:

- Disallow all and render noindex metadata.

Crawler decisions for AI training versus search discovery require a separate approved policy. Do not make legal or brand decisions silently in code.

## 8. Structured data

Render sanitized JSON-LD in Server Components.

### Homepage

- `Organization`
- `WebSite`
- `WebPage`

Organization fields only when verified:

- Name
- URL
- Logo
- Founder
- Founding date if confirmed
- Address only if a public business address is approved
- Contact point only if a public contact method exists
- `sameAs` only for verified official profiles

### About

- `Person` for Brandon Lincoln Hendricks
- `AboutPage`
- `BreadcrumbList`
- `NewsMediaOrganization` for The Search Economy, with `founder` pointing at the Person node and the same `@id` the publication's own site uses (`https://thesearcheconomy.com/#organization`)

Person `sameAs` lists profiles that identify Brandon himself, starting with `https://brandonlincolnhendricks.com`, which is his entity home and lists /about back. Publications and individual articles are not `sameAs` targets.

Do not add unverified client names to Person or Organization schema.

### Solution pages

- `Service`
- `WebPage`
- `BreadcrumbList`

Service schema should use visible service descriptions and provider information.

### Research

- `Article` or a more specific supported article subtype when accurate
- `Person` author reference
- `BreadcrumbList`
- `WebPage`

### Case studies

- `Article`
- `BreadcrumbList`

Do not add reviews or ratings unless they are verified, visible, and legally approved.

### Definition pages

- `WebPage`
- `BreadcrumbList`
- Optional `DefinedTerm`/`DefinedTermSet` only if it accurately represents visible content and passes validation. Do not rely on it for a Google rich result.

## 9. JSON-LD security

Use a safe serializer. At minimum, replace `<` with `\u003c` before injecting JSON-LD. Never directly inject unsanitized CMS strings into a script tag.

## 10. FAQ handling

Visible FAQs are useful for users.

Do not automatically add `FAQPage` markup. Add it only after verifying current search-engine support, eligibility, and visible-content alignment. The website must not depend on FAQ rich results.

## 11. Page structure

Every indexable commercial page requires:

- One clear H1
- Direct answer to the page purpose near the top
- Logical H2/H3 hierarchy
- Descriptive links
- Meaningful page-specific copy
- Related solution/research links
- Visible author or company responsibility where appropriate
- Updated information when material changes occur

## 12. Source-ready research format

Every substantial research article should include:

1. Direct answer or executive summary
2. Key findings
3. Definitions
4. Data or evidence
5. Methodology
6. Sample and date range
7. Assumptions
8. Limitations
9. Sources
10. Author
11. Published date
12. Meaningful updated date
13. Data-through date where relevant
14. Corrections link
15. Related solution

## 13. Internal linking

Use contextual anchors such as:

- Learn how Selection Intelligence measures consideration.
- See the Search Presence Engineering layers.
- Review the Demand-to-Selection methodology.

Avoid repeatedly using exact-match commercial keywords in every footer and paragraph.

## 14. Images and media

- Use descriptive filenames.
- Provide accurate alt text.
- Decorative media gets empty alt.
- Include image dimensions.
- Use `next/image` for raster images.
- Create route-specific OG images for major pages.
- Charts require captions and text summaries.

## 15. Content freshness

- Update dates only when content changes materially.
- Preserve original publish date.
- Add a data-through date to trend or platform research.
- Archive or annotate outdated platform-specific claims.
- Maintain a corrections policy and change log for methodology documents.

## 16. Search migration

Follow `docs/09-MIGRATION-PLAN.md`.

No launch until:

- Existing URLs are inventoried.
- Redirects are mapped.
- High-value backlinks and pages are reviewed.
- Staging is noindex.
- New sitemap and Search Console verification are ready.
