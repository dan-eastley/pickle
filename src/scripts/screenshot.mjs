// Renders the app's routes with headless Chromium and writes PNGs into
// src/assets/screenshots/. The screenshot folder mirrors the URL structure,
// ignoring the architecture id and transition (e.g. the route
//   /architectures/fedc/baseline/domains/business/conceptual/BUS-CAP
// is saved to
//   assets/screenshots/domains/business/conceptual/BUS-CAP.png
//
// The route list is derived from the architecture data on disk, so every
// artefact present for the reference client is captured, plus the overview,
// each domain, and each abstraction page. A few named product shots are also
// written to the screenshots root for the homepage imagery.
//
//   BASE_URL=http://localhost:3000 node scripts/screenshot.mjs   # local dev
//   node scripts/screenshot.mjs                                  # deployed
//   ONLY=product node scripts/screenshot.mjs                     # just homepage imagery
import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import { mkdirSync, readdirSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(__dirname, '../..')
const OUT = resolve(__dirname, '../assets/screenshots')

const BASE = process.env.BASE_URL ?? 'https://pickle-psi-neon.vercel.app'
const ONLY = process.env.ONLY ?? 'all' // all | url | product

// Reference architecture/transition whose routes we capture. The screenshot path
// drops the architecture and transition, so the imagery stays stable as those change.
const CLIENT = process.env.SHOT_CLIENT ?? 'fedc'
const VERSION = process.env.SHOT_VERSION ?? 'baseline'
const ROUTE_BASE = `architectures/${CLIENT}/${VERSION}`
const DOMAINS_ROOT = join(REPO, 'architectures', `${CLIENT}/${VERSION}`, 'domains')

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

// Build the URL-mapped shot list from the data on disk.
function urlShots() {
  const shots = [{ route: `${ROUTE_BASE}/domains`, out: 'domains/index' }]
  for (const domain of dirs(DOMAINS_ROOT)) {
    shots.push({ route: `${ROUTE_BASE}/domains/${domain}`, out: `domains/${domain}/index` })
    for (const abstraction of dirs(join(DOMAINS_ROOT, domain))) {
      shots.push({
        route: `${ROUTE_BASE}/domains/${domain}/${abstraction}`,
        out: `domains/${domain}/${abstraction}/index`,
      })
      for (const id of jsons(join(DOMAINS_ROOT, domain, abstraction))) {
        shots.push({
          route: `${ROUTE_BASE}/domains/${domain}/${abstraction}/${id}`,
          out: `domains/${domain}/${abstraction}/${id}`,
        })
      }
    }
  }
  return shots.map((s) => ({ ...s, fullPage: true }))
}

// Named product shots used as homepage imagery (kept at the screenshots root).
const productShots = [
  { route: '/', out: 'home', fullPage: true },
  {
    route: `${ROUTE_BASE}/domains/business/conceptual/BUS-BCM`,
    out: 'capability-model',
    fullPage: false,
  },
  {
    route: `${ROUTE_BASE}/domains/business/conceptual/BUS-BPM`,
    out: 'process-flow',
    fullPage: false,
  },
  { route: `${ROUTE_BASE}/domains/business/conceptual/BUS-CAP`, out: 'catalogue', fullPage: false },
  {
    route: `${ROUTE_BASE}/domains/solution/conceptual/SOL-AVI`,
    out: 'vision-document',
    fullPage: false,
  },
  {
    route: `${ROUTE_BASE}/domains/solution/logical/SOL-SDE`,
    out: 'solution-design',
    fullPage: false,
  },
  {
    route: `${ROUTE_BASE}/domains/integration/logical/INT-WRD`,
    out: 'wiring-diagram',
    fullPage: false,
  },
  { route: 'architectures/fedc/baseline/decisions/ADR-013', out: 'decision', fullPage: false },
]

const SHOTS =
  ONLY === 'product' ? productShots : ONLY === 'url' ? urlShots() : [...productShots, ...urlShots()]

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1.5,
})

let ok = 0,
  fail = 0
for (const shot of SHOTS) {
  const url = shot.route.startsWith('/') ? `${BASE}${shot.route}` : `${BASE}/${shot.route}`
  const file = resolve(OUT, `${shot.out}.png`)
  mkdirSync(dirname(file), { recursive: true })
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 })
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
    await page.waitForTimeout(2000)
    await page.screenshot({ path: file, fullPage: shot.fullPage })
    ok++
    console.log(`ok   ${shot.out}  <- ${url}`)
  } catch (err) {
    fail++
    console.log(`FAIL ${shot.out}  ${err.message}`)
  }
}

await browser.close()
console.log(`\n${ok} ok, ${fail} failed, ${SHOTS.length} total`)
