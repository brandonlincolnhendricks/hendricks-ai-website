import { routes } from '@/config/routes'

/** Every live DefinedTerm that joins the shared vocabulary node. */
export const DEFINED_TERM_MEMBERS = [
  {
    name: 'Search Intelligence Engineering',
    path: routes.whatIsSearchIntelligenceEngineering.path,
  },
  { name: 'Selection Intelligence', path: routes.whatIsSelectionIntelligence.path },
  { name: 'AI-Mediated Search', path: routes.whatIsAiMediatedSearch.path },
  {
    name: 'Generative Engine Optimization',
    path: routes.whatIsGenerativeEngineOptimization.path,
  },
] as const

/**
 * The definition routes, as a set of paths.
 *
 * A definition page's "Related terms" block is its own approved related links
 * filtered through this set, so the vocabulary a page points at is derived from
 * the route registry rather than retyped per page.
 */
export const DEFINITION_ROUTE_PATHS: ReadonlySet<string> = new Set([
  ...DEFINED_TERM_MEMBERS.map(({ path }) => path),
  routes.aiSelectionProblem.path,
])

export function isDefinitionRoute(href: string): boolean {
  return DEFINITION_ROUTE_PATHS.has(href)
}
