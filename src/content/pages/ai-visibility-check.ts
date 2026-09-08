import type { Cta } from '@/components/ui/cta'
import { routes } from '@/config/routes'
import { formLegal as diagnosticLegal } from '@/content/pages/diagnostic'
import { evidenceRule } from '@/content/shared/evidence-rule'
import {
  observedSystemsExclusion,
  observedSystemsSentence,
} from '@/content/shared/observed-systems'
import { questionShapes } from '@/lib/visibility-check/questions'
import { engineIds } from '@/lib/visibility-check/schema'

/**
 * Every count on this page is computed from the two lists that define a run,
 * never typed. The observed-systems guard forbids counting the systems in a
 * page literal because a typed count keeps saying "three" after a fourth
 * joins, which is what happened on 2026-09-01; the same drift would reach
 * "twenty cells" the day a fifth system is observed. A computed word cannot
 * go stale.
 */
const QUESTIONS = questionShapes.length
const CELLS = QUESTIONS * engineIds.length

const WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
  'nineteen', 'twenty', 'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four',
  'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine', 'thirty',
] as const

function spell(n: number): string {
  return WORDS[n] ?? String(n)
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

const five = spell(QUESTIONS)
const Five = capitalize(five)
const twenty = spell(CELLS)

/**
 * Copy for /ai-visibility-check, mirrored in content/pages/31-ai-visibility-check.md.
 *
 * The free instrument Brandon asked for on 2026-09-07: a lead-generation tool
 * on the homepage where a visitor checks their AI visibility live, gets a
 * real reading, and Hendricks gets the contact. It is new copy and carries
 * CONTENT_VERIFICATION rows V1 to V4; nothing here is a client claim, a
 * result, or a fee.
 *
 * Four decisions are load-bearing.
 *
 * 1. THE READING IS THE FIRST RUNG ONLY. The check reads visibility: named or
 *    cited. It never reads understanding, consideration or recommendation,
 *    and the copy says so before the form and again after the result. A free
 *    run that implied a rung above visibility would contradict the ladder on
 *    the homepage.
 *
 * 2. EVERY COUNT CARRIES ITS DENOMINATOR AND ITS RUN TIME. The reading
 *    sentence is built in `scoring.ts` and always states "N of M cells
 *    measured on <time>", per docs/19 rule one. No score, no percentage
 *    alone, no colour-only state.
 *
 * 3. THE SAME INSTRUMENT AS THE RESEARCH. The engine adapters and the parser
 *    are ported from The Answer Index collector, so the page may say so, and
 *    the questions follow five of that panel's ten shapes.
 *
 * 4. THE LEGAL COPY IS THE DIAGNOSTIC FORM'S, VERBATIM. The notice at
 *    collection and the marketing sentence are read from `diagnostic.formLegal`
 *    rather than restated, because they were approved once for exactly these
 *    purposes: evaluate and respond to a request, keep a business record,
 *    protect the form.
 *
 * Render order: hero, directAnswer, check (the form), reading, notMeasured,
 * afterwards, questions, closing.
 */

export const meta = {
  title: 'Free AI Visibility Check: Is Your Brand in the Answer? | Hendricks',
  description: `Enter a website and a market. Hendricks asks the AI systems it observes ${five} buyer questions in one run and reports whether your brand was named or cited, with the denominator and the run time.`,
} as const

export const hero = {
  eyebrow: 'Free AI Visibility Check',
  title: 'Is your brand in the answer?',
  lead: {
    claim: `One run, ${five} buyer questions, ${twenty} answers.`,
    continuation:
      'The reading shows whether your brand was named or cited, who was cited instead, and how far that is from being chosen.',
  },
} as const

export const directAnswer = {
  term: 'What this check does',
  /**
   * Two paragraphs: the mechanism, then the boundary. The second is the shared
   * scope sentence rendered rather than retyped, so the list of systems on
   * this page is the one A1 holds and no other.
   */
  paragraphs: [
    `The AI Visibility Check asks ${five} questions a buyer in your market would ask, in one capture, to every AI system Hendricks observes, and records whether each answer named your brand, cited your website as a source, or did neither. It uses the same engine adapters and the same citation parser as The Answer Index, the Hendricks research corpus. Every count is reported with its denominator and its run time. It measures the first rung of the selection journey, visibility, and nothing above it: whether the brand was understood, considered, or recommended is a different measurement.`,
    observedSystemsSentence,
  ],
} as const

export const check = {
  eyebrow: 'The Check',
  title: 'Describe what you sell the way a customer would ask for it.',
  lead: `The ${five} questions are built from that phrase and shown with the result. Hendricks pays for the ${twenty} probes.`,
  legends: {
    market: 'Your market',
    contact: 'Where to send the follow-up',
  },
  labels: {
    brandName: 'Brand name',
    website: 'Website',
    market: 'What you sell, in a customer’s words',
    location: 'Where you sell it',
    name: 'Your name',
    workEmail: 'Work email',
  },
  hints: {
    brandName: 'The name a customer would say, for example Hendricks, not Hendricks Agency LLC.',
    market: 'For example: commercial HVAC maintenance, or CRM software for small law firms.',
    location:
      'Optional. A city, region, or country, for example Houston or the United Kingdom. Leave blank for a national market.',
  },
  submit: 'Run the check',
  submitting: 'Collecting answers',
  pending: `${capitalize(twenty)} answers are being collected in one capture. Most runs take between one and three minutes, because the ChatGPT endpoint is the slowest. Keep this page open.`,
  notice: diagnosticLegal.notice,
  marketingOptIn: diagnosticLegal.marketingOptIn,
  errors: {
    summaryTitle: 'The check did not run.',
    invalid: 'Check the fields listed below, then run it again.',
    rateLimited: (minutes: number) =>
      `This connection has used its three free runs for today. Try again in about ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}, or apply for a Diagnostic.`,
    capped:
      'The free check has reached its daily limit. Hendricks pays for every run, so the limit is a real one. Try again tomorrow, or apply for a Diagnostic.',
    unavailable: 'The check is not available right now. Try again later, or apply for a Diagnostic.',
    failed:
      'The engines did not answer this time, so there is no reading to show. Hendricks has your details and will run the reading by hand and email it. Try again in an hour, or apply for a Diagnostic.',
    duplicate:
      'A check for this website was already run from this address in the last ten minutes. Its reading was shown on screen at the time; wait ten minutes to run it again.',
    generic: 'The check could not be run. Please try again.',
  },
} as const

export const results = {
  eyebrow: 'Your Reading',
  title: 'What the engines returned.',
  gridCaption: `${Five} questions, one row each, and one column per observed system. Each cell is one answer, captured once.`,
  columns: {
    question: 'Question',
  },
  cellWords: {
    cited: 'Cited',
    mentioned: 'Mentioned',
    absent: 'Absent',
    notCited: 'Not cited',
    noPanel: 'No panel',
    failed: 'Not measured',
  },
  legend: [
    'Cited: your website appeared as a source in the answer.',
    'Mentioned: the answer named the brand and did not link to your site.',
    'Absent: the answer neither named the brand nor cited your site.',
    'Not cited and No panel: Google AI Overviews reports citations only, so a name in its panel text is not read.',
    'Not measured: the system did not return an answer inside the run, and the cell is excluded from every denominator.',
  ],
  questionsHeading: 'The questions that were asked',
  topDomainsHeading: 'Who was cited instead',
  topDomainsLead:
    'The domains the answers linked to, ranked by how many of the measured cells cited them. These are the sources the engines trusted for your market in this run.',
  noDomains: 'No answer in this run cited a source.',
  rule: evidenceRule,
  next: {
    title: 'What happens next',
    body: `Hendricks reviews every reading by hand and follows up by email with what these ${twenty} cells do and do not support. If the gap is worth closing, the next step is the Search Intelligence Diagnostic.`,
  },
  primaryCta: {
    label: 'Start with a Search Intelligence Diagnostic',
    href: routes.diagnostic.path,
    analytics: { location: 'avc_results' },
  } satisfies Cta,
  secondaryCta: {
    label: 'Run another check',
    href: routes.aiVisibilityCheck.path,
    analytics: { location: 'avc_results_again' },
  } satisfies Cta,
} as const

export const reading = {
  eyebrow: 'How To Read It',
  title: 'Three states, and what each one is not.',
  rows: [
    {
      label: 'Absent',
      value: 'The answer neither named the brand nor cited the website.',
      note: 'Absence is not yet a diagnosis.',
    },
    {
      label: 'Mentioned',
      value:
        'The answer named the brand and linked elsewhere. The engine knows the name and trusts another source for the claim.',
      note: 'A brand mention is not the same as consideration.',
    },
    {
      label: 'Cited',
      value:
        'The answer linked to the website as a source. The page did work in the answer, which is the condition every rung above depends on.',
      note: 'Visibility, the first rung.',
    },
  ],
  closing:
    'AI-mediated results can vary by context, wording, location, platform, and time. Hendricks therefore measures controlled intent contexts and repeated outcomes, not one pretend universal ranking.',
} as const

export const notMeasured = {
  eyebrow: 'Scope',
  title: 'What this check does not measure.',
  items: [
    'Whether the answer represented the brand accurately.',
    'Whether the brand was presented as a legitimate option or actively favored.',
    'Whether the reading holds across repeated runs, locations, or wordings. This is one capture under one set of conditions.',
    'Why an engine retrieved what it retrieved. Hendricks does not claim access to a model’s hidden reasoning.',
    'A name inside a Google AI Overview panel. That surface is read for citations only.',
  ],
  scope: [observedSystemsSentence, observedSystemsExclusion],
} as const

export const questions = {
  eyebrow: 'Questions People Ask',
  title: 'Before you run it.',
  items: [
    {
      question: `Why ${five} questions and not fifty?`,
      answer: `${Five} questions on every observed system is ${twenty} paid probes, which is what a free check can carry. It is enough to show whether a brand is in the answer set at all, and who is. It is not enough to rank anything, which is why the reading never produces a score.`,
    },
    {
      question: 'Why did the reading change when I ran it again?',
      answer:
        'Answers move. In The Answer Index, Perplexity re-asked the same questions 38 minutes later agreed with itself at a mean overlap of 0.900 and Google AI Overviews at 0.622. Two runs that differ are two observations, not a contradiction, and a Diagnostic measures the stability itself rather than one screen.',
    },
    {
      question: 'Which systems does it cover?',
      answer: `${observedSystemsSentence} ${observedSystemsExclusion}`,
    },
    {
      question: 'Is it really free, and what does Hendricks get?',
      answer:
        `It is free. Hendricks pays for the ${twenty} probes. In return Hendricks receives your contact details and the reading, and follows up by email. There is no obligation, no automated sequence, and no recurring email unless you select the optional box.`,
    },
    {
      question: 'How is this different from an AI visibility tool?',
      answer:
        `A tool runs a prompt set on a schedule and reports appearances. This is one run of ${five} questions through the parser Hendricks uses in its own research, read by a person. Which of the two a budget should buy is a separate decision, and it has its own page.`,
      link: {
        label: 'Do you need an AI visibility tool or a partner?',
        href: routes.aiVisibilityToolOrPartner.path,
        analytics: { location: 'avc_questions' },
      } satisfies Cta,
    },
  ],
} as const

export const closing = {
  eyebrow: 'Find the Gap',
  title: 'The check shows whether you appeared. The Diagnostic shows why.',
  lead: {
    claim: `${capitalize(twenty)} cells say where the brand is missing.`,
    continuation:
      'The Search Intelligence Diagnostic measures the full journey across controlled contexts and repeated runs, and produces the roadmap.',
  },
  primaryCta: {
    label: 'Start with a Search Intelligence Diagnostic',
    href: routes.diagnostic.path,
    analytics: { location: 'avc_closing' },
  } satisfies Cta,
  secondaryLink: {
    label: 'Read the Hendricks Measurement Methodology',
    href: routes.methodology.path,
    analytics: { location: 'avc_closing_methodology' },
  } satisfies Cta,
} as const

/** The rail's contents list, in render order. */
export const contents = [
  { id: 'check', label: 'The check' },
  { id: 'reading', label: 'How to read it' },
  { id: 'scope', label: 'What it does not measure' },
  { id: 'questions', label: 'Questions people ask' },
] as const
