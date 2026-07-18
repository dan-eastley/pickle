import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import { readdirSync, existsSync } from 'fs'
import { hasTestCreds } from './auth.shared.js'

// Architecture content is auth-gated. Specs that browse it run only when a
// seeded test session is available (see auth.setup.js); the public homepage
// spec always runs. `requiresAuth` is called at the top of a gated test.
const requiresAuth = () =>
  test.skip(!hasTestCreds, 'requires TEST_USER_ credentials for the auth-gated routes')

const __dirname = dirname(fileURLToPath(import.meta.url))

// Reference architecture/transition whose routes we smoke-test.
const CLIENT = 'fedc'
const VERSION = 'baseline'
const ROUTE_BASE = `/architectures/${CLIENT}/${VERSION}`
const DOMAINS_ROOT = resolve(__dirname, '../../../architectures', `${CLIENT}/${VERSION}`, 'domains')

const dirs = (p) =>
  existsSync(p)
    ? readdirSync(p, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    : []
const jsons = (p) =>
  existsSync(p)
    ? readdirSync(p)
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace(/\.json$/, ''))
    : []

// Build the full route list from the architecture data on disk: the overview,
// each domain, each abstraction, and every artefact.
function architectureRoutes() {
  const routes = [`${ROUTE_BASE}/domains`]
  for (const domain of dirs(DOMAINS_ROOT)) {
    routes.push(`${ROUTE_BASE}/domains/${domain}`)
    for (const abstraction of dirs(join(DOMAINS_ROOT, domain))) {
      routes.push(`${ROUTE_BASE}/domains/${domain}/${abstraction}`)
      for (const id of jsons(join(DOMAINS_ROOT, domain, abstraction))) {
        routes.push(`${ROUTE_BASE}/domains/${domain}/${abstraction}/${id}`)
      }
    }
  }
  return routes
}

// Public routes reachable without a session. These always run — including
// against prod — and are the suite's core health signal: they catch a broken or
// stale deployment (missing chunks, JS init errors) the way a real visitor would
// hit it. Each is checked for a rendered heading, no error boundary, no
// uncaught JS exception, and no failed same-origin asset/chunk request.
const PUBLIC_ROUTES = [
  { path: '/', name: 'home' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
  { path: '/docs/index', name: 'docs' },
]

// Public checks run as a real anonymous visitor — force an empty session even
// when the project carries the authenticated storageState (otherwise /login and
// /register would redirect a signed-in user away).
test.describe('public (anonymous)', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  for (const { path, name } of PUBLIC_ROUTES) {
    test(`public route is healthy: ${name}`, async ({ page }) => {
      const pageErrors = []
      const failedRequests = []
      page.on('pageerror', (e) => pageErrors.push(e.message))
      page.on('response', (r) => {
        // Same-origin asset/chunk failures indicate a broken/stale deploy.
        const u = new URL(r.url())
        if (u.origin === new URL(page.url() || 'http://localhost').origin && r.status() >= 400) {
          failedRequests.push(`${r.status()} ${u.pathname}`)
        }
      })

      await page.goto(path, { waitUntil: 'networkidle' })

      // The error boundary must not be showing (the "This page failed to load" /
      // "Something went wrong" the user reported).
      await expect(page.getByText('This page failed to load.')).toHaveCount(0)
      await expect(page.getByText('Something went wrong.')).toHaveCount(0)
      // The page resolved to real content.
      await expect(page.getByRole('heading').first()).toBeVisible()
      // No uncaught JS (stale-chunk TDZ, etc.) and no failed same-origin assets.
      expect(pageErrors, `JS errors on ${path}`).toEqual([])
      expect(failedRequests, `failed same-origin requests on ${path}`).toEqual([])
    })
  }

  test('homepage renders its key sections', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'A working architecture repository, not slideware' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'From vision to build, one step at a time' })
    ).toBeVisible()
    await expect(page.getByText('This page failed to load.')).toHaveCount(0)
  })

  test('footer shows the deployed version (health signal)', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/^v\d+\.\d+\.\d+/).first()).toBeVisible()
  })
})

// Authenticated coverage — the real reason the smoke exists: hit the overview,
// every domain, each abstraction, and every artefact, asserting each renders
// without tripping the error boundary or throwing (this is what would have
// caught the Breadcrumb crash). Runs with the session from auth.setup.js; skips
// when no test credentials are configured.
const routes = architectureRoutes()
test(`enumerated ${routes.length} architecture routes`, () => {
  expect(routes.length).toBeGreaterThan(10)
})

for (const route of routes) {
  test(`route renders: ${route.replace(ROUTE_BASE, '')}`, async ({ page }) => {
    requiresAuth()
    const pageErrors = []
    page.on('pageerror', (e) => pageErrors.push(e.message))
    await page.goto(route, { waitUntil: 'networkidle' })
    await expect(page.getByText('This page failed to load.')).toHaveCount(0)
    await expect(page.getByText('Something went wrong.')).toHaveCount(0)
    // A level-1 heading is present once the page has resolved.
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    // No uncaught JS on the authenticated route (the Breadcrumb TDZ class).
    expect(pageErrors, `JS errors on ${route}`).toEqual([])
  })
}
