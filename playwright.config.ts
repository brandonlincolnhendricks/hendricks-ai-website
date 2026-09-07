import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
  outputDir: './test-results',

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],

  // Build once and serve the production output — dev-mode overlays and HMR
  // scripts would otherwise pollute the axe results.
  //
  // Never reuse a server already on the port. Reusing one locally means the suite
  // silently tests whatever build that process started with: a stale server whose
  // .next directory has since been rebuilt serves 404s for new routes and
  // wrong-MIME chunk responses, which then cascade into unstyled pages and dozens
  // of misleading target-size and overflow failures.
  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    // The optional-analytics master switch is on under test so the consent gate
    // is exercised rather than passing vacuously. With it off, "no analytics
    // request before consent" would prove nothing — the vendors were never a
    // possibility. Production keeps it off until these tests pass on a
    // deployment (docs/11, privacy phase).
    env: {
      NEXT_PUBLIC_ENABLE_OPTIONAL_ANALYTICS: 'true',
      OBSERVE_JOB_STORE: 'fs',
      OBSERVE_IP_RATE_LIMIT: '100',
      OBSERVE_FIXTURE: '0',
      /*
        The suite must never reach a real destination. `next build` reads
        `.env.local`, and on 2026-09-07 a local file holding the CRM sheet's
        service account put forty test rows in the live Leads tab and slowed
        every form action past the analytics test's window. A process
        variable outranks the file, so each paid or durable channel is
        blanked here: no sheet row, no email, no probe, whatever the file
        says. Production IDs stay out for the same reason the consent test
        expects them empty.
      */
      CRM_SHEET_ID: '',
      GOOGLE_SHEETS_CLIENT_EMAIL: '',
      GOOGLE_SHEETS_PRIVATE_KEY: '',
      RESEND_API_KEY: '',
      CRM_WEBHOOK_URL: '',
      DATAFORSEO_LOGIN: '',
      DATAFORSEO_PASSWORD: '',
      NEXT_PUBLIC_GA_MEASUREMENT_ID: '',
      NEXT_PUBLIC_LINKEDIN_PARTNER_ID: '',
    },
  },
})
