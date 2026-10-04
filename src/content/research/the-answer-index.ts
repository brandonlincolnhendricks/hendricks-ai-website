import type { ChangeEntry } from '@/content/shared/publication-record'
import type { RelatedEntry } from '@/components/canvas/related-list'
import type { Cta } from '@/components/ui/cta'
import type { DataTableColumn, DataTableRow } from '@/components/ui/data-table'
import type { MetricDefinition } from '@/components/visuals/metric-definitions'
import type { ResearchDataset } from '@/content/research/types'
import { routes } from '@/config/routes'
import { siteConfig } from '@/config/site'
import {
  observedSystemsExclusion,
  observedSystemsSentence,
} from '@/content/shared/observed-systems'

/**
 * The Answer Index. The fifth research article and the first from the
 * 480-question corpus, mirrored into content/pages/30-the-answer-index.md.
 *
 * Provenance. Every figure on this page is read from two named runs of the
 * Hendricks answer-index instrument, run-2026-09-01T022903Z (the corpus) and
 * run-2026-09-01T014944Z (the repeat round behind the self-agreement figures),
 * against panel v2.0, sha 7a15060d8b5ec5f6. The verified-figures file the page
 * was written from is data/report_data.json in the answer-index workspace, and
 * the full corpus ships as an open data package under the same name as this
 * page, including one row per citation event, so every figure here can be
 * recomputed without re-running the panel.
 *
 * Three decisions are load-bearing.
 *
 * 1. THIS PAGE IS THE FIRST TO REPORT FOUR ENGINES. CONTENT_VERIFICATION A1 was
 *    amended by Brandon decision 2026-09-01 to add Gemini as the fourth
 *    observed system, and `src/content/shared/observed-systems.ts` carries the
 *    change. The four sibling research pages render the shared sentence and
 *    their updated dates moved with it.
 *
 * 2. THE ELEVEN-CLASS SOURCE TABLE IS DELIBERATELY ABSENT. The corpus carries a
 *    full classification of 7,775 domains, produced by a local model. A blind
 *    audit of 60 domains found 28 percent disagreement by domain and 32 percent
 *    weighted to citation mass, so the class table is withheld and only the
 *    provider versus non-provider split is published, as a floor, with the
 *    audit stated beside it. Errors Found carries the audit.
 *
 * 3. SIX FINDINGS FROM FIFTY-SIX CANDIDATES. Two analysis rounds produced 56
 *    candidate findings. Each was handed to an independent reviewer instructed
 *    to refute it by recomputing the number from the raw run file and hunting
 *    for a confound or a denominator mismatch. Forty were refuted and are not
 *    on this page. The corrections section records the count so a reader knows
 *    the six that remain are survivors rather than selections.
 */

export const meta = {
  title: 'ChatGPT Cited No Source on Six of Ten Question Types | Hendricks',
  description:
    'A research experiment. Hendricks sent the same 480 questions across eight industries to four AI answer engines and recorded 16,069 citations across 7,775 domains. ChatGPT cited a source in 72 of 480 answers, 69 of them on two of the ten question types, and no engine agreed with another engine anywhere near as much as it agreed with itself 38 minutes later.',
} as const

export const hero = {
  eyebrow: 'Research Experiment',
  title:
    'Four Engines, 480 Questions, 16,069 Citations. ChatGPT Cited Nothing on Six of Ten Question Types.',
  lead: [
    'Hendricks sent the same 480 questions to Google AI Overviews, ChatGPT, Perplexity, and Gemini in one capture on 2026-09-01 and recorded every source each engine cited. The questions cover eight industries, sixty questions each, split evenly across ten question types, so the mix of question types is identical in every industry. 1,919 of 1,920 probes returned a measurement, and the answers cited 16,069 sources across 7,775 distinct domains.',
    'The sharpest reading is ChatGPT’s. It cited at least one source in 72 of its 480 answers, and 69 of those 72 sit in two of the ten question types: who provides something, and what it costs. On the other six types, 48 questions each across all eight industries, it cited nothing at all, while writing answers averaging 2,303 characters.',
  ],
  primaryCta: {
    label: 'See how Hendricks produces a number',
    href: routes.methodology.path,
    analytics: { location: 'tai_hero' },
  } satisfies Cta,
} as const

/**
 * The results gate, in visible copy. CONTENT_VERIFICATION.md holds `showResults`
 * at false until two verified case studies exist, or one verified case study
 * plus one clearly labeled research experiment. This block renders immediately
 * under the hero and may not be moved below the fold, shortened into a footnote,
 * or replaced with a badge.
 */
export const experimentLabel = {
  label: 'Research experiment',
  title: 'This is a research experiment, not a case study.',
  body: [
    'There is no client here, no intervention, and no control. Hendricks sent a fixed, published question panel to four engines once, recorded the sources each cited, and repeated two of the engines 38 minutes later to measure how much of their own reading survives a re-ask. Nothing was changed and nothing was held back for comparison, so no result on this page can be attributed to any action by anyone.',
    'It is published under the standard Hendricks applies to client work, including the parts that are uncomfortable. The run ids, the denominators, a source classifier that failed its own blind audit badly enough to have its output withheld, and the forty candidate findings that were refuted before publication are all on the page.',
  ],
} as const

/**
 * Element 1, first half. One self-contained passage that survives being lifted
 * out of the page, because being lifted is what this page is for.
 */
export const directAnswer = {
  term: 'The finding',
  answer:
    'In one capture on 2026-09-01, Hendricks sent the same 480 questions, spanning eight industries and ten question types, to Google AI Overviews, ChatGPT, Perplexity, and Gemini, and recorded 16,069 citations across 7,775 distinct domains. ChatGPT cited a source in 72 of 480 answers, and 69 of those 72 sit in two question types, provider discovery and cost; on six of the ten types it cited nothing in any industry. The engines barely share sources: the strongest pair, Perplexity and Google AI Overviews, overlaps at a mean per-question Jaccard of 0.181, while Perplexity re-asked the same questions 38 minutes later agrees with itself at 0.900. Reddit appears in 68.1 percent of Perplexity’s answers while holding 4.45 percent of its citations, which are different measures and diverge that far. YouTube appears in 47.0 percent of the 462 rendered AI Overview panels. 5,201 of the 7,775 cited domains, 67 percent, were cited exactly once. Sites owned by companies that sell the thing being asked about hold 54.0 percent of all citations, ranging from 64.5 percent in healthcare to 27.0 percent in education, published as a floor because the classifier behind it carries a measured 28 percent audit disagreement. Every figure is read from run-2026-09-01T022903Z against panel v2.0, and the full corpus is published as an open data package so each one can be recomputed. One capture of one panel shows what appeared. It shows nothing about why any engine retrieved or did not.',
} as const

/** Element 1, second half. */
export const executiveSummary = {
  eyebrow: 'Executive Summary',
  title: 'What 1,919 measured answers say about how four engines cite',
  body: [
    'The four engines are not four views of one ranking. They are four different supply chains. The strongest agreement between any two engines on the same questions is a mean per-question overlap of 0.181, and every pair involving ChatGPT sits at 0.020 or below. Perplexity, re-asked the same 240 questions 38 minutes later, agreed with itself at 0.900, and Google AI Overviews at 0.622. An engine resembles itself far more than it resembles any other engine at the same instant, which is the measured case against averaging them into one score.',
    'ChatGPT mostly does not search. It cited a source in 15.0 percent of its 480 answers, and the pattern is not noise: 73 percent of provider-discovery questions and 71 percent of cost questions carried citations, against zero of 48 on each of six other question types, in every industry. When it searched, its answers averaged 6,194 characters; when it did not, 2,303. The other three engines cited on 93 to 100 percent of their answers.',
    'Presence and mass diverge, and Reddit is where they diverge most. Reddit appears somewhere in 68.1 percent of Perplexity’s answers, the most of any domain on any engine, while holding 4.45 percent of Perplexity’s 7,350 citations, because Perplexity cites about fifteen sources per answer. The citation surface is overwhelmingly tail: 67 percent of all cited domains appear exactly once in the corpus, and the average domain is cited 2.1 times.',
    'Who holds the answer is a property of the market. Provider-owned sites, the companies that sell the thing being asked about, hold 64.5 percent of citations in healthcare and dental and 27.0 percent in education and training, with six industries in between. The spread is the finding: no row of that table can be assumed to transfer to an industry that is not in it, and the honest use of this page is as a design to run on your own market rather than a table to copy.',
  ],
} as const

/** Element 2. */
export const keyFindings = {
  eyebrow: 'Key Findings',
  title: 'Six findings from one corpus, forty candidates refuted on the way',
  lead: 'Every figure below is read from run-2026-09-01T022903Z, with the two self-agreement figures read against the repeat round run-2026-09-01T014944Z. Two analysis rounds produced 56 candidate findings; independent reviewers instructed to refute them killed 40; these are six of the survivors.',
  items: [
    {
      number: '01',
      name: 'No engine resembles another engine as much as it resembles itself.',
      description:
        'On questions both engines answered, the mean per-question Jaccard overlap of cited domains is 0.181 for Perplexity and Google AI Overviews (462 questions), 0.151 for Perplexity and Gemini (480), 0.151 for Gemini and Google AI Overviews (462), and 0.020 or below for every pair involving ChatGPT. Against that, Perplexity re-asked the same questions 38 minutes later agreed with itself at 0.900 over 240 questions, and Google AI Overviews at 0.622 over 201 rendered panels. ChatGPT and Gemini were not re-run, so no self-agreement is claimed for them. A brand competing for a place in one engine’s answers is largely not competing in the others’.',
    },
    {
      number: '02',
      name: 'ChatGPT cited a source in 72 of 480 answers, and the question type decides it.',
      description:
        'Provider discovery: 35 of 48 answers carried at least one citation. Cost: 34 of 48. Comparison: 2 of 48. Alternatives: 1 of 48. Selection criteria, explainer, problem diagnosis, timing, trust and credentials, and definition: 0 of 48 each, across all eight industries. Because the question-type mix is identical in every industry, this is a property of the question type and not of any industry. Citing answers averaged 6,194 characters against 2,303 for non-citing ones. The uncited answers were not failures; the engine answered at length from the model rather than from retrieved pages, and a brand cannot be cited in an answer that cites nobody.',
    },
    {
      number: '03',
      name: 'Appearing in most answers is not the same as taking most of the links.',
      description:
        'Reddit appears in 68.1 percent of Perplexity’s 480 answers and holds 4.45 percent of its 7,350 citations. In Google AI Overviews it appears in 38.3 percent of 462 rendered panels and holds 5.59 percent of 3,164 citations. Presence answers whether a source is in the room; mass answers how much of the room it holds; most reporting in this category quotes the first and implies the second. Reddit is nonetheless the only domain in the top eight most-present sources of all four engines, which makes it a fixture of these answers without being an incumbent in them.',
    },
    {
      number: '04',
      name: 'Google AI Overviews attach video at a rate no other engine approaches.',
      description:
        'YouTube appears in 47.0 percent of the 462 rendered AI Overview panels, against 8.1 percent of Gemini answers, 2.3 percent of Perplexity answers, and zero ChatGPT answers. This is the one finding on the page that depends on no classification judgment, because youtube.com is matched by an exact published rule. It is also the finding most exposed to the vendor caveat recorded under Errors Found, because it rests on what the SERP API reported inside the panel.',
    },
    {
      number: '05',
      name: 'The citation surface is overwhelmingly tail.',
      description:
        '7,775 distinct domains filled 16,069 citation slots, and 5,201 of them, 67 percent, were cited exactly once in the entire corpus. The average domain is cited 2.1 times. The engines differ sharply in breadth: Perplexity drew on 4,788 distinct domains at about 15.3 per answer, Gemini on 3,579 at 10.6, Google AI Overviews on 1,977 at 7.4 per rendered panel, and ChatGPT on 368 at 7.1 across its 72 citing answers. A given site’s realistic expectation of being cited on any single probe is low, and the useful question is whether the kind of page it publishes is the kind the engine reaches for.',
    },
    {
      number: '06',
      name: 'Provider-owned sites hold the majority of citations in six of eight industries, and the spread is enormous.',
      description:
        'Sites owned by companies that sell the thing being asked about hold 64.5 percent of citations in healthcare and dental, 64.4 in B2B SaaS, 64.3 in professional services, 60.0 in home services, 57.6 in automotive, 49.8 in retail, 43.7 in consumer finance, and 27.0 percent in education and training. Pooled, 54.0 percent. These figures are published as a floor: the classifier behind them carries a measured 28 percent blind-audit disagreement, but only 7 of the 60 audited domains crossed the provider boundary and six of the seven moved toward provider. The eleven-class breakdown is withheld entirely. Eight industries are eight instances, not a sample of all industries.',
    },
  ],
  closing: [
    'A seventh number belongs beside these six rather than among them. A broader definition of commercial that also counts directories, lead-generation marketplaces, and agency comparison content reaches 71.4 percent of citation mass. This page reports the narrower provider-owned figure, because a directory is not the company the question was about, and the wider figure is stated here so nobody has to discover it in the data package.',
  ],
} as const

/** Element 3. Every unit the evidence counts, defined before it is counted. */
export const definitions = {
  eyebrow: 'Definitions',
  title: 'The eleven terms every number here depends on',
  lead: 'Read these before the tables. The difference between a probe that errored, an answer that cited nothing, and a panel that never rendered is the difference between three findings on this page, and a bare count collapses all three.',
  items: [
    {
      name: 'Engine',
      definition:
        'One AI answer system a run sends questions to. Four are covered here: Google AI Overviews, ChatGPT, Perplexity, and Gemini. All four were reached through a commercial search-data vendor’s API, which is not the same surface as any consumer app; the scope statement under Limitations carries the consequences.',
    },
    {
      name: 'Cell',
      definition:
        'One question sent to one engine in one run. 480 questions across four engines produce 1,920 cells. 1,919 returned a measurement; the one that did not is named in the sample section and excluded from every denominator rather than counted as a zero.',
    },
    {
      name: 'Measured cell',
      definition:
        'A cell where the engine returned a usable response. A measured cell that cites nothing and an errored cell look similar in a result file and mean opposite things, so they are counted separately everywhere on this page.',
    },
    {
      name: 'Citation-eligible cell',
      definition:
        'A measured cell that could have cited a source. 1,902 of the 1,919 measured cells are eligible; the 17 excluded are Google AI Overview probes where no panel rendered, because an overview that never renders cannot cite anyone, and folding those into a citation rate reports a sourcing result where the finding was the absence of the surface.',
    },
    {
      name: 'Rendered panel',
      definition:
        'A Google AI Overview probe in which the answer panel actually appeared: 462 of 479 measured AI Overview cells. Every AI Overview share on this page is computed against rendered panels, and the render rate is published rather than absorbed.',
    },
    {
      name: 'Cite event',
      definition:
        'One distinct domain cited in one cell, counted once however many links to it the answer carried. The corpus holds 16,069 cite events. Counting once per answer makes every share answer how often a source gets into an answer rather than rewarding engines that emit more links.',
    },
    {
      name: 'Presence',
      definition:
        'The share of an engine’s citation-eligible cells in which a domain appears at least once. Presence answers whether a source is in the room.',
    },
    {
      name: 'Mass',
      definition:
        'A domain’s share of every cite event an engine produced. Mass answers how much of the room a source holds. Presence and mass diverge sharply on engines that cite many sources per answer, and finding 03 exists because reporting either alone misleads.',
    },
    {
      name: 'Question type',
      definition:
        'One of ten fixed shapes a buyer’s question can take: provider discovery, comparison, cost, selection criteria, explainer, problem diagnosis, timing, trust and credentials, definition, and alternatives. Every industry carries six questions of each type, so the mix is identical everywhere and a difference between industries cannot be a difference in the questions asked.',
    },
    {
      name: 'Provider-owned domain',
      definition:
        'A domain owned by a company that sells the thing the question is about, whether a national brand or an independent operator. Directories, lead-generation marketplaces, review platforms, publishers, forums, and agency comparison content are not provider-owned, however commercial they are.',
    },
    {
      name: 'Self-agreement',
      definition:
        'The mean per-question Jaccard overlap between the domains an engine cited in the first round and the domains the same engine cited for the same question 38 minutes later. It is the yardstick the cross-engine overlaps are read against, and it exists only for the two engines that were re-run.',
    },
  ] satisfies readonly MetricDefinition[],
} as const

const corpusColumns = [
  { key: 'measure', header: 'Measure', rowHeader: true },
  { key: 'value', header: 'Run 2026-09-01T022903Z' },
] as const satisfies readonly DataTableColumn[]

const corpusRows = [
  { measure: 'Questions', value: '480, fixed and published before the run' },
  { measure: 'Engines', value: '4' },
  { measure: 'Industries', value: '8, sixty questions each' },
  { measure: 'Question types', value: '10, six per industry, identical mix everywhere' },
  { measure: 'Cells sent', value: '1,920' },
  { measure: 'Cells measured', value: '1,919' },
  { measure: 'Cells that errored', value: '1' },
  { measure: 'Citation-eligible cells', value: '1,902' },
  { measure: 'AI Overview probes with no rendered panel', value: '17 of 479' },
  { measure: 'Cells citing at least one source', value: '1,458' },
  { measure: 'Cite events', value: '16,069' },
  { measure: 'Distinct domains cited', value: '7,775' },
  { measure: 'Domains cited exactly once', value: '5,201, or 67 percent' },
] as const satisfies readonly DataTableRow[]

const engineColumns = [
  { key: 'engine', header: 'Engine', rowHeader: true },
  { key: 'eligible', header: 'Eligible cells' },
  { key: 'citing', header: 'Cells citing a source' },
  { key: 'rate', header: 'Citation rate' },
  { key: 'events', header: 'Cite events' },
  { key: 'perAnswer', header: 'Sources per citing cell' },
  { key: 'domains', header: 'Distinct domains' },
] as const satisfies readonly DataTableColumn[]

const engineRows = [
  { engine: 'Perplexity', eligible: '480', citing: '480', rate: '100.0 percent', events: '7,350', perAnswer: '15.3', domains: '4,788' },
  { engine: 'Gemini', eligible: '480', citing: '476', rate: '99.2 percent', events: '5,042', perAnswer: '10.6', domains: '3,579' },
  { engine: 'Google AI Overviews', eligible: '462 rendered panels', citing: '430', rate: '93.1 percent', events: '3,164', perAnswer: '7.4', domains: '1,977' },
  { engine: 'ChatGPT', eligible: '480', citing: '72', rate: '15.0 percent', events: '513', perAnswer: '7.1', domains: '368' },
] as const satisfies readonly DataTableRow[]

const chatgptColumns = [
  { key: 'shape', header: 'Question type', rowHeader: true },
  { key: 'cited', header: 'Answers citing a source' },
  { key: 'rate', header: 'Rate' },
] as const satisfies readonly DataTableColumn[]

const chatgptRows = [
  { shape: 'Provider discovery', cited: '35 of 48', rate: '72.9 percent' },
  { shape: 'Cost', cited: '34 of 48', rate: '70.8 percent' },
  { shape: 'Comparison', cited: '2 of 48', rate: '4.2 percent' },
  { shape: 'Alternatives', cited: '1 of 48', rate: '2.1 percent' },
  { shape: 'Selection criteria', cited: '0 of 48', rate: '0.0 percent' },
  { shape: 'Explainer', cited: '0 of 48', rate: '0.0 percent' },
  { shape: 'Problem diagnosis', cited: '0 of 48', rate: '0.0 percent' },
  { shape: 'Timing', cited: '0 of 48', rate: '0.0 percent' },
  { shape: 'Trust and credentials', cited: '0 of 48', rate: '0.0 percent' },
  { shape: 'Definition', cited: '0 of 48', rate: '0.0 percent' },
] as const satisfies readonly DataTableRow[]

const agreementColumns = [
  { key: 'pair', header: 'Pair', rowHeader: true },
  { key: 'overlap', header: 'Mean per-question Jaccard' },
  { key: 'questions', header: 'Questions' },
] as const satisfies readonly DataTableColumn[]

const agreementRows = [
  { pair: 'Perplexity and Google AI Overviews', overlap: '0.181', questions: '462' },
  { pair: 'Perplexity and Gemini', overlap: '0.151', questions: '480' },
  { pair: 'Gemini and Google AI Overviews', overlap: '0.151', questions: '462' },
  { pair: 'Perplexity and ChatGPT', overlap: '0.020', questions: '480' },
  { pair: 'Gemini and ChatGPT', overlap: '0.013', questions: '476' },
  { pair: 'Google AI Overviews and ChatGPT', overlap: '0.011', questions: '430' },
  { pair: 'Perplexity against itself, 38 minutes later', overlap: '0.900', questions: '240' },
  { pair: 'Google AI Overviews against itself, 38 minutes later', overlap: '0.622', questions: '201' },
  { pair: 'ChatGPT against itself', overlap: 'Not measured', questions: 'Not re-run' },
  { pair: 'Gemini against itself', overlap: 'Not measured', questions: 'Not re-run' },
] as const satisfies readonly DataTableRow[]

const presenceColumns = [
  { key: 'engine', header: 'Engine', rowHeader: true },
  { key: 'redditPresence', header: 'Reddit presence' },
  { key: 'redditMass', header: 'Reddit mass' },
  { key: 'youtubePresence', header: 'YouTube presence' },
  { key: 'youtubeMass', header: 'YouTube mass' },
] as const satisfies readonly DataTableColumn[]

const presenceRows = [
  { engine: 'Perplexity', redditPresence: '68.1 percent', redditMass: '4.45 percent', youtubePresence: '2.3 percent', youtubeMass: '0.15 percent' },
  { engine: 'Gemini', redditPresence: '11.5 percent', redditMass: '1.09 percent', youtubePresence: '8.1 percent', youtubeMass: '0.77 percent' },
  { engine: 'Google AI Overviews', redditPresence: '38.3 percent', redditMass: '5.59 percent', youtubePresence: '47.0 percent', youtubeMass: '6.86 percent' },
  { engine: 'ChatGPT', redditPresence: '2.9 percent', redditMass: '2.73 percent', youtubePresence: '0.0 percent', youtubeMass: '0.00 percent' },
] as const satisfies readonly DataTableRow[]

const providerColumns = [
  { key: 'industry', header: 'Industry', rowHeader: true },
  { key: 'share', header: 'Provider-owned share of citations' },
  { key: 'events', header: 'Cite events' },
] as const satisfies readonly DataTableColumn[]

const providerRows = [
  { industry: 'Healthcare and dental', share: '64.5 percent', events: '2,035' },
  { industry: 'B2B SaaS', share: '64.4 percent', events: '2,060' },
  { industry: 'Professional services', share: '64.3 percent', events: '2,113' },
  { industry: 'Home services', share: '60.0 percent', events: '1,982' },
  { industry: 'Automotive', share: '57.6 percent', events: '1,952' },
  { industry: 'Retail and consumer', share: '49.8 percent', events: '1,904' },
  { industry: 'Consumer finance', share: '43.7 percent', events: '1,955' },
  { industry: 'Education and training', share: '27.0 percent', events: '2,068' },
  { industry: 'All eight industries pooled', share: '54.0 percent', events: '16,069' },
] as const satisfies readonly DataTableRow[]

/** Element 4, the counted half. */
export const data = {
  eyebrow: 'The Data',
  title: 'One corpus, read five ways',
  lead: 'The shape of the whole corpus, what each engine contributed, where ChatGPT searched, how much any two engines agree against how much each agrees with itself, and who holds the answer by industry.',
  tables: [
    {
      id: 'corpus-shape',
      caption: 'The shape of the corpus in run 2026-09-01T022903Z, four engines combined.',
      columns: corpusColumns,
      rows: corpusRows,
    },
    {
      id: 'by-engine',
      caption: 'What each engine contributed in run 2026-09-01T022903Z.',
      columns: engineColumns,
      rows: engineRows,
      summary:
        'Citation rate is cells citing a source over citation-eligible cells. Google AI Overviews is measured over its 462 rendered panels; the other three over 480 answers each. ChatGPT’s sources-per-cell and distinct-domain figures rest on its 72 citing answers.',
    },
    {
      id: 'chatgpt-by-type',
      caption: 'ChatGPT answers citing at least one source, by question type, 48 answers per type.',
      columns: chatgptColumns,
      rows: chatgptRows,
      summary:
        'The denominator is 48 answers per question type, six in each of eight industries. Because the type mix is identical in every industry, the zeroes are a property of the question type and not of any industry.',
    },
    {
      id: 'cross-engine-agreement',
      caption: 'Cross-engine agreement against self-agreement, mean per-question Jaccard of cited-domain sets.',
      columns: agreementColumns,
      rows: agreementRows,
      summary:
        'Each cross-engine row is computed on the questions both engines answered, with Google AI Overviews counted only where a panel rendered. The two self-agreement rows are read against repeat round run-2026-09-01T014944Z, which covered the original 240 questions on two engines 38 minutes earlier. ChatGPT and Gemini were not re-run, and the two Not measured rows exist so that gap is in the table rather than only in the prose.',
    },
    {
      id: 'presence-vs-mass',
      caption: 'Presence against mass for the two most-present domains in the corpus, reddit.com and youtube.com.',
      columns: presenceColumns,
      rows: presenceRows,
      summary:
        'Presence is the share of the engine’s citation-eligible cells containing the domain. Mass is the domain’s share of every cite event the engine produced. ChatGPT presence is computed over all 480 of its answers and its mass over its 513 cite events.',
    },
    {
      id: 'provider-by-industry',
      caption: 'Provider-owned share of cite events by industry, four engines pooled, published as a floor.',
      columns: providerColumns,
      rows: providerRows,
      summary:
        'Provider-owned means the site of a company selling the thing being asked about, national brand or independent operator. The classifier behind this table carries a measured 28 percent blind-audit disagreement by domain, 32 percent weighted to citation mass; only 7 of 60 audited domains crossed the provider boundary and six of the seven moved toward provider, which is why the figures are a floor. The eleven-class breakdown is withheld.',
    },
  ],
  note: [
    'These tables record which sources these answers cited. They are facts about the answers and nothing else. They are not a ranking of firms, they carry no judgment about any company behind a domain, and no page on this site publishes one.',
    'A domain is counted once per answer, never once per link, and every share on this page is computed against exactly one denominator, stated beside it. The analysis code asserts at runtime that no table mixes two denominators and that every printed share recomputes from its own numerator and denominator, because a prior internal pass published shares computed against one denominator while printing another, and an assertion is more reliable than care.',
    'Every figure is read from run-2026-09-01T022903Z against panel v2.0, sha 7a15060d8b5ec5f6, with the self-agreement figures read against run-2026-09-01T014944Z. The full corpus ships as an open data package under this report’s name, including one row per cite event, the complete panel, the classification of every domain with how it was assigned, and the 60-domain blind audit, so every figure on this page can be recomputed without re-running the panel.',
  ],
} as const

/**
 * The series record (decision D-C, 2026-09-02).
 *
 * The Answer Index is quarterly, so it is a repeatable series rather than a
 * single capture, and the edition label and package version may now render. No
 * next-capture date renders, because none has been scheduled: printing one
 * would promise a date nobody has committed to.
 */
export const series = {
  name: 'The Answer Index',
  edition: 'Edition 1, September 2026',
  packageVersion: 'v2026.09.1',
  cadence: 'Quarterly',
  labels: {
    edition: 'Edition',
    packageVersion: 'Package version',
    cadence: 'Cadence',
    dataDoi: 'Data DOI',
    latestVersion: 'Latest version',
    keywords: 'Dataset keywords',
    access: 'Access',
    relatedSolution: 'Related solution',
  },
  dataDoi: {
    label: '10.5281/zenodo.22242103',
    href: 'https://doi.org/10.5281/zenodo.22242103',
  },
  latestVersionDoi: {
    label: '10.5281/zenodo.22242102',
    href: 'https://doi.org/10.5281/zenodo.22242102',
  },
} as const

/** Optional downloads. The page is canonical; these travel. */
export const downloads = {
  eyebrow: 'Downloads',
  title: 'Take the report and the data with you',
  lead: 'This page is the canonical version of the study. These are the same figures in forwardable and recomputable form, and the data package here is byte-identical to the copy archived at Zenodo.',
  items: [
    {
      cta: {
        label: 'Download the report (PDF, 13 pages)',
        href: '/research/the-answer-index/the-answer-index-2026-09.pdf',
        external: true,
        analytics: { location: 'tai_download_pdf' },
      } satisfies Cta,
      note: '917 KB. The six findings with their denominators, the limits, and the citation block, composed for print and forwarding.',
    },
    {
      cta: {
        label: 'Download the data package (ZIP, 19 files)',
        href: '/research/the-answer-index/the-answer-index-2026-09-v2026.09.1.zip',
        external: true,
        analytics: { location: 'tai_download_data' },
      } satisfies Cta,
      note: '333 KB. The full 480-question panel, one row per citation event, every domain\u2019s classification with how it was assigned, the 60-domain blind audit, the methodology, and per-file SHA-256 digests. md5 9a0a18ef97e7dcafe41e07c2ce19d804, matching the Zenodo copy exactly.',
    },
    {
      cta: {
        label: 'Cite the dataset at its DOI',
        href: 'https://doi.org/10.5281/zenodo.22242103',
        external: true,
        analytics: { location: 'tai_download_doi' },
      } satisfies Cta,
      note: 'The permanent identifier for this data release. DOI 10.5281/zenodo.22242102 always resolves to the latest version.',
    },
  ],
} as const

/**
 * The archived data release behind this study (17 S-10).
 *
 * All values are transcribed from the visible cite-this block and the downloads
 * section so the Dataset node and the page carry identical text. The licence is
 * Creative Commons Attribution 4.0, stated on the Zenodo record. The version
 * DOI is the identifier for this specific release; the concept DOI always
 * resolves to the latest version.
 *
 * `contentSize` values are the byte counts of the files served from public/:
 * 938,854 bytes for the PDF and 341,101 bytes for the ZIP, both verified by
 * the sha256 check in the types contract.
 */
export const dataset: ResearchDataset = {
  name: 'The Answer Index, Edition 1, September 2026',
  description:
    'The full 480-question panel from run-2026-09-01T022903Z: one row per citation event, the complete panel, every domain classification with how it was assigned, the 60-domain blind audit, the methodology, and per-file SHA-256 digests.',
  version: series.packageVersion,
  keywords: [
    'AI-mediated search',
    'Search Intelligence Engineering',
    'Selection Intelligence',
    'agentic search',
    'AI retrieval',
    'source selection',
  ],
  isAccessibleForFree: true,
  doi: {
    label: '10.5281/zenodo.22242103',
    href: 'https://doi.org/10.5281/zenodo.22242103',
  },
  latestVersionDoi: {
    label: '10.5281/zenodo.22242102',
    href: 'https://doi.org/10.5281/zenodo.22242102',
  },
  license: {
    name: 'Creative Commons Attribution 4.0 International',
    href: 'https://creativecommons.org/licenses/by/4.0/',
  },
  temporalCoverage: '2026-09-01',
  variableMeasured: [
    'Citation presence',
    'Citation count per answer',
    'Source domain',
    'Source classification',
    'Engine',
    'Question',
  ],
  distribution: {
    contentUrl: '/research/the-answer-index/the-answer-index-2026-09-v2026.09.1.zip',
    encodingFormat: 'application/zip',
    contentSize: 332804,
    sha256: '907962013e73c2acb306f61b46035d63ea00f57dfc03641c1a6f032dafc9e93a',
  },
} as const

/**
 * Element 4, the checked half. Every entry states the verification method and
 * the date.
 */
export const errorsFound = {
  eyebrow: 'Errors Found',
  title: 'A classifier that failed its audit, a vendor payload with a known defect, and forty findings that did not survive',
  lead: 'Three disclosures, each with its method and date. They are published because a firm selling measurement discipline does not get to show only the parts that worked.',
  items: [
    {
      number: '01',
      name: 'The source classifier disagrees with a blind audit on 28 percent of domains, so its class table is withheld.',
      description:
        'The 7,775 cited domains were classified into eleven source classes by a locally run language model. Verified on 2026-09-01 by a blind audit: 60 domains, stratified by citation mass, were independently re-classified without sight of the model’s answers, and the two disagreed on 17 of 60, 28 percent by domain and 32 percent weighted to the citation mass of the corpus, with the errors concentrated in exactly the classes a reader would use to argue that independent editorial sources hold the answer. The eleven-class table is therefore not published anywhere, on this page or off it. The provider versus non-provider split survives the audit, because only 7 of the 60 crossed that boundary and six of the seven moved toward provider, and it is published as a floor with the audit stated beside it. The 60 domains and both classifications ship in the data package.',
    },
    {
      number: '02',
      name: 'The AI Overview payload this instrument reads has previously reported panel presence wrongly in both directions.',
      description:
        'Google AI Overview figures are read from a commercial SERP API rather than from a rendered browser. In client-side work with the same vendor during August 2026, the payload was observed to report a panel absent when a browser showed one and present when a browser did not, in separate incidents. Nothing in this corpus independently verifies panel presence, so every AI Overview figure on this page, including the 96.5 percent render rate and the 47.0 percent YouTube attachment rate, is directional pending a browser-screenshot control run. The caveat is repeated beside the affected findings rather than stated once and left behind.',
    },
    {
      number: '03',
      name: 'Forty of fifty-six candidate findings were refuted before publication.',
      description:
        'Two analysis rounds produced 56 candidate findings. Each was handed to an independent reviewer instructed to refute it rather than confirm it, by recomputing the headline number from the raw run file and hunting for a confound, a denominator mismatch, or a claim that outran the measurement. Verified continuously across 2026-09-01, the day of the corpus. Forty were refuted, including an earlier version of the provider figure that pooled a broader commercial definition into the seller number and an earlier headline that conflated Reddit’s presence with its mass. The six findings above are what survived, and the refusal count is published so the survivors are read as survivors.',
    },
  ],
  closing: [
    'The first disclosure removed a table from this page. The second downgrades two published figures to directional. The third is the reason the page is six findings rather than fourteen. None of the three is a reason to trust the remainder less; each is the check that makes the remainder worth publishing.',
  ],
} as const

/** Element 5. */
export const methodology = {
  eyebrow: 'Methodology',
  title: 'How these numbers were produced',
  lead: 'The instrument is a first-party probe that records the sources each engine cited, one question at a time, per engine, through a commercial search-data vendor’s API. It is the same class of instrument Hendricks points at a client engagement.',
  items: [
    {
      number: '01',
      name: 'Send one fixed, hashed panel to every engine in the same capture, and name the runs.',
      description:
        'All 480 questions went to all four engines inside one capture, so a difference between engines cannot be a difference in timing or wording. The panel is versioned and hashed, v2.0, sha 7a15060d8b5ec5f6, and published verbatim in the data package. Every figure names its run: run-2026-09-01T022903Z for the corpus, run-2026-09-01T014944Z for the repeat round. Run files are immutable and keyed by run id, because a figure that cannot name its run cannot be checked.',
    },
    {
      number: '02',
      name: 'Hold the question-type mix identical in every industry. This is the study’s control.',
      description:
        'Each of the eight industries carries the same ten question types at six questions each. A difference in source composition between two industries is therefore attributable to the industry rather than to the questions asked, and a question-type effect, such as ChatGPT’s, can be separated from an industry effect. Without this, the industry table would be unfalsifiable.',
    },
    {
      number: '03',
      name: 'Write questions in assistant voice, not keyword voice, and publish them.',
      description:
        'The panel is written as a person would put questions to an assistant, with no branded or navigational queries, and local intent named in the question text using four fixed metros rather than inferred from the requesting network address. A panel written in search-keyword form measures what an engine does with a keyword and then gets reported as what an assistant does with a question, which are different behaviors. Question phrasings were seeded from real search-suggestion data before authoring.',
    },
    {
      number: '04',
      name: 'Count a domain once per answer, and separate errored, empty, and citing cells.',
      description:
        'A domain cited three times in one answer counts once, so shares answer how often a source enters an answer rather than rewarding link-heavy engines. A cell that errored, a cell that answered citing nothing, and a cell that cited are three outcomes, counted separately everywhere, and the one errored cell is excluded from every denominator rather than recorded as a zero.',
    },
    {
      number: '05',
      name: 'Compute Google AI Overview shares against rendered panels only.',
      description:
        'An overview that never renders cannot cite anyone. 462 of 479 measured AI Overview probes rendered a panel; every AI Overview share uses 462 or the relevant subset of it as its denominator, and the render rate is published beside the shares it conditions.',
    },
    {
      number: '06',
      name: 'Enforce one denominator per table by assertion, not by care.',
      description:
        'The analysis code refuses at runtime to emit a table whose rows mix denominators, and recomputes every printed share from its own numerator and denominator before emitting it. The assertion exists because an earlier internal pass published shares computed against one denominator while printing another, and that class of error is fatal to a page whose value is that it can be checked.',
    },
    {
      number: '07',
      name: 'Re-ask, and hand every finding to a reviewer instructed to refute it.',
      description:
        'Two engines were re-run on 240 questions 38 minutes after the first round to measure self-agreement, which is the yardstick the cross-engine overlaps are read against. Separately, all 56 candidate findings were independently recomputed from the raw run file by reviewers instructed to refute rather than confirm, and 40 fell. Both checks are disclosed in full on this page.',
    },
  ],
  closing: [
    'What this design cannot do is also part of the method. One capture cannot measure drift over days. An API surface cannot describe a logged-in consumer app. And no count of citations can say why an engine retrieved or did not. Those limits are stated below rather than discovered by a reader.',
  ],
} as const

/** Element 6. */
export const sample = {
  eyebrow: 'Sample and Date Range',
  title: 'What was sampled, and when',
  items: [
    'Subject: four AI answer engines compared against each other. No brand is the subject of this study, and no client brand, client market, client query, or client data appears anywhere in it.',
    'Date: one capture, 2026-09-01, with a repeat round the same day.',
    'Runs of record: run-2026-09-01T022903Z, the corpus, and run-2026-09-01T014944Z, the repeat round 38 minutes earlier covering the original 240 questions on Perplexity and Google AI Overviews.',
    'Engines: Google AI Overviews, ChatGPT, Perplexity, and Gemini, all reached through a commercial search-data vendor’s API.',
    'Questions: 480, fixed and hashed before the run, published verbatim in the data package. Panel v2.0, sha 7a15060d8b5ec5f6.',
    'Industries: eight, sixty questions each. B2B SaaS, home services, professional services, healthcare and dental, automotive, consumer finance, retail and consumer, education and training.',
    'Question types: ten, six per industry, identical mix in every industry.',
    'Local intent: named in the question text using four fixed metros, Phoenix, Columbus, Sacramento, and Kansas City, chosen to sit outside every Hendricks client market.',
    'Cells: 1,920 sent, 1,919 measured, 1 errored. The errored cell is Google AI Overviews on an education cost question, a vendor server error, excluded from every denominator.',
    'Citation-eligible cells: 1,902. Cells citing at least one source: 1,458. Cite events: 16,069. Distinct domains: 7,775.',
    'Geography and language: United States, English, country level, held constant across both runs.',
    'Instrument: a first-party probe.',
  ],
  note: [
    'The repeat round is half the panel on two engines. Self-agreement for ChatGPT and Gemini was not measured, and no stability claim is made for either.',
    'The corpus was built to be free of client derivation by construction: the panel was authored fresh, the metros sit outside every client market, and the account that ran the capture ran nothing else that day.',
  ],
} as const

/** Element 7. */
export const assumptions = {
  eyebrow: 'Assumptions',
  title: 'Five things this study assumes',
  items: [
    {
      number: '01',
      name: 'That a shared capture makes four engines comparable.',
      description:
        'All four engines received the same 480 questions inside one capture, which removes timing and wording as explanations for the differences reported. It does not remove everything. The engines were reached through different endpoints with different request shapes, and this study assumes those differences do not themselves manufacture the gaps it reports. That assumption is tested nowhere on this page.',
    },
    {
      number: '02',
      name: 'That the vendor API faithfully relays what each engine cited.',
      description:
        'Every figure depends on the vendor returning the citations the engine actually produced. For Google AI Overviews that assumption has already failed in both directions on panel presence in related work, which is why every AI Overview figure is directional. For the other three engines the assumption is undisclosed rather than validated.',
    },
    {
      number: '03',
      name: 'That the host is the right unit to count a source by.',
      description:
        'Every cited URL is reduced to its host, and a host cited more than once inside one answer fills a single slot. This study therefore says nothing about which page on a domain was cited, and Gemini, which returns bare hosts with no path, contributes no page-level information at all.',
    },
    {
      number: '04',
      name: 'That the panel represents how buyers actually ask.',
      description:
        'The 480 questions were authored against a fixed type frame and seeded from real search-suggestion phrasings, but they are an authored instrument, not a sample of real user traffic. A different panel with the same design would return different domains, and the design holds the type mix constant precisely so that the comparisons inside the corpus survive that.',
    },
    {
      number: '05',
      name: 'That counting once per answer is the right weight.',
      description:
        'A domain cited five times in one answer counts once. This makes presence the primary lens and understates sources that earn many links inside single answers. The mass figures exist to carry the other reading, and both are published wherever either is.',
    },
  ],
} as const

/** Element 8. */
export const limitations = {
  eyebrow: 'Limitations',
  title: 'What this corpus does not show',
  lead: 'This is a description of what four engine APIs cited on one day, under one panel, in one geography and language. It is not an experiment in the sense that would let anyone claim a cause, and nothing here tests whether any tactic produces a citation.',
  items: [
    {
      number: '01',
      name: 'APIs are not consumer apps.',
      description:
        'ChatGPT here is a model with web search enabled behind a vendor API, which is not the product people type into. The consumer app may retrieve differently, and nothing on this page describes it. The same caution applies, with different force, to all four engines.',
    },
    {
      number: '02',
      name: 'Every Google AI Overview figure is directional.',
      description:
        'The panel-presence reading comes from a vendor payload with a documented history of error in both directions, recorded under Errors Found. A browser-screenshot control run is the fix, and it has not been run on this corpus.',
    },
    {
      number: '03',
      name: 'Stability was measured for two engines, on half the panel, across 38 minutes.',
      description:
        'The 0.900 and 0.622 self-agreement figures establish that the instrument reproduces its own reading over a short interval. They say nothing about drift over days or weeks, and nothing at all about ChatGPT or Gemini, which were not re-run.',
    },
    {
      number: '04',
      name: 'The provider split rests on a classifier with a measured 28 percent audit disagreement.',
      description:
        'The figures are published as a floor for the reasons stated beside them, and the eleven-class breakdown is withheld entirely. A reader who wants the class-level story must wait for a classifier that survives its own audit.',
    },
    {
      number: '05',
      name: 'A citation is not a click, and not a recommendation.',
      description:
        'Nothing here measures referral traffic to any cited domain. A brand can also be named in an answer without being linked, and linked without being recommended; this corpus measured links. The named-without-linked gap is real, unmeasured here, and acknowledged rather than waved away.',
    },
    {
      number: '06',
      name: 'Eight industries are eight instances.',
      description:
        'The industry table describes the eight industries in the panel and is not a sample of all industries. The 27.0 to 64.5 percent spread licenses one conclusion: answer composition is market-specific, so run the reading on your own market rather than assuming any row transfers.',
    },
    {
      number: '07',
      name: 'The scope boundary.',
      description: `${observedSystemsSentence} ${observedSystemsExclusion} This page is the first in the section to report Gemini, following the boundary change recorded in the corrections log, and it reports nothing beyond the four.`,
    },
  ],
} as const

/** Elements 10 to 13. */
export const byline = {
  author: 'Brandon Lincoln Hendricks',
  authorRole: 'Search Intelligence Engineer, Hendricks',
  authorHref: siteConfig.founderPersonId,
  published: '2026-09-01',
  dataThrough: '2026-09-01',
  note: 'The published date and the data-through date are the same day because the corpus was captured, verified, and written up in one pass. The updated date moves when a figure, a method, or a limitation changes, and is not refreshed to signal activity.',
} as const

/** Element 14. */
/**
 * Item 11. The dated record. One entry, because the page has been corrected
 * zero times and says so in its own corrections prose; the row is the machine
 * readable form of that sentence rather than a second claim.
 */
export const changes: readonly [ChangeEntry, ...ChangeEntry[]] = [
  {
    date: '2026-09-01',
    kind: 'publication',
    summary:
      'First publication. Six findings from run-2026-09-01T022903Z against panel v2.0, with the 480-question corpus published as an open data package.',
  },
]

export const corrections = {
  eyebrow: 'Corrections',
  title: 'No corrections to this page yet, and forty findings that never reached it',
  body: [
    'This page has been corrected zero times. That is a statement about its age rather than about its accuracy, and it is published as a starting count so a later reader can see whether it moved.',
    'Forty candidate findings were refuted during production rather than corrected after it, including an earlier seller-share figure whose definition quietly included directories and an earlier Reddit headline that conflated presence with mass. They are recorded under Errors Found rather than quietly dropped.',
    'If a figure here is wrong, or a third party recomputes the corpus and gets a materially different result, the correction is published with its date, the original figure, the contradicting result, and what changed. Nothing on this page is quietly edited, and the updated date above moves with the correction.',
    'A firm selling measurement discipline has to be correctable in public. The corrections log carries every entry for every page in this section.',
  ],
  href: routes.corrections.path,
  fallbackHref: routes.contact.path,
  label: 'Read the corrections policy',
} as const

/** Element 15. */
export const relatedSolution = {
  eyebrow: 'Related Solution',
  title: 'Where this measurement sits in the work',
  body: [
    'What this corpus counts, whether an engine retrieved at all, which sources it reached for, and how far its reading survives a re-ask, is the ground Selection Intelligence stands on. A question an engine answers without retrieving is a question where citation work has no surface to act on. An engine that agrees with itself at 0.9 and with its neighbors at 0.18 is an engine that must be measured on its own terms, never averaged. Both facts shape how a client baseline is designed and read.',
    'The run design behind a client baseline, the context panels, the classification rule, and the evidence grade every conclusion carries are on the Methodology page.',
  ],
  ctas: [
    {
      label: 'See what a Selection Intelligence baseline covers',
      href: routes.selectionIntelligence.path,
      analytics: { location: 'tai_related_solution', solutionName: 'Selection Intelligence' },
    },
    {
      label: 'Read the Methodology',
      href: routes.methodology.path,
      analytics: { location: 'tai_related_methodology' },
    },
  ] satisfies readonly Cta[],
} as const

/** Element 9. No `citations` array. First-party measurement only. */
export const sources = {
  reviewed: '2026-09-01',
  basis:
    'This page reports first-party measurement produced by Hendricks. Every figure is read from run-2026-09-01T022903Z or, for the two self-agreement figures, run-2026-09-01T014944Z, both taken against panel v2.0, sha 7a15060d8b5ec5f6, with immutable run files keyed by run id. The full corpus is published as an open data package carrying one row per cite event, the complete panel, every domain’s classification with how it was assigned, the 60-domain blind audit, and per-file digests, so every figure on this page can be recomputed without re-running the panel. The package is archived at Zenodo under DOI 10.5281/zenodo.22242103, and DOI 10.5281/zenodo.22242102 always resolves to its latest version. The page reports no third-party research, no vendor study, and no statistic from anyone else, and therefore cites none.',
  appliedIn: [
    { label: 'the Selection Intelligence solution', href: routes.selectionIntelligence.path },
    { label: 'the Methodology', href: routes.methodology.path },
    { label: 'the Search Intelligence Diagnostic', href: routes.diagnostic.path },
  ],
} as const

export const related: readonly RelatedEntry[] = [
  {
    href: routes.researchNoSharedSourceAcrossEngines.path,
    label: 'No Shared Source Across Engines',
    description:
      'The 17-question run this corpus scales by a factor of 28, and the page whose zero-shared-domains reading the larger corpus explains rather than refutes.',
  },
  {
    href: routes.researchAnswerStabilityTwoRuns.path,
    label: 'Two Runs, Same Questions',
    description: 'The first reading of answer stability, on 20 cells. This corpus repeats the design at 441 cells.',
  },
  {
    href: routes.researchWhoGetsCitedInAiAnswers.path,
    label: 'Who Gets Cited in AI Answers',
    description: 'The structure of a citation set on an earlier run, and the first appearance of the no-incumbent finding this corpus confirms at scale.',
  },
  {
    href: routes.researchHendricksSelectionBaseline.path,
    label: 'The Hendricks Selection Baseline',
    description: 'The same instrument, read for whether one brand appeared in the answers at all.',
  },
  {
    href: routes.whatIsAiMediatedSearch.path,
    label: 'What Is AI-Mediated Search?',
    description: 'The surfaces this corpus sampled, and the table recording which of them Hendricks observes.',
  },
]

export const closing = {
  title: 'Run this reading on your own market.',
  primaryCta: {
    label: 'Start with a Search Intelligence Diagnostic',
    href: routes.diagnostic.path,
    analytics: { location: 'tai_closing' },
  } satisfies Cta,
} as const
