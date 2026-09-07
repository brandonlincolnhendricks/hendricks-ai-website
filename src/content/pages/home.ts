import type { Cta } from '@/components/ui/cta'
import { ctaHref, routes } from '@/config/routes'
import { addition, gated, isApproved, line } from '@/content/gate'
import { observedSystemsExclusion, observedSystemsSentence } from '@/content/shared/observed-systems'

/**
 * Approved homepage copy, transcribed from `content/pages/01-home.md`.
 *
 * Rebuilt on the approved canvas (`07-hifi/home-v3.html`, decision D-A) to the
 * ten stations of that page, with the copy of redesign 04 as compressed by 04a.
 * Copy lives here rather than inside components so it can be reviewed without
 * reading TSX (docs/02 section 6). Do not edit these strings without the
 * matching change to the approved markdown.
 *
 * Every line redesign 04 marks new or variant runs through `gated`, so the
 * page renders the approved line it replaces until Brandon Lincoln Hendricks
 * records the row in `CONTENT_VERIFICATION.md` as approved (handoff 4.7 rule
 * 9). The fallback beside each call is the exact approved sentence 04's
 * decisions table names, so this file reads as the decision it encodes.
 *
 * The homepage is the one route exempt from D-E: it is a conversion surface
 * and is not what gets cited, so the depth lives on the interior routes that
 * answer one question each. Nothing cut here is lost; 04a names the page that
 * already carries it.
 *
 * Three conflicts between the design package and the copy specs, resolved and
 * recorded rather than reconciled silently:
 *
 * 1. `home-v3.html` drops the hero's boundary and audience paragraph, which
 *    carries two of the five answers the hero owes a reader in five seconds
 *    (04 section 1). 04a keeps it. The paragraph stays.
 * 2. `home-v3.html` renders a fee sentence in the Diagnostic station. 04a's
 *    homepage list carries the timing sentence and not the investment cell, and
 *    no fee renders anywhere under `src/content`. The timing sentence stays and
 *    the fee sentence does not.
 * 3. 04a offers the self-baseline and Answer Index research lines "or move to
 *    /methodology related research if the height target is missed".
 *    `home-v3.html` omits both and the measured budget is tighter than 04a's,
 *    so they are not rendered here. Both are published on their study pages.
 */

export const homeMeta = {
  title: 'Search Intelligence Engineering for the AI Era | Hendricks',
  description:
    'Hendricks maps valuable search demand, measures whether brands enter consideration across Google and AI search, engineers search-presence gaps, and connects the work to business impact.',
} as const

/** Station ids, which are also the page's published anchors (04 decisions). */
export const stations = {
  hero: 'hero',
  check: 'ai-visibility-check',
  problem: 'before-the-click',
  system: 'what-hendricks-does',
  /** The merged system station keeps the `#solutions` anchor for inbound links (04a section 3). */
  solutions: 'solutions',
  ladder: 'beyond-visibility',
  evidenceRule: 'evidence-rule',
  outputs: 'outputs',
  pathways: 'pathways',
  evidence: 'how-hendricks-knows',
  diagnostic: 'diagnostic',
  founder: 'founder',
  close: 'find-the-gap',
} as const

/* ========================================================================== */
/* Station 1. Hero                                                            */
/* ========================================================================== */

export const hero = {
  // R1 moves the locked category line from the H1 to the eyebrow and puts the
  // brief's verb-first sentence in its place. Until H1 is approved the page
  // renders the pair it replaces: the live eyebrow and the live H1.
  eyebrow: line('heroEyebrow'),
  title: line('heroTitle'),
  /** The two-tone lead: the claim at full ink, the continuation at 62 per cent. */
  lead: {
    claim: 'Know where your brand is missing from the shortlist.',
    continuation: line('heroLead'),
  },
  /**
   * Five-second answers 2 and 3: who it is for, and why it is neither an SEO
   * agency nor a tool. Restored over `home-v3.html`, which drops it.
   */
  boundary: line('heroBoundary'),
  primaryCta: {
    label: 'Start with a Search Intelligence Diagnostic',
    href: '/diagnostic',
    analytics: { location: 'home_hero' },
  } satisfies Cta,
  secondaryCta: {
    label: line('heroSecondaryCta'),
    href: '/how-it-works',
    analytics: { location: 'home_hero_secondary' },
  } satisfies Cta,
  /**
   * Brand/QA: new public link. Short on purpose so it stays a door, not a
   * claim. It must not read as the Diagnostic or as Plate 01.
   */
  observeLink: {
    label: 'Try a public observation',
    href: '/observe',
    analytics: { location: 'home_plate' },
  } satisfies Cta,
  /**
   * The definer, bound to the primary CTA by `aria-describedby`. It adds to the
   * hero rather than replacing an approved line, so while H4 is pending it is
   * not rendered and the button carries no description.
   */
  definer: addition('heroDefiner'),
  operatingLine:
    'Measure demand. Understand AI visibility. Engineer selection. Prove business impact.',
  /**
   * The proof line. The numbered form is CONTENT_VERIFICATION F2, whose row
   * records the wording as approved and the start year as pending, so the
   * numberless fallback is what ships (CANON R5; 04 decision 6).
   */
  proofLine: line('heroProofLine'),
} as const

/* ========================================================================== */
/* Station 1a. The free check                                                 */
/* ========================================================================== */

/**
 * The lead-generation instrument Brandon asked for on 2026-09-07: one field on
 * the homepage, the full check on its own route. The station collects nothing
 * personal, only a website address, so it carries no notice at collection;
 * the contact fields and the notice live on /ai-visibility-check, where the
 * run happens. New copy, CONTENT_VERIFICATION V3.
 */
export const check = {
  eyebrow: 'Free AI Visibility Check',
  title: 'Is your brand in the answer?',
  lead: {
    claim: 'Enter a website.',
    continuation:
      'Hendricks asks the AI systems it observes five buyer questions and shows whether your brand was named or cited, with the denominator.',
  },
  label: 'Your website',
  placeholder: 'example.com',
  submit: 'Check my AI visibility',
  foot: 'About two minutes. A reading with its denominator, not a score.',
  href: routes.aiVisibilityCheck.path,
} as const

/* ========================================================================== */
/* Station 2. The loss before the click                                       */
/* ========================================================================== */

export const problem = {
  eyebrow: 'The AI Selection Problem',
  title: line('problemTitle'),
  body: [
    'Search increasingly interprets the need, researches the market, compares options, and narrows consideration before a customer reaches your website.',
    'A business can have a strong website, high rankings, excellent reviews, active paid media, respected leadership, and a recognizable brand, and still fail to enter an AI-mediated buying journey.',
  ],
  /**
   * The locked core problem at full ink, with the contrast line as its
   * continuation. While H7 is pending the continuation is the approved
   * sentence that carried this beat on the live page.
   */
  lead: {
    claim: 'Brands are losing control over the path between being discovered and being chosen.',
    continuation: line('problemContrast'),
  },
  /** Plate 02. Lane labels and steps are approved verbatim (04 section 2). */
  plate: {
    number: 'Plate 02',
    title: 'Two paths',
    gloss: 'Traditional search ran to a ranking. AI-mediated search runs to a shortlist.',
    traditional: {
      label: 'Traditional search was largely a ranking problem',
      steps: ['Query', 'Search Results', 'Website', 'Conversion'],
      marker: 'website session begins',
    },
    aiMediated: {
      label: 'AI-mediated search is increasingly a selection journey',
      steps: [
        'Need',
        'Intent Interpretation',
        'Research',
        'Comparison',
        'Synthesis',
        'Shortlist',
        'Choice',
      ],
      marker: 'website session, if at all',
      note: 'the loss can happen before a visit',
    },
    alt: 'Two paths compared. Traditional search ran Query, Search Results, Website, Conversion, and the website was the third step. AI-mediated search runs Need, Intent Interpretation, Research, Comparison, Synthesis, Shortlist, Choice, and the website may not be visited at all.',
  },
  cta: {
    label: 'See why a brand can rank #1 on Google and still not appear in AI answers',
    href: routes.whatIsAiMediatedSearch.path,
    analytics: { location: 'home_problem' },
  } satisfies Cta,
} as const

/* ========================================================================== */
/* Station 3. The system. Live sections 3 and 6 merged (audit decision 17).    */
/* ========================================================================== */

export const system = {
  eyebrow: 'The Hendricks Method',
  title: line('systemTitle'),
  lead: {
    claim: 'Hendricks does not sell screenshots of chatbot mentions.',
    continuation: line('systemLead'),
  },
  /**
   * The four phases. Names, business questions and output names are approved
   * verbatim (CANON section 3; home.ts phases). Only the one-line summary is
   * new, so only it is gated; the fallback is the approved description it
   * compresses.
   */
  phases: [
    {
      index: '01',
      name: 'Map demand',
      href: '/solutions/search-demand-intelligence',
      question: 'What demand is worth pursuing?',
      summary: line('phaseDemand'),
      output: 'Demand Map',
    },
    {
      index: '02',
      name: 'Observe selection',
      href: '/solutions/selection-intelligence',
      question: 'Where are we winning or losing consideration?',
      summary: line('phaseSelection'),
      output: 'Selection Map',
    },
    {
      index: '03',
      name: 'Engineer the presence',
      href: '/solutions/search-presence-engineering',
      question: 'What should change?',
      summary: line('phasePresence'),
      output: 'Intervention Roadmap',
    },
    {
      index: '04',
      name: 'Measure impact',
      href: '/solutions/search-impact-measurement',
      question: 'Did it produce business impact?',
      summary: line('phaseImpact'),
      output: 'Impact Ledger',
    },
  ],
  /** The operating cycle closes on itself (CANON section 3). */
  returnLabel: 'Learn and repeat',
  /**
   * The scope boundary, rendered once per page, here, where "observe" first
   * appears as an activity (audit V7). Imported from the shared module and
   * never retyped, so the closed list of four cannot drift.
   */
  scope: [observedSystemsSentence, observedSystemsExclusion],
} as const

/* ========================================================================== */
/* Station 4. Beyond visibility                                               */
/* ========================================================================== */

type Mark = 'observed' | 'inferred' | 'measured' | 'tested'

type Rung = {
  name: string
  question: string
  /** How Hendricks knows. Present only while H10 is approved. */
  knows?: string
  /**
   * The evidence classes the rung's inline mark draws, in order. Present only
   * alongside `knows`, because canvas `home-v3.html` never draws a mark that
   * the row does not also name in words, and canvas.md section 2 forbids
   * carrying an evidence class by colour or shape alone.
   */
  marks?: readonly Mark[]
}

/**
 * The approved ladder: seven rungs and their questions, and nothing else. The
 * marks belong to the third column and arrive with it (H10), never before it.
 */
const approvedRungs: readonly Rung[] = [
  { name: 'Visibility', question: 'Did the brand appear?' },
  { name: 'Understanding', question: 'Was the brand represented accurately?' },
  { name: 'Relevance', question: 'Was it connected to the customer’s specific need?' },
  { name: 'Consideration', question: 'Was it presented as a legitimate option?' },
  { name: 'Recommendation', question: 'Was it actively favored or shortlisted?' },
  { name: 'Selection', question: 'Did the customer choose it?' },
  { name: 'Impact', question: 'Did that choice produce commercial value?' },
]

/** The third column and the mark that draws it, as one pair. */
const observedInAnswer = { knows: 'observed in the answer', marks: ['observed'] } as const

const proposedRungs: readonly Rung[] = [
  { ...approvedRungs[0], ...observedInAnswer },
  { ...approvedRungs[1], ...observedInAnswer },
  { ...approvedRungs[2], ...observedInAnswer },
  {
    name: 'Trust',
    question: 'Did sufficient evidence support it?',
    knows: 'sources observed; sufficiency inferred',
    marks: ['observed', 'inferred'],
  },
  { ...approvedRungs[3], ...observedInAnswer },
  { ...approvedRungs[4], ...observedInAnswer },
  { ...approvedRungs[5], knows: 'measured in your own systems', marks: ['measured'] },
  {
    ...approvedRungs[6],
    knows: 'measured, and tested where a control exists',
    marks: ['measured', 'tested'],
  },
]

export const ladder = {
  eyebrow: 'Beyond AI Visibility',
  title: 'A brand mention is not the same as consideration.',
  lead: {
    claim: 'Visibility tells you that you appeared.',
    continuation: 'Selection Intelligence tells you what that appearance means.',
  },
  /**
   * The Trust rung, the "How Hendricks knows" column, its inline marks and the
   * citation note are one decision (04 decision 13). While H10 is pending the
   * ladder is the approved seven rungs and their questions, with no third
   * column and so no marks: a mark with no word beside it would state an
   * evidence class the row never names.
   */
  rungs: gated('H10', proposedRungs, approvedRungs),
  note: addition('ladderCitationNote'),
  /** The stability sentence, kept on the homepage by 04a section 3. */
  closing:
    'AI-mediated results can vary by context, wording, location, platform, and time. Hendricks therefore measures controlled intent contexts and repeated outcomes, not one pretend universal ranking.',
  cta: {
    label: 'Learn What Selection Intelligence Measures',
    href: ctaHref('/what-is-selection-intelligence', '/solutions/selection-intelligence'),
    analytics: { location: 'home_ladder' },
  } satisfies Cta,
} as const

/* ========================================================================== */
/* Station 5. The evidence rule                                               */
/* ========================================================================== */

/** Locked, CANON section 2. The word "yet" is load bearing and is never cut. */
export { evidenceRule } from '@/content/shared/evidence-rule'

/* ========================================================================== */
/* Station 6. Evidence and outputs                                            */
/* ========================================================================== */

/**
 * The eight artifacts. Names are approved verbatim (CANON section 3;
 * diagnostic.ts). The decision line under each is the 02 register's new copy
 * and enters the gate with the register (04 decision 11), so while H12 is
 * pending each figure renders its plate number, its name and its drawing.
 */
export const outputs = {
  eyebrow: line('outputsEyebrow'),
  title: line('outputsTitle'),
  /**
   * Approved copy in a moved position, which is the whole of 04 decision 15:
   * while H11 is pending this sentence is the H2, so no lead renders beneath
   * it; once the row is approved the new H2 takes the heading slot and this
   * sentence becomes the lead. It is not gated copy, so it is written here.
   */
  lead: isApproved('H11')
    ? 'Every output should tell the organization what happened, why it matters, and what to do next.'
    : null,
  items: [
    {
      number: 'Plate 04',
      name: 'Demand Map',
      preview: 'demand-map' as const,
      decision: addition('decisionDemandMap'),
      alt: 'Demand Map. Customer decisions as rows, relative value as bar length, no figures.',
    },
    {
      number: 'Plate 05',
      name: 'Intent Context Library',
      preview: 'intent-context' as const,
      decision: addition('decisionIntentContext'),
      alt: 'Intent Context Library. Three situation cards for one decision, each with need, who, constraint, and decision stage fields.',
    },
    {
      number: 'Plate 06',
      name: 'Selection Map',
      preview: 'selection-map' as const,
      decision: addition('decisionSelectionMap'),
      alt: 'Selection Map. The hero instrument at thumbnail scale, five sample brands on one context.',
    },
    {
      number: 'Plate 07',
      name: 'Competitor Selection Matrix',
      preview: 'competitor-matrix' as const,
      decision: addition('decisionCompetitorMatrix'),
      alt: 'Competitor Selection Matrix. Decisions as rows, sample brands as columns, cells marked absent, referenced, considered, or recommended.',
    },
    {
      number: 'Plate 08',
      name: 'Source and Evidence Graph',
      preview: 'evidence-graph' as const,
      decision: addition('decisionEvidenceGraph'),
      alt: 'Source and Evidence Graph. Source-type nodes linked to claim nodes, with unsupported claims drawn in the inferred stroke.',
    },
    {
      number: 'Plate 09',
      name: 'Commercial Selection Gap',
      preview: 'selection-gap' as const,
      decision: addition('decisionSelectionGap'),
      alt: 'Commercial Selection Gap. Your Brand against a benchmark band on a relative scale, no figures.',
    },
    {
      number: 'Plate 10',
      name: 'Intervention Roadmap',
      preview: 'roadmap' as const,
      decision: addition('decisionRoadmap'),
      alt: 'Intervention Roadmap. Ordered rows with condition, owner, and measurement fields, the first row expanded.',
    },
    {
      number: 'Plate 11',
      name: 'Impact Ledger',
      preview: 'impact-ledger' as const,
      decision: addition('decisionImpactLedger'),
      alt: 'Impact Ledger. Ledger rows with a change, a period, a source, and an evidence-class label, no values.',
    },
  ],
  closing: addition('outputsClosing'),
} as const

/* ========================================================================== */
/* Station 7. Audience pathways                                               */
/* ========================================================================== */

export const pathways = {
  eyebrow: 'Built for Valuable Search Decisions',
  title: 'One system. Two ways to work with Hendricks.',
  columns: [
    {
      label: 'For Brands',
      title: line('brandsTitle'),
      body: {
        claim: 'Your customer experiences one decision journey.',
        continuation: line('brandsBody'),
      },
      cta: {
        label: line('brandsCta'),
        href: '/for-brands',
        analytics: { location: 'home_pathways', audienceType: 'brand' as const },
      } satisfies Cta,
    },
    {
      label: 'For Agencies',
      title: line('agenciesTitle'),
      body: {
        claim: 'Your agency keeps the client relationship.',
        continuation:
          'Responsibilities, branding, data access, and communication ownership are established before delivery. No fabricated results or guaranteed citation claims.',
      },
      /** The four models, named only. Descriptions and best-for lines stay on /for-agencies. */
      models: [
        'White-label specialist',
        'Embedded intelligence lead',
        'Co-branded partner',
        'System builder',
      ],
      cta: {
        label: 'Discuss an Agency Partnership',
        href: '/for-agencies#partnership-inquiry',
        analytics: { location: 'home_pathways', audienceType: 'agency' as const },
      } satisfies Cta,
    },
  ],
} as const

/* ========================================================================== */
/* Station 8. How Hendricks knows                                             */
/* ========================================================================== */

export const evidence = {
  eyebrow: 'Proof Without False Precision',
  title: line('evidenceTitle'),
  classes: [
    {
      kind: 'observed' as const,
      name: 'Observed',
      description: 'Responses, citations, sources, rankings, and referrals.',
    },
    {
      kind: 'inferred' as const,
      name: 'Inferred',
      description: 'The likely relationship between evidence gaps and outcomes.',
    },
    {
      kind: 'measured' as const,
      name: 'Measured',
      description: 'Leads, opportunities, pipeline, revenue, and branded demand.',
    },
    {
      kind: 'tested' as const,
      name: 'Tested',
      description: 'Baselines, staggered rollouts, matched groups, and holdouts.',
    },
  ],
  pull: {
    claim: 'Hendricks does not claim access to a model’s hidden reasoning.',
    continuation:
      'We study inputs, outputs, sources, interventions, and business outcomes, then state how much confidence the evidence supports.',
  },
  alt: 'A legend of four evidence classes. Observed uses a solid line and a filled dot. Inferred uses a dashed line and a hollow dot. Measured uses a solid rule with a tick. Tested uses a double rule. Every diagram on the page uses these four marks.',
  cta: {
    label: 'Read the Hendricks Measurement Methodology',
    href: ctaHref('/methodology', '/solutions/search-impact-measurement'),
    analytics: { location: 'home_evidence' },
  } satisfies Cta,
} as const

/* ========================================================================== */
/* Station 9. The entry point, with the founder note                          */
/* ========================================================================== */

export const diagnostic = {
  eyebrow: 'Start with Evidence',
  title: line('diagnosticTitle'),
  lead: 'The Search Intelligence Diagnostic is a fixed-scope engagement that identifies where valuable customer demand exists, whether your brand enters consideration, which observable conditions separate you from stronger competitors, and what should be implemented first.',
  timing:
    'Most Diagnostics are designed to take approximately three to four weeks, assuming required data access and stakeholder availability.',
  outputsLabel: 'Plate 12 / What you leave with',
  outputs: [
    'Decision Brief',
    'Commercial Demand Model',
    'Selection Baseline',
    'Commercial Selection Gap',
    'Source and Evidence Graph',
    '90-Day Demand-to-Selection Roadmap',
  ],
  cta: {
    label: 'Start with a Search Intelligence Diagnostic',
    href: '/diagnostic',
    analytics: { location: 'home_diagnostic' },
  } satisfies Cta,
} as const

export const founder = {
  /** D-D: this portrait renders in colour, at every size, on every ground. */
  portrait: {
    src: '/images/brandon-lincoln-hendricks-portrait.jpg',
    alt: 'Brandon Lincoln Hendricks, founder of Hendricks',
    width: 660,
    height: 819,
  },
  name: 'Brandon Lincoln Hendricks',
  body: 'is the founder of Hendricks and a Search Intelligence Engineer.',
  /**
   * The non-personal delivery-model line 02 section 2 requires while
   * CONTENT_VERIFICATION F8 ("Brandon personally architects Hendricks
   * engagements") stays pending. New framing around the approved stage
   * sentence at how-it-works.ts, so it is gated on H17.
   */
  deliveryModel: line('founderDeliveryModel'),
  cta: {
    label: 'About Brandon Lincoln Hendricks',
    href: '/about',
    analytics: { location: 'home_founder' },
  } satisfies Cta,
} as const

/* ========================================================================== */
/* Station 10. The close                                                      */
/* ========================================================================== */

export const finalCta = {
  eyebrow: 'Find the Gap',
  title: 'What decision can your current search system not answer?',
  lead: {
    claim: 'Tell Hendricks what your organization needs to understand, improve, or build.',
    continuation:
      'We will determine whether a Search Intelligence Diagnostic is the appropriate first step, and say directly when a simpler solution is sufficient.',
  },
  primaryCta: {
    label: 'Start with a Search Intelligence Diagnostic',
    href: '/diagnostic',
    analytics: { location: 'home_final_cta' },
  } satisfies Cta,
  secondaryCta: {
    label: 'Discuss an Agency Partnership',
    href: '/for-agencies#partnership-inquiry',
    analytics: { location: 'home_final_cta', audienceType: 'agency' as const },
  } satisfies Cta,
} as const
