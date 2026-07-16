// Full-page screenshot crawler.
//
// Signs in, then BFS-crawls same-origin links starting from the home page, the
// architectures list, and the docs index. Every reachable page gets a
// full-length screenshot written to assets/screenshots/all-pages, with the
// folder path mirroring the URL path and the image named index.png
// (so /architectures/fedc/baseline/domains -> .../architectures/fedc/baseline/domains/index.png,
// and / -> .../all-pages/index.png).
//
// Read-only: navigates via GET only, never clicks buttons, so nothing mutates.
//
// Usage: node tools/crawl-screenshots.mjs   (run from src/)
//   BASE_URL   override target (default: production)
//   MAX_PAGES  cap on pages captured (default: 400)

import { chromium } from 'playwright'
import { mkdirSync, rmSync } from 'fs'
import { dirname, join, resolve } from 'path'

const BASE = (process.env.BASE_URL || 'https://pickle-psi-neon.vercel.app').replace(/\/+$/, '')
const ORIGIN = new URL(BASE).origin
const OUT = resolve(process.cwd(), '../assets/screenshots/all-pages')
const MAX = Number(process.env.MAX_PAGES || 900)
const EMAIL = process.env.CRAWL_EMAIL || 'dan+owner@eastley.net'
const PASS = process.env.CRAWL_PASSWORD || 'Pickle-Owner-2026!'

// Normalise a path for dedup: drop query/hash, strip trailing slash.
const norm = (pathname) => {
  const p = pathname.split('#')[0].split('?')[0].replace(/\/+$/, '')
  return p === '' ? '/' : p
}

const pathToFile = (pathname) => {
  const rel = pathname === '/' ? '' : pathname.replace(/^\//, '')
  return join(OUT, rel, 'index.png')
}

const SKIP = (p) => p.startsWith('/api') || p.startsWith('/login') || p.startsWith('/register')

async function goto(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  } catch {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
  }
  await clearCheckpoint()
  // Give lazy chunks / metric fetches a moment to paint.
  await page.waitForTimeout(1200)
}

async function capture(page, pathname) {
  const file = pathToFile(pathname)
  mkdirSync(dirname(file), { recursive: true })
  await page.screenshot({ path: file, fullPage: true })
}

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  locale: 'en-GB',
})
const page = await ctx.newPage()

// The Vercel security checkpoint serves a JS challenge that auto-redirects to
// the real page once solved. Wait it out (reloading if it stalls).
async function clearCheckpoint() {
  for (let i = 0; i < 12; i++) {
    const title = await page.title().catch(() => '')
    if (!/Checkpoint|Security/i.test(title)) return true
    await page.waitForTimeout(2500)
    if (i === 5) await page.reload({ waitUntil: 'networkidle' }).catch(() => {})
  }
  return !/Checkpoint|Security/i.test(await page.title().catch(() => ''))
}

const captured = []

// 1. Auth pages, captured while signed out.
for (const p of ['/login', '/register']) {
  await goto(page, BASE + p)
  await capture(page, p)
  captured.push(p)
  console.log('shot', p)
}

// 2. Sign in. The Vercel security checkpoint can transiently intercept a
//    navigation, so wait for the real form and retry with a reload.
let signedIn = false
for (let attempt = 1; attempt <= 4 && !signedIn; attempt++) {
  await goto(page, BASE + '/login')
  try {
    await page.waitForSelector('input[type=email]', { timeout: 15000 })
  } catch {
    await page.reload({ waitUntil: 'networkidle' }).catch(() => {})
    await page.waitForTimeout(3000)
    continue
  }
  await page.fill('input[type=email]', EMAIL)
  await page.fill('input[type=password]', PASS)
  await Promise.all([
    page.waitForLoadState('networkidle').catch(() => {}),
    page.click('button[type=submit]'),
  ])
  await page.waitForTimeout(2500)
  // Signed in once we're no longer on /login.
  signedIn = !norm(new URL(page.url()).pathname).startsWith('/login')
  if (!signedIn) await page.waitForTimeout(2000)
}
if (!signedIn) {
  console.error('could not sign in after retries — aborting')
  await browser.close()
  process.exit(1)
}
console.log('signed in →', norm(new URL(page.url()).pathname))

// 3. Deterministically enumerate every architecture route from the app's API
//    (the browser session passes the Vercel checkpoint that blocks plain curl).
//    Seeding every domain/abstraction/decision/discovery route guarantees the
//    deep pages are captured even where the in-page nav links load lazily.
const DOMAINS = ['business', 'data', 'application', 'integration', 'solution']
const ABSTRACTIONS = ['conceptual', 'logical', 'physical']

const apiJson = (p) =>
  page.evaluate(async (u) => {
    try {
      const r = await fetch(u)
      return r.ok ? await r.json() : null
    } catch {
      return null
    }
  }, BASE + p)

const seeds = ['/', '/architectures', '/account', '/docs/index']

const archIdx = await apiJson('/api/arch/architectures.json')
for (const a of archIdx?.architectures ?? []) {
  const arch = a['architecture-id']
  if (!arch) continue
  seeds.push(`/architectures/${arch}/transitions`)
  const tIdx = await apiJson(`/api/arch/${arch}/transitions.json`)
  for (const t of tIdx?.transitions ?? []) {
    const tr = t['transition-id']
    if (!tr) continue
    const base = `/architectures/${arch}/${tr}`
    seeds.push(`${base}/domains`, `${base}/decisions`, `${base}/decisions/new`)
    seeds.push(`${base}/discovery`, `${base}/discovery/new`)
    for (const d of DOMAINS) {
      seeds.push(`${base}/domains/${d}`)
      for (const ab of ABSTRACTIONS) seeds.push(`${base}/domains/${d}/${ab}`)
    }
    const decIdx = await apiJson(`/api/arch/${arch}/${tr}/decisions/decisions.json`)
    for (const dec of decIdx?.decisions ?? []) {
      if (dec['decision-id']) seeds.push(`${base}/decisions/${dec['decision-id']}`)
    }
    const discIdx = await apiJson(`/api/arch/${arch}/${tr}/discovery/discovery.json`)
    for (const disc of discIdx?.discoveries ?? []) {
      if (disc['discovery-id']) seeds.push(`${base}/discovery/${disc['discovery-id']}`)
    }
  }
}
console.log(`enumerated ${seeds.length} seed routes from the API`)

// 4. BFS crawl — seeds first (deterministic), then anything they link to
//    (artefact detail pages, docs pages, …).
const visited = new Set(['/login', '/register'])
const queue = [...new Set(seeds.map(norm))]

while (queue.length && captured.length < MAX) {
  const p = norm(queue.shift())
  if (visited.has(p) || SKIP(p)) continue
  visited.add(p)

  await goto(page, BASE + p)
  const finalPath = norm(new URL(page.url()).pathname)
  if (finalPath !== p) {
    // Redirected (e.g. an auth bounce or index redirect); dedup on the target.
    if (visited.has(finalPath) || SKIP(finalPath)) continue
    visited.add(finalPath)
  }

  await capture(page, finalPath)
  captured.push(finalPath)
  console.log('shot', finalPath, `(${captured.length})`)

  const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.href))
  for (const h of hrefs) {
    let u
    try {
      u = new URL(h)
    } catch {
      continue
    }
    if (u.origin !== ORIGIN) continue
    const np = norm(u.pathname)
    if (!visited.has(np) && !SKIP(np) && !queue.includes(np)) queue.push(np)
  }
}

await browser.close()

if (captured.length >= MAX) console.log(`\n⚠ hit MAX_PAGES=${MAX} cap — some pages may be uncaptured`)
console.log(`\n✓ captured ${captured.length} pages into ${OUT}`)
