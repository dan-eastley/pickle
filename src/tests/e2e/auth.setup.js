import { test as setup, expect } from '@playwright/test'
import { authFile, hasTestCreds, readLatestOtp } from './auth.shared.js'

// Signs in as the seeded test user once and persists the session (storageState)
// so the authenticated smoke specs reuse it — auth is always enforced, so the
// architecture routes are unreachable without this. Runs as a Playwright
// "setup" project the main project depends on (see playwright.config.js).
//
// Login is two-step: password, then a 6-digit code emailed by the 2FA plugin.
// Automation can't read the email, so once the code step appears we read the
// code Better Auth just stored (readLatestOtp, straight from Postgres) and
// submit it. On a user's very first login they're enrolled but not yet
// challenged, so the password step alone may complete — both paths are handled.
//
// Needs TEST_USER_EMAIL / TEST_USER_PASSWORD / DATABASE_URL (CI secrets); absent
// them the setup and the gated specs skip, leaving the public checks to run.
setup('authenticate as the seeded test user', async ({ page }) => {
  setup.skip(!hasTestCreds, 'TEST_USER_* / DATABASE_URL not set')

  await page.goto('/login')
  await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL)
  await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Either the 2FA code step appears (enrolled user) or we're straight in
  // (first-login enrolment). Wait for whichever happens.
  const codeInput = page.getByLabel('6-digit code')
  await Promise.race([
    codeInput.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
    expect(page)
      .not.toHaveURL(/\/login/, { timeout: 15000 })
      .catch(() => {}),
  ])

  if (await codeInput.isVisible().catch(() => false)) {
    const code = await readLatestOtp()
    if (!code) throw new Error('Could not read the 2FA code from the database')
    await codeInput.fill(code)
    await page.getByRole('button', { name: /verify and sign in/i }).click()
  }

  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 })
  await page.context().storageState({ path: authFile })
})
