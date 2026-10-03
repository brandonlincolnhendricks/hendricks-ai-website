# Hendricks.ai Project Instructions

## Mission

Build a premium, evidence-led B2B website for **Hendricks**, a Search Intelligence Engineering firm. The site must explain a new category clearly, sell a fixed-scope Search Intelligence Diagnostic, and establish Hendricks as the specialist that connects search demand, AI visibility, brand consideration, implementation, and measurable business impact.

## Required positioning

- Category: **Search Intelligence Engineering**
- Category line: **Search Intelligence Engineering for the AI Era.**
- Operating line: **Measure demand. Understand AI visibility. Engineer selection. Prove business impact.**
- Core problem: **Brands are losing control over the path between being discovered and being chosen.**
- Primary CTA: **Start with a Search Intelligence Diagnostic**

Do not rename these without explicit approval.

## The Search Economy

The Search Economy is a daily publication at `https://thesearcheconomy.com`, founded by Brandon Lincoln Hendricks. Brandon confirmed on 2026-10-03 that it does not have to be kept separate from Hendricks and can be linked to it.

- Today it appears on the About page biography and in the About page structured data, as a `NewsMediaOrganization` with `founder` pointing at the Person node. It is not a `sameAs` target, because `sameAs` asserts the URL identifies Brandon himself.
- Wider placement (homepage, primary navigation, footer, Solutions, the conversion flow) is not decided yet. Confirm with Brandon first, then update the guards that still limit it to /about: `scripts/validate-content.ts`, `tests/unit/content.test.ts`, `tests/unit/page-content.test.ts`, `tests/e2e/homepage.spec.ts`, and `tests/e2e/routes.spec.ts`.

## Technical rules

- Use the current stable Next.js App Router with TypeScript strict mode.
- Default to React Server Components. Add `'use client'` only where browser state or interaction requires it.
- Use Tailwind CSS and shadcn/ui with Radix primitives.
- Use Geist Sans and Geist Mono.
- Use `next/image`, `next/link`, Metadata APIs, file-based metadata, and server-rendered core content.
- Use async Next.js APIs correctly. Do not reintroduce legacy Pages Router patterns.
- Avoid data waterfalls. Fetch independent data in parallel.
- Keep initial client JavaScript low. Do not install a large animation library for simple effects.
- Use direct imports rather than broad barrel imports for heavy libraries.
- Do not expose secrets to the client or commit any real environment values.
- Never read or print `.env` files. Use `.env.example` only.

## Content rules

- Use the approved copy in `content/pages/`.
- Do not replace approved copy with generic AI language.
- Never invent customers, metrics, testimonials, awards, citations, partnerships, platform capabilities, or case studies.
- Never promise guaranteed rankings, ChatGPT citations, AI recommendations, or revenue.
- Distinguish observation, inference, measurement, and causation.
- Use “AI-mediated search” when precision matters.
- Use “observed consideration rate” and “observed recommendation rate,” not universal AI rankings.
- The formal implementation solution is **Search Presence Engineering**, not “Selection Engineering.”

## Design rules

- The aesthetic is an **instrument-grade search intelligence system**: precise, premium, editorial, calm, and data-centered.
- Avoid generic AI visuals: robots, brains, holograms, glowing hands, purple gradients, circuit boards, and fake chat windows.
- Use the Hendricks signal dot as a restrained visual motif.
- Use charts, decision paths, query clusters, source networks, and evidence maps.
- Any interface illustration using sample data must say **Illustrative interface. Not a client result.**
- Do not use lorem ipsum.
- No auto-rotating carousels, scroll-jacking, excessive parallax, or decorative motion that obscures content.

## Accessibility and performance

- Target WCAG 2.2 AA.
- Provide keyboard access, visible focus, semantic landmarks, unique page titles, proper labels, sufficient contrast, and reduced-motion behavior.
- All essential content must remain available without animation or client-side JavaScript.
- Target Core Web Vitals: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at p75.
- Use optimized responsive images and explicit image dimensions.

## SEO and structured data

- Each indexable route needs unique title, description, canonical, H1, OG image, and breadcrumbs where appropriate.
- Generate `sitemap.ts`, `robots.ts`, and route-level metadata.
- Use valid, visible-content-supported JSON-LD only.
- Never add fake reviews, aggregate ratings, FAQ markup, or unsupported claims.
- Sanitize JSON-LD before rendering.

## Forms and analytics

- Validate forms server-side with Zod.
- Include spam controls, rate limiting, a honeypot, and optional Turnstile integration.
- Do not send sensitive form content to analytics.
- Push the approved events and parameters to the data layer.
- Preserve UTM parameters, landing page, and referrer in lead submissions.
- Support email delivery and an optional CRM webhook.

## Required verification

Before declaring work complete, run:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

Then start the dev server and verify the site in a real browser at desktop, tablet, and mobile widths. Check for console errors, broken links, horizontal overflow, focus states, form success/error states, metadata, and reduced-motion behavior.

## Work discipline

- Read all handoff documents before writing code.
- Create a written implementation plan and route checklist first.
- Implement in small, reviewable phases.
- Keep page sections data-driven and reusable without forcing every page into one generic template.
- Do not delete approved content or simplify the site architecture without recording the reason.
- When blocked only by a missing credential or brand asset, implement a safe placeholder interface and document the exact required input.

## Privacy and legal implementation

Before touching forms, cookies, analytics, or legal routes, read:

- `legal/01-FORM-AND-CONSENT-COPY.md`
- `content/pages/19-privacy.md`
- `content/pages/20-terms.md`
- `docs/16-PRIVACY-CONSENT-AND-LEGAL-IMPLEMENTATION.md`

Non-negotiable rules:

- Inquiry forms use a notice at collection, not a required “privacy consent” checkbox.
- Marketing email permission is separate, optional, and unchecked.
- The website uses a global opt-in consent banner.
- All non-essential analytics remain blocked before acceptance.
- Use basic Google Consent Mode v2.
- Do not add advertising or retargeting tags at launch.
- Honor Global Privacy Control.
- Never send form content or other personal information to analytics.
- Build `/privacy`, `/terms`, and `/privacy-request`.
- Do not launch with unresolved legal placeholders.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
