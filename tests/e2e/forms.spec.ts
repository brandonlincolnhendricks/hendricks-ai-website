import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { CONSENT_VERSION } from '@/lib/consent/state'
import { LEAD_RATE_LIMIT, MINIMUM_SUBMIT_SECONDS } from '@/lib/forms/limits'
import {
  agencyForm,
  contactForm,
  diagnosticForm,
  errors,
  requiredMarker,
} from '@/content/forms/lead-forms'

/**
 * The three lead forms end to end (15 sections 4 to 6; 16 FM-01 to FM-12).
 *
 * The launch gate this replaces asserted that a link existed. What it asserts
 * now is that a submission reaches the action, that validation and every error
 * state render accessibly, that nothing reaches analytics before a decision,
 * and that a recoverable error never costs the visitor what they typed.
 *
 * Delivery is unconfigured under test, so a valid submission ends in the
 * delivery error rather than the success region. That is the point: only the
 * action can produce that state, and D-H requires it to fail closed rather than
 * accept a lead it cannot deliver.
 */

const FORMS = [
  {
    name: 'Diagnostic application',
    path: '/diagnostic',
    anchor: '#apply',
    copy: diagnosticForm,
    fill: fillDiagnostic,
    audienceRadio: true,
  },
  {
    name: 'Agency partnership inquiry',
    path: '/for-agencies',
    anchor: '#partnership-inquiry',
    copy: agencyForm,
    fill: fillAgency,
    audienceRadio: false,
  },
  {
    name: 'General inquiry',
    path: '/contact',
    anchor: '#inquiry',
    copy: contactForm,
    fill: fillContact,
    audienceRadio: true,
  },
] as const

const CONSENT_KEY = 'hendricks_privacy_v1'

/**
 * Records a decision before the page loads.
 *
 * The consent sheet is fixed to the bottom of the viewport, so a run that never
 * decides is a run where the sheet can sit over the submit button. Declining is
 * the conservative seed: the forms must work identically either way, and
 * nothing optional loads.
 */
async function decideConsent(page: Page, analytics: 'granted' | 'denied'): Promise<void> {
  await page.addInitScript(
    ({ key, record }) => window.localStorage.setItem(key, record),
    {
      key: CONSENT_KEY,
      record: JSON.stringify({
        version: CONSENT_VERSION,
        analytics,
        advertising: 'denied',
        source: 'banner',
        gpc: false,
        decidedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      }),
    },
  )
}

/**
 * A bucket of its own per test.
 *
 * The limiter keys on the forwarded address and every request in this suite
 * comes from the same loopback client, so without this the fifth submission in
 * the whole run would start refusing the sixth.
 */
async function ownBucket(page: Page, label: string): Promise<void> {
  // Keep the full 32-bit hash instead of collapsing every case into 250 IPv4
  // addresses. The smaller pool lets unrelated cases collide during the full
  // five-project matrix and can make an ordinary validation test hit the shared
  // form rate limit. 2001:db8::/32 is reserved for documentation and gives each
  // deterministic test label its own valid, non-routable IPv6 identifier.
  const bucket = hash(label) >>> 0
  const high = (bucket >>> 16).toString(16)
  const low = (bucket & 0xffff).toString(16)
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': `2001:db8:${high}:${low}::1` })
}

/** Opens a form page with the consent decision already recorded. */
async function openForm(
  page: Page,
  { path, anchor }: { path: string; anchor: string },
  label: string,
): Promise<void> {
  await ownBucket(page, label)
  await decideConsent(page, 'denied')
  await page.goto(`${path}${anchor}`)
}

/** Submits and waits for the action's own response, not for a repaint. */
async function submit(page: Page, label: string): Promise<void> {
  await Promise.all([
    page.waitForResponse((response) => response.request().method() === 'POST'),
    page.getByRole('button', { name: label }).click(),
  ])
}

function hash(value: string): number {
  let total = 0
  for (const character of value) total = (total * 31 + character.charCodeAt(0)) | 0
  return total
}

/** The timing floor rejects anything a person could not have typed. */
async function waitOutTimingFloor(page: Page): Promise<void> {
  await page.waitForTimeout((MINIMUM_SUBMIT_SECONDS + 0.4) * 1000)
}

async function fillIdentity(page: Page): Promise<void> {
  await page.getByLabel(/^First name/).fill('Brandon')
  await page.getByLabel(/^Last name/).fill('Hendricks')
  await page.getByLabel(/^Work email/).fill('name@company.example')
  await page.getByLabel(/^Role/).fill('Head of Growth')
}

async function fillDiagnostic(page: Page): Promise<void> {
  await page.getByLabel('A brand or company').check()
  await fillIdentity(page)
  await page.getByLabel(/^Organization/).fill('Example Co')
  await page.getByLabel(/^Website/).fill('example.com')
  await page.getByLabel(/^Primary product, service, or market/).fill('Observability software')
  await page
    .locator('textarea[name="primaryQuestion"]')
    .fill('Why do competitors enter the shortlist when we do not?')
}

async function fillAgency(page: Page): Promise<void> {
  await page.getByLabel(/^Agency name/).fill('Example Agency')
  await page.getByLabel(/^Website/).fill('agency.example')
  await fillIdentity(page)
  await page.getByLabel(/^Primary services/).fill('SEO, paid search, content')
  await page
    .locator('textarea[name="primaryQuestion"]')
    .fill('Our client asks about AI answers and we cannot measure them.')
}

async function fillContact(page: Page): Promise<void> {
  await page.getByLabel('Brand or company').check()
  await page.getByLabel(/^First name/).fill('Brandon')
  await page.getByLabel(/^Last name/).fill('Hendricks')
  await page.getByLabel(/^Work email/).fill('name@company.example')
  await page.getByLabel(/^Organization/).fill('Example Co')
  await page
    .locator('textarea[name="primaryQuestion"]')
    .fill('We cannot tell which questions we are absent from.')
}

const summary = (page: Page) => page.getByRole('alert').filter({ hasText: errors.summaryTitle })

for (const form of FORMS) {
  test.describe(form.name, () => {
    test('reaches the action, and fails closed rather than reporting a success it cannot deliver', async ({
      page,
    }, testInfo) => {
      await openForm(page, form, `${form.name}-reaches-${testInfo.project.name}`)

      await form.fill(page)
      await waitOutTimingFloor(page)
      await submit(page, form.copy.submit)

      await expect(summary(page)).toBeVisible()
      await expect(summary(page)).toContainText(form.copy.deliveryError)

      // No success region, and no confirmation text anywhere on the page.
      await expect(page.getByRole('status').filter({ hasText: form.copy.confirmation })).toHaveCount(
        0,
      )
    })

    test('reports invalid fields in a focused summary that links to each one', async ({
      page,
    }, testInfo) => {
      await openForm(page, form, `${form.name}-invalid-${testInfo.project.name}`)

      await form.fill(page)
      await page.getByLabel(/^Work email/).fill('not-an-address')
      await waitOutTimingFloor(page)
      await submit(page, form.copy.submit)

      const alert = summary(page)
      await expect(alert).toBeVisible()
      await expect(alert).toBeFocused()

      const link = alert.getByRole('link').first()
      await expect(link).toContainText(/valid work email/i)

      const target = await link.getAttribute('href')
      const field = page.locator(target as string)
      await expect(field).toHaveAttribute('aria-invalid', 'true')

      // The message is announced with the field as well as in the summary.
      const describedBy = await field.getAttribute('aria-describedby')
      await expect(page.locator(`#${(describedBy ?? '').split(' ').pop()}`)).toContainText(
        /valid work email/i,
      )
    })

    test('links every message in the summary to a field that exists (FM-02)', async ({
      page,
    }, testInfo) => {
      await openForm(page, form, `${form.name}-anchors-${testInfo.project.name}`)

      // Nothing is filled, so every required field reports. The audience radio
      // has no default and is the first entry, which is the anchor a summary
      // built from field names is most likely to point at nothing.
      await waitOutTimingFloor(page)
      await submit(page, form.copy.submit)

      const alert = summary(page)
      await expect(alert).toBeVisible()

      const targets = await alert
        .getByRole('link')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))

      expect(targets.length).toBeGreaterThan(1)

      for (const target of targets) {
        await expect(page.locator(target), `no element for ${target}`).toHaveCount(1)
      }

      if (form.audienceRadio) {
        const audience = targets.find((target) => target.endsWith('-audienceType'))
        expect(audience, `no audienceType entry in ${targets.join(', ')}`).toBeTruthy()
        await expect(page.locator(audience as string)).toHaveAttribute('tabindex', '-1')
      }
    })

    test('preserves every answer through a recoverable error (WCAG 3.3.7)', async ({
      page,
    }, testInfo) => {
      await openForm(page, form, `${form.name}-redundant-${testInfo.project.name}`)

      await form.fill(page)
      const question = page.locator('textarea[name="primaryQuestion"]')
      const typed = await question.inputValue()

      await page.getByLabel(/^Work email/).fill('not-an-address')
      await waitOutTimingFloor(page)
      await submit(page, form.copy.submit)

      await expect(summary(page)).toBeVisible()
      await expect(question).toHaveValue(typed)
      await expect(page.locator('input[name="firstName"]')).toHaveValue('Brandon')

      // One step: nothing asks for the same value twice.
      await expect(page.locator('input[type="email"]')).toHaveCount(1)
    })

    test('meets the form accessibility contract', async ({ page }, testInfo) => {
      await openForm(page, form, `${form.name}-a11y-${testInfo.project.name}`)

      // Required fields say so in words, not with a glyph alone (FM-01).
      const emailLabel = page.locator('label', { hasText: form.copy.labels.workEmail }).first()
      await expect(emailLabel).toContainText(requiredMarker)

      // The notice at collection is body text above the submit, never a modal
      // and never a checkbox (FM-05, FM-06).
      const notice = page.locator('.notice')
      await expect(notice).toBeVisible()
      await expect(notice.getByRole('link', { name: 'Privacy Notice' })).toHaveAttribute(
        'href',
        '/privacy',
      )
      await expect(page.locator('form input[type="checkbox"][required]')).toHaveCount(0)

      // The optional opt-in is unchecked and the form submits without it.
      const optIn = page.getByLabel(form.copy.marketingOptIn)
      await expect(optIn).not.toBeChecked()

      // 2.5.8: every control the visitor operates clears 24 by 24 CSS pixels.
      const controls = page.locator('form .input, form .select, form .textarea, form .check')
      for (let index = 0; index < (await controls.count()); index += 1) {
        const box = await controls.nth(index).boundingBox()
        expect(box?.height ?? 0, `control ${index}`).toBeGreaterThanOrEqual(24)
      }

      const results = await new AxeBuilder({ page })
        .include('form')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()

      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
    })

    test('reports the error state accessibly, without relying on colour', async ({
      page,
    }, testInfo) => {
      await openForm(page, form, `${form.name}-error-a11y-${testInfo.project.name}`)

      await form.fill(page)
      await page.getByLabel(/^Work email/).fill('not-an-address')
      await waitOutTimingFloor(page)
      await submit(page, form.copy.submit)

      await expect(summary(page)).toBeVisible()

      // The inline message names itself in words before it names the fault.
      const inline = page.locator('.field > .err').first()
      const prefix = await inline.evaluate(
        (element) => window.getComputedStyle(element, '::before').content,
      )
      expect(prefix).toContain('Error')

      const results = await new AxeBuilder({ page })
        .include('form')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()

      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
    })
  })
}

test.describe('Without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  for (const form of FORMS) {
    test(`${form.name} still reaches the action`, async ({ page }, testInfo) => {
      await openForm(page, form, `${form.name}-nojs-${testInfo.project.name}`)

      await form.fill(page)
      await waitOutTimingFloor(page)
      await page.getByRole('button', { name: form.copy.submit }).click()

      await expect(summary(page)).toBeVisible()
      await expect(summary(page)).toContainText(form.copy.deliveryError)
    })
  }

  test('the fit check is the two approved lists and one instruction', async ({ page }) => {
    await decideConsent(page, 'denied')
    await page.goto('/diagnostic#fit')

    await expect(page.getByText('Read both lists, then apply below.')).toBeVisible()
    await expect(page.locator('#fit input[type="radio"]')).toHaveCount(0)
    await expect(page.locator('#fit [role="status"]')).toHaveCount(0)

    // The application below it is unaffected, and the skip link reaches it.
    await expect(
      page.getByRole('link', { name: 'Skip the fit check and go to the Diagnostic application' }),
    ).toHaveAttribute('href', '#apply')
    await expect(page.locator('#apply form')).toBeVisible()
  })

  test('the routing choice preselects from the query', async ({ page }) => {
    await decideConsent(page, 'denied')
    await page.goto('/contact?intent=agency')
    await expect(page.getByLabel('Digital marketing agency')).toBeChecked()

    await page.goto('/contact?intent=diagnostic')
    await expect(page.getByLabel('Brand or company')).toBeChecked()

    await page.goto('/contact?intent=nonsense')
    await expect(page.getByLabel('Brand or company')).not.toBeChecked()
  })

  test('the partnership model preselects from the query', async ({ page }) => {
    await decideConsent(page, 'denied')
    await page.goto('/for-agencies?model=embedded#partnership-inquiry')
    await expect(page.locator('select[name="preferredModel"]')).toHaveValue('embedded')
  })
})

test.describe('Analytics', () => {
  const VENDORS = ['google-analytics.com', 'googletagmanager.com', '/_vercel/insights']

  test('a submission before a consent decision reaches no vendor and writes no event', async ({
    page,
  }, testInfo) => {
    await ownBucket(page, `analytics-${testInfo.project.name}`)

    const seen: string[] = []
    page.on('request', (request) => {
      if (VENDORS.some((vendor) => request.url().includes(vendor))) seen.push(request.url())
    })

    // No decision is recorded, so the consent sheet is present: the submit
    // button is reached through the form itself rather than through a click
    // the sheet could intercept.
    await page.goto('/diagnostic#apply')
    await fillDiagnostic(page)
    await waitOutTimingFloor(page)
    await Promise.all([
      page.waitForResponse((response) => response.request().method() === 'POST'),
      page.locator('#apply form button[type="submit"]').evaluate((button) => {
        ;(button as HTMLButtonElement).click()
      }),
    ])
    await expect(summary(page)).toBeVisible()

    expect(seen, `analytics fired before consent:\n${seen.join('\n')}`).toEqual([])

    const layer = await page.evaluate(
      () => (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [],
    )
    const named = layer.filter(
      (entry) => typeof entry === 'object' && entry !== null && 'event' in entry,
    )
    expect(named, `dataLayer held events before consent:\n${JSON.stringify(named)}`).toEqual([])
  })

  test('reports the submission with the audience the visitor chose', async ({
    page,
  }, testInfo) => {
    await ownBucket(page, `analytics-submit-${testInfo.project.name}`)
    await decideConsent(page, 'granted')
    await page.goto('/diagnostic#apply')

    await fillDiagnostic(page)
    await waitOutTimingFloor(page)
    await submit(page, diagnosticForm.submit)
    await expect(summary(page)).toBeVisible()

    const layer = await page.evaluate(
      () => (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer ?? [],
    )

    // Fired at invocation, so it is present even though delivery is
    // unconfigured under test and the run ends in the delivery error.
    const submitted = layer.find((entry) => entry.event === 'diagnostic_submit')
    expect(submitted, `dataLayer:\n${JSON.stringify(layer, null, 2)}`).toMatchObject({
      form_name: 'diagnostic',
      audience_type: 'brand',
    })
  })

  test('stores no click identifier in the first-touch record it submits', async ({
    page,
  }, testInfo) => {
    await ownBucket(page, `analytics-attribution-${testInfo.project.name}`)
    await decideConsent(page, 'granted')
    await page.goto('/diagnostic?utm_source=linkedin&gclid=CLICK_ID&msclkid=BING_ID#apply')

    // The record is written by an effect, so the hidden field filling is what
    // says hydration has run. Reading storage before that reads an empty store.
    const field = page.locator('#apply form input[name="attribution"]')
    await expect(field).not.toHaveValue('')

    const stored = await page.evaluate(() => window.sessionStorage.getItem('hx_attr_v1'))
    expect(stored).not.toContain('CLICK_ID')
    expect(stored).not.toContain('BING_ID')
    expect(stored).toContain('linkedin')

    const submitted = await field.inputValue()
    expect(submitted).not.toContain('CLICK_ID')
    expect(submitted).not.toContain('BING_ID')
  })
})

test.describe('The fit check with JavaScript', () => {
  test('is advisory: it never gates the application and stores nothing', async ({ page }) => {
    await decideConsent(page, 'denied')
    await page.goto('/diagnostic#fit')

    const radios = page.locator('#fit input[type="radio"]')
    await expect(radios).toHaveCount(28)

    const status = page.locator('#fit [role="status"]')
    await expect(status).toContainText('Answer all fourteen for a reading. 0 of 14 answered.')

    for (let index = 0; index < 14; index += 1) {
      await page.locator('#fit input[type="radio"][value="yes"]').nth(index).check()
    }

    await expect(status).toContainText('probably not the right first step')

    // The application stays open, enabled and in place.
    await expect(page.locator('#apply form')).toBeVisible()
    await expect(page.locator('#apply button[type="submit"]')).toBeEnabled()

    // The consent record is the only thing in storage, and it was planted.
    const stored = await page.evaluate((key) => ({
      session: window.sessionStorage.length,
      local: Object.keys(window.localStorage).filter((name) => name !== key),
      cookie: document.cookie,
    }), CONSENT_KEY)
    expect(stored).toEqual({ session: 0, local: [], cookie: '' })
  })
})

test.describe('Rate limit', () => {
  test('refuses the attempt after the allowance and says when to try again', async ({
    page,
  }, testInfo) => {
    await openForm(page, FORMS[2], `rate-limit-${testInfo.project.name}`)

    for (let attempt = 0; attempt < LEAD_RATE_LIMIT.limit; attempt += 1) {
      await fillContact(page)
      if (attempt === 0) await waitOutTimingFloor(page)
      await submit(page, contactForm.submit)
      await expect(summary(page)).toBeVisible()
    }

    await submit(page, contactForm.submit)
    await expect(summary(page)).toContainText('Try again in about')
    await expect(summary(page)).toContainText('minutes')

    // The control that tripped is never named, and the answers survive.
    await expect(summary(page)).not.toContainText(/rate|limit|honeypot/i)
    await expect(page.locator('input[name="firstName"]')).toHaveValue('Brandon')
  })
})
