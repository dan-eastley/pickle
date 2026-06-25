import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import { readdirSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Reference client/version whose routes we smoke-test.
const CLIENT = 'fedc'
const VERSION = '1.0.0'
const ROUTE_BASE = `/clients/${CLIENT}/${VERSION}`
const DOMAINS_ROOT = resolve(
  __dirname,
  '../../../architectures',
  `clients/${CLIENT}/${VERSION}`,
  'domains'
)

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

test('homepage renders its key sections', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', {
      name: 'A working architecture repository, not slideware',
    })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: 'From vision to build, one step at a time',
    })
  ).toBeVisible()
  await expect(page.getByText('This page failed to load.')).toHaveCount(0)
})

test('navigates from the homepage to the clients list', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'View Clients' }).first().click()
  await expect(page).toHaveURL(/\/clients$/)
  await expect(page.getByRole('heading', { name: 'Clients', level: 1 })).toBeVisible()
})

// Hit every artefact, the overview, each domain, and each abstraction page, and
// assert the route renders without tripping the error boundary.
const routes = architectureRoutes()
test(`enumerated ${routes.length} architecture routes`, () => {
  expect(routes.length).toBeGreaterThan(10)
})

for (const route of routes) {
  test(`route renders: ${route.replace(ROUTE_BASE, '')}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' })
    await expect(page.getByText('This page failed to load.')).toHaveCount(0)
    // A level-1 heading is present once the page has resolved.
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
  })
}
