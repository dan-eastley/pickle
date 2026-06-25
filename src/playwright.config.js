import { defineConfig } from '@playwright/test'

// When PLAYWRIGHT_BASE_URL is set (e.g. a Vercel preview/production URL in
// post-deploy CI), run against that deployment and skip the dev server.
// Otherwise drive the real dev server locally, which proxies architecture data
// from GitHub via the GITHUB_* env / .env.
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  use: { baseURL: externalBaseURL ?? 'http://localhost:3000' },
  webServer: externalBaseURL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
})
