import 'server-only'

import { env } from '@/lib/env'
import type { Cell, EngineId, Question } from '@/lib/visibility-check/schema'
import { citedDomains, isOwnedHost, mentionsBrand } from '@/lib/visibility-check/scoring'

/**
 * The four engine adapters, ported from the Answer Index collector
 * (`~/claudecode/answer-index/collector/engines.py`, itself vendored from the
 * client checker on 2026-08-31). Same endpoints, same request bodies, same
 * parser rules, so the free check reads the engines the way the published
 * research does. Two of those rules are load-bearing and are kept verbatim:
 *
 *  - Gemini returns every citation as a vertexaisearch grounding redirect with
 *    the real source in `title`. Reading `url` alone collapses a run to one
 *    host. The redirect is resolved from the title when the title is a bare
 *    domain, and dropped otherwise rather than credited to google.com.
 *
 *  - A Google AI Overview cites on two surfaces: the `references` card list and
 *    per-element inline `links`. Reading references alone scores an inline-only
 *    citation as absent.
 *
 * One rule is inherited from the collector's caution and is stated in the
 * visitor copy: the AI Overview panel text is not read for a mention, because
 * the vendor's AIO payload has been wrong on presence in both directions on
 * this account. An AIO cell therefore reports citations only, and `mentioned`
 * is `null` there.
 *
 * Gemini rejects `web_search_country_iso_code` with 40501 Invalid Field, so it
 * is not sent for that engine. Do not add it to make the configs symmetrical.
 */

const API = 'https://api.dataforseo.com'

/** United States, country level, and English: the Answer Index capture settings. */
const LOCATION_CODE = 2840
const LANGUAGE_CODE = 'en'

/**
 * Well inside the page's 300 second ceiling once delivery is added. A probe
 * that has not answered in this time is recorded as a timeout, never retried:
 * the run is one capture, and a late answer folded in would be a second one.
 */
const PROBE_TIMEOUT_MS = 170_000

type EngineConfig = {
  path: string
  kind: 'llm' | 'aio'
  body: Record<string, unknown>
}

const ENGINES: Record<EngineId, EngineConfig> = {
  chat_gpt: {
    path: '/v3/ai_optimization/chat_gpt/llm_responses/live',
    kind: 'llm',
    body: { model_name: 'gpt-4.1', web_search: true, web_search_country_iso_code: 'US' },
  },
  perplexity: {
    path: '/v3/ai_optimization/perplexity/llm_responses/live',
    kind: 'llm',
    body: { model_name: 'sonar', web_search: true, web_search_country_iso_code: 'US' },
  },
  gemini: {
    path: '/v3/ai_optimization/gemini/llm_responses/live',
    kind: 'llm',
    body: { model_name: 'gemini-2.5-flash', web_search: true },
  },
  google_aio: {
    path: '/v3/serp/google/organic/live/advanced',
    kind: 'aio',
    body: { load_async_ai_overview: true, depth: 10 },
  },
}

const GROUNDING_REDIRECT_HOSTS = new Set(['vertexaisearch.cloud.google.com'])
const BARE_DOMAIN = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/

export const engineIsConfigured = Boolean(env.DATAFORSEO_LOGIN && env.DATAFORSEO_PASSWORD)

type Annotation = { url?: string; title?: string }
type Section = { text?: string; annotations?: Annotation[] }
type LlmItem = { sections?: Section[] }
type Reference = { url?: string; domain?: string; title?: string }
type AioElement = { links?: Reference[] }
type SerpItem = {
  type?: string
  references?: Reference[]
  items?: AioElement[]
  asynchronous_ai_overview?: boolean
  markdown?: string
}

type ApiResponse = {
  status_code?: number
  status_message?: string
  tasks?: { status_code?: number; status_message?: string; cost?: number; result?: unknown[] }[]
}

function resolveAnnotationUrl(url: string | undefined, title: string | undefined): string | null {
  if (url && url.startsWith('http')) {
    let host = ''
    try {
      host = new URL(url).hostname.toLowerCase()
    } catch {
      return null
    }
    if (!GROUNDING_REDIRECT_HOSTS.has(host)) return url
    const bare = (title ?? '').trim().toLowerCase()
    return BARE_DOMAIN.test(bare) ? `https://${bare}` : null
  }
  if (title && title.startsWith('http')) return title
  return null
}

export type ParsedLlm = { answer: string; urls: string[] }

export function parseLlm(result: { items?: LlmItem[] }): ParsedLlm {
  const text: string[] = []
  const urls: string[] = []

  for (const item of result.items ?? []) {
    for (const section of item.sections ?? []) {
      if (section.text) text.push(section.text)
      for (const annotation of section.annotations ?? []) {
        const resolved = resolveAnnotationUrl(annotation.url, annotation.title)
        if (resolved) urls.push(resolved)
      }
    }
  }

  return { answer: text.join(' '), urls }
}

export type ParsedAio = { panel: 'shown' | 'none'; urls: string[] }

export function parseAio(result: { items?: SerpItem[] }): ParsedAio {
  for (const item of result.items ?? []) {
    if (item.type !== 'ai_overview') continue

    const references = item.references ?? []
    const inline = (item.items ?? []).flatMap((element) => element.links ?? [])

    // `asynchronous_ai_overview` only means Google rendered the panel via a
    // second request. Treat it as unresolved only when there is nothing to read.
    if (item.asynchronous_ai_overview && references.length === 0 && inline.length === 0 && !item.markdown) {
      return { panel: 'none', urls: [] }
    }

    const urls: string[] = []
    for (const reference of [...references, ...inline]) {
      const url = reference.url ?? ''
      if (url.startsWith('http') && !urls.includes(url)) urls.push(url)
    }

    return { panel: 'shown', urls }
  }

  return { panel: 'none', urls: [] }
}

async function post(path: string, body: unknown, signal: AbortSignal): Promise<ApiResponse> {
  const credentials = Buffer.from(`${env.DATAFORSEO_LOGIN}:${env.DATAFORSEO_PASSWORD}`).toString(
    'base64',
  )

  const response = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { authorization: `Basic ${credentials}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal,
    cache: 'no-store',
  })

  if (!response.ok) throw new Error(`api ${response.status}`)
  return (await response.json()) as ApiResponse
}

function firstResult(response: ApiResponse): { result: Record<string, unknown>; cost: number } {
  if (response.status_code !== 20000) throw new Error(`api ${response.status_code}`)
  const task = response.tasks?.[0]
  if (!task || task.status_code !== 20000) throw new Error(`task ${task?.status_code}`)
  const result = (task.result?.[0] ?? {}) as Record<string, unknown>
  return { result, cost: task.cost ?? 0 }
}

function failed(engine: EngineId, question: Question, failure: Cell['failure']): Cell {
  return {
    engine,
    questionId: question.id,
    status: 'failed',
    mentioned: null,
    cited: false,
    citedDomains: [],
    citationCount: 0,
    answerLength: 0,
    cost: 0,
    failure,
  }
}

/**
 * One cell: one question on one engine. Never throws; a failure is a cell in
 * the failed state with a category, because the run's denominator has to
 * count it and the visitor has to see it.
 */
export async function probe({
  engine,
  question,
  brandName,
  domain,
}: {
  engine: EngineId
  question: Question
  brandName: string
  domain: string
}): Promise<Cell> {
  if (!engineIsConfigured) return failed(engine, question, 'unconfigured')

  const config = ENGINES[engine]
  const signal = AbortSignal.timeout(PROBE_TIMEOUT_MS)

  const body =
    config.kind === 'llm'
      ? [{ ...config.body, user_prompt: question.text }]
      : [
          {
            ...config.body,
            keyword: question.text,
            location_code: LOCATION_CODE,
            language_code: LANGUAGE_CODE,
          },
        ]

  let result: Record<string, unknown>
  let cost = 0

  try {
    ;({ result, cost } = firstResult(await post(config.path, body, signal)))
  } catch (error) {
    const timeout = error instanceof Error && error.name === 'TimeoutError'
    // The category is logged; the provider's message is not, because it can
    // echo the request body.
    console.error(`[visibility-check] ${engine} ${question.id} ${timeout ? 'timed out' : 'failed'}.`)
    return failed(engine, question, timeout ? 'timeout' : 'api')
  }

  if (config.kind === 'llm') {
    const { answer, urls } = parseLlm(result as { items?: LlmItem[] })
    const domains = citedDomains(urls)
    return {
      engine,
      questionId: question.id,
      status: 'measured',
      mentioned: mentionsBrand(answer, brandName),
      cited: domains.some((host) => isOwnedHost(host, domain)),
      citedDomains: domains,
      citationCount: urls.length,
      answerLength: answer.length,
      cost,
    }
  }

  const { panel, urls } = parseAio(result as { items?: SerpItem[] })
  const domains = citedDomains(urls)
  return {
    engine,
    questionId: question.id,
    status: 'measured',
    mentioned: null,
    cited: domains.some((host) => isOwnedHost(host, domain)),
    citedDomains: domains,
    citationCount: urls.length,
    answerLength: 0,
    panel,
    cost,
  }
}
