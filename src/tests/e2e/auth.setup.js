import { test as setup, expect } from '@playwright/test'
import { authFile, hasTestCreds } from './auth.shared.js'

// Signs in as a seeded test user once and persists the session (storageState)
// so the authenticated smoke specs reuse it — auth is always enforced, so the
// architecture routes are unreachable without this. Runs as a Playwright
// "setup" project that the main project depends on (see playwright.config.js).
//
// Credentials come from TEST_USER_EMAIL / TEST_USER_PASSWORD (CI secrets). When
// they're absent (a local run), this is skipped and the authenticated specs
// skip too, leaving the public smoke checks to run.
setup('authenticate as the seeded test user', async ({ page }) => {
  setup.skip(!hasTestCreds, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not set')

  await page.goto('/login')
  await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL)
  await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()

  // A successful sign-in leaves /login (autoSignIn redirects to the app).
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 })
  await page.context().storageState({ path: authFile })
})
