import 'server-only'

import { createSign } from 'node:crypto'

import { env } from '@/lib/env'

/**
 * The Google Sheets adapter behind the CRM channel (Brandon, 2026-09-07: "my
 * CRM, which can be Google Sheets for now").
 *
 * A service account signs its own JWT and trades it for a one-hour access
 * token; the row is then appended with one POST. No SDK: the whole exchange is
 * two requests, and a serverless function keeps no client alive between
 * invocations for a library to reuse.
 *
 * The account holds no project role. Its only access is the writer share on
 * the one spreadsheet, so the blast radius of the key is that sheet and
 * nothing else in the project. Rotating the key means minting a new one on
 * the account and replacing the two variables in Vercel.
 *
 * Every failure is logged with the request id and never with a value: the
 * row carries names and addresses, and a thrown fetch error can echo the body.
 */

export const CRM_TABS = {
  leads: 'Leads',
  visibilityChecks: 'Visibility Checks',
  questionnaires: 'Questionnaires',
} as const

export type CrmTab = (typeof CRM_TABS)[keyof typeof CRM_TABS]

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'

/** Refresh a minute early so a token never expires mid-request. */
const TOKEN_MARGIN_SECONDS = 60

export const sheetIsConfigured = Boolean(
  env.GOOGLE_SHEETS_CLIENT_EMAIL && env.GOOGLE_SHEETS_PRIVATE_KEY && env.CRM_SHEET_ID,
)

/**
 * The PEM, whichever way it was stored. Vercel holds it base64 encoded so the
 * newlines survive every UI; a local `.env` may hold it verbatim with `\n`
 * escapes, which is how Google's own key file prints it.
 */
function privateKeyPem(): string {
  const raw = env.GOOGLE_SHEETS_PRIVATE_KEY ?? ''
  if (raw.includes('-----BEGIN')) return raw.replace(/\\n/g, '\n')
  return Buffer.from(raw, 'base64').toString('utf8').replace(/\\n/g, '\n')
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url')
}

let cached: { token: string; expiresAt: number } | null = null

async function accessToken(now = Date.now()): Promise<string> {
  if (cached && cached.expiresAt - TOKEN_MARGIN_SECONDS * 1000 > now) return cached.token

  const issuedAt = Math.floor(now / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = base64url(
    JSON.stringify({
      iss: env.GOOGLE_SHEETS_CLIENT_EMAIL,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: issuedAt,
      exp: issuedAt + 3600,
    }),
  )

  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${claims}`)
  const signature = signer.sign(privateKeyPem(), 'base64url')
  const assertion = `${header}.${claims}.${signature}`

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  })

  if (!response.ok) throw new Error(`token exchange responded ${response.status}`)

  const body = (await response.json()) as { access_token?: string; expires_in?: number }
  if (!body.access_token) throw new Error('token exchange returned no token')

  cached = { token: body.access_token, expiresAt: now + (body.expires_in ?? 3600) * 1000 }
  return cached.token
}

export type SheetAppendStatus = 'success' | 'failed' | 'skipped'

/**
 * Appends one row under the tab's header. `RAW` so a value that starts with
 * `=` or `+` is stored as text rather than evaluated: every cell is visitor
 * supplied, and a formula in a CRM row is an injection, not a feature.
 */
export async function appendSheetRow({
  tab,
  values,
  requestId,
}: {
  tab: CrmTab
  values: readonly (string | number | boolean)[]
  requestId: string
}): Promise<SheetAppendStatus> {
  if (!sheetIsConfigured) {
    const missing = [
      env.GOOGLE_SHEETS_CLIENT_EMAIL ? null : 'GOOGLE_SHEETS_CLIENT_EMAIL',
      env.GOOGLE_SHEETS_PRIVATE_KEY ? null : 'GOOGLE_SHEETS_PRIVATE_KEY',
      env.CRM_SHEET_ID ? null : 'CRM_SHEET_ID',
    ].filter(Boolean)

    console.error(
      `[crm] ${requestId} was not written to the sheet: unconfigured. Set ${missing.join(', ')}.`,
    )
    return 'skipped'
  }

  try {
    const token = await accessToken()
    const range = encodeURIComponent(`'${tab}'!A1`)
    const url = `${SHEETS_API}/${env.CRM_SHEET_ID}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`

    const response = await fetch(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ majorDimension: 'ROWS', values: [values] }),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error(`[crm] ${requestId} sheet append failed with ${response.status}.`)
      return 'failed'
    }

    return 'success'
  } catch {
    // The caught value can carry the row, so it is not logged.
    console.error(`[crm] ${requestId} sheet append threw.`)
    return 'failed'
  }
}

/** An A1 range on one tab, quoted so a tab name with a space still parses. */
function tabRange(tab: CrmTab, a1: string): string {
  return encodeURIComponent(`'${tab}'!${a1}`)
}

function logUnconfigured(requestId: string, action: string): void {
  console.error(`[crm] ${requestId} could not ${action}: the sheet is unconfigured.`)
}

export type SheetReadResult =
  | { status: 'success'; rows: string[][] }
  | { status: 'missing-tab' }
  | { status: 'failed' }
  | { status: 'skipped' }

/**
 * Reads a block of rows. The questionnaire backup is the only reader: it has
 * to find a draft's row to update it in place, and to hand the draft back
 * when the same link is opened on another device.
 *
 * Sheets answers 400 ("Unable to parse range") for a tab that does not exist
 * yet, which is reported as `missing-tab` so the caller can create it.
 */
export async function readSheetRows({
  tab,
  a1,
  requestId,
}: {
  tab: CrmTab
  a1: string
  requestId: string
}): Promise<SheetReadResult> {
  if (!sheetIsConfigured) {
    logUnconfigured(requestId, 'read the sheet')
    return { status: 'skipped' }
  }

  try {
    const token = await accessToken()
    const response = await fetch(`${SHEETS_API}/${env.CRM_SHEET_ID}/values/${tabRange(tab, a1)}`, {
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    if (response.status === 400) return { status: 'missing-tab' }
    if (!response.ok) {
      console.error(`[crm] ${requestId} sheet read failed with ${response.status}.`)
      return { status: 'failed' }
    }

    const body = (await response.json()) as { values?: unknown[][] }
    const rows = (body.values ?? []).map((row) => row.map((cell) => String(cell ?? '')))
    return { status: 'success', rows }
  } catch {
    console.error(`[crm] ${requestId} sheet read threw.`)
    return { status: 'failed' }
  }
}

/** Overwrites one row in place, starting at column A. `RAW` for the same reason as the append. */
export async function updateSheetRow({
  tab,
  rowNumber,
  values,
  requestId,
}: {
  tab: CrmTab
  rowNumber: number
  values: readonly (string | number | boolean)[]
  requestId: string
}): Promise<SheetAppendStatus> {
  if (!sheetIsConfigured) {
    logUnconfigured(requestId, 'update the sheet')
    return 'skipped'
  }

  try {
    const token = await accessToken()
    const url = `${SHEETS_API}/${env.CRM_SHEET_ID}/values/${tabRange(tab, `A${rowNumber}`)}?valueInputOption=RAW`

    const response = await fetch(url, {
      method: 'PUT',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ majorDimension: 'ROWS', values: [values] }),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error(`[crm] ${requestId} sheet update failed with ${response.status}.`)
      return 'failed'
    }

    return 'success'
  } catch {
    console.error(`[crm] ${requestId} sheet update threw.`)
    return 'failed'
  }
}

/**
 * Creates a tab with a frozen header row, so a new row shape does not depend
 * on someone adding the tab by hand before the first write.
 *
 * A 400 from `addSheet` means the tab already exists, usually because a second
 * request created it a moment earlier. That is not a failure: the header
 * write that follows puts back the same header either way.
 */
export async function createSheetTab({
  tab,
  header,
  requestId,
}: {
  tab: CrmTab
  header: readonly string[]
  requestId: string
}): Promise<SheetAppendStatus> {
  if (!sheetIsConfigured) {
    logUnconfigured(requestId, 'create a tab')
    return 'skipped'
  }

  try {
    const token = await accessToken()
    const response = await fetch(`${SHEETS_API}/${env.CRM_SHEET_ID}:batchUpdate`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title: tab, gridProperties: { frozenRowCount: 1 } } } }],
      }),
      cache: 'no-store',
    })

    if (!response.ok && response.status !== 400) {
      console.error(`[crm] ${requestId} tab creation failed with ${response.status}.`)
      return 'failed'
    }
  } catch {
    console.error(`[crm] ${requestId} tab creation threw.`)
    return 'failed'
  }

  return updateSheetRow({ tab, rowNumber: 1, values: header, requestId })
}

/** Test seam. */
export function resetSheetsTokenForTests(): void {
  cached = null
}
