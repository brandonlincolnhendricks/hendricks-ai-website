import type { LeadSubmissionRecord } from '@/lib/forms/lead-record'

/**
 * The two row shapes the CRM sheet holds, in the exact order of the header
 * row on each tab. Pure functions with no `server-only` marker so a unit test
 * can pin the column order, which is the only contract the sheet has: a column
 * added in the wrong place is a lead whose email lands under "Role".
 *
 * Header, tab "Leads" (31 columns):
 *   Received (UTC), Request ID, Form, Audience, First name, Last name, Work
 *   email, Organization, Website, Role, Primary market, Question, Current
 *   systems, Monthly search investment, Desired timing, Additional context,
 *   Relevant accounts, Preferred model, Marketing opt-in, Landing page,
 *   Referrer, UTM source, UTM medium, UTM campaign, UTM term, UTM content,
 *   Submitted from, Privacy notice version, Status, Owner, Notes
 *
 * Header, tab "Visibility Checks" (28 columns):
 *   Received (UTC), Request ID, Name, Work email, Brand, Website, Domain,
 *   Market phrase, Location, Cells measured, Cells total, Mentioned, Mention
 *   denominator, Cited, Cited denominator, Reading, Top cited domains,
 *   Questions asked, Landing page, Referrer, UTM source, UTM medium, UTM
 *   campaign, Marketing opt-in, Status, Owner, Notes, Result JSON
 *
 * "Status", "Owner" and "Notes" are Brandon's columns. They are written once,
 * as "New" and two blanks, and never touched again by the site.
 */

export const LEAD_ROW_LENGTH = 31
export const VISIBILITY_CHECK_ROW_LENGTH = 28

/** The value a new row opens in Brandon's pipeline column. */
export const NEW_ROW_STATUS = 'New'

/**
 * A cell that a spreadsheet could read as a formula is prefixed with an
 * apostrophe, the same defence the append call's RAW mode gives, applied here
 * too so a CSV export of the sheet is safe as well.
 */
export function cellText(value: string | undefined | null): string {
  if (!value) return ''
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}

export function leadRow(record: LeadSubmissionRecord): string[] {
  const f = record.fields
  const a = record.attribution

  const row = [
    record.submittedAt,
    record.requestId,
    record.formName,
    record.audienceType,
    cellText(f.firstName),
    cellText(f.lastName),
    cellText(f.workEmail),
    cellText(f.organization),
    cellText(f.website),
    cellText(f.role),
    cellText(f.primaryMarket),
    cellText(f.primaryQuestion),
    cellText(f.currentStack),
    cellText(f.monthlySearchInvestment),
    cellText(f.desiredTiming),
    cellText(f.additionalContext),
    cellText(f.relevantAccounts),
    cellText(f.preferredModel),
    record.marketingOptIn ? 'yes' : 'no',
    cellText(a.landingPage),
    cellText(a.referrer),
    cellText(a.utmSource),
    cellText(a.utmMedium),
    cellText(a.utmCampaign),
    cellText(a.utmTerm),
    cellText(a.utmContent),
    cellText(a.currentPage),
    record.privacyNoticeVersion,
    NEW_ROW_STATUS,
    '',
    '',
  ]

  if (row.length !== LEAD_ROW_LENGTH) {
    throw new Error(`leadRow built ${row.length} cells; the Leads tab has ${LEAD_ROW_LENGTH}.`)
  }

  return row
}

export type VisibilityCheckRowInput = {
  submittedAt: string
  requestId: string
  name: string
  workEmail: string
  brandName: string
  website: string
  domain: string
  market: string
  location: string
  cellsMeasured: number
  cellsTotal: number
  mentioned: number
  mentionDenominator: number
  cited: number
  citedDenominator: number
  reading: string
  topDomains: readonly string[]
  questions: readonly string[]
  marketingOptIn: boolean
  attribution: {
    landingPage?: string
    referrer?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
  }
  resultJson: string
}

export function visibilityCheckRow(input: VisibilityCheckRowInput): (string | number)[] {
  const a = input.attribution

  const row: (string | number)[] = [
    input.submittedAt,
    input.requestId,
    cellText(input.name),
    cellText(input.workEmail),
    cellText(input.brandName),
    cellText(input.website),
    cellText(input.domain),
    cellText(input.market),
    cellText(input.location),
    input.cellsMeasured,
    input.cellsTotal,
    input.mentioned,
    input.mentionDenominator,
    input.cited,
    input.citedDenominator,
    input.reading,
    input.topDomains.join(', '),
    input.questions.join(' | '),
    cellText(a.landingPage),
    cellText(a.referrer),
    cellText(a.utmSource),
    cellText(a.utmMedium),
    cellText(a.utmCampaign),
    input.marketingOptIn ? 'yes' : 'no',
    NEW_ROW_STATUS,
    '',
    '',
    input.resultJson,
  ]

  if (row.length !== VISIBILITY_CHECK_ROW_LENGTH) {
    throw new Error(
      `visibilityCheckRow built ${row.length} cells; the Visibility Checks tab has ${VISIBILITY_CHECK_ROW_LENGTH}.`,
    )
  }

  return row
}
