// Renders key routes of the deployed (or local) app with headless Chromium and
// writes PNGs into src/assets/screenshots/. Used for visual review and as
// product imagery on the homepage.
//
//   BASE_URL=http://localhost:3000 node scripts/screenshot.mjs   # local dev
//   node scripts/screenshot.mjs                                  # deployed
import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../assets/screenshots')
mkdirSync(OUT, { recursive: true })

const BASE = process.env.BASE_URL ?? 'https://pickle-psi-neon.vercel.app'
const V = 'clients/fedc/1.0.0/domains'

// fullPage:false captures a clean app "window" (for homepage product imagery);
// fullPage:true captures the whole scroll height (for review).
const SHOTS = [
  { name: 'home',             path: '/',                                          fullPage: true },
  { name: 'capability-model', path: `/${V}/business/conceptual/BUS-BCM`,          fullPage: false },
  { name: 'process-flow',     path: `/${V}/business/conceptual/BUS-BPM`,          fullPage: false },
  { name: 'catalogue',        path: `/${V}/business/conceptual/BUS-CAP`,          fullPage: false },
  { name: 'vision-document',  path: `/${V}/solution/conceptual/SOL-AVI`,          fullPage: false },
  { name: 'solution-design',  path: `/${V}/solution/logical/SOL-SDE`,             fullPage: false },
  { name: 'wiring-diagram',   path: `/${V}/integration/logical/INT-WRD`,          fullPage: false },
  { name: 'decision',         path: '/clients/fedc/1.0.0/decisions/ADR-013',      fullPage: false },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 })

for (const shot of SHOTS) {
  const url = `${BASE}${shot.path}`
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 })
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
    await page.waitForTimeout(2500)
    await page.screenshot({ path: resolve(OUT, `${shot.name}.png`), fullPage: shot.fullPage })
    console.log(`ok   ${shot.name}  <- ${url}`)
  } catch (err) {
    console.log(`FAIL ${shot.name}  ${err.message}`)
  }
}

await browser.close()
