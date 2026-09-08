import type { RelatedEntry } from '@/components/canvas/related-list'
import type { Cta } from '@/components/ui/cta'
import { routes } from '@/config/routes'
import {
  observedSystemsExclusion,
  observedSystemsSentence,
} from '@/content/shared/observed-systems'

/**
 * Approved copy, transcribed from content/pages/26-ai-visibility-tool-or-partner.md.
 *
 * Cluster C10, tool versus partner, verdict OWN (docs/17 §4.10). The route is
 * specified in full in docs/17 §5.3: the H1, the direct answer, and the
 * question-shaped headings below are transcribed from it rather than authored
 * here, and `directAnswer.answer` is published word for word.
 *
 * Four decisions in this file are load-bearing.
 *
 * 1. SIX HEADINGS, NOT SEVEN. docs/17 §5.3 specifies a seventh section, "What
 *    should you ask a vendor before you sign?", and states two constraints it
 *    cannot ship without. The first requires Hendricks to publish at least one
 *    vendor-evaluation criterion it currently fails, which is decision D5 in
 *    docs/17 §9. D5 records a recommendation and no decision, so the section is
 *    held rather than softened: a vetting list rewritten until it no longer
 *    needs D5 is the self-ranked listicle with better manners, which is the
 *    outcome the constraint exists to prevent. docs/17 §8.8 names the reduced
 *    form as six headings, and §5.3 records that the page is still worth
 *    building without the seventh. Adding it later is additive. Do not add it
 *    without D5.
 *
 * 2. NO `DefinedTerm` NODE. The four definition pages emit one because they
 *    define a term. This page defines nothing. `directAnswer.term` is a short
 *    decision label that renders as the eyebrow above the answer, and a
 *    `DefinedTerm` whose name is a purchase decision would be a false claim in
 *    structured data. The page component emits `webPageSchema` with
 *    `hasBreadcrumb` and `dateModified` only, and this page is deliberately
 *    absent from `definedTermSetSchema`.
 *
 * 3. NO VENDOR, NO PRODUCT, NO PRICE, EVER. docs/17 §4.10: the moment this page
 *    ranks products it becomes conceded cluster X1 and Hendricks loses. docs/17
 *    §4.11 X3 withholds every fee under CONTENT_VERIFICATION P1 to P3. The page
 *    names categories of purchase and the jobs behind them, and nothing else.
 *
 * 4. NO EXTERNAL CITATION. docs/18-SOURCE-LEDGER.md approves sources per page
 *    and has no section for this route, and docs/19 §7.2 forbids an agent citing
 *    a source the ledger does not already carry or adding one to it. Every claim
 *    here is either a statement about what a buyer can check or a statement
 *    about Hendricks, and no external document supports either. `sources` below
 *    therefore carries no `citations` array, unlike /what-is-ai-mediated-search.
 *
 * Two claims on this page rest on plausible mechanism rather than measured
 * effect and say so in the copy, as docs/17 §11 rule 8 requires: the staffing
 * inference in `buildOrBuy.closing` and the unit-change inference in
 * `afterDashboard.closing`. Neither may be promoted to a result.
 *
 * `position.body` renders the observed-systems constants from
 * src/content/shared/observed-systems.ts rather than a seventh wording of the
 * A1 boundary (docs/17 §3.5). content/pages/26-ai-visibility-tool-or-partner.md
 * carries the same two sentences as literal text, because a boundary that exists
 * only as an import has not been approved.
 *
 * Render order the page is built against:
 *   hero, directAnswer, produces, gap, monitoringVsMeasurement, buildOrBuy,
 *   afterDashboard, position, limitation, related, sources, closing.
 */

export const meta = {
  title: 'Do You Need an AI Visibility Tool or a Partner? | Hendricks',
  description:
    'What an AI visibility monitoring tool produces, what it leaves undone, and how to decide whether that work is bought as software or staffed as a capability.',
} as const

export const hero = {
  eyebrow: 'Decision',
  title: 'Do You Need an AI Visibility Tool or a Partner?',
  lead: [
    'A monitoring subscription and a delivery capability are different purchases. The first is a data feed. The second is the judgment that turns a feed into a decision.',
    'The distinction decides what a budget buys, and it is cheaper to draw before the dashboard arrives than after.',
  ],
  primaryCta: {
    label: 'Establish a baseline through the Diagnostic',
    href: routes.diagnostic.path,
    analytics: { location: 'avtop_hero' },
  } satisfies Cta,
} as const

/**
 * Published word for word from docs/17 §5.3. `term` is a decision label rather
 * than a defined term. See decision 2 in the header comment before changing it.
 */
export const directAnswer = {
  term: 'Tool or partner',
  answer:
    'A tool reports where a brand appeared. It does not decide which customer decisions were worth appearing in, judge whether an appearance amounted to being considered, or say what to change next. Those three jobs are the work, and they are done by people whether they sit inside the company or outside it. The useful question is not which tool to buy. It is which of the three jobs the organization can staff.',
} as const

/**
 * Names what the category of product outputs, and never a product. The list is
 * the whole point of the section: a set rendered as prose is the most common way
 * a good answer becomes unretrievable.
 *
 * "AI-mediated search" is defined on /what-is-ai-mediated-search (docs/17 §3.2),
 * so this section uses the term once and links rather than defining it again.
 */
export const produces = {
  eyebrow: 'What A Tool Produces',
  title: 'What does an AI visibility tool actually produce?',
  lead: 'An AI visibility tool produces a record of appearances. It runs a fixed set of prompts against AI answer surfaces on a schedule, stores what came back, and reports how often a brand was named, which competitors were named alongside it, and which sources the answers cited.',
  items: [
    'A prompt set, supplied as a template or assembled by the buyer',
    'A run schedule, and a stored record of what each run returned',
    'A count of appearances over time, by prompt and by surface',
    'The competitor names that appeared in the same answers',
    'The domains cited in those answers',
    'An alert when a count moves',
  ],
  closing: [
    'Every item on that list is a real output and none of them is a conclusion. A tool records what happened on the AI-mediated search surfaces it was pointed at, on the dates it ran.',
    'Which prompts it was pointed at, and whether an appearance was worth having, are settled by a person before the first run and after the last one.',
  ],
  cta: {
    label: 'Read What Is AI-Mediated Search?',
    href: routes.whatIsAiMediatedSearch.path,
    analytics: { location: 'avtop_produces' },
  } satisfies Cta,
} as const

/**
 * The three jobs the direct answer names, one numbered item each.
 *
 * The four-part model belongs to /what-is-selection-intelligence (docs/17 §3.3)
 * and is not restated here. `closing` is the one-line pointer plus a link that
 * docs/17 §11 rule 1 requires in its place.
 */
export const gap = {
  eyebrow: 'What A Tool Leaves Undone',
  title: 'What does a tool not tell you?',
  lead: 'A tool does not tell you three things: which customer decisions were worth appearing in, whether an appearance amounted to being considered, and what to change next. Each one is a judgment about commercial value, and a judgment is not an output a scheduler produces.',
  items: [
    {
      number: '01',
      name: 'Deciding which customer decisions are worth measuring.',
      description:
        'A prompt set is a hypothesis about what customers ask. Assembled from what is easy to track, it produces a clean number about questions no buyer with budget types. Nothing inside the tool can flag that, because the tool has no view of the market outside its own prompt list.',
    },
    {
      number: '02',
      name: 'Judging what an appearance amounted to.',
      description:
        'Being named, being described accurately, and being recommended are separate outcomes that fail for separate reasons. A count treats them as one event. Separating them is a classification decision made by a person against a rule, and the rule has to exist before the run rather than after the chart.',
    },
    {
      number: '03',
      name: 'Deciding what to change.',
      description:
        'A record of what happened carries no instruction. Moving from an observed pattern to an intervention needs a view of what the brand controls, what it does not, and which change is worth what it costs to make.',
    },
  ],
  closing:
    'Hendricks calls the discipline that does the second of those jobs Selection Intelligence. The definition page states the measures it reports and what the term does not cover.',
  cta: {
    label: 'Read What Is Selection Intelligence?',
    href: routes.whatIsSelectionIntelligence.path,
    analytics: { location: 'avtop_gap' },
  } satisfies Cta,
} as const

/**
 * A comparison, so it is a table. Each row holds one dimension with both
 * readings beside it and survives being lifted without the rest of the page.
 *
 * The Selection Intelligence versus AI rank tracking contrast is owned by
 * /what-is-selection-intelligence `versusRankTracking` (docs/17 §3.9). One
 * sentence and a link, never the contrast itself.
 */
export const monitoringVsMeasurement = {
  eyebrow: 'Monitoring And Measurement',
  title: 'What is the difference between monitoring and measurement?',
  lead: 'Monitoring reports that a number moved. Measurement states what the number is, how it was produced, and what would make it wrong, and states all three before the number exists. Monitoring is a feed. Measurement is a method, and the difference surfaces the first time somebody outside marketing asks how the figure was arrived at.',
  caption: 'Monitoring compared with measurement, by dimension.',
  columns: [
    { key: 'dimension', header: 'Dimension', rowHeader: true, width: '28%' },
    { key: 'monitoring', header: 'Monitoring' },
    { key: 'measurement', header: 'Measurement' },
  ],
  rows: [
    {
      dimension: 'What it answers',
      monitoring: 'Did anything change?',
      measurement: 'What is true, under stated conditions?',
    },
    {
      dimension: 'When the definition is written',
      monitoring: 'After the data arrives',
      measurement: 'Before the first run',
    },
    {
      dimension: 'What is known about sampling',
      monitoring: 'Whatever the schedule happened to capture',
      measurement: 'How many runs, in which contexts, on which dates',
    },
    {
      dimension: 'What a moving number means',
      monitoring: 'Undetermined until somebody interprets it',
      measurement: 'Read against a rule written in advance',
    },
    {
      dimension: 'What is published beside the number',
      monitoring: 'A chart',
      measurement: 'The definition, the sample, and the stated limits',
    },
    {
      dimension: 'What it survives',
      monitoring: 'A dashboard review',
      measurement: 'A challenge from finance',
    },
  ],
  closing: [
    'Monitoring is not a lesser product. A feed is the cheapest way to notice that something moved, and an organization that already holds the method gets real value from one.',
    'The failure mode is buying the feed in place of the method, then asking the feed a question only a method can answer.',
    'Selection Intelligence and AI rank tracking are the two disciplines the distinction separates in practice, and the definition page states the question each one asks.',
  ],
  ctas: [
    {
      label: 'See the question each discipline asks',
      href: routes.whatIsSelectionIntelligence.path,
      analytics: { location: 'avtop_disciplines' },
    },
    {
      label: 'Read the measurement methodology',
      href: routes.methodology.path,
      analytics: { location: 'avtop_method' },
    },
  ] satisfies readonly Cta[],
} as const

/**
 * The staffing question the direct answer sets up.
 *
 * No cost, no headcount figure, and no build-time estimate appears here, and
 * none may be added: CONTENT_VERIFICATION P1 to P3 withhold every fee, and
 * Hendricks has measured no build duration. The eight scope factors that set the
 * fee belong to /diagnostic `investment` (docs/17 §3.2), so `closing` points at
 * them and does not reproduce them.
 *
 * The second `closing` line is a mechanism label and is required (docs/17 §11
 * rule 8). Deleting it converts an inference into a claim.
 */
export const buildOrBuy = {
  eyebrow: 'Build Or Buy',
  title: 'Should we build AI visibility monitoring in-house or buy it?',
  lead: 'Build or buy is the second question, not the first. The three jobs a tool does not do have to be staffed either way, so the decision that matters is whether the organization can supply a demand model, a written classification rule, and an owner for the change decision. Software is bought against that answer rather than ahead of it.',
  concession:
    'Software feels like the cheaper start, because a subscription is a line item and a capability is a hire or a contract. The subscription is cheaper only where somebody already does the three jobs. Where nobody does, buying the feed first converts an unanswered question into a recurring cost and a chart nobody is accountable for reading.',
  caption: 'What to buy, by the jobs the organization can already staff.',
  columns: [
    { key: 'staffed', header: 'What the organization can staff', rowHeader: true, width: '42%' },
    { key: 'follows', header: 'What follows' },
  ],
  rows: [
    {
      staffed: 'A demand model, a written classification rule, and an owner for the change decision',
      follows: 'Buy the feed. The judgment already exists in-house and the instrument is the cheap part.',
    },
    {
      staffed: 'Two of the three',
      follows:
        'Buy the feed and contract the missing job by name. Put the name in the scope so it is somebody’s work rather than an assumption.',
    },
    {
      staffed: 'One of the three',
      follows:
        'Buy the capability first and let it choose the instrument. A feed bought ahead of the method produces reporting the organization cannot act on.',
    },
    {
      staffed: 'None of the three, and no named owner',
      follows:
        'Neither yet. There is no accountable reader for the output, and appointing one is the change that comes first.',
    },
  ],
  closing: [
    'What sets the cost of the contracted version is scope rather than hours. The Diagnostic page lists the factors that move it.',
    'One label on the reasoning above. That an organization able to staff all three jobs gets more out of the same feed is an inference from what the jobs are, not a measured relationship. Hendricks has run no study comparing outcomes across organizations that bought differently, and no statement on this page rests on one.',
  ],
  cta: {
    label: 'See what sets the scope of a Diagnostic',
    href: routes.diagnostic.path,
    analytics: { location: 'avtop_build_buy' },
  } satisfies Cta,
} as const

/**
 * The post-purchase prompt docs/17 §4.10 identifies as the cheapest lead in the
 * cluster, because the buyer has already been budget-approved once.
 *
 * The items are ordered cheapest to check first. What a Selection Intelligence
 * baseline delivers belongs to /solutions/selection-intelligence and the
 * controllable-conditions claim belongs to /solutions/search-presence-engineering
 * (docs/17 §3.2). Both are pointers here.
 *
 * The first `closing` line is a mechanism label and is required.
 */
export const afterDashboard = {
  eyebrow: 'After The Dashboard',
  title: 'Our dashboard shows mentions rising and nothing else moved. What now?',
  lead: 'A rising mention count with nothing else moving is the expected result of measuring the wrong unit, not proof that the work failed. Mentions count appearances. A business moves when a brand enters consideration for decisions that carry commercial value, and an appearance count cannot separate the two.',
  items: [
    {
      number: '01',
      name: 'The prompt set is not the market.',
      description:
        'The count rose on questions no buyer with budget asks. Check what share of the prompt set maps to a decision the business actually sells into. It is the most common cause and the cheapest to check.',
    },
    {
      number: '02',
      name: 'The appearances are mentions rather than recommendations.',
      description:
        'Being named in an answer that goes on to recommend a competitor increments the same counter as being recommended. Re-read a sample of the answers themselves rather than the count over them.',
    },
    {
      number: '03',
      name: 'The brand is named and described from weak evidence.',
      description:
        'An appearance built on outdated, thin, or contradictory sources can raise a count while lowering the odds of being chosen. Read what the answer said about the brand, not only that it said something.',
    },
    {
      number: '04',
      name: 'The movement is variance.',
      description:
        'The same question can return different answers across runs, contexts, locations, and dates. A rise observed once is not a change. A rise that survives repeated runs in the same contexts is.',
    },
    {
      number: '05',
      name: 'Nothing downstream was instrumented before the change.',
      description:
        'Where no branded-demand, site-behavior, or CRM series was recorded beforehand, there is no series in which anything could have been seen to move.',
    },
  ],
  closing: [
    'One label on the remedy. That measuring consideration instead of mentions produces a better commercial decision is an inference from the definitions rather than a measured effect. Hendricks publishes no experiment showing that a brand which changes unit performs better. What holds is narrower: the two units answer different questions, and only one of them names a decision.',
    'Which conditions a brand can actually control, and the limit on what any firm can commit to about the rest, is stated on the Search Presence Engineering page.',
  ],
  ctas: [
    {
      label: 'See what a Selection Intelligence baseline covers',
      href: routes.selectionIntelligence.path,
      analytics: { location: 'avtop_after_dashboard', solutionName: 'Selection Intelligence' },
    },
    {
      label: 'See which conditions a brand controls',
      href: routes.searchPresenceEngineering.path,
      analytics: { location: 'avtop_conditions', solutionName: 'Search Presence Engineering' },
    },
  ] satisfies readonly Cta[],
} as const

/**
 * Two paragraphs, then the page closes. docs/17 §5.3 caps this section
 * deliberately: it must not become a pitch, must not restate the Method, and
 * must not claim honesty as a differentiator. docs/17 §10 records why the last
 * of those is a trap. Major vendors in this category have published the most
 * rigorous negative results in it, and a national business publication published
 * essentially the Hendricks measurement position on 2026-08-17, so a reader
 * falsifies "we are the honest one" in a single search.
 *
 * Both boundary sentences are read from the shared constant. Do not reword
 * either, and never let a fourth system in behind them.
 */
export const position = {
  eyebrow: 'Where Hendricks Sits',
  title: 'Where does Hendricks sit?',
  body: [
    'Hendricks sits on the partner side of this decision and sells no tool. Hendricks designs the observation set against the decisions a business sells into, runs it under controlled conditions, classifies each outcome against a written rule, and reports what changed alongside what the method cannot show. The instrument is chosen to fit that design rather than the design fitted to an instrument.',
    `Two boundaries belong beside that description. ${observedSystemsSentence} ${observedSystemsExclusion} And Hendricks publishes no fee on this site, so a reader cannot price the work from this page and has to ask what a stated scope would cost.`,
  ],
  cta: {
    label: 'See which AI systems Hendricks observes',
    href: routes.whatIsAiMediatedSearch.path,
    analytics: { location: 'avtop_position' },
  } satisfies Cta,
} as const

export const limitation = {
  label: 'Honest limitation',
  title: 'This page states a position and reports no measurement.',
  body: [
    'Every claim on this page is either a statement about what a buyer can check or a statement about what Hendricks does. None of it reports a study, a survey, or a controlled test.',
    'The distinction between monitoring and measurement is definitional. Hendricks publishes no experiment showing that an organization which buys the second outperforms one that buys the first.',
    'No vendor, product, or price is named on this page, and none will be. Ranking tools credibly would require a standing test rig and repeated re-testing across a changing vendor set, which Hendricks does not run.',
  ],
} as const

/**
 * No `citations` array, deliberately. See decision 4 in the header comment.
 */
export const sources = {
  reviewed: '2026-08-19',
  basis:
    'This page states the Hendricks position on how AI visibility work is bought. It reports no third-party research, names no vendor or product, and publishes no fee.',
  appliedIn: [
    { label: 'the Selection Intelligence solution', href: routes.selectionIntelligence.path },
    { label: 'the Search Intelligence Diagnostic', href: routes.diagnostic.path },
  ],
} as const

/** The page's own outline, in the order the stations render. */
export const contents = [
  { id: 'produces', label: 'What a monitoring feed produces' },
  { id: 'gap', label: 'What it leaves undone' },
  { id: 'monitoring', label: 'Monitoring against measurement' },
  { id: 'build-or-buy', label: 'Build, buy or contract' },
  { id: 'after-dashboard', label: 'After the dashboard' },
  { id: 'position', label: 'Where Hendricks sits' },
  { id: 'limitation', label: 'The honest limitation' },
  { id: 'sources', label: 'Sources' },
  { id: 'change-history', label: 'Change history' },
  { id: 'related-terms', label: 'Related terms' },
  { id: 'related', label: 'Where to go next' },
] as const

export const relatedSection = {
  eyebrow: 'Where To Go Next',
  title: 'Where to go next.',
} as const

const CHECK_LABEL = 'AI Visibility Check'

export const related: readonly RelatedEntry[] = [
  {
    href: routes.selectionIntelligence.path,
    label: 'Selection Intelligence',
    description: 'What a consideration and recommendation baseline covers, produces, and reports.',
  },
  {
    href: routes.whatIsSelectionIntelligence.path,
    label: 'What Is Selection Intelligence?',
    description: 'The measures a baseline reports, defined before they are reported.',
  },
  /*
    The free reading, added 2026-09-07 (CONTENT_VERIFICATION V5). A reader
    deciding between a subscription and a capability is the reader most helped
    by seeing one real reading first. It is a sample, never the Diagnostic, and
    the label says check rather than audit.
  */
  {
    href: routes.aiVisibilityCheck.path,
    label: CHECK_LABEL,
    description: 'One brand read across the observed systems, free, with its denominators.',
  },
  {
    href: routes.methodology.path,
    label: 'Methodology',
    description: 'Context panels, classification, weighting, evidence grades, and the stated limits.',
  },
  {
    href: routes.whatIsAiMediatedSearch.path,
    label: 'What Is AI-Mediated Search?',
    description: 'The surfaces a monitoring tool samples, and which of them Hendricks observes.',
  },
]

export const closing = {
  title: 'Name the three jobs, and name who does each one, before choosing an instrument.',
  primaryCta: {
    label: 'Establish a baseline through the Diagnostic',
    href: routes.diagnostic.path,
    analytics: { location: 'avtop_closing' },
  } satisfies Cta,
} as const
