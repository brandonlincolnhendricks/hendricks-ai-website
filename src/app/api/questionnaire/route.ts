import { randomBytes } from 'node:crypto'

import { NextResponse } from 'next/server'

import { checkRateLimit, identifierFromHeaders } from '@/lib/forms/rate-limit'
import {
  DRAFT_ID_PATTERN,
  isQuestionnaireSlug,
  MAX_BODY_CHARS,
  questionnaireSaveSchema,
} from '@/lib/questionnaire/schema'
import { loadQuestionnaireDraft, saveQuestionnaire } from '@/lib/questionnaire/store'

/**
 * /api/questionnaire, the backup behind the client questionnaires.
 *
 * POST saves a draft (`kind: backup`, sent automatically while the respondent
 * types and again as the tab closes) or submits it (`kind: final`). GET hands a
 * draft back by its id, which is what makes one link resumable on any device.
 *
 * The body is read as text because the close-of-tab save arrives through
 * `navigator.sendBeacon`, which posts `text/plain`.
 *
 * Abuse surface: a slug allowlist, a 128-bit draft id, size ceilings, a
 * same-origin check for browsers, and a per-address window separate from the
 * lead forms' bucket so a long questionnaire session cannot lock anyone out of
 * the contact form.
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const HEADERS = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' }

/** Generous: a backup goes out about once a minute while someone is typing. */
const WRITE_LIMIT = { limit: 240, windowSeconds: 60 * 60 }
const READ_LIMIT = { limit: 60, windowSeconds: 10 * 60 }

function reply(body: Record<string, unknown>, status = 200, extra: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...HEADERS, ...extra } })
}

function newRequestId(): string {
  return `q-${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`
}

/**
 * A browser always sends Origin on a cross-site POST, so a mismatch is a page
 * on another site trying to write here. A request with no Origin is not a
 * browser and is left to the rate limit.
 */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return reply({ ok: false, code: 'FORBIDDEN' }, 403)

  const text = await request.text()
  if (text.length > MAX_BODY_CHARS) return reply({ ok: false, code: 'TOO_LARGE' }, 413)

  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return reply({ ok: false, code: 'VALIDATION_ERROR' }, 400)
  }

  const parsed = questionnaireSaveSchema.safeParse(body)
  if (!parsed.success) return reply({ ok: false, code: 'VALIDATION_ERROR' }, 400)

  const limit = await checkRateLimit({
    identifier: `questionnaire-write:${identifierFromHeaders(request.headers)}`,
    ...WRITE_LIMIT,
  })
  if (!limit.allowed) {
    return reply({ ok: false, code: 'RATE_LIMITED' }, 429, {
      'retry-after': String(limit.retryAfterSeconds),
    })
  }

  const requestId = newRequestId()
  const result = await saveQuestionnaire(parsed.data, requestId)
  const stored = result.sheet === 'success' || result.sheet === 'stale'

  // A backup exists only if the sheet has it. A submission has arrived if
  // either the sheet or the email has it; the page falls back to its own
  // channel only when neither does.
  const ok = parsed.data.kind === 'final' ? stored || result.email === 'success' : stored

  return reply(
    { ok, requestId, kind: parsed.data.kind, sheet: result.sheet, email: result.email },
    ok ? 200 : 502,
  )
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const slug = url.searchParams.get('slug') ?? ''
  const draftId = url.searchParams.get('draft') ?? ''

  if (!isQuestionnaireSlug(slug) || !DRAFT_ID_PATTERN.test(draftId)) {
    return reply({ ok: false, code: 'VALIDATION_ERROR' }, 400)
  }

  const limit = await checkRateLimit({
    identifier: `questionnaire-read:${identifierFromHeaders(request.headers)}`,
    ...READ_LIMIT,
  })
  if (!limit.allowed) {
    return reply({ ok: false, code: 'RATE_LIMITED' }, 429, {
      'retry-after': String(limit.retryAfterSeconds),
    })
  }

  const lookup = await loadQuestionnaireDraft(slug, draftId, newRequestId())

  if (lookup.status === 'found') return reply({ ok: true, draft: lookup.draft })
  if (lookup.status === 'not-found') return reply({ ok: false, code: 'NOT_FOUND' }, 404)
  return reply({ ok: false, code: 'UNAVAILABLE' }, 503)
}
