import { z } from 'zod'

import { BUSINESS_EMAIL_MESSAGE, isBusinessEmail } from '@/lib/forms/business-email'

import {
  type ContactAudience,
  contactAudienceValues,
  desiredTimingValues,
  diagnosticAudienceValues,
  monthlySearchInvestmentValues,
  preferredModelValues,
  relevantAccountsValues,
} from '@/lib/forms/lead-options'

/**
 * The lead contract for the three forms (docs/15 section 2, 15 sections 4 to 6).
 *
 * One discriminated union rather than three unrelated schemas. The three forms
 * ask overlapping questions of different audiences, so the field names have to
 * mean the same thing in every submission or the inbox cannot be read as one
 * queue. The union is what keeps "required on the Diagnostic, optional on
 * /contact" a property of the form rather than of the field name.
 *
 * Every message names the field and the fix, because it is rendered both inline
 * and as a link in the error summary (16 FM-02) and has to make sense read
 * alone.
 */

export const leadFormNames = ['diagnostic', 'agency-partnership', 'contact'] as const
export type LeadFormName = (typeof leadFormNames)[number]

/**
 * Normalizes a bare domain to an absolute https URL before validation.
 *
 * A visitor typing "example.com" is not making a mistake, and rejecting it
 * teaches the form's rules rather than answering the question. Anything that
 * already carries a scheme is left alone, so a deliberate http URL stays http
 * and an unsupported scheme still fails.
 */
export function normalizeWebsite(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return trimmed
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const website = z
  .string()
  .trim()
  .max(500)
  .transform(normalizeWebsite)
  .pipe(z.url({ error: 'Enter a website address, for example https://example.com.' }))

const requiredText = (max: number, message: string) =>
  z.string().trim().min(1, message).max(max)

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional()

const optionalEnum = (allowed: [string, ...string[]]) =>
  z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional()
    .refine((value) => value === undefined || allowed.includes(value), {
      error: 'Choose one of the listed options.',
    })

const primaryQuestion = (message: string) =>
  z
    .string()
    .trim()
    .min(10, message)
    .max(3000)

/**
 * Attribution the visitor's browser contributes (docs/07 section 6).
 *
 * First-touch values only, and only under a granted analytics decision. Every
 * field is optional and bounded, because this arrives as a client-supplied
 * string and is treated as untrusted like any other form value.
 */
export const attributionInputSchema = z.object({
  utmSource: z.string().trim().max(200).optional(),
  utmMedium: z.string().trim().max(200).optional(),
  utmCampaign: z.string().trim().max(300).optional(),
  utmTerm: z.string().trim().max(300).optional(),
  utmContent: z.string().trim().max(300).optional(),
  landingPage: z.string().trim().max(1000).optional(),
  referrer: z.string().trim().max(1000).optional(),
})

export type AttributionInput = z.infer<typeof attributionInputSchema>

/** Shared by all three forms. Identity, anti-abuse and the optional opt-in. */
const common = {
  firstName: requiredText(80, 'Enter your first name.'),
  lastName: requiredText(80, 'Enter your last name.'),
  workEmail: z
    .string()
    .trim()
    .max(254)
    .pipe(z.email('Enter a valid work email address, for example name@company.com.'))
    .refine(isBusinessEmail, { error: BUSINESS_EMAIL_MESSAGE }),
  primaryQuestion: primaryQuestion(
    'Describe the question in at least a sentence so Hendricks can review it.',
  ),
  currentStack: optionalText(2000),
  desiredTiming: optionalEnum(desiredTimingValues),
  additionalContext: optionalText(5000),
  marketingOptIn: z.boolean().default(false),
  honeypot: z.string().max(0),
  startedAt: z.number().int().positive(),
}

const diagnosticSchema = z.object({
  formName: z.literal('diagnostic'),
  audienceType: z.enum(diagnosticAudienceValues, {
    error: 'Choose whether you are applying as a brand or as an agency.',
  }),
  organization: requiredText(160, 'Enter your organization name.'),
  website: website,
  role: requiredText(160, 'Enter your role.'),
  primaryMarket: requiredText(500, 'Name the primary product, service, or market.'),
  monthlySearchInvestment: optionalEnum(monthlySearchInvestmentValues),
  ...common,
})

const agencySchema = z.object({
  formName: z.literal('agency-partnership'),
  organization: requiredText(160, 'Enter your agency name.'),
  website: website,
  role: requiredText(160, 'Enter your role.'),
  primaryMarket: requiredText(300, 'Name the services your agency primarily delivers.'),
  relevantAccounts: optionalEnum(relevantAccountsValues),
  preferredModel: optionalEnum(preferredModelValues),
  ...common,
})

const contactSchema = z.object({
  formName: z.literal('contact'),
  audienceType: z.enum(contactAudienceValues, {
    error: 'Choose what you are contacting Hendricks as.',
  }),
  organization: requiredText(160, 'Enter your organization name.'),
  website: website.optional(),
  role: optionalText(160),
  primaryMarket: optionalText(500),
  ...common,
})

export const leadInputSchema = z.discriminatedUnion('formName', [
  diagnosticSchema,
  agencySchema,
  contactSchema,
])

export type LeadInput = z.infer<typeof leadInputSchema>
export type DiagnosticLeadInput = z.infer<typeof diagnosticSchema>
export type AgencyLeadInput = z.infer<typeof agencySchema>
export type ContactLeadInput = z.infer<typeof contactSchema>

/**
 * The audience recorded for a submission.
 *
 * The agency form has no audience field: the page it sits on is the answer, and
 * asking again would be redundant entry (WCAG 3.3.7).
 */
export function audienceTypeOf(input: LeadInput): ContactAudience {
  return input.formName === 'agency-partnership' ? 'agency' : input.audienceType
}
