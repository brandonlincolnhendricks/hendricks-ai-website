import { expect, test } from '@playwright/test'

import { check as copy } from '@/content/pages/ai-visibility-check'
import { check as homeCheck } from '@/content/pages/home'
import { MINIMUM_SUBMIT_SECONDS } from '@/lib/forms/limits'

/**
 * The AI Visibility Check (Brandon, 2026-09-07).
 *
 * Two contracts. The homepage station is a plain GET form that hands the
 * website to the instrument's route, so it works with JavaScript off and
 * collects nothing personal on the homepage. The full form validates before
 * it spends: an invalid submission is answered with the focused summary and
 * never reaches the paid probes, which is also why the suite can exercise it
 * with no vendor credentials in the environment.
 */
test.describe('AI Visibility Check', () => {
  test('the homepage station hands the website to the check page', async ({ page }) => {
    await page.goto('/')

    const station = page.locator('#ai-visibility-check')
    await expect(station.getByRole('heading', { level: 2 })).toHaveText(homeCheck.title)

    await station.getByLabel(homeCheck.label).fill('example.com')
    await station.getByRole('button', { name: homeCheck.submit }).click()

    await expect(page).toHaveURL(/\/ai-visibility-check\?site=example\.com$/)
    await expect(page.getByLabel(new RegExp(`^${copy.labels.website}`))).toHaveValue(
      'https://example.com/',
    )
  })

  test('renders the reading copy before any run, so the page answers on its own', async ({ page }) => {
    await page.goto('/ai-visibility-check')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Is your brand in the answer?')
    await expect(page.locator('#reading')).toContainText('Absence is not yet a diagnosis.')
    await expect(page.locator('#scope')).toContainText('Hendricks observes four systems')
    await expect(page.getByRole('button', { name: copy.submit })).toBeVisible()
  })

  test('answers an invalid submission with a focused summary and spends nothing', async ({ page }) => {
    await page.goto('/ai-visibility-check')

    await page.getByLabel(/^Brand name/).fill('Example')
    await page.getByLabel(/^Website/).fill('example.com')
    await page.getByLabel(/^What you sell/).fill('observability software')
    await page.getByLabel(/^Your name/).fill('Ada Lovelace')
    await page.getByLabel(/^Work email/).fill('not-an-address')

    // The timing floor: a submission faster than a person could type is refused
    // with the generic error rather than the field message this test wants.
    await page.waitForTimeout((MINIMUM_SUBMIT_SECONDS + 0.5) * 1000)
    await page.getByRole('button', { name: copy.submit }).click()

    // Filtered on its title: the App Router's hidden route announcer is a
    // second, empty `role="alert"` on every page, and a bare role query
    // resolves to both.
    const alert = page.getByRole('alert').filter({ hasText: copy.errors.summaryTitle })
    await expect(alert).toBeVisible()
    await expect(alert).toBeFocused()
    await expect(alert).toContainText(copy.errors.summaryTitle)
    await expect(alert.getByRole('link')).toContainText(/valid email/i)

    // What the visitor typed survives the round trip.
    await expect(page.getByLabel(/^Brand name/)).toHaveValue('Example')
  })
})
