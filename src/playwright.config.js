import { defineConfig } from '@playwright/test'

// Drives the real dev server (which proxies architecture data from GitHub via
// the GITHUB_* env / .env), so the smoke test exercises the actual app rather
// than a static build with no backend.
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
