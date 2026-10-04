import type { RelatedEntry } from '@/components/canvas/related-list'
import type { Cta } from '@/components/ui/cta'
import { routes } from '@/config/routes'
import type { ChangeEntry } from '@/content/shared/publication-record'

/**
 * Approved copy, transcribed from
 * content/pages/13-what-is-search-intelligence-engineering.md.
 *
 * The markdown's "Related CTAs" section lists three destinations without
 * specifying which is primary. The Diagnostic is used as the primary action to
 * match every other page on the site, and the other two become related links.
 */

export const meta = {
  title: 'What Is Search Intelligence Engineering? | Hendricks',
  description:
    'Search Intelligence Engineering explains how search and AI systems retrieve, select, cite, recommend, and connect observable decisions to business outcomes.',
} as const

export const hero = {
  eyebrow: 'Definition',
  title: 'What Is Search Intelligence Engineering?',
  lead: [
    'AI search is not one ranking event. It is a chain of retrieval, selection, synthesis, citation, recommendation, and measurement decisions.',
  ],
  primaryCta: {
    label: 'Start with a Search Intelligence Diagnostic',
    href: routes.diagnostic.path,
    analytics: { location: 'wisie_hero' },
  } satisfies Cta,
} as const

export const directAnswer = {
  term: 'Search Intelligence Engineering',
  answer:
    'Search Intelligence Engineering is the evidence-driven discipline of understanding and improving how search and AI systems retrieve, select, cite, and recommend information while measuring how those observable decisions connect to business outcomes.',
  note:
    'Search Intelligence Engineering is a Hendricks-defined operating framework. It is not presented as an established academic field or a universally adopted industry label.',
} as const

/**
 * Citation-presence illustration. Sits immediately after the definition.
 * The Medium link names the role only. It does not carry a measurement.
 */
export const illustratedBy = {
  body: 'This discipline is illustrated by Hendricks self-baseline run 2026-08-19-110930, which measured citation presence, not consideration.',
  study: {
    label: 'Read the Hendricks Selection Baseline',
    href: routes.researchHendricksSelectionBaseline.path,
    analytics: { location: 'wisie_illustrated_by' },
  } satisfies Cta,
  roleNaming: {
    body: 'The role name Search Intelligence Engineer is also set out in a public essay. That essay names the role. It is not a measurement.',
    label: 'What is a Search Intelligence Engineer',
    href: 'https://medium.com/@brandonlincolnhendricks/what-is-a-search-intelligence-engineer-f6211b8339a6',
  },
} as const

export const whyItExists = {
  eyebrow: 'Why a Larger Discipline Is Needed',
  title: 'The final answer hides several different decisions.',
  body: [
    'Traditional search optimization asks whether a page can be accessed, understood, ranked, and clicked. That work still matters. An AI-mediated answer can add decisions between discovery and the visible output.',
    'A final response cannot reveal every internal stage. Search Intelligence Engineering therefore separates observable outcomes from mechanisms that remain hypotheses, then tests the weakest verified stage instead of treating every absence as one visibility problem.',
  ],
  question:
    'At which observable decision point did the source, entity, brand, or product enter or leave the system?',
  events: [
    'A page can be index-eligible but never enter a measured candidate set.',
    'A candidate can be retrieved but not survive a later selection step.',
    'A source can inform an answer without receiving a visible citation.',
    'A source can be cited without the brand or product being recommended.',
    'Attention can occur without evidence of a qualified commercial action.',
  ],
} as const

export const framework = {
  eyebrow: 'The Four-Layer Framework',
  title: 'Four layers connect candidate evidence to measurable outcomes.',
  lead:
    'Each layer answers a different question. The mechanisms listed below form an experiment map, not a universal list of ranking factors.',
  layers: [
    {
      marker: '01',
      title: 'Retrieval: what enters the candidate set?',
      body: [
        'Retrieval is the layer that makes documents, entities, products, tools, or data available for consideration from one or more accessible sources.',
        'Foundational view: make the priority asset accessible, identifiable, relevant to the task, and complete enough to be useful.',
        'Expert experiment map: test access, index eligibility, entity resolution, query coverage, lexical and semantic matching, metadata filters, chunking, freshness constraints, and recall where they can be observed. Do not attribute any one mechanism to a product without evidence.',
      ],
      output: 'Decision question: did the evidence become a candidate?',
    },
    {
      marker: '02',
      title: 'Selection: what survives the decision process?',
      body: [
        'Selection is the layer between availability and visible use. A system can make more than one selection while forming a response or choosing an action.',
        'Foundational view: being available is not the same as being chosen.',
        'Expert experiment map: test topical and task relevance, evidence specificity, entity clarity, source access, corroboration, freshness, information structure, passage utility, and run variance. These are test variables, not claims about a hidden scoring function.',
      ],
      output: 'Decision question: where did a candidate remain, change, or disappear?',
    },
    {
      marker: '03',
      title: 'Citation and recommendation: how is selected evidence exposed?',
      body: [
        'A citation points to evidence. A mention names an entity. A recommendation prefers an entity, source, product, method, or action for a task. One response can contain all three, one, or none.',
        'Foundational view: classify citations, mentions, and recommendations separately.',
        'Expert view: preserve the complete output and record the surface, task, run, source path, attribution state, and classification decision.',
      ],
      output: 'Decision question: what observable form did selection take?',
    },
    {
      marker: '04',
      title: 'Revenue measurement: what evidence connects selection to value?',
      body: [
        'Revenue is not produced by a visibility score. It requires an evidence chain from an authority asset to a qualified action, opportunity, and closed record.',
        'Foundational view: a citation is evidence of selection, not evidence of revenue.',
        'Expert view: connect timestamped authority touches to first-party journeys and label sourced, assisted, self-reported, plausible, and ambient exposure separately.',
      ],
      output: 'Decision question: which links in the commercial evidence chain are actually present?',
    },
  ],
  selectionClasses: [
    {
      term: 'Direct citation',
      definition: [
        'The output links the canonical article, report, dataset record, repository artifact, or DOI that carries the evidence.',
      ],
    },
    {
      term: 'Mediated citation',
      definition: [
        'The output links an independent source that explicitly credits the original work.',
      ],
    },
    {
      term: 'Attributed mention',
      definition: [
        'The person, organization, method, or named research asset appears without a clickable source.',
      ],
    },
    {
      term: 'Unattributed concept match',
      definition: [
        'Distinctive terminology or a finding appears without attribution. Treat this as a monitoring clue, not proof of derivation.',
      ],
    },
    {
      term: 'Recommendation',
      definition: [
        'The person, organization, method, product, or asset is offered as a preferred choice for the task.',
      ],
    },
    {
      term: 'No selection',
      definition: ['None of the defined citation, mention, or recommendation outcomes occurs.'],
    },
    {
      term: 'Unclear',
      definition: ['The available output does not support a reliable classification.'],
    },
  ],
  revenueEvidence: [
    {
      term: 'Sourced',
      definition: ['First-party evidence ties the qualifying action to a specific authority asset.'],
    },
    {
      term: 'Assisted',
      definition: [
        'A verified authority interaction appears in the journey before qualification or close.',
      ],
    },
    {
      term: 'Self-reported influence',
      definition: [
        'A prospect reports influence that cannot be independently reconstructed. Report it separately from financially attributed evidence.',
      ],
    },
    {
      term: 'Plausible exposure',
      definition: ['Exposure is possible but not demonstrated. Assign no revenue attribution.'],
    },
    {
      term: 'Ambient visibility',
      definition: [
        'No person-level or account-level evidence exists. Treat it as context and assign no revenue attribution.',
      ],
    },
  ],
} as const

export const agenticPipeline = {
  eyebrow: 'Agentic Search Decision Pipeline',
  title: 'A general model for locating testable handoffs.',
  lead:
    'This pipeline is an analytical model. It does not claim that every search or AI product uses every stage or implements a stage in the same way.',
  steps: [
    'A user or agent defines an objective.',
    'The system interprets the task and available context.',
    'It decides whether to search, retrieve, call a tool, or answer from available context.',
    'One or more retrieval operations produce candidate evidence.',
    'Filtering or reranking can reduce or reorder the candidate set.',
    'A model or other decision component forms an answer, comparison, recommendation, or action plan.',
    'The interface can expose citations, sources, or tool results.',
    'The user or a downstream agent acts or does not act.',
    'Measurement attempts to connect the observable action to a business outcome.',
  ],
  closing: [
    'An LLM can be one component in this map. Retrieval services, indexes, orchestration, ranking systems, databases, APIs, safety systems, and interface rules can also affect an observed result.',
    'Use the map to form tests at observable handoffs. Do not present it as a diagram of a product whose internal architecture has not been documented.',
  ],
} as const

export const foundationalAndExpert = {
  eyebrow: 'Foundational and Expert Views',
  title: 'The same question can be answered at two levels of rigor.',
  caption: 'Foundational and expert views of the Search Intelligence Engineering questions.',
  columns: [
    { key: 'question', header: 'Question', rowHeader: true, width: '24%' },
    { key: 'foundational', header: 'Foundational view' },
    { key: 'expert', header: 'Expert view' },
  ],
  rows: [
    {
      question: 'Can machines find us?',
      foundational: 'Make priority information accessible and understandable.',
      expert:
        'Measure access, index eligibility, candidate inclusion, entity resolution, retrieval recall, and question coverage where observable.',
    },
    {
      question: 'Why were we not used?',
      foundational: 'Being available is not the same as being selected.',
      expert:
        'Test candidate generation, filters, reranking, passage utility, corroboration, freshness, and run variance without claiming access to hidden scores.',
    },
    {
      question: 'Did we appear?',
      foundational: 'Separate citation, mention, and recommendation.',
      expert:
        'Preserve complete outputs and classify selection events by surface, task, run, and source path.',
    },
    {
      question: 'Did it create value?',
      foundational: 'A citation is not revenue.',
      expert:
        'Connect timestamped authority touches to qualified actions, opportunities, and closed records using explicit evidence tiers.',
    },
    {
      question: 'What should change?',
      foundational: 'Improve the weakest verified stage.',
      expert:
        'Run one controlled intervention and compare the same frozen question panel before and after it.',
    },
  ],
} as const

export const brandImplications = {
  eyebrow: 'What This Means for Brands',
  title: 'Build an evidence system that people and machines can inspect.',
  lead:
    'The controllable work is not writing for a chatbot. It is improving the identity, evidence, access, and measurement surrounding the questions a market actually asks.',
  items: [
    'Resolve a clear and consistent identity across the website, author profiles, research records, repositories, and independent references.',
    'Publish canonical pages that answer priority informational, comparative, and recommendation questions completely.',
    'Attach visible methodology, dates, versions, authorship, corrections, and limitations to original evidence.',
    'Use structured data that accurately describes the visible asset, such as Person, Organization, Article, DefinedTerm, or Dataset.',
    'Maintain stable URLs and identifiers, including versioned records and DOIs where they are appropriate.',
    'Earn independent corroboration rather than relying on an entirely self-referential footprint.',
    'Measure discovery, selection, qualified action, opportunity, and revenue as separate events.',
  ],
  closing:
    'These are controllable improvements to the evidence and identity layer. They do not guarantee inclusion, citation, or recommendation by a third-party system.',
} as const

export const disciplineRelationship = {
  eyebrow: 'Relationship to SEO, GEO, and AEO',
  title: 'The labels describe different scopes inside this framework.',
  caption: 'How Hendricks uses four related labels in this operating framework.',
  columns: [
    { key: 'discipline', header: 'Label', rowHeader: true, width: '24%' },
    { key: 'role', header: 'Role in this framework' },
  ],
  rows: [
    {
      discipline: 'SEO',
      role: 'Accessibility, information architecture, relevance, authority, organic discovery, and user experience remain core inputs.',
    },
    {
      discipline: 'AEO',
      role: 'A useful label for work that makes information suitable for direct answers and answer surfaces.',
    },
    {
      discipline: 'GEO',
      role: 'A useful label for work aimed at visibility within generative experiences.',
    },
    {
      discipline: 'Search Intelligence Engineering',
      role: 'The broader operating model that connects retrieval, selection, citation or recommendation, and qualified business outcomes.',
    },
  ],
  closing: [
    'This table explains how Hendricks uses the labels. It does not claim a settled history, boundary, or industry consensus for any acronym.',
    'The useful question is whether the operating model explains the complete observable decision chain and can be tested.',
  ],
} as const

/**
 * The four outcomes map one-to-one onto the four solutions, so each carries the
 * link to the solution that delivers it. This is what satisfies the rule in
 * docs/03 §6 that a category definition links to all four solutions.
 */
export const outcomes = {
  eyebrow: 'Four Outcomes',
  title: 'What the discipline is accountable for.',
  items: [
    {
      number: '01',
      name: 'Measure demand',
      description:
        'Understand the commercially important needs, questions, comparisons, and buying contexts in the market.',
      solution: {
        label: 'Search Demand Intelligence',
        href: routes.searchDemandIntelligence.path,
      },
    },
    {
      number: '02',
      name: 'Understand AI visibility and selection',
      description:
        'Observe whether a brand is found, understood, considered, cited, and recommended across defined customer contexts.',
      solution: { label: 'Selection Intelligence', href: routes.selectionIntelligence.path },
    },
    {
      number: '03',
      name: 'Engineer the search presence',
      description:
        'Improve technical access, entity clarity, content, evidence, authority, acquisition, and conversion conditions.',
      solution: {
        label: 'Search Presence Engineering',
        href: routes.searchPresenceEngineering.path,
      },
    },
    {
      number: '04',
      name: 'Prove business impact',
      description:
        'Connect exposure with behavior, qualified demand, opportunities, pipeline, and revenue using the strongest available evidence.',
      solution: {
        label: 'Search Impact Measurement',
        href: routes.searchImpactMeasurement.path,
      },
    },
  ],
} as const

export const operatingModel = {
  eyebrow: 'Seven-Step Operating Model',
  title: 'Move from a fixed question panel to the strongest available outcome evidence.',
  steps: [
    {
      marker: '01',
      title: 'Map the entity and evidence graph.',
      body: [
        'Inventory canonical people, organizations, products, research assets, datasets, profiles, identifiers, and independent references. Resolve conflicting names, descriptions, URLs, and dates.',
      ],
    },
    {
      marker: '02',
      title: 'Define and freeze the question panel.',
      body: [
        'Choose questions that represent the audience\'s informational, comparative, and recommendation tasks. Freeze the panel before testing so unfavorable results cannot be removed after the fact.',
      ],
    },
    {
      marker: '03',
      title: 'Establish a baseline by surface.',
      body: [
        'Run the panel independently on each approved surface. Preserve the date, product or model label, mode, account state, geography when known, full output, citations, and failures. Do not blend surfaces into an unexplained average.',
      ],
    },
    {
      marker: '04',
      title: 'Classify observable outcomes.',
      body: [
        'Separate direct citations, mediated citations, attributed mentions, recommendations, unclear results, and no selection. Preserve negative and null results.',
      ],
    },
    {
      marker: '05',
      title: 'Improve one verified constraint.',
      body: [
        'Clarify one entity relationship, fill one evidence gap, improve one canonical explanation, or repair one measurement weakness. Avoid changing several variables when the objective is to learn which intervention mattered.',
      ],
    },
    {
      marker: '06',
      title: 'Re-run and compare.',
      body: [
        'Use the same question panel and document unavoidable changes in product behavior or test conditions. Treat a directional comparison as directional, not causal.',
      ],
    },
    {
      marker: '07',
      title: 'Connect authority to qualified outcomes.',
      body: [
        'Capture research downloads, relevant visits, subscriptions, replies, meeting requests, inquiries, opportunities, and revenue with the strongest available evidence. Leave unavailable measurements blank.',
      ],
    },
  ],
  cta: {
    label: 'See How the System Works',
    href: routes.howItWorks.path,
    analytics: { location: 'wisie_operating_model' },
  } satisfies Cta,
} as const

export const pilot = {
  eyebrow: 'Pilot Protocol',
  title: 'A falsifiable pilot, not a reported result or a causal study.',
  status:
    'Status: proposed pilot protocol. It has not produced a result, and its repeat count and decision threshold must be declared before the first run.',
  hypothesis:
    'Pilot hypothesis: publishing one complete canonical definition asset with explicit authorship, visible methods, supporting research, and accurate machine-readable metadata will change direct-citation frequency for a frozen panel of relevant non-branded questions on at least one measured surface.',
  steps: [
    {
      marker: '01',
      title: 'Pre-register the panel and scoring rule.',
      body: [
        'Freeze the questions, surfaces, classification rules, repeat count, comparison window, and decision threshold before changing the asset.',
      ],
    },
    {
      marker: '02',
      title: 'Record the baseline.',
      body: [
        'Run the declared repeats under documented conditions and preserve every output, citation, failure, and null result.',
      ],
    },
    {
      marker: '03',
      title: 'Publish one bounded intervention.',
      body: [
        'Make the approved canonical-page change without bundling unrelated site, distribution, or outreach changes into the same test.',
      ],
    },
    {
      marker: '04',
      title: 'Allow a documented discovery interval.',
      body: [
        'Record crawl or indexing requests as requests only. Do not treat submission to a crawl queue as proof of indexing or retrieval.',
      ],
    },
    {
      marker: '05',
      title: 'Repeat under comparable conditions.',
      body: [
        'Use the same panel, scoring rule, and declared repeat count. Record any change in surface, model label, account state, region, or mode.',
      ],
    },
    {
      marker: '06',
      title: 'Report every outcome.',
      body: [
        'Publish positive, negative, null, unclear, and unavailable results together. Separate observed differences from proposed explanations.',
      ],
    },
  ],
  falsification:
    'Falsification rule: the pilot does not support its hypothesis if the predeclared direct-citation threshold is not met on any measured surface, or if a simultaneous confound better explains the observed change.',
  interpretation:
    'Interpretation limit: a before-and-after pilot can report a directional association under documented conditions. It cannot establish a universal mechanism or causal effect by itself.',
} as const

export const limitations = {
  eyebrow: 'Limitations',
  title: 'The framework starts by naming what outside observation cannot prove.',
  label: 'Evidence boundaries',
  items: [
    'External search and AI products can change their models, indexes, interfaces, and citation behavior between observations.',
    'Outputs can vary across runs, regions, accounts, context, and product modes.',
    'A visible citation does not reveal every source or internal step used to form an output.',
    'A missing citation does not prove the source was never retrieved or used.',
    'An observational before-and-after difference does not establish causation by itself.',
    'A self-authored definition demonstrates a point of view, not independent adoption or industry consensus.',
    'Revenue attribution remains incomplete without first-party journey evidence or clearly separated self-reported evidence.',
    'Improving machine-readable identity and evidence does not guarantee selection by a third-party system.',
  ],
  closing:
    'The response to these limits is smaller claims, preserved evidence, visible protocols, and explicit uncertainty.',
} as const

export const reproducibility = {
  eyebrow: 'Reproducibility and The Answer Index',
  title: 'An authority claim should leave an inspectable record.',
  lead:
    'A reproducible record exposes enough context for another reviewer to understand what was tested, what was observed, and what remains uncertain.',
  requirements: [
    'The frozen question panel and any exclusions',
    'The surface, date, mode, model or product label, account state, and known geography',
    'The classification definitions and scoring rule',
    'The complete outputs, failures, negative results, and null results',
    'The intervention and the conditions held constant',
    'The release version, file inventory, and integrity information for published data',
    'The limitations, corrections, and unresolved uncertainties',
  ],
  body: [
    'The Answer Index is Hendricks\'s versioned first-party measurement program for examining what AI answer engines cite across a defined panel. Its canonical page and archived record identify the current public scope, release, dataset, corrections, and limitations.',
    'This definition page does not repeat release-specific findings or a package version. The canonical research record remains the source of truth when a corrected release replaces an earlier package.',
    'Search Intelligence Engineering is the operating discipline around that work: understand the decision chain, improve the evidence, test selection, and connect observable outcomes to commercial value without overstating what the data proves.',
  ],
  study: {
    label: 'Read The Answer Index',
    href: routes.researchTheAnswerIndex.path,
    analytics: { location: 'wisie_answer_index' },
  } satisfies Cta,
  dataset: {
    label: 'Open the latest archived Answer Index record',
    href: 'https://doi.org/10.5281/zenodo.22242102',
    external: true,
    analytics: { location: 'wisie_answer_index_doi' },
  } satisfies Cta,
} as const

export const faq = {
  eyebrow: 'FAQ',
  title: 'Questions about the framework and its limits.',
  entries: [
    {
      term: 'What is Search Intelligence Engineering?',
      definition: [
        'Search Intelligence Engineering is the evidence-driven discipline of understanding and improving how search and AI systems retrieve, select, cite, and recommend information while measuring how those observable decisions connect to business outcomes.',
      ],
    },
    {
      term: 'Is Search Intelligence Engineering the same as SEO?',
      definition: [
        'No. SEO remains a major input because access, relevance, authority, organic discovery, and user experience still matter. Search Intelligence Engineering continues from retrieval through selection, citation or recommendation, and outcome measurement.',
      ],
    },
    {
      term: 'Is it another name for GEO or AEO?',
      definition: [
        'No. In this framework, GEO and AEO describe narrower tactical scopes. Search Intelligence Engineering connects those activities to a larger, testable decision chain. This is Hendricks\'s usage, not a claim of industry consensus.',
      ],
    },
    {
      term: 'What is Selection Intelligence?',
      definition: [
        'Selection Intelligence is the study and measurement of why an AI or search system selects one source, entity, brand, product, or action over alternatives. It focuses on decisions between candidate availability and visible use.',
      ],
    },
    {
      term: 'How do LLMs choose sources?',
      definition: [
        'There is no single mechanism this framework assumes. In an observed application, retrieval, filtering, reranking, orchestration, context, model behavior, tools, and interface rules are possible test areas. Product-specific claims require documentation or reproducible evidence.',
      ],
    },
    {
      term: 'Can a business ensure that an AI system will cite it?',
      definition: [
        'No. A business can improve the access, clarity, identity, evidence quality, and corroboration of its assets, but a third-party system controls its own retrieval and selection behavior.',
      ],
    },
    {
      term: 'How should AI-search visibility be measured?',
      definition: [
        'Use a frozen question panel, repeat the declared runs, preserve complete outputs, identify the surface and conditions, and separate direct citations, mediated citations, mentions, recommendations, failures, and null results.',
      ],
    },
    {
      term: 'Can an AI citation be tied to revenue?',
      definition: [
        'Sometimes, but only when a defensible evidence trail connects the citation or authority asset to a qualified action, opportunity, and closed record. Citation alone is not revenue.',
      ],
    },
    {
      term: 'What is The Answer Index?',
      definition: [
        'The Answer Index is Hendricks\'s versioned first-party measurement program for examining what AI answer engines cite across a defined research panel. Its canonical page identifies the current public release and archived dataset.',
      ],
    },
  ],
} as const

export const sources = {
  reviewed: '2026-10-03',
  basis:
    'This is a Hendricks-defined operating framework. Mechanism lists are experiment maps, not claims about universal product architecture or ranking factors.',
  appliedIn: [
    { label: 'the four solutions', href: routes.solutions.path },
    { label: 'the delivery system', href: routes.howItWorks.path },
    { label: 'The Answer Index', href: routes.researchTheAnswerIndex.path },
  ],
} as const

export const changeHistory = [
  {
    date: '2026-08-16',
    kind: 'publication',
    summary: 'First publication of this page.',
  },
  {
    date: '2026-10-03',
    kind: 'update',
    summary:
      'Expanded the framework, methods, and limitations, and corrected the page\'s structured-data relationships.',
  },
] satisfies readonly ChangeEntry[]

/**
 * The first two entries are the destinations the approved markdown names under
 * "Related CTAs". Everything after them is an internal-linking decision under
 * docs/03 §6 rather than approved copy, which is the established pattern on this
 * page and on /ai-selection-problem.
 *
 * The two entry-vocabulary pages sit third and fourth on purpose. This page
 * carries the explicit SEO, GEO, and AEO relationship table, and a reader who
 * arrived on that vocabulary needs somewhere to go next. The related block
 * supplies that path without turning a definition table into navigation.
 */
/** The page's own outline, in the order the stations render. */
export const contents = [
  { id: 'why-it-exists', label: 'Why a larger discipline' },
  { id: 'four-layer-framework', label: 'Four-layer framework' },
  { id: 'agentic-search-pipeline', label: 'Agentic-search pipeline' },
  { id: 'foundational-expert', label: 'Foundational and expert views' },
  { id: 'brand-implications', label: 'What this means for brands' },
  { id: 'related-disciplines', label: 'SEO, GEO, and AEO' },
  { id: 'four-outcomes', label: 'Four solution links' },
  { id: 'operating-model', label: 'Seven-step operating model' },
  { id: 'pilot-protocol', label: 'Pilot protocol' },
  { id: 'limitations', label: 'Limitations' },
  { id: 'reproducibility', label: 'Reproducibility' },
  { id: 'faq', label: 'FAQ' },
  { id: 'sources', label: 'Sources' },
  { id: 'change-history', label: 'Change history' },
  { id: 'related-terms', label: 'Related terms' },
  { id: 'related', label: 'Related solutions and methodology' },
] as const

export const relatedSection = {
  eyebrow: 'Related Solutions and Methodology',
  title: 'Related solutions and methodology',
} as const

export const related: readonly RelatedEntry[] = [
  {
    href: routes.solutions.path,
    label: 'Explore the four solutions',
    description: 'How the discipline is delivered as demand, selection, presence, and impact.',
  },
  {
    href: routes.howItWorks.path,
    label: 'See how the system works',
    description: 'The six stages, who owns what, and the operating cycle.',
  },
  {
    href: routes.whatIsGenerativeEngineOptimization.path,
    label: 'What Is Generative Engine Optimization?',
    description: 'What generative engine optimization covers, and where the framing runs out.',
  },
  {
    href: routes.whatIsAiMediatedSearch.path,
    label: 'What Is AI-Mediated Search?',
    description: 'Where AI-mediated search happens, and which systems Hendricks observes.',
  },
  {
    href: routes.whatIsSelectionIntelligence.path,
    label: 'What Is Selection Intelligence?',
    description: 'The measurement layer that shows where consideration is lost.',
  },
  {
    href: routes.aiSelectionProblem.path,
    label: 'The AI Selection Problem',
    description: 'Why being discovered no longer means being chosen.',
  },
  {
    href: routes.methodology.path,
    label: 'Methodology',
    description: 'How contexts are defined, classified, weighted, and graded.',
  },
]

export const closing = {
  eyebrow: 'Find the Gap',
  title: 'Find where your brand is losing consideration.',
  primaryCta: {
    label: 'Start with a Search Intelligence Diagnostic',
    href: routes.diagnostic.path,
    analytics: { location: 'wisie_closing' },
  } satisfies Cta,
} as const
