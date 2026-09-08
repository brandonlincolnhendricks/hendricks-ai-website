import 'server-only'

import { z } from 'zod'

/**
 * Server-only environment parsing. Public values are re-exported through
 * `publicEnv` so client components never reach for `process.env` directly.
 *
 * Credentials for Sanity, Resend, and GTM are not yet provisioned. Every one of
 * them is optional here so the build never blocks, and each consuming adapter is
 * responsible for degrading safely when its value is absent. See
 * `IMPLEMENTATION_PLAN.md` §11.
 */

const optionalUrl = z.url().optional().or(z.literal('').transform(() => undefined))

const serverSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('https://hendricks.ai'),
  NEXT_PUBLIC_GTM_ID: z
    .string()
    .regex(/^GTM-[A-Z0-9]+$/, 'GTM container ID must look like GTM-XXXXXXX')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  /**
   * GA4 web stream ID. Empty means gtag.js is never loaded. Do not invent a
   * measurement ID — set this only in Vercel when a real G- ID exists.
   */
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z
    .string()
    .regex(/^G-[A-Z0-9]+$/, 'GA4 measurement ID must look like G-XXXXXXXX')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  /**
   * LinkedIn Insight Tag partner ID. Empty keeps the pixel off. Do not set
   * this in production until the Privacy Notice is updated to name the tag.
   */
  NEXT_PUBLIC_LINKEDIN_PARTNER_ID: z
    .string()
    .regex(/^\d+$/, 'LinkedIn partner ID must be numeric')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  NEXT_PUBLIC_VERCEL_ENV: z
    .enum(['development', 'preview', 'production'])
    .default('development'),
  /**
   * Optional analytics remain off until the consent network tests pass against a
   * deployed environment (docs/11, privacy phase). Absent means false.
   */
  NEXT_PUBLIC_ENABLE_OPTIONAL_ANALYTICS: z
    .enum(['true', 'false'])
    .default('false')
    .or(z.literal('').transform(() => 'false' as const)),

  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_SANITY_DATASET: z.string().default('production'),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().default('2026-08-01'),
  SANITY_READ_TOKEN: z.string().optional(),
  SANITY_PREVIEW_SECRET: z.string().optional(),
  SANITY_REVALIDATE_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  LEAD_FROM_EMAIL: z.string().optional(),
  LEAD_NOTIFICATION_EMAIL: z.email().optional().or(z.literal('').transform(() => undefined)),

  CRM_WEBHOOK_URL: optionalUrl,
  CRM_WEBHOOK_SECRET: z.string().optional(),

  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  RATE_LIMIT_REDIS_URL: optionalUrl,
  RATE_LIMIT_REDIS_TOKEN: z.string().optional(),
  /**
   * Shared secret for the rate-limit and idempotency keys. Without it every
   * instance derives a different key for the same visitor, which is the
   * in-memory limiter wearing a hash. Thirty-two characters minimum, rotated
   * quarterly, which also expires every key in the store.
   */
  RATE_LIMIT_HASH_SECRET: z
    .string()
    .min(32, 'RATE_LIMIT_HASH_SECRET must be at least 32 characters')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  /**
   * Public-mini observation queue. Redis is optional and not on Vercel today.
   * memory (default) and fs work locally. redis uses RATE_LIMIT_REDIS_*.
   * Production Redis needs Brandon-approved env. Do not put DataForSEO or
   * Ultra probe credentials in this app.
   */
  OBSERVE_JOB_STORE: z
    .enum(['memory', 'fs', 'redis'])
    .optional()
    .or(z.literal('').transform(() => undefined)),
  /**
   * Non-production only. `1` or `true` loads the labeled filled fixture.
   * Ignored when NEXT_PUBLIC_VERCEL_ENV is production.
   */
  OBSERVE_FIXTURE: z
    .enum(['0', '1', 'true', 'false'])
    .optional()
    .or(z.literal('').transform(() => undefined)),
  /** Optional bearer secret so Ultra can POST cell updates. Absent refuses writes. */
  OBSERVE_WORKER_SECRET: z.string().optional().or(z.literal('').transform(() => undefined)),
  OBSERVE_COST_CEILING_USD: z.string().optional().or(z.literal('').transform(() => undefined)),

  /**
   * DEVIATION, RECORDED RATHER THAN SILENT. The observation block above says
   * "Do not put DataForSEO or Ultra probe credentials in this app", and the
   * two variables below are exactly that. The rule and this code arrived from
   * two different sessions on the same day and only one of them can stand.
   *
   * Why they are here today: the /observe worker that keeps keys off the site
   * is a manual script on the Ultra, is not armed as a LaunchAgent, and is
   * documented "Do not run against production", so it cannot serve a public
   * lead instrument yet. The credential is a metered API key, not a data
   * secret: its blast radius is spend, and the spend is bounded by
   * VISIBILITY_CHECK_DAILY_CAP and the per-visitor limit.
   *
   * This is Brandon's ruling to make, and it is one of two open decisions on
   * this route. Either the check moves behind the queue and these two
   * variables leave the app, or the rule above is amended to name this
   * exception. Do not resolve it by deleting one comment.
   */

  /**
   * The Google Sheet that is the CRM for now (Brandon, 2026-09-07). A service
   * account with no project role; its only access is the share on the sheet.
   * The private key is the PEM, either verbatim with `\n` escapes or base64
   * encoded, which is how it is stored in Vercel. All three are required for
   * the channel to exist; with any one missing it is skipped and logged.
   */
  GOOGLE_SHEETS_CLIENT_EMAIL: z.email().optional().or(z.literal('').transform(() => undefined)),
  GOOGLE_SHEETS_PRIVATE_KEY: z.string().optional().or(z.literal('').transform(() => undefined)),
  CRM_SHEET_ID: z.string().optional().or(z.literal('').transform(() => undefined)),

  /**
   * DataForSEO, the transport behind the AI Visibility Check. The same vendor
   * and the same four endpoints The Answer Index was captured through, so the
   * free check and the research read the engines the same way.
   */
  DATAFORSEO_LOGIN: z.string().optional().or(z.literal('').transform(() => undefined)),
  DATAFORSEO_PASSWORD: z.string().optional().or(z.literal('').transform(() => undefined)),

  /**
   * Spend ceilings for the free check. A run is twenty paid probes, so the
   * daily cap is the most the site can spend on strangers in a day. Per
   * identifier limits live in `src/lib/visibility-check/limits.ts`.
   */
  VISIBILITY_CHECK_DAILY_CAP: z
    .string()
    .optional()
    .transform((value) => (value && value.length > 0 ? Number(value) : 40))
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: 'VISIBILITY_CHECK_DAILY_CAP must be a positive integer',
    }),

  /**
   * Whether the visitor receives their own copy of the reading by email.
   * Off until Brandon approves an applicant-facing message (DR-95): the
   * reading is shown on screen either way.
   */
  VISIBILITY_CHECK_SEND_VISITOR_COPY: z
    .enum(['true', 'false'])
    .default('false')
    .or(z.literal('').transform(() => 'false' as const)),
})

const parsed = serverSchema.safeParse(process.env)

if (!parsed.success) {
  // Never print values — only the failing key names.
  const keys = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')
  throw new Error(`Invalid environment configuration for: ${keys}`)
}

export const env = parsed.data

export const isProduction = env.NEXT_PUBLIC_VERCEL_ENV === 'production'

/** Only production is indexable. Preview and development are noindex. */
export const isIndexable = isProduction

export const integrationStatus = {
  gtm: Boolean(env.NEXT_PUBLIC_GTM_ID),
  ga4: Boolean(env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
  linkedinInsight: Boolean(env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID),
  sanity: Boolean(env.NEXT_PUBLIC_SANITY_PROJECT_ID),
  email: Boolean(env.RESEND_API_KEY && env.LEAD_FROM_EMAIL && env.LEAD_NOTIFICATION_EMAIL),
  crmWebhook: Boolean(env.CRM_WEBHOOK_URL),
  crmSheet: Boolean(
    env.GOOGLE_SHEETS_CLIENT_EMAIL && env.GOOGLE_SHEETS_PRIVATE_KEY && env.CRM_SHEET_ID,
  ),
  visibilityCheck: Boolean(env.DATAFORSEO_LOGIN && env.DATAFORSEO_PASSWORD),
  turnstile: Boolean(env.TURNSTILE_SECRET_KEY && env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
} as const
