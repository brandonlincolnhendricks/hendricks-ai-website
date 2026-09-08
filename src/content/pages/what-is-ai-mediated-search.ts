import type { RelatedEntry } from '@/components/canvas/related-list'
import type { Cta } from '@/components/ui/cta'
import { routes } from '@/config/routes'
import {
  observedSystemRows,
  observedSystemsContext,
  observedSystemsExclusion,
  observedSystemsSentence,
} from '@/content/shared/observed-systems'

/**
 * Approved copy, transcribed from content/pages/22-what-is-ai-mediated-search.md.
 *
 * "AI-mediated search" is load-bearing vocabulary across /about, /contact,
 * /diagnostic, /solutions and /ai-selection-problem, and until this page shipped
 * the site used the term without ever defining it. This is the definition those
 * pages point at, and the one place the site names the surfaces a buyer actually
 * types: AI Overviews, AI Mode, ChatGPT, Perplexity, Gemini, Microsoft Copilot.
 *
 * Naming a public product as part of the environment is a factual statement. It
 * is not a capability claim, and the two must never be allowed to blur, so the
 * surfaces section carries a table with an explicit "Observed by Hendricks"
 * column and a block that states the observed systems in one sentence: Google AI
 * Overviews, ChatGPT, and Perplexity. Nothing here may be reworded to imply a
 * fourth.
 *
 * Render order the page is built against:
 *   hero, directAnswer, surfaces, upstream, absence, diagnosis, comparison,
 *   vocabulary, limitation, related, sources, closing.
 *
 * `absence` and `diagnosis` answer the same question `upstream` answers, in the
 * words a brand-side buyer types rather than in Google vocabulary, and they sit
 * immediately after it for that reason. They are not a third rendering of the
 * ranking contrast and must not be rewritten into one.
 *
 * `sources.citations` is new on this page and has no precedent elsewhere in
 * src/content. Every other definition page states a Hendricks position and
 * therefore cites nothing. This one describes publicly documented behavior of
 * systems Hendricks does not control, so those claims carry the platform's own
 * documentation. SourcesNote does not accept citations, so the page renders them
 * as a visible list of its own. Dropping that list would leave external claims
 * uncited, which is worse than making no claim at all.
 */

export const meta = {
  title: 'What Is AI-Mediated Search? | Hendricks',
  description:
    'AI-mediated search is search in which an AI system interprets the request and composes an answer before the click. Why a brand can rank #1 on Google and still not appear in AI answers.',
} as const

export const hero = {
  eyebrow: 'Definition',
  title: 'What Is AI-Mediated Search?',
  lead: [
    'Traditional search returned a page of links and left the comparison to the customer.',
    'AI-mediated search performs more of the interpretation, research, and comparison first, then presents a shorter set of options.',
  ],
  primaryCta: {
    label: 'Establish a baseline through the Diagnostic',
    href: routes.diagnostic.path,
    analytics: { location: 'wiams_hero' },
  } satisfies Cta,
} as const

export const directAnswer = {
  term: 'AI-mediated search',
  answer:
    'AI-mediated search is search in which an AI system interprets the request, gathers sources, and composes an answer before the person reaches a website. Instead of working through a page of ranked links, the person is presented with a composed answer, a limited set of named options, and the sources behind them.',
} as const

/**
 * The lexical core of the page. Both groups are named because both are the
 * environment. Only the table's third column says what Hendricks does about it.
 */
export const surfaces = {
  eyebrow: 'The Surfaces',
  title: 'Where does AI-mediated search happen?',
  lead: 'AI-mediated search happens in two places: inside Google Search, and inside assistant products people use as a search entry point.',
  groups: [
    {
      name: 'Inside Google Search',
      description:
        'AI Overviews and AI Mode sit inside Google Search itself rather than in a separate product. Google Search Central documents AI Overviews as helping people get to the gist of a complicated topic or question more quickly while providing a jumping off point to explore links, and AI Mode as particularly helpful for queries where further exploration, reasoning, or complex comparisons are needed.',
      items: ['AI Overviews', 'AI Mode'],
    },
    {
      name: 'Assistant products used as a search entry point',
      description:
        'The same interpretation happens inside assistant products rather than a results page. ChatGPT, Perplexity, Gemini, and Microsoft Copilot are separate products from separate companies. OpenAI and Perplexity each publish documentation describing the crawler that surfaces websites in their search results and how a site controls its access.',
      items: ['ChatGPT', 'Perplexity', 'Gemini', 'Microsoft Copilot'],
    },
  ],
  caption: 'Named AI-mediated search surfaces and whether Hendricks observes each one.',
  columns: [
    { key: 'surface', header: 'Surface', rowHeader: true, width: '30%' },
    { key: 'environment', header: 'Where it sits' },
    { key: 'observed', header: 'Observed by Hendricks' },
  ],
  // The rows and both scope sentences come from src/content/shared/observed-systems.ts,
  // which transcribed them from this page. This page stays the canonical
  // explanation (docs/17 3.5) because it is the only rendering with an
  // "Observed by Hendricks" column, but it reads the strings back out of the
  // shared module rather than holding a second copy. Otherwise the canonical
  // page is the one place the constant can silently fork from.
  rows: observedSystemRows,
  observed: {
    title: 'Which surfaces does Hendricks observe?',
    body: [
      observedSystemsSentence,
      `${observedSystemsContext} ${observedSystemsExclusion}`,
    ],
  },
} as const

/**
 * The section that answers the symptom a buyer actually types.
 *
 * The heading and lead carry the buyer's own words on purpose. Before this
 * change the corpus contained "rank #1", "number one", "top of Google", and
 * "not appear in AI answers" zero times across 18 content objects, while the
 * claim itself was stated three times in the site's own vocabulary. A page
 * cannot be retrieved for words it does not contain. Read that as a
 * precondition for retrieval, never as a lever: the property does not
 * distinguish cited pages from uncited ones, only this corpus from every page
 * that has the words at all.
 *
 * The third sentence of the lead is load-bearing and must not be cut for
 * length. The circulating measurements behind this question run "cited but not
 * ranked", which is the reverse of the quantity the question asks about, and
 * docs/18-SOURCE-LEDGER.md records for the Xu, Iqbal, Montgomery preprint that
 * "written carelessly, a citation here inverts the finding". Naming the
 * direction of measurement and attaching no number is the honest form of this
 * answer. No percentage, range, "most", or "a growing share" may be added
 * here. The defensible figure would require a Selection Intelligence run on
 * Hendricks itself, which does not exist.
 *
 * `comparison.closing` below states the same distinction in comparison
 * register, closing the traditional-versus-AI table, and the
 * /ai-selection-problem related description points a reader at it. Leave it
 * alone. Rewriting it to match this section creates the third rendering this
 * section exists to avoid.
 */
export const upstream = {
  eyebrow: 'Ranking Versus Appearing',
  title: 'Why can a brand rank #1 on Google and still not appear in AI answers?',
  lead: 'A brand can rank #1 on Google and still not appear in AI answers, because a position in a ranked list of links and a named source inside a composed answer are two different outcomes, and holding the first does not produce the second. Hendricks publishes no figure for how often this happens. The share of AI-cited pages that also rank in Google is a different quantity from the share of well-ranked pages that get cited, and only the second describes this problem. What can be established for one brand is narrower and more useful: whether it was named, on which observed surface, for which question, and on which date.',
  items: [
    'The brand is absent from the options presented, so it is never evaluated.',
    'The brand appears, but is described from outdated, thin, or contradictory evidence.',
    'The brand is mentioned without being recommended, and the shortlist forms around competitors.',
    'The decision narrows before any website visit, so no analytics event records the loss.',
    'Rank and traffic reporting stays flat while consideration falls, because the two measure different things.',
    'Nobody in the business can say whether the brand was considered, because nothing in the stack observes the surfaces where the comparison happened.',
  ],
  closing: [
    'Hendricks calls this the AI Selection Problem.',
    'Being discovered and being chosen are now separate outcomes, and most reporting still measures only the first.',
  ],
  cta: {
    label: 'Read The AI Selection Problem',
    href: routes.aiSelectionProblem.path,
    analytics: { location: 'wiams_upstream' },
  } satisfies Cta,
} as const

/**
 * The buyer's own phrasing of the same symptom, and the one section on this page
 * that carries a number.
 *
 * docs/17 §3.2 assigns the diagnosis of why a brand is absent to this page and
 * to /what-is-selection-intelligence. /for-agencies owns the adjacent answer,
 * which is what a principal says to a client and in what order, and it already
 * links here for the diagnosis itself. Nothing in this section may be rewritten
 * into that register: this is what is happening, not what to say about it.
 *
 * Why the section exists at all. The corpus stated the diagnosis only in Google
 * vocabulary ("rank #1 ... not appear in AI answers") and never in the words a
 * brand-side buyer types. It also had no answer to the prior question, which the
 * self-baseline made answerable for the first time on 2026-08-19: whether the
 * answer cited anybody. A question that returns no sources has no slot for any
 * brand to win, and every generic five-reasons treatment of this subject skips
 * straight past it.
 *
 * THE FIGURES ARE QUOTED, NEVER RECOMPUTED. Every number below is published at
 * /research/hendricks-selection-baseline and appears here in the same form it
 * appears there. Do not derive a rate, a percentage, a trend, or a comparison
 * between the two runs from them: the runs used different query sets, and that
 * page's own limitations section forbids reading them as a series. Do not add a
 * figure from anywhere else. The baseline has no intervention and no control, so
 * no sentence here may present it as evidence that any tactic works.
 *
 * EVERY 2026-08-19 FIGURE HERE WAS REPLACED ON 2026-08-19. The first published
 * set came from a run whose result file a scheduled job overwrote in place, so
 * nothing in it could be reproduced, and one of its figures was also wrong:
 * Google AI Overviews returned one sourced overview, on 1 of the 13 cells it
 * returned a measurement on, not none of 17. The
 * replacements are read from run 2026-08-19-110930, which is named in the copy
 * below so a reader can ask for the file. See decision 0A in
 * `src/content/research/hendricks-selection-baseline.ts` before editing a
 * number here, and never restore the zero for Google AI Overviews.
 *
 * The closing paragraph used to report a run 2 Perplexity answer citing consumer
 * software help pages. That observation rested on the destroyed file and cannot
 * be checked against the archive, so it was replaced by the run 1 viaudit.com
 * finding, which reproduces from run 1's own file. Do not restore it.
 */
export const absence = {
  eyebrow: 'Absence Versus No Sources',
  title: 'Why is my brand not showing up in ChatGPT?',
  lead: 'A brand is missing from a ChatGPT answer for one of two reasons that look identical on screen and are not the same problem. Either the answer cited sources and the brand was not among them, or the answer cited nothing at all. An answer that cites nobody has no slot for any brand to win.',
  body: [
    'Hendricks measured that split on its own brand and published the run. On 2026-08-19, all three engines were sent the same 17 buyer questions. ChatGPT cited sources on 2 of them and answered the rest with no source attached. Perplexity cited sources on 17. Google AI Overviews returned a measurement on 13 of its 17 and cited sources on 1 of those. The run produced 51 cells, measured 47 of them, and 20 of those carried a citation of any kind. It is archived as run 2026-08-19-110930.',
    'A later archived run, 2026-08-20-110653, published on the study of whether any source was cited by all three engines, recorded ChatGPT citing a source on 2 of 17 questions. Those were the same two questions across six dated runs. That count is citation presence only.',
    'Those figures describe 17 questions, three systems, one geography, and one date. Nothing was changed between that run and the one before it, and nothing was held back for comparison, so the run establishes what those answers looked like and nothing about what a change to a website would do to them. It is a baseline, not evidence that any tactic works.',
    'What the split changes is the first question worth asking. Before a brand asks why it lost a ChatGPT answer, it has to establish whether the answer had anything to lose. For most of the questions in that run, the honest reading is not that a shortlist formed without the brand. It is that no shortlist was published at all.',
    'An answer that names a source is not the same as an answer that is right. In the run a day earlier, ChatGPT answered a question about who audits brand visibility in AI assistants by listing viaudit.com, a domain that returned no DNS record and no response when it was checked with dig and curl on 2026-08-18.',
  ],
  cta: {
    label: 'Read the run, its denominators, and its limits',
    href: routes.researchHendricksSelectionBaseline.path,
    analytics: { location: 'wiams_absence' },
  } satisfies Cta,
  laterRun: {
    label: 'Read the 2026-08-20-110653 study',
    href: routes.researchNoSharedSourceAcrossEngines.path,
    analytics: { location: 'wiams_absence_110653' },
  } satisfies Cta,
} as const

/**
 * The order the four states are ruled out in, as a table rather than prose.
 *
 * A sequence of checks written as paragraphs is the most common way a good
 * answer becomes unretrievable, and this one is a comparison as well as a
 * sequence: each row is a state, what settles it, and why it sits where it does.
 * One row has to survive being lifted without the other three.
 *
 * Row 4 deliberately does not restate the variance mechanism. docs/17 §4.3
 * assigns that answer to /why-ai-answers-change, which is not built, so this row
 * states the consequence for the reader and stops. When that route ships it
 * takes an inbound link from here, and this row shortens rather than grows.
 *
 * The closing carries the mechanism label required by docs/17 §11 rule 8, in
 * those exact words. It is not a hedge and it is not decorative. The best
 * available controlled evidence does not show that this class of work produces a
 * citation, and a page that sells the conditions without saying so is selling
 * plausible mechanism as measured effect. Do not soften it, and do not move it
 * into a comment.
 *
 * The three conditions named in the closing are three of the seven layers owned
 * by /solutions/search-presence-engineering. They are named in one clause and
 * linked, never re-listed. Restating the seven layers here is the duplication
 * docs/17 rule one exists to prevent.
 */
export const diagnosis = {
  eyebrow: 'Ruling Causes Out',
  title: 'How does a brand find out why it is not showing up in ChatGPT?',
  lead: 'A brand finds out why it is not showing up in ChatGPT by separating four states that look the same on one answer screen, in order, cheapest first. Three of the four are not competitive losses. Each carries a different remedy, and only two of them respond to anything a brand does to its own evidence.',
  caption:
    'Four states behind a brand missing from a ChatGPT answer, in the order they are ruled out.',
  columns: [
    { key: 'check', header: 'Check', rowHeader: true, width: '30%' },
    { key: 'settles', header: 'What it establishes' },
    { key: 'order', header: 'Why it sits here' },
  ],
  rows: [
    {
      check: 'Did the answer cite any source at all?',
      settles: 'Whether the question produced citation slots that any brand could occupy.',
      order:
        'An answer that cites nobody is not a shortlist the brand lost, and no work on the brand adds a slot to it.',
    },
    {
      check: 'Did a sourced answer leave the brand out?',
      settles: 'Whether the brand was passed over inside an answer that named other sources.',
      order:
        'This is the only one of the four states that is a competitive loss, and it is the one most treatments of this question assume without checking the first.',
    },
    {
      check: 'Did the answer name the brand and describe it wrongly?',
      settles: 'Whether the problem is absence or description.',
      order:
        'A brand described from outdated, thin, or contradictory evidence reads as missing to anyone scanning an answer for a reason to shortlist it, and the remedy is a different one.',
    },
    {
      check: 'Did the result hold when the question was asked again?',
      settles: 'Whether the reading is an observation or a single screen.',
      order:
        'A result that appears in one run and not the next has not been established, so nothing read once settles which of the three states above applies.',
    },
  ],
  closing: [
    'Two of those four states are worth acting on, and neither is fixed by publishing more pages. Absence from a sourced answer and a wrong description are both conditions of the evidence an AI system can find and corroborate about a brand: whether the site can be reached and read, whether the organization, its services, and its people are defined consistently wherever they are described, and whether decision-stage content exists for the questions buyers actually ask. Search Presence Engineering is the work on those conditions.',
    'Hendricks labels the reasoning behind that work for what it is. Improving those conditions is a plausible mechanism rather than a measured effect. No controlled test available to Hendricks shows that the work produces a citation, no page on this site claims one, and the two published runs tested nothing, because Hendricks changed nothing about the site between them and held nothing back for comparison.',
  ],
  cta: {
    label: 'See the Search Presence Engineering layers',
    href: routes.searchPresenceEngineering.path,
    analytics: { location: 'wiams_diagnosis' },
  } satisfies Cta,
} as const

/**
 * A real comparison rather than prose pretending to be one, so a single row
 * survives being lifted on its own.
 */
export const comparison = {
  eyebrow: 'Traditional Versus AI-Mediated',
  title: 'How is AI-mediated search different from traditional search results?',
  lead: 'Traditional search results return a page of links and leave the comparison to the customer. AI-mediated search returns a composed answer, and much of the comparison is finished before the customer clicks anything.',
  caption: 'Traditional search results compared with AI-mediated search, by dimension.',
  columns: [
    { key: 'dimension', header: 'Dimension', rowHeader: true, width: '24%' },
    { key: 'traditional', header: 'Traditional search results' },
    { key: 'aiMediated', header: 'AI-mediated search' },
  ],
  rows: [
    {
      dimension: 'What the customer receives',
      traditional: 'A page of ranked links',
      aiMediated: 'A composed answer with a limited set of named options and cited sources',
    },
    {
      dimension: 'Where comparison happens',
      traditional: 'Across several websites, after the click',
      aiMediated: 'Largely before the click, inside the answer',
    },
    {
      dimension: 'What a brand competes for',
      traditional: 'A position on the results page',
      aiMediated: 'Inclusion in the set of options presented',
    },
    {
      dimension: 'What the brand supplies',
      traditional: 'The page the customer lands on',
      aiMediated: 'The evidence a system can find and corroborate about it',
    },
    {
      dimension: 'Stability of the result',
      traditional: 'Comparatively stable for the same query',
      aiMediated: 'Can vary with context, wording, location, platform, and time',
    },
    {
      dimension: 'What measurement reports',
      traditional: 'Rank, impressions, clicks, and sessions',
      aiMediated:
        'Observed consideration rate and observed recommendation rate under stated conditions',
    },
  ],
  closing:
    'Neither replaces the other. A brand can rank well and still lose the shortlist, which is why the two are measured separately.',
} as const

/**
 * The vocabulary slot on this page. It carries one owned definition and one
 * pointer, and the split is deliberate.
 *
 * "AI search visibility" is the highest-demand buyer term the corpus used
 * without ever defining, so this page defines it once and every other page that
 * uses the phrase links here (docs/17 §3.2). It belongs on this page rather than
 * a solution page because it is Term register: the reader is asking what a word
 * means, not what a client receives.
 *
 * GEO and AEO were previously restated here in full. They are defined on
 * /what-is-generative-engine-optimization and docs/17 §3.10 cuts the second
 * rendering to a pointer, which is the last body line plus the CTA. What stays
 * is the distinction this page owns and that page does not: the difference
 * between the environment and the work aimed at it.
 *
 * The scope line is a reference to the table above rather than a fourth wording
 * of the observed-systems statement. Restating it here would add the paraphrase
 * that docs/17 §3.5 exists to remove.
 *
 * Hendricks does not sell GEO or AEO services and no line here may suggest it.
 */
export const vocabulary = {
  eyebrow: 'Vocabulary',
  title: 'What is AI search visibility?',
  body: [
    'AI search visibility is the presence of a brand in the answers AI systems compose and in the sources those answers cite. It is a presence measure: it records that the brand appeared, on a named surface, for a named question, on a given date.',
    'Visibility is not selection. A brand can be present in an answer that goes on to recommend a competitor, and it can be present for questions no buyer with budget ever asks. Entering a consideration set that carries commercial value is a separate outcome, earned separately, which is why Hendricks reports observed consideration rate and observed recommendation rate rather than a count of appearances.',
    'Any visibility Hendricks reports is bounded by the surfaces marked as observed in the table above.',
    'Generative engine optimization (GEO) and answer engine optimization (AEO) are names for the work aimed at earning that visibility. AI-mediated search is the environment that work is aimed at, not the work itself.',
  ],
  cta: {
    label: 'Read What Is Generative Engine Optimization?',
    href: routes.whatIsGenerativeEngineOptimization.path,
    analytics: { location: 'wiams_vocabulary' },
  } satisfies Cta,
} as const

export const limitation = {
  label: 'Honest limitation',
  title:
    'Everything Hendricks reports about these surfaces is an observation under stated conditions.',
  body: [
    'These surfaces change without notice, so a result observed on one date may not reproduce on the next.',
    'Output varies with user context, which means a single observation is not a ranking.',
    'Hendricks cannot see inside these systems. Hendricks reports what was observed, when, on which surface, and under which conditions, and makes no claim about how any system decides.',
  ],
} as const

/**
 * The only content object on the site that carries external citations. Every
 * claim this page makes about a platform is traceable to that platform's own
 * documentation, and no blog, vendor study, or third-party statistic is cited.
 *
 * The `absence` section added a second class of evidence to this page: a
 * first-party figure produced by Hendricks and published on this site with its
 * denominators and its limits. That is not an external citation and it does not
 * touch A5, so it belongs in `basis` and in the body link rather than in the
 * reference list below, which carries platform documentation only.
 *
 * The list carries a citation only where the page makes a claim that needs one.
 * Naming a public product as part of the environment is not such a claim, which
 * is why Gemini, Google AI Mode, and Microsoft Copilot are named on the page
 * without a citation of their own: nothing here describes what any of them does.
 * A source for a surface Hendricks does not observe would also read, in a
 * reference list, as evidence of an engagement that does not exist.
 *
 * Every URL below was fetched and confirmed to resolve to the first-party
 * document it names on the review date, and each is the address the document
 * settles at rather than one that redirects.
 */
export const sources = {
  reviewed: '2026-08-19',
  basis:
    'This definition is maintained by Hendricks. Where the page describes systems Hendricks does not control, it states publicly observable behavior and cites the platform’s own documentation. The figures on this page come from first-party Hendricks measurement, published in full with its query set, its denominators, its method, and its limits at the Hendricks Selection Baseline. No third-party research, vendor study, or statistic is reported.',
  citations: [
    {
      title: 'AI features and your website',
      publisher: 'Google Search Central',
      url: 'https://developers.google.com/search/docs/appearance/ai-features',
    },
    {
      title: 'Overview of OpenAI Crawlers',
      publisher: 'OpenAI',
      url: 'https://developers.openai.com/api/docs/bots',
    },
    {
      title: 'Perplexity Crawlers',
      publisher: 'Perplexity',
      url: 'https://docs.perplexity.ai/docs/resources/perplexity-crawlers',
    },
  ],
  appliedIn: [
    { label: 'the Selection Intelligence solution', href: routes.selectionIntelligence.path },
    { label: 'the measurement methodology', href: routes.methodology.path },
  ],
} as const

/**
 * The GEO page leads because it is the reciprocal of this one. Both are entry
 * vocabulary, the section above argues the two terms against each other, and
 * that section had no route to the page that defines them until this entry
 * existed. The GEO page already links back here first.
 */
/** The page's own outline, in the order the stations render. */
export const contents = [
  { id: 'surfaces', label: 'The surfaces' },
  { id: 'ranking-gap', label: 'Ranking versus appearing' },
  { id: 'absence', label: 'Absence versus no sources' },
  { id: 'diagnosis', label: 'Ruling causes out' },
  { id: 'comparison', label: 'Traditional versus AI-mediated' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'limitation', label: 'The honest limitation' },
  { id: 'sources', label: 'Sources and references' },
  { id: 'change-history', label: 'Change history' },
  { id: 'related-terms', label: 'Related terms' },
  { id: 'related', label: 'Where to go next' },
] as const

export const relatedSection = {
  eyebrow: 'Where To Go Next',
  title: 'Where to go next.',
} as const

export const related: readonly RelatedEntry[] = [
  {
    href: routes.whatIsGenerativeEngineOptimization.path,
    label: 'What Is Generative Engine Optimization?',
    description:
      'What generative engine optimization and answer engine optimization cover, and where the framing runs out.',
  },
  {
    href: routes.whatIsSelectionIntelligence.path,
    label: 'What Is Selection Intelligence?',
    description: 'The measurement discipline applied to these surfaces.',
  },
  {
    href: routes.aiSelectionProblem.path,
    label: 'The AI Selection Problem',
    description: 'What it costs a brand when the shortlist forms before the click.',
  },
  /*
    The free reading, added 2026-09-07 (CONTENT_VERIFICATION V5). This page
    explains why a brand can rank first and still be absent from these
    surfaces; the check is where a reader finds out whether theirs is.
  */
  {
    href: routes.aiVisibilityCheck.path,
    label: 'AI Visibility Check',
    description: 'Whether one brand is named or cited on these surfaces, read in one run.',
  },
  {
    href: routes.whatIsSearchIntelligenceEngineering.path,
    label: 'What Is Search Intelligence Engineering?',
    description: 'The wider discipline this environment is measured inside.',
  },
]

export const closing = {
  title: 'Measure the surfaces before deciding what to change.',
  primaryCta: {
    label: 'Establish a baseline through the Diagnostic',
    href: routes.diagnostic.path,
    analytics: { location: 'wiams_closing' },
  } satisfies Cta,
} as const
