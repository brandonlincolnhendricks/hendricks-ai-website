import type { RelatedEntry } from '@/components/canvas/related-list'
import type { Cta } from '@/components/ui/cta'
import { routes } from '@/config/routes'

/**
 * Copy authored for this route, mirrored into content/pages/24-corrections.md.
 *
 * Provenance, stated plainly because the rest of `src/content/pages/` carries a
 * stronger one. CONTENT_VERIFICATION.md R6 recorded `/corrections` as "blocked
 * — no approved copy exists for this route", and docs/17 wave 0 item 0.4 records
 * that the block is roughly 200 words of policy rather than a missing fact. This
 * file is that policy. It was written alongside its markdown twin rather than
 * transcribed from copy that existed first, so like A3 and A4 it is authored
 * copy pending Brandon's editorial review, and the twin corroborates it without
 * approving it. Add a row to CONTENT_VERIFICATION.md when that review happens.
 *
 * Five decisions here are load-bearing.
 *
 * 1. THE LOG IS SEEDED, NOT EMPTY. docs/17 section 6.2 directs that the `/about`
 *    `alumniOf` defect be fixed and made the first entry here, and docs/17 wave
 *    0 item 0.4 repeats it: a corrections page whose first entry is the firm
 *    correcting its own structured data is worth more than an empty one. The
 *    seed entry is that fix, and it is verifiable in git: `alumniOf` was
 *    published as `['Merkle', 'Dentsu', 'SolarWinds']` in commit 2cfcb05 on
 *    2026-08-17 and reduced to `['Merkle', 'SolarWinds']` in commit 57371c6 the
 *    same day. `tests/unit/json-ld.test.ts` now pins it.
 *
 *    THE LOG NOW HOLDS SEVEN ENTRIES, NEWEST FIRST. The newest records the
 *    v2026.09.2 documentation and methodology correction to The Answer Index.
 *    The remaining six preserve the earlier research and identity corrections.
 *    Add entries at the head of the array; the page renders them in array order.
 *
 * 2. NAMING DENTSU IS THE POINT, NOT A C1 BREACH. CONTENT_VERIFICATION.md C1
 *    blocks a client or employer name used to borrow its credibility, and blocks
 *    every logo. This entry names Dentsu in order to state that Hendricks
 *    published it wrongly and removed it, which is the opposite act. The same
 *    reasoning already licenses the Search Economy mentions in the two legal
 *    documents: naming a thing to disclaim it is not presenting it as an asset.
 *    A log entry that will not say what was wrong is not a log entry. Merkle and
 *    SolarWinds are named because both are already published in the visible role
 *    timeline on /about. `src/app/llms.txt/route.ts` still names none of the
 *    three, and its test must keep passing.
 *
 * 3. THE REPORTING PATH IS /contact AND NOT A NEW MAILBOX. A
 *    `corrections@hendricks.ai` address would be an invented, unmonitored
 *    destination: CONTENT_VERIFICATION.md L6 already holds `privacy@` and
 *    `legal@` as "blocked — mailboxes not confirmed", and publishing a third
 *    unconfirmed address on the page that promises every report gets an answer
 *    would falsify the page in its own first paragraph. The contact form exists,
 *    is monitored, and already carries an "Other" routing choice.
 *
 * 4. WHAT IS LOGGED VERSUS WHAT IS FIXED. The `scope` table draws the line at
 *    whether a change alters a claim. This is what keeps the log usable: a log
 *    padded with typo fixes hides the corrections that matter, and a log that
 *    omits an overstatement because every number in it was accurate is not
 *    honest. Both halves of that rule are in the table and neither may be
 *    dropped.
 *
 * 5. NO EXTERNAL CITATION. docs/18-SOURCE-LEDGER.md approves sources per page
 *    and carries no section for this route. Every claim here is a statement
 *    about what Hendricks does, so `sources` carries no `citations` array.
 *
 * Render order the page is built against:
 *   hero, directAnswer, scope, reporting, recording, log, limitation, related,
 *   sources, closing.
 */

export const meta = {
  title: 'Corrections | Hendricks',
  description:
    'How Hendricks corrects a published error, how to report one, and the dated log of corrections made to this site.',
} as const

export const hero = {
  eyebrow: 'Editorial Policy',
  title: 'Corrections',
  lead: [
    'Hendricks publishes measurement. Measurement that cannot be corrected in public is not measurement.',
    'This page states what gets corrected, how to report an error, and what the firm did the last time it found one in its own work.',
  ],
} as const

/**
 * The extractable unit. One self-contained statement of the policy, quotable
 * without the rest of the page, and it has to carry the reporting path with it
 * or a reader who only sees this block does not know what to do.
 *
 * `term` is a policy label, not a defined term. The page emits no `DefinedTerm`
 * node, matching /ai-visibility-tool-or-partner.
 */
export const directAnswer = {
  term: 'Corrections policy',
  answer:
    'Hendricks corrects any published statement of fact that turns out to be wrong, including figures, dates, names, definitions, and the machine-readable claims a page emits in its structured data. A substantive correction is dated, described, and left visible in the log on this page rather than edited away, and anyone can report an error through the contact form.',
} as const

export const scope = {
  eyebrow: 'Scope',
  title: 'What gets logged, and what gets fixed quietly.',
  lead: 'The line is whether the change alters a claim. A change that alters a claim is logged. A change that does not is not, because a log padded with typo fixes hides the corrections that matter.',
  caption: 'How each class of change is handled.',
  columns: [
    { key: 'change', header: 'The change', rowHeader: true, width: '46%' },
    { key: 'handling', header: 'How it is handled' },
  ],
  rows: [
    {
      change:
        'A statement of fact that is wrong: a figure, a date, a name, a definition, a source, or a claim in structured data',
      handling:
        'Corrected on the page and logged here with both dates, what was published, and what changed.',
    },
    {
      change: 'A claim that is accurate but reads as more than the evidence behind it supports',
      handling:
        'Narrowed to the claim the evidence carries, and logged. Overstating is an error even when every number in the sentence is right.',
    },
    {
      change: 'A number whose method, sample, or date range was described incompletely',
      handling:
        'The description is completed and logged. The figure stands only if the completed description still supports it.',
    },
    {
      change: 'A typo, a broken link, a formatting fault, or a rewording that alters no claim',
      handling: 'Fixed without an entry.',
    },
  ],
} as const

export const reporting = {
  eyebrow: 'Reporting An Error',
  title: 'How to report an error.',
  lead: 'Use the contact form and select Other. Include enough that the claim can be checked without a reply first.',
  items: [
    'The address of the page',
    'The sentence, figure, or table cell in question',
    'What you believe is correct',
    'How you know, where that can be shared',
  ],
  closing: [
    'Every report gets one of three answers: the claim is corrected, the claim stands and the reason is given, or the claim comes off the page while it is checked.',
    'A report that produces no answer is a failure of this policy rather than a decision under it.',
  ],
  cta: {
    label: 'Open the contact form',
    href: routes.contact.path,
    analytics: { location: 'corrections_reporting' },
  } satisfies Cta,
} as const

export const recording = {
  eyebrow: 'How A Correction Is Recorded',
  title: 'Dated, described, and left visible.',
  body: [
    'A corrected page carries the correction rather than a clean version of itself. The entry states what was published, not only what replaced it, so a reader can see the claim that was wrong.',
    'Each entry records the date the claim was published, the date it was corrected, what was wrong, and what changed. Where a figure was revised, both figures appear.',
    'Structured data is in scope. A claim a visitor never reads but a machine can read is still a published claim, and the oldest entry below is one of those.',
    'Where a published Hendricks figure is contradicted by someone running the same design, the contradiction is published here beside the original figure. That case is the reason this page exists.',
  ],
} as const

/**
 * The log. Seven entries, newest first. The seed entry is per decision 1 above.
 *
 * `published` and `corrected` are ISO dates so the page can render machine
 * readable <time> elements. The newest correction fixes a package first
 * published on 2026-09-01. The dates are the same in the three August entries,
 * which is a fact about those corrections rather than a placeholder: each wrong
 * claim shipped and was corrected on the same day. The three 2026-09-01 entries
 * correct claims published on 2026-08-19, so their two dates differ.
 *
 * The two 2026-08-19 entries are separate corrections to the same page with
 * separate causes, and neither may be folded into the other. The first is a
 * destroyed record: figures that were taken from a real run whose result file a
 * scheduled job then overwrote in place, so nothing could be reproduced. The
 * second is a check run against the wrong repository. The study page's own
 * corrections section states that both are recorded here.
 */
export const log = {
  eyebrow: 'Log',
  title: 'Corrections to date.',
  lead: 'Seven entries, newest first. The log does not reconstruct changes made before this page existed.',
  /* The labels on each entry's fields. Held here so the log and any future
     rendering of it cannot label the same field differently. */
  fieldLabels: {
    published: 'Published',
    corrected: 'Corrected',
    page: 'Page:',
    claim: 'What was published',
    fault: 'What was wrong',
    change: 'What changed',
  },
  entries: [
    {
      id: 'answer-index-v2026-09-2-release-record',
      title:
        'Incomplete release metadata and audit disclosures in The Answer Index v2026.09.1 data package',
      published: '2026-09-01',
      corrected: '2026-10-04',
      page: {
        label: 'The Answer Index',
        href: routes.researchTheAnswerIndex.path,
      },
      claim:
        'Data package v2026.09.1, exact DOI 10.5281/zenodo.22242103, shipped without complete release and citation metadata, described probe completion without cleanly separating 1,920 planned probes from 1,919 measured probes, did not ship the 11 google.com retrieval-plumbing events excluded from the analytic corpus, and did not explicitly state that no independent browser-screenshot control was run or preserved for the Google AI Overview figures.',
      fault:
        'The analytic corpus and reported findings were unchanged, but the package did not expose a complete audit trail for its exclusion or state the browser-control limitation as plainly as the evidence required. Under this policy, an incomplete method or limitation description is a correction even when the published analytic totals remain unchanged.',
      change:
        'On 2026-10-04, Hendricks published data package v2026.09.2 under exact DOI 10.5281/zenodo.23132107. It adds complete release and citation metadata, distinguishes planned from measured probes, ships excluded-cite-events.csv with all 11 retrieval-plumbing events, and makes the missing browser-screenshot control explicit. No question, captured observation, source classification, analytic table, reported finding, panel version, or panel hash changed. The v2026.09.1 record remains preserved at its exact DOI.',
    },
    {
      id: 'baseline-aio-parser-bailout',
      title: 'A Google AI Overviews reading produced by a parser that discarded rendered panels, on the Hendricks Selection Baseline',
      published: '2026-08-19',
      corrected: '2026-09-01',
      page: {
        label: 'Hendricks Selection Baseline',
        href: routes.researchHendricksSelectionBaseline.path,
      },
      claim:
        'The study read Google AI Overviews as citing a source on 1 of its 13 measured cells in the 2026-08-19 run, findings 02 and 03 built conclusions on that reading, and the first correction to the page stated that the reading it draws from that number was unchanged.',
      fault:
        'The probe bailed out of any overview panel the vendor flagged as asynchronously rendered, discarding usable panels, so the engine read as nearly silent when it was not. The archived run the first correction pointed to was itself read through the defective parser, which is why this entry exists on a page that had already been corrected once for the same engine. The probe\u2019s own source now records the defect and the fix: treating the asynchronous flag alone as absence had discarded fully usable answers.',
      change:
        'The published counts stand as records of what the defective instrument read, and the conclusions built on them are corrected inline on the page: the most-answers-cited-nothing headline now holds for ChatGPT rather than for all three engines, the averaging argument now rests on the two engines that were read correctly, and the sentence in the earlier correction claiming the reading was unchanged is withdrawn by name. Corroboration rather than cause: corpus run run-2026-09-01T022903Z, taken after the parser fix, reads Google AI Overviews citing on 430 of 462 rendered panels at 6.8 sources per rendered panel.',
    },
    {
      id: 'whogets-aio-contribution',
      title: 'An engine-contribution reading resting on the same discarded panels, on Who Gets Cited in AI Answers',
      published: '2026-08-19',
      corrected: '2026-09-01',
      page: {
        label: 'Who Gets Cited in AI Answers',
        href: routes.researchWhoGetsCitedInAiAnswers.path,
      },
      claim:
        'Finding 03 read Google AI Overviews as supplying 6 domains across 6 slots and concluded that almost the entire citation set in the run came from one engine.',
      fault:
        'The same parser defect: asynchronously rendered overview panels were discarded, so the engine\u2019s contribution describes the defect rather than the engine.',
      change:
        'The counts stand as a record of the instrument; the almost-everything-from-one-engine conclusion came off, and the finding now carries the corrected reading inline with the run id of the corroborating corpus, run-2026-09-01T022903Z, which reads the engine citing on 430 of 462 rendered panels.',
    },
    {
      id: 'stability-aio-single-cell',
      title: 'A stability reading of 1.00 that was the parser defect agreeing with itself, on Two Runs, Same Questions',
      published: '2026-08-19',
      corrected: '2026-09-01',
      page: {
        label: 'Two Runs, Same Questions',
        href: routes.researchAnswerStabilityTwoRuns.path,
      },
      claim:
        'Finding 04 reported Google AI Overviews returning an identical citation set on its one comparable cell, an overlap of 1.00, and finding 01 reported agreement on whether a cell cited across all 51 comparable cells.',
      fault:
        'Twelve Google AI Overviews cells read as empty in both runs because the parser discarded asynchronously rendered panels in both, so the defect agreed with itself, and the single 1.00 cell was the one panel that escaped it, read twice.',
      change:
        'A scope note on finding 01 and a corrected reading on finding 04 are inline: no Google AI Overviews stability reading exists on that pair of runs. The later corpus rounds, run-2026-09-01T014944Z against run-2026-09-01T022903Z, read that engine\u2019s self-agreement at 0.622 over 201 rendered panels under the fixed parser.',
    },
    {
      id: 'baseline-unreproducible-run',
      title: 'Figures from a run whose record had been overwritten, on the Hendricks Selection Baseline',
      published: '2026-08-19',
      corrected: '2026-08-19',
      page: {
        label: 'Hendricks Selection Baseline',
        href: routes.researchHendricksSelectionBaseline.path,
      },
      claim:
        'The study published a 2026-08-19 run of 51 cells with all 51 measured, 19 of them citing a source, 248 distinct domains across 305 citation slots, 218 domains cited exactly once, reddit.com in 14 cells, linkedin.com in 10, and Google AI Overviews returning no sourced overview on any of the 17 questions.',
      fault:
        'Two faults. The figures came from a real three-engine run at 22:54 on 2026-08-18 that carried the 2026-08-19 date, and Hendricks destroyed that run’s result file. The probe named each result file from the client and the date alone, so the scheduled job at 06:16 on 2026-08-19 wrote over it in place. That job queries one engine and carries the alternating engine forward from the day before, so the surviving file held 32 records: 17 Perplexity cells from that morning, 15 ChatGPT cells flagged as carried forward from 2026-08-18, and no Google AI Overviews cells at all. No published figure could be reproduced from any surviving record, which disqualifies it on a page whose value is that a reader can check it. Separately, one figure was wrong on its merits: Google AI Overviews returned one sourced overview of the 17, not none.',
      change:
        'Every 2026-08-19 figure on the study is now read from run 2026-08-19-110930, archived at history/runs/hendricks-2026-08-19-110930.json with its manifest at history/runs/manifest-2026-08-19-110930.json. That run measured 47 of its 51 cells, 20 of them citing a source, across 247 distinct domains and 308 citation slots, and cited hendricks.ai in none of them. Google AI Overviews is reported at 1 of the 13 cells that returned a measurement, the other 4 of its 17 having errored. An answer reported as citing consumer software help pages rested on the destroyed file, cannot be checked against the archive, and came off the page. The 2026-08-18 run is untouched and still reproduces from its own file. The instrument changed as well: every run now writes an immutable archive keyed to a run id, plus a manifest recording which engines were queried, which were carried forward from an earlier run, and which were not run at all. Those are three different states and a bare result file cannot tell them apart after the fact.',
    },
    {
      id: 'baseline-retired-article-citation',
      title: 'A real citation reported as a citation of a page that never existed, on the Hendricks Selection Baseline',
      published: '2026-08-19',
      corrected: '2026-08-19',
      page: {
        label: 'Hendricks Selection Baseline',
        href: routes.researchHendricksSelectionBaseline.path,
      },
      claim:
        'The study said the single hendricks.ai citation in the 2026-08-18 run pointed at an address that had never existed, and counted both runs as zero citations on that basis.',
      fault:
        'The page was real. Hendricks published it on 2025-11-25, retired it on 2026-08-17 while replacing the site, and Perplexity cited it on 2026-08-18, the day after it came down. Hendricks reached the wrong conclusion by running the history check against the wrong repository. The firm has two retired sites, the check searched the one with 74 registered insight slugs and a different directory layout, did not find the address there, and stopped. The address was in the other retired site, the one belonging to this codebase. The same published sentence also said the address appeared in no list of retired addresses, and it was in that list in this site’s own source at the time.',
      change:
        'The 2026-08-18 run now reports one real citation of a retired page, and the study leads with the fact that an engine cited an article after the firm had deleted it. The 2026-08-19 run still reports zero. The study’s methodology now carries a step requiring that a claim about a Hendricks page is verified against that page, by named repository, branch, and command.',
    },
    {
      id: 'about-alumni-of',
      title: 'A third employer in the founder structured data on the About page',
      published: '2026-08-17',
      corrected: '2026-08-17',
      page: { label: 'About', href: routes.about.path },
      claim:
        'The Person structured data on the About page listed three organizations under alumniOf: Merkle, Dentsu, and SolarWinds.',
      fault:
        'The verified career record names Merkle as the single employer of record, and the visible role timeline on the same page named Merkle and SolarWinds only. The third organization existed in the markup and nowhere a reader could see it, which made it a claim about the founder that the page itself did not support.',
      change:
        'Dentsu was removed from alumniOf the same day. A unit test now asserts that every organization in alumniOf also appears in the visible role timeline, so the markup cannot again state an employer the page does not show.',
    },
  ],
} as const

export const limitation = {
  label: 'Honest limitation',
  title: 'This log begins on the day the page shipped.',
  body: [
    'Hendricks kept no public corrections log before this page. Earlier changes to the site are in version control and are not enumerated here, and nothing on this page claims there were none.',
    'The log records corrections to what Hendricks published. It is not a change log for the site, and it is not an audit performed by anyone outside the firm.',
  ],
} as const

/**
 * No `citations` array, and `appliedIn` is deliberately empty. See decision 5.
 * SourcesNote renders "This definition is applied in ..." only when that array
 * has a built entry, and the sentence would misdescribe a policy page.
 */
export const sources = {
  reviewed: '2026-10-04',
  basis:
    'This page states the Hendricks corrections policy and the corrections made to this site. It reports no third-party research and cites no external source.',
  appliedIn: [] as readonly { label: string; href: string }[],
} as const

/** The page's own outline, in the order the stations render. */
export const contents = [
  { id: 'scope', label: 'What is corrected' },
  { id: 'reporting', label: 'Reporting an error' },
  { id: 'recording', label: 'How a correction is recorded' },
  { id: 'log', label: 'The correction log' },
  { id: 'limitation', label: 'The honest limitation' },
  { id: 'sources', label: 'Sources' },
  { id: 'related', label: 'Where to go next' },
] as const

export const relatedSection = {
  eyebrow: 'Where To Go Next',
  title: 'Where to go next.',
} as const

export const related: readonly RelatedEntry[] = [
  {
    href: routes.methodology.path,
    label: 'Methodology',
    description: 'The measurement standards a published Hendricks figure is held to.',
  },
  {
    href: routes.research.path,
    label: 'Research',
    description: 'Published Hendricks measurement, with its method, sample, and stated limits.',
  },
  {
    href: routes.about.path,
    label: 'About',
    description: 'The founder record the first entry in the log corrects.',
  },
]

export const closing = {
  title: 'Found something wrong on this site? Report it, and it gets an answer.',
  primaryCta: {
    label: 'Submit a correction',
    href: routes.contact.path,
    analytics: { location: 'corrections_closing' },
  } satisfies Cta,
} as const
