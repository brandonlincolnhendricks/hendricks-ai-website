# Content Verification Register

Nothing on this list may be published until its status is `approved` and an
approved source is recorded. Seeded from `templates/content-verification.csv` and
extended with items found while reading the approved copy in `content/pages/`.

Governing rules: `docs/12-CONTENT-GOVERNANCE.md` §6 (proof rules) and §7 (founder
claims), and `.cursor/rules/20-content-seo.mdc`.

## Status legend

- `pending` — not yet reviewed by Brandon
- `approved` — wording and source confirmed, safe to publish
- `blocked` — cannot publish; needs external permission or legal review

---

## Founder claims

| # | Claim | Proposed location | What must be verified | Status |
|---|---|---|---|---|
| F1 | "More than fifteen years inside search" | Homepage founder section, About | Exact start year and approved wording. `content/pages/01-home.md` flags this explicitly. | wording approved, start year pending |
| F2 | Homepage credibility line: "more than fifteen years of enterprise search, paid and organic acquisition, analytics, and search operating systems" | Homepage hero | The approved copy itself says "Verify the exact experience statement before publication." | wording approved, start year pending |
| F3 | SolarWinds title and dates | About | Exact title, start and end dates | approved |
| F4 | Merkle / Dentsu title and dates | About | Exact title, start and end dates, which entity | approved |
| F5 | Ahrefs advisory role | About | Current or former, approved wording | approved |
| F6 | University relationship | About | Institution, role, approved wording | pending |
| F7 | Speaking credentials | About | Named events and dates | pending |
| F8 | "Brandon personally architects Hendricks engagements" | Homepage founder section | Confirm this remains accurate as the firm scales | pending |
| F9 | Job title — "Search Intelligence Engineer" | Homepage, About, `Person` JSON-LD | Confirm this is the title to publish | approved |

### Resolution log — 2026-08-17

Source: the canonical career record in
`~/claudecode/CLAUDE-md-templates/brandon-facts.md` (confirmed by Brandon
2026-08-15), corroborated by the retired hendricks.ai `/about` page
(`~/Archive/archived-2026-06-03/Hendricks.AI/hendricks-ai-website/app/about/page.tsx`,
Nov 2025), which was publicly published under this positioning.

- F3 — **approved.** SolarWinds, **Global Search and Innovation Lead**,
  **Apr 2024 to Sep 2025**. Confirmed by Brandon 2026-08-17. Four competing
  titles existed for this one role: the LinkedIn header (published), the body
  text of that same entry ("Global Senior Search Lead"), "Global Director of
  Search" (`brandon-facts.md`), and "Director of Search" (retired Nov 2025
  site). The last three are rejected.
- F4 — **approved.** **Merkle**, **Global Paid Search Director**, **Jan 2022 to
  Dec 2023**. Confirmed by Brandon 2026-08-17. The title is paid-search
  specific; "Global Search Director" overstates scope and is not published.
  Recorded as a single employer, not "Merkle and Dentsu".

> **`brandon-facts.md` corrected 2026-08-17.** The canonical career record had
> the wrong title for both roles and no dates. It now carries the verbatim
> LinkedIn titles and dates plus the Ahrefs advisory entry. Any deliverable
> that reused the old titles is wrong and should be re-checked.

> **Coverage gap.** The three recovered LinkedIn entries span Jan 2022 onward
> only. They do not evidence F1/F2's "more than fifteen years", which depends on
> roles before 2022 that have not been recovered.
- F9 — **approved.** "Search Intelligence Engineer" was already the published
  founder title on the retired site, in both visible copy and `Person` JSON-LD.
- F1 / F2 — the "more than fifteen years" wording appeared on both retired
  pages and remains true, so it is safe to publish. The exact start year is
  still unrecorded. Note the phrase has been carried unchanged since Nov 2025
  and will understate the number over time; revisit when the start year lands.
- F5 — **approved.** Ahrefs Customer Advisory Board, Mar 2025 to Present, so
  **current**, not former. One of thirteen members. Source: LinkedIn.
- F6 — **still pending.** No university relationship appears on either retired
  page. Nothing recovered; this needs Brandon directly.
- F7 — **still pending.** The retired page listed speaking *topics* only, with
  no named event or date. That is the exact unsupported form F7 guards against.
- F8 — not addressed by the recovered sources.

C1 remains blocked and no client or employer logo is used. No client brand is
named in the experience section, including brands reached through a former
employer.

Per `docs/12` §7, where relationship context matters the copy must state whether
work occurred through employment, agency, consulting, or direct Hendricks
engagement.

## Client and brand assets

| # | Item | Proposed location | What must be verified | Status |
|---|---|---|---|---|
| C1 | Any client or employer logo | About, Results | Written permission and correct relationship context. A client name may not be used merely because Brandon worked with it through a former employer (`docs/12` §6). | blocked |
| C2 | Testimonials | Results | Attribution, role, relationship, written permission | blocked |
| C3 | Case study metrics | Results | Baseline, intervention, timeframe, measurement source, limitations, permission | blocked |

`showResults` stays `false` until at least two verified case studies exist, or one
verified case study plus one clearly labeled research experiment.

## Imagery

| # | Item | Proposed location | What must be verified | Status |
|---|---|---|---|---|
| I1 | Founder portrait | Homepage founder section, About | Approved original photograph and final alt text | pending |
| I2 | Portrait resolution ceiling | Homepage, About | **Known limitation.** Best available source is 1024×819 landscape, cropped to ~660×819. Founder columns are sized to ~380px so this covers 2×. Replace when a photographer re-export is available. No AI upscaling. | pending |
| I3 | Wordmark provenance | Global | Confirm Hendricks owns the wordmark artwork and typeface licensing permits web use as artwork | pending |

## External venture

| # | Item | Proposed location | What must be verified | Status |
|---|---|---|---|---|
| E1 | The Search Economy description | About page only, founder biography | Final approved description. Approved wording is in `docs/01` §13 and `docs/12` §8. | pending |

Hard constraints, from `docs/10` §2. The Search Economy must be absent from
Solutions, primary navigation, and the footer; must never be described as a
Hendricks research arm; must have no Hendricks route; must appear only in
Brandon's founder context on About; and must link externally to
`https://thesearcheconomy.com`.

The `check:content` script fails the build if any Search Economy reference appears
outside `/about`.

## Pricing claims

**Decided 2026-08-16 (Brandon): fees are disclosed in conversation, not published.**
This resolves P1–P3 and matches `docs/01` §15, which excludes a public pricing
calculator, and `docs/03` §2, which excludes a pricing nav item. `/diagnostic`
describes the fee as fixed and scope-based, and `/for-brands` lists engagement types
without amounts. A unit test asserts no currency figure reaches `/diagnostic`.

| # | Item | Proposed location | Decision | Status |
|---|---|---|---|---|
| P1 | Diagnostic fee | `/diagnostic` | Withheld. Page states a fixed fee set by scope rather than hours, and lists the eight scope factors that determine it. | resolved — withheld |
| P2 | 90-Day Program fee | `/for-brands` | Withheld. Engagement type described without an amount. | resolved — withheld |
| P3 | Managed Search Intelligence monthly fee | `/for-brands` | Withheld. Engagement type described without an amount. | resolved — withheld |

If this reverses, the figures live in `content/pages/07-diagnostic.md` and
`content/pages/09-for-brands.md` and would need re-transcribing into the content
objects; the guard test in `tests/unit/page-content.test.ts` ("publishes no
price until it is approved") would need removing at the same time.

## Legal

| # | Item | Proposed location | What must be verified | Status |
|---|---|---|---|---|
| L1 | Privacy notice | `/privacy` | Approved copy supplied 2026-08-16 and published verbatim. Counsel review of the privacy language is still outstanding (docs/16 §14). | approved — pending counsel review |
| L2 | Website terms | `/terms` | Approved copy supplied 2026-08-16 and published verbatim. Venue resolved to Harris County, Texas by Brandon. Counsel review of liability and venue is still outstanding. | approved — pending counsel review |
| L3 | Form consent language | `/diagnostic`, `/contact`, `/privacy-request` | Resolved by `legal/01-FORM-AND-CONSENT-COPY.md`. Forms now carry a notice at collection and a separate, unticked marketing opt-in; submitting is not treated as consent to marketing. | approved |
| L4 | Cookie and consent banner | Global | Resolved by `docs/16`. Opt-in banner, Privacy Choices modal, Consent Mode v2 defaults, and Global Privacy Control support are built. No third-party CMP is used. | approved |
| L5 | AI crawler policy | `robots.ts` | Approved 2026-08-17, source Brandon decision: all AI crawlers are allowed, both search discovery and training. `docs/06` §7 required this to be decided in policy rather than silently in code; `robots.ts` now names both classes explicitly, each named group repeating the wildcard's disallow list. | approved |
| L6 | `privacy@hendricks.ai` and `legal@hendricks.ai` | `/privacy`, `/terms`, `/privacy-request` | Both addresses are published in the legal copy. They must exist and be monitored before launch. | blocked — mailboxes not confirmed |
| L7 | Vendor list, CRM provider, and retention settings | `/privacy` §"Additional U.S. State Disclosures" and §"How We Share" | The notice describes categories rather than named vendors. Confirm the actual processors, the CRM, and the retention periods match what is written. | pending |
| L8 | Privacy request workflow | `/privacy-request` | Requests are validated, rate limited, and given a case reference, but delivery is stubbed pending a mailbox. Confirm who works the queue and the response deadline. | blocked on L6 |

## AI system scope and category vocabulary

Two decisions Brandon took on 2026-08-17 govern how the site may name AI systems
and how it may use the GEO and AEO vocabulary. They are recorded here rather than
only in the pages that shipped with them, because they bind every page, FAQ
answer, and deliverable that names an AI system or an optimization practice,
including ones not yet written.

| # | Item | Applies to | Decision and source | Status |
|---|---|---|---|---|
| A1 | Which AI systems Hendricks observes | Every page, FAQ answer, and deliverable that names an AI system | Hendricks observes exactly four systems: Google AI Overviews, ChatGPT, Perplexity, and Gemini. The list is closed, so no "including", "such as", or "among others" may precede it. Google AI Mode and Microsoft Copilot may be named as surfaces that exist in the information environment, and must never be described as systems Hendricks measures, tests, monitors, or reports on. Gemini was added by Brandon decision 2026-09-01, when the Answer Index corpus measured it alongside the original three; the original three-system list was Brandon decision 2026-08-17. | approved |
| A2 | GEO and AEO as entry vocabulary, not positioning | `/what-is-generative-engine-optimization`, `/what-is-ai-mediated-search`, the three FAQ sections | Bridge, do not adopt. The terms are used in titles, direct answers, and headings so the pages can be retrieved for what buyers actually type, and the framing is then argued to be incomplete and the reader routed to Search Intelligence Engineering. Hendricks is not a GEO or AEO vendor, and no page may describe a Hendricks service as GEO or AEO work. Source: Brandon decision 2026-08-17. | approved |

The copy those two decisions unlocked was written by the implementation, not
supplied as approved copy. That distinction is the point of the next three rows.

| # | Item | Location | What must be verified | Status |
|---|---|---|---|---|
| A3 | Two new definition pages | `/what-is-ai-mediated-search`, `/what-is-generative-engine-optimization` | Implementation-authored copy, not transcription. Every other object in `src/content/pages/` was transcribed from approved markdown that existed first. These two were written alongside their markdown twins, `content/pages/22-what-is-ai-mediated-search.md` and `content/pages/23-what-is-generative-engine-optimization.md`, on the same day, so the twin corroborates the code but is not an independent approval. Brandon's editorial review is owed on every visitor-facing string. | authored 2026-08-17, pending editorial review |
| A4 | 17 FAQ answers | `/solutions/search-demand-intelligence` (5), `/solutions/selection-intelligence` (6), `/solutions/search-impact-measurement` (6) | The questions are approved copy and were not reworded. The answers are new. Each was written from material already published on the same page rather than from any new fact, but none has been read by Brandon. Detail in the FAQ sections table below. | questions approved, answers authored 2026-08-17 and pending editorial review |
| A5 | External platform documentation as a cited source | `/what-is-ai-mediated-search`, `/what-is-generative-engine-optimization` | A scoped extension of the sources posture, and the first external sources this site cites. The other four definition pages state the Hendricks position and correctly cite nothing, and the only other outbound link in `src/content/` is the external-venture link on `/about`, which is not a citation. These two describe the observable behaviour of systems Hendricks does not control, which is permitted only where the platform's own documentation carries the claim, so every such claim is sourced to first-party documentation: Google Search Central, OpenAI, and Perplexity. No blog, vendor study, analyst figure, or statistic is cited. Gemini and Microsoft Copilot are named on both pages without a citation, correctly: neither page says anything about what either product does, and naming a public product as part of the environment is not a claim that needs a source. A citation for a surface Hendricks does not observe would also read, in a reference list, as evidence of an engagement that does not exist. Every URL was fetched 2026-08-17, resolves without redirecting, and needs re-checking at each review. | posture approved, URLs verified 2026-08-17 |

### Resolution log, 2026-09-01

Source for the A1 amendment: Brandon decision, 2026-09-01, recorded during the
Answer Index publication session. Gemini becomes the fourth observed system.
Consequences, all shipped in the same change: `src/content/shared/observed-systems.ts`
flips the Gemini row and rewords the canonical sentence and exclusion;
`tests/unit/shared-content.test.ts` pins the four-system boundary; the four
published research articles render the changed sentence, so each carries a dated
update paragraph in its corrections section and an updated-date bump. The change
is a scope widening, not a correction: the prior sentence was true when
published, so it is logged on each page rather than entered in the corrections
log, which is reserved for claims that were wrong.

The fifth research article, `/research/the-answer-index`, publishes figures from
runs run-2026-09-01T022903Z and run-2026-09-01T014944Z against panel v2.0, sha
7a15060d8b5ec5f6, read from the verified-figures file `data/report_data.json` in
the answer-index workspace. Same-day, three formal corrections landed in the
corrections log, all tracing to one parser defect in the probe's Google AI
Overviews reading during the 2026-08-19 window, with the new corpus cited as
corroboration rather than cause.

### Resolution log, 2026-08-17

Source for A1 and A2: Brandon decision, 2026-08-17. Those are the only new facts
approved on that date and neither may be extended by inference.

- Both decisions exist because the corpus was lexically sealed. At commit `HEAD`
  before this change, `git grep` over `src/content/pages/` returned zero
  occurrences of Perplexity, Gemini, Copilot, "AI Overviews", Bing, "generative
  engine", and "answer engine", and the only two occurrences of ChatGPT were
  dismissals: "Before tracking ChatGPT mentions" on Search Demand Intelligence,
  and "Guaranteed ChatGPT citations" in the Diagnostic's not-designed-for list. A
  page cannot be retrieved for a word it does not contain, so this was a
  candidate-set problem that no amount of schema or heading work could reach.
- A1 is a ceiling, not a floor. It caps what may be claimed. It does not oblige
  any page to name all three systems, and it does not make naming a fourth
  product wrong, only claiming coverage of one.
- A3 and A4 are recorded so a later reader cannot mistake authored copy for
  transcribed approved copy. The rest of `src/content/pages/` carries the stronger
  provenance and says so in each file's header comment; these do not.
- Reachability, since an unlinked page is an orphan whatever its content. Both new
  pages sit in `footerNavigation.research`, which renders on every route, so each
  has a sitewide internal link. Both are linked from
  `/what-is-search-intelligence-engineering`, which carries the site's only
  GEO/AEO comparison row. `/what-is-ai-mediated-search` is additionally linked
  from `/ai-selection-problem`, which argues from AI-mediated search throughout
  and never defines it, and from the GEO page.
- `/solutions` is left as the one top-level commercial page linking to no research
  page. Its content object has no `related` array and its page file renders no
  related block, so closing that needs both, and neither was in scope here. The
  gap and the two-part fix are recorded in the header comment of
  `src/content/pages/solutions.ts`.

## FAQ sections

Three approved pages carry a "FAQ topics" list: questions supplied without
answers. `docs/12` §6 and `AGENTS.md` forbid inventing the answers, so these
sections shipped unrendered until 2026-08-17, when all 17 answers were authored
against material already published on the same pages and mirrored into the
approved markdown. The questions were not reworded. The answers are new and are
the subject of row A4 above.

No `FAQPage` JSON-LD is emitted for any of them, and none may be added. `docs/06`
§10 forbids adding it automatically, and Google deprecated FAQ rich results for
most sites, so the sections ship as visible question-shaped headings only. The
shared renderer, `src/components/sections/faq-section.tsx`, emits no structured
data, which means a page cannot acquire it as a side effect of rendering
questions.

| # | Source | Location | Topics | Status |
|---|---|---|---|---|
| Q1 | `content/pages/03-search-demand-intelligence.md` §"FAQ topics" | `/solutions/search-demand-intelligence` | 5 questions, incl. how demand is estimated when AI prompts are not publicly reported | questions approved, 5 answers pending editorial review |
| Q2 | `content/pages/04-selection-intelligence.md` §"FAQ" | `/solutions/selection-intelligence` | 6 questions, incl. personalization handling and which AI systems are tested | questions approved, 6 answers pending editorial review |
| Q3 | `content/pages/06-search-impact-measurement.md` §"FAQ topics" | `/solutions/search-impact-measurement` | 6 questions, incl. correlation versus causation and self-reported attribution | questions approved, 6 answers pending editorial review |

Q2's "Is this the same as AI rank tracking?" and Q3's correlation-versus-causation
question are category-defining answers. Both carry the risk of overclaiming, so
their wording needs the same scrutiny as a metric definition. Q2 also carries the
answer that states A1's observed-systems scope to a buyer, which makes it the
highest-consequence paragraph of the 17.

## SEO copy

| # | Item | Proposed location | What must be verified | Status |
|---|---|---|---|---|
| S1 | Two approved title tags exceed the width Google renders | `/solutions` (85 chars), `/diagnostic` (78 chars) | Both are transcribed verbatim from the approved copy and are published as written. Confirm whether to shorten them or accept SERP truncation. | pending |
| S2 | `/how-it-works` title ends "\| How It Works" rather than "\| Hendricks" | `/how-it-works` | The only page whose approved title does not close on the brand. Confirm intentional. | pending |

## Internal links to unbuilt routes

Nothing links to a 404: `src/config/routes.ts` marks each unbuilt route
`built: false`, navigation and related-content lists filter on it, and CTAs whose
approved destination is unbuilt fall back through `ctaHref`.

Four of the six editorial routes shipped in Phase 6. Their references resolved
automatically — no copy changed, because the approved destinations were recorded
in the content objects from the start and the gate simply opened.

| # | Approved destination | Referenced from | Current behaviour | Status |
|---|---|---|---|---|
| R1 | `/methodology` | All four solution pages, `/how-it-works`, `/diagnostic`, `/for-agencies`, `/ai-selection-problem`, homepage measurement CTA, footer | Live. Homepage CTA reverted from its `/solutions/search-impact-measurement` fallback | resolved |
| R2 | `/what-is-selection-intelligence` | `/solutions/selection-intelligence`, `/solutions/search-impact-measurement`, homepage distinction CTA, footer | Live. Homepage CTA reverted from its `/solutions/selection-intelligence` fallback | resolved |
| R3 | `/what-is-search-intelligence-engineering` | `/solutions/search-demand-intelligence`, `/solutions/search-presence-engineering`, footer | Live | resolved |
| R4 | `/ai-selection-problem` | `/solutions/selection-intelligence`, footer | Live | resolved |
| R5 | `/research` | Footer, 404 page | Footer column now renders the four definition pages and omits the hub | blocked on Sanity credentials |
| R6 | `/corrections` | Footer legal row | Filtered | blocked — no approved copy exists for this route |
| R7 | `/privacy`, `/terms` | Footer legal row, both form notices, consent banner and modal | Live | resolved |
| R8 | `/privacy-request` | Footer legal row, `/privacy` | Live, and deliberately excluded from the sitemap and from indexing (docs/16 §9). It is a destination for people who already have a reason to be there, not a search result. | resolved |

`docs/03` §6 asks each solution page to link at least two relevant research pages.
That is now satisfied on all four, and a unit test enforces it. Two of them —
`/solutions/search-presence-engineering` and `/solutions/search-impact-measurement`
— shipped Phase 4 with only one editorial link and were corrected in Phase 6.

## Definition page review dates

Each definition page publishes a "last reviewed" date, because a reader cannot
judge whether a definition is current without one (`docs/03`, definition page
template). The date is stored in each content object as `sources.reviewed`, and
`src/app/sitemap.ts` reads that same constant rather than keeping a second copy,
so the visible date and the advertised date cannot drift apart.

| # | Item | Current value | What must be confirmed | Status |
|---|---|---|---|---|
| D1 | Last-reviewed date on the four original definition pages | 2026-08-16 | This is the date the approved copy was transcribed, not a date Brandon reviewed the substance. Either confirm it or supply the real review date. | pending |
| D2 | Who owns the review cycle and how often | not stated | The pages claim to be revised as platform behaviour changes. Decide the interval, or soften the claim. | pending |
| D3 | Last-reviewed date on the two entry-vocabulary pages | 2026-08-17 | These two were authored on 2026-08-17 rather than transcribed on 2026-08-16, so the later date is a real content diff rather than a freshness stamp. It still records authorship, not review: like D1 it becomes a review date only once A3 clears. Both pages also cite external documentation (A5), which gives them a stronger reason than the other four to carry a short review interval once D2 is decided. | pending on A3 |

## Organization structured data

Per `docs/06` §8, these `Organization` fields may only be emitted once verified:

| # | Field | Status |
|---|---|---|
| O1 | Founding date | pending |
| O2 | Public business address | pending |
| O3 | Public contact point | pending |
| O4 | `sameAs` official profiles | pending |

Until approved, the homepage `Organization` node emits only name, URL, logo, and
founder.

---

## Homepage redesign copy

Every line the redesign's `04-homepage-narrative-and-copy.md` marks new or
variant, with the approved line it replaces. Until a row is `approved` the
homepage renders that approved line instead; the mechanism is
`src/content/gate.ts` and `check:content` enforces both halves of it (redesign
handoff 4.7 rule 9). Rows are grouped by the station that renders them.

`F2` above governs the hero proof line and is not repeated here: while its row
is not `approved` the numberless variant ships (CANON R5; 04 decision 6).

| # | Claim | Proposed location | What must be verified | Status |
|---|---|---|---|---|
| H1 | Eyebrow "Search Intelligence Engineering for the AI Era." with H1 "Engineer the path from customer demand to brand selection." | Homepage hero | 04 decision 1 and CANON R1. Replaces the eyebrow "Search Intelligence Engineering" and the H1 "Search Intelligence Engineering for the AI Era." The SEO title does not change. | pending |
| H2 | Lead sentence 2: "Hendricks finds the customer decisions worth winning, measures whether your brand is considered across Google and AI search, engineers the conditions your brand controls, and connects the work to pipeline and revenue." | Homepage hero | 04 decision 2. Replaces the approved sentence at `home.ts` "Hendricks maps the questions and decisions that drive your market...". | pending |
| H3 | Boundary and audience paragraph, including the noun "a specialist consultancy and engineering partner" | Homepage hero | 04 decisions 3 and 23. "Consultancy" appears in no approved copy and sits one adjective from three blocked descriptors. The alternative is "Hendricks is a Search Intelligence Engineering firm, not software and not an SEO agency." | pending |
| H4 | Definer under the primary CTA: "A fixed-scope engagement of approximately three to four weeks that establishes where your brand is losing consideration and what to change first." | Homepage hero | 04 decision 4. Adds to the hero; compresses two approved sentences on /diagnostic. Nothing renders while pending. | pending |
| H5 | Secondary CTA label "See the Demand-to-Selection System" | Homepage hero | 04 decision 5. Replaces "See What Hendricks Actually Does". | pending |
| H6 | H2 "The most important search loss may happen before a customer visits your website." | Homepage, the loss before the click | 04 decision 7. The locked core problem moves from the H2 to the body, unchanged. | pending |
| H7 | Contrast line "Traditional search measured whether a brand ranked. Hendricks measures and engineers whether a brand becomes a legitimate choice." | Homepage, the loss before the click | 04 decision 8. Replaces the approved closing line "Most organizations have major blind spots across that path." | pending |
| H8 | H2 "Find the gap. Change the conditions. Measure what happens." with the lead naming the Demand-to-Selection System | Homepage, the system | 04 decision 9. Replaces the approved H2 and the approved supporting sentence. | pending |
| H9 | The four one-line phase summaries | Homepage, the system | 04 decision 10. Each compresses the approved phase description it replaces. Phase names, business questions and output names are approved and are not gated. | pending |
| H10 | The Trust rung, the "How Hendricks knows" column, and the citation note | Homepage, beyond visibility | 04 decision 13 and CANON R3. While pending the ladder is the approved seven rungs and their questions, with no third column. | pending |
| H11 | Eyebrow "Evidence and Outputs", H2 "Decisions, not another dashboard.", and the closing line about evidence classes | Homepage, evidence and outputs | 04 decision 15. While pending the approved sentence is the H2 and no lead renders beneath it. | pending |
| H12 | The eight artifact decision lines | Homepage, evidence and outputs | 04 decision 11 and the messaging register. No approved sentence exists for several of these artifacts. While pending each figure renders its plate number, name and drawing without a decision line. | pending |
| H13 | For Brands headline, body sentence 2, and the CTA label "Explore Hendricks for Brands" | Homepage, audience pathways | 04 decision 17. The headline is approved on /for-brands and is a variant of the approved homepage sentence "Turn fragmented search investment into a path to selection." | pending |
| H14 | For Agencies headline "Add Search Intelligence to your agency without building the entire capability in-house." | Homepage, audience pathways | 04 decision 18. Approved on /for-agencies; a variant of the approved homepage sentence. | pending |
| H15 | H2 "We separate what is observed, inferred, measured, and tested." | Homepage, how Hendricks knows | 04 decision 16. One word changed from the approved "proven", so the headline matches the four labels beneath it. | pending |
| H16 | H2 "Begin with evidence, not an open-ended retainer." | Homepage, the entry point | 04 decision 19. Replaces the approved "Direct engagements begin with a fixed-scope diagnostic, not an open-ended retainer." | pending |
| H17 | Delivery-model line "Every engagement runs on the Demand-to-Selection System, a published method with one question and one named output at each stage." | Homepage, the founder note | 04 decision 20. New framing around the approved sentence "Each stage has one question and one named output." Ships in place of F8, which stays pending. | pending |

## AI Visibility Check copy

Requested by Brandon 2026-09-07: "something on the homepage like a lead
generation tool where they can check to see their AI visibility status live,
once that is completed that client gets real results and I get an email to add
to my CRM". The instrument is `/ai-visibility-check` with a one-field station
on the homepage. The copy is new and makes no client claim, publishes no
result and no fee; the only figures on the page are read from the published
Answer Index study. The rows below are the wording review Brandon owes before
the branch merges. None of these strings is held by the compiler gate in
`src/content/gate.ts`, which covers the homepage redesign lines only.

| # | Item | Location | What must be verified | Status |
|---|---|---|---|---|
| V1 | Page copy: hero, direct answer, "How to read it", "Scope", "Questions people ask", closing | `/ai-visibility-check`, `content/pages/31-ai-visibility-check.md` | Wording. The direct answer says the check uses "the same engine adapters and the same citation parser as The Answer Index"; that is true of the port in `src/lib/visibility-check/engines.ts` and must stay true if either side changes. | pending |
| V2 | Form and result strings: labels, hints, submit, pending line, the seven error messages, the cell words, the legend, "Hendricks reviews every reading by hand and follows up by email." | `/ai-visibility-check` | Wording, and that the follow-up sentence describes what Brandon will actually do with each row in the CRM sheet. | pending |
| V3 | Homepage station: "Free AI Visibility Check", "Is your brand in the answer?", the lead, "Your website", "Check my AI visibility", the foot line | Homepage station 1a | Wording. The station collects only a website address, so it carries no notice at collection; confirm with counsel that this reading of `legal/01` holds. | pending |
| V5 | Two inbound related-list entries pointing at the check: "One brand read across the observed systems, free, with its denominators." on `/ai-visibility-tool-or-partner`, and "Whether one brand is named or cited on these surfaces, read in one run." on `/what-is-ai-mediated-search` | Both pages and their markdown mirrors | Wording, and that a free reading is the right next step to offer a reader of each. Added 2026-09-07 because the check otherwise had one internal link, from the footer, which is not enough for a page meant to be found. Neither entry calls it an audit and neither implies it is the Diagnostic. | pending |
| V4 | The Answer Index figures quoted on the page: Perplexity self-agreement 0.900, Google AI Overviews 0.622, the 38-minute repeat | `/ai-visibility-check`, "Why did the reading change" | Read from `/research/the-answer-index` (run-2026-09-01T014944Z against run-2026-09-01T022903Z). Approved by derivation if the study's figures stand; re-check if the study is corrected. | pending |

Operational notes recorded with the rows: the run costs roughly $0.70 in
DataForSEO fees (the ChatGPT endpoint is $0.07 of every $0.09 per question);
the site refuses runs above `VISIBILITY_CHECK_DAILY_CAP` per UTC day and three
per visitor per day; and the notice at collection on the form is the Diagnostic
application's approved sentence, verbatim.
