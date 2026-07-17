import { defineConfig } from '@playwright/test'
import { authFile, hasTestCreds } from './tests/e2e/auth.shared.js'

// When PLAYWRIGHT_BASE_URL is set (e.g. a Vercel preview/production URL in
// post-deploy CI), run against that deployment and skip the dev server.
// Otherwise drive the real dev server locally, which proxies architecture data
// from GitHub via the GITHUB_* env / .env.
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL

// Auth is always enforced, so the architecture-route specs need a session. When
// TEST_USER_ creds are provided, a "setup" project signs in first and the main
// project reuses that storageState; without creds the setup and the gated specs
// skip, leaving the public checks to run.
const projects = [
  ...(hasTestCreds ? [{ name: 'setup', testMatch: /auth\.setup\.js/ }] : []),
  {
    name: 'chromium',
    testIgnore: /auth\.setup\.js/,
    dependencies: hasTestCreds ? ['setup'] : [],
    use: hasTestCreds ? { storageState: authFile } : {},
  },
]

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  use: { baseURL: externalBaseURL ?? 'http://localhost:3000' },
  projects,
  webServer: externalBaseURL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
})
