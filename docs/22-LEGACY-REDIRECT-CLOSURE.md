# Legacy Redirect Closure

Date: 2026-10-04

## Goal

Preserve authority and referral traffic for the retired Search Intelligence
Engineering glossary URL without changing any stable current URL or immutable
research artifact.

## Implementation plan

1. Add apex-absolute permanent redirects for the exact legacy definitions and
   authority-bearing social URLs that have true current equivalents, ordered
   ahead of the `www` host catch-all so both hostnames resolve in one hop.
2. Record the disposition in `migration/redirect-map.csv` as a shipped 308.
3. Add unit coverage that proves the source is permanent, lands on a built
   route, stays outside the Gone list, and does not create a redirect chain.
4. Run the focused redirect tests, then the full project verification gate.
5. Verify the preview and production response status and `Location` header.

## Route checklist

| Source | Destination | Disposition | Action |
|---|---|---:|---|
| `/glossary/search-intelligence-engineering` | `https://hendricks.ai/what-is-search-intelligence-engineering` | 308 | Add and verify in one hop |
| `/glossary/ai-search-visibility` | `https://hendricks.ai/what-is-ai-mediated-search#vocabulary` | 308 | Add and verify in one hop |
| `/search-intelligence-engineering` | `https://hendricks.ai/what-is-search-intelligence-engineering` | 308 | Existing, retain |
| `/ai-search-intelligence` | `https://hendricks.ai/what-is-search-intelligence-engineering` | 308 | Existing, retain |
| `/glossary` | `https://hendricks.ai/what-is-search-intelligence-engineering` | 308 | Existing, retain |
| `/research/the-answer-index` | unchanged | 200 | Current LinkedIn target, retain |
| `/insights/ai-search-visibility-revenue-impact` | `https://hendricks.ai/solutions/search-impact-measurement` | 308 | Existing LinkedIn target, retain |
| `/insights/what-is-search-intelligence-engineer` | none | 410 | Intentional role-article retirement, retain |
| Exact Zenodo version DOIs and versioned downloads | unchanged | immutable | Retain |

No wildcard glossary redirect is permitted. The archive contains 126 unique
term URLs, and 124 had no documented disposition when this work began.
First-party search performance data confirms retained demand across this
archive, but URL-level metrics are intentionally excluded from this public
artifact. Those URLs must be reviewed for preservation or evidence-led
rebuilding before any 410 is added. A broad redirect or broad 410 would destroy
measured authority. The detailed recovery inventory belongs in a separate
content migration batch; this redirect batch changes only exact equivalents
and already cited social targets.
