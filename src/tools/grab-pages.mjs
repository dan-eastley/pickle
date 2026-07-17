// One-off: sign in and full-page screenshot a specific comma-separated PAGES
// list into the same all-pages tree. Used to backfill pages the crawler missed.
// Usage: PAGES=/account node tools/grab-pages.mjs
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { dirname, join, resolve } from 'path'

const BASE = (process.env.BASE_URL || 'https://pickle-psi-neon.vercel.app').replace(/\/+$/, '')
const OUT = resolve(process.cwd(), '../assets/screenshots/all-pages')
const EMAIL = process.env.CRAWL_EMAIL || 'dan+owner@eastley.net'
const PASS = process.env.CRAWL_PASSWORD || 'Pickle-Owner-2026!'
const PAGES = (process.env.PAGES || '/account').split(',').map((s) => s.trim()).filter(Boolean)

const norm = (p) => {
  const x = p.split('#')[0].split('?')[0].replace(/\/+$/, '')
  return x === '' ? '/' : x
}
const pathToFile = (p) => join(OUT, p === '/' ? '' : p.replace(/^\//, ''), 'index.png')

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  locale: 'en-GB',
})
const page = await ctx.newPage()

async function clearCheckpoint() {
  for (let i = 0; i < 12; i++) {
    if (!/Checkpoint|Security/i.test(await page.title().catch(() => ''))) return
    await page.waitForTimeout(2500)
    if (i === 5) await page.reload({ waitUntil: 'networkidle' }).catch(() => {})
  }
}
async function goto(url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
  await clearCheckpoint()
  await page.waitForTimeout(1500)
}

let signedIn = false
for (let a = 1; a <= 4 && !signedIn; a++) {
  await goto(BASE + '/login')
  try {
    await page.waitForSelector('input[type=email]', { timeout: 15000 })
  } catch {
    continue
  }
  await page.fill('input[type=email]', EMAIL)
  await page.fill('input[type=password]', PASS)
  await Promise.all([page.waitForLoadState('networkidle').catch(() => {}), page.click('button[type=submit]')])
  await page.waitForTimeout(2500)
  signedIn = !norm(new URL(page.url()).pathname).startsWith('/login')
}
if (!signedIn) {
  console.error('sign-in failed')
  await browser.close()
  process.exit(1)
}
console.log('signed in')

for (const p of PAGES) {
  const np = norm(p)
  await goto(BASE + np)
  const finalPath = norm(new URL(page.url()).pathname)
  const file = pathToFile(finalPath)
  mkdirSync(dirname(file), { recursive: true })
  await page.screenshot({ path: file, fullPage: true })
  console.log('shot', finalPath, '→', file)
}

await browser.close()
console.log('done')
