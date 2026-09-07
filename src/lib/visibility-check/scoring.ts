import type { Cell, EngineId, Summary } from '@/lib/visibility-check/schema'
import { engineIds } from '@/lib/visibility-check/schema'

/**
 * How a cell is read, and how twenty cells become one sentence.
 *
 * Two readings per cell, never blended. "Mentioned" is the brand's name in the
 * answer text; "cited" is the brand's domain among the sources the answer
 * linked. They diverge often, which is the finding the check exists to show,
 * and the summary keeps them apart with their own denominators.
 */

/** The registrable host of a website, without a leading `www.`. */
export function brandDomain(website: string): string {
  const host = new URL(website).hostname.toLowerCase()
  return host.startsWith('www.') ? host.slice(4) : host
}

/** The host of a cited URL, normalized the same way, or null when unparseable. */
export function citedHost(url: string): string | null {
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (!host) return null
    return host.startsWith('www.') ? host.slice(4) : host
  } catch {
    return null
  }
}

/** True when `host` is the brand's domain or a subdomain of it. */
export function isOwnedHost(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Whether the answer names the brand as a word, not as a fragment of a longer
 * one: "Hendricks" must not match "Hendrickson". Letters and digits on either
 * side break the match; punctuation and space do not, so "Hendricks," and
 * "(Hendricks)" both count.
 */
export function mentionsBrand(text: string, brandName: string): boolean {
  const needle = escapeRegExp(brandName.trim().replace(/\s+/g, ' '))
  if (needle.length === 0) return false
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${needle.replace(/ /g, '\\s+')}(?=$|[^\\p{L}\\p{N}])`, 'iu')
  return pattern.test(text)
}

/** Every distinct cited host in an answer, in first-seen order. */
export function citedDomains(urls: readonly string[]): string[] {
  const seen: string[] = []
  for (const url of urls) {
    const host = citedHost(url)
    if (host && !seen.includes(host)) seen.push(host)
  }
  return seen
}

/** The three assistants read a mention; Google AI Overviews does not. */
export const MENTION_ENGINES: readonly EngineId[] = engineIds.filter((id) => id !== 'google_aio')

const TOP_DOMAINS = 8

export function readingSentence({
  brandName,
  reading,
  cited,
  citedDenominator,
  mentioned,
  mentionDenominator,
  cellsMeasured,
  cellsTotal,
  runAt,
}: {
  brandName: string
  reading: Summary['reading']
  cited: number
  citedDenominator: number
  mentioned: number
  mentionDenominator: number
  cellsMeasured: number
  cellsTotal: number
  runAt: string
}): string {
  const when = runAt.slice(0, 16).replace('T', ' ') + ' UTC'
  const health = `${cellsMeasured} of ${cellsTotal} cells measured on ${when}`

  if (reading === 'unmeasured') {
    return `No reading. ${health}. Too few answers returned to say anything about ${brandName}.`
  }

  if (reading === 'cited') {
    return `${brandName} was cited as a source in ${cited} of ${citedDenominator} answers and named in ${mentioned} of ${mentionDenominator}. ${health}.`
  }

  if (reading === 'mentioned') {
    return `${brandName} was named in ${mentioned} of ${mentionDenominator} answers and cited as a source in 0 of ${citedDenominator}. ${health}.`
  }

  return `${brandName} was neither named nor cited in any of the ${citedDenominator} measured answers. ${health}.`
}

export function summarize({
  cells,
  brandName,
  domain,
  runAt,
}: {
  cells: readonly Cell[]
  brandName: string
  domain: string
  runAt: string
}): Summary {
  const measured = cells.filter((cell) => cell.status === 'measured')
  const mentionCells = measured.filter((cell) => cell.mentioned !== null)

  const cited = measured.filter((cell) => cell.cited).length
  const mentioned = mentionCells.filter((cell) => cell.mentioned).length

  const counts = new Map<string, number>()
  for (const cell of measured) {
    for (const host of cell.citedDomains) counts.set(host, (counts.get(host) ?? 0) + 1)
  }

  const topDomains = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_DOMAINS)
    .map(([host, count]) => ({ domain: host, cells: count, owned: isOwnedHost(host, domain) }))

  /**
   * A reading needs at least half the cells. Below that the run is reported as
   * unmeasured rather than as absence, because "absent from 3 of 20" is a
   * statement about the run, not about the brand.
   */
  const enough = measured.length >= Math.ceil(cells.length / 2)

  const reading: Summary['reading'] = !enough
    ? 'unmeasured'
    : cited > 0
      ? 'cited'
      : mentioned > 0
        ? 'mentioned'
        : 'absent'

  const costUsd = Math.round(cells.reduce((sum, cell) => sum + (cell.cost || 0), 0) * 10_000) / 10_000

  return {
    cellsTotal: cells.length,
    cellsMeasured: measured.length,
    cellsFailed: cells.length - measured.length,
    mentionDenominator: mentionCells.length,
    mentioned,
    citedDenominator: measured.length,
    cited,
    topDomains,
    reading,
    sentence: readingSentence({
      brandName,
      reading,
      cited,
      citedDenominator: measured.length,
      mentioned,
      mentionDenominator: mentionCells.length,
      cellsMeasured: measured.length,
      cellsTotal: cells.length,
      runAt,
    }),
    costUsd,
  }
}
