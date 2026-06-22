import { test, expect } from '@playwright/test'

test('homepage renders its key sections', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', {
    name: 'A working architecture repository, not slideware',
  })).toBeVisible()
  await expect(page.getByRole('heading', {
    name: 'From vision to build, one step at a time',
  })).toBeVisible()
  await expect(page.getByRole('heading', {
    name: 'Every decision, analysed across seven dimensions',
  })).toBeVisible()

  // The route error boundary must not have tripped.
  await expect(page.getByText('This page failed to load.')).toHaveCount(0)
})

test('navigates from the homepage to the clients list', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'View Clients' }).first().click()
  await expect(page).toHaveURL(/\/clients$/)
  await expect(page.getByRole('heading', { name: 'Clients', level: 1 })).toBeVisible()
})
