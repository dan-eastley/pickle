// Runs use cases from tests/use-cases.json against the app, records the outcome
// of each back into the JSON, and writes a human-readable report with summaries
// to tests/use-case-outcomes.md.
//
// Filter which cases run with env vars (default: XS + Must Have):
//   COMPLEXITY=XS PRIORITY="Must Have" BASE_URL=https://… node tests/run-use-cases.mjs
//   COMPLEXITY=all PRIORITY=all node tests/run-use-cases.mjs   # everything with a check
//
// Each use case is matched to a check by its `title`. Titles without a check are
// recorded as `todo` (not yet automated) rather than passed/failed.
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Playwright is a dev dependency of the SPA (src/), so resolve it from there.
const require = createRequire(resolve(__dirname, '../src/package.json'))
const { chromium } = require('playwright')
const JSON_PATH = resolve(__dirname, 'use-cases.json')
const MD_PATH = resolve(__dirname, 'use-case-outcomes.md')

const BASE = process.env.BASE_URL ?? 'https://pickle-psi-neon.vercel.app'
const FILTER_C = process.env.COMPLEXITY ?? 'XS'
const FILTER_P = process.env.PRIORITY ?? 'Must Have'
const REF = 'clients/fedc/1.0.0'

const pass = (note) => ({ status: 'passed', note })
const fail = (note) => ({ status: 'failed', note })

// title → async (page) => { status, note }
const CHECKS = {
  'Browse the architecture by domain': async (page) => {
    await page.goto(`${BASE}/${REF}/domains`, { waitUntil: 'networkidle' })
    if (await page.getByText('This page failed to load.').count()) return fail('error boundary tripped')
    // Acceptance: all five domains listed with descriptions.
    const cards = page.locator('a[href*="/domains/"]')
    const n = await cards.count()
    if (n < 5) return fail(`expected ≥5 domain cards, found ${n}`)
    const firstDesc = await cards.first().locator('p').first().innerText().catch(() => '')
    if (!firstDesc.trim()) return fail('domain cards have no description')
    // Acceptance: selecting a domain shows its artefacts.
    await cards.first().click()
    await page.waitForURL(/\/domains\/[a-z]+$/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    const heading = await page.getByRole('heading', { level: 1 }).first().innerText().catch(() => '')
    if (!/Architecture/i.test(heading)) return fail(`domain page heading unexpected: "${heading}"`)
    return pass(`5+ domains with descriptions; navigated to "${heading}"`)
  },
}

// Generic "this route renders real content" check — loads an artefact/page,
// asserts no error boundary, an h1, substantive body text, and (optionally) a
// known string. Guards the empty-render class of bug too.
const at = (path) => `${BASE}/${REF}/${path}`
function rendersWithContent(path, mustText) {
  return async (page) => {
    await page.goto(at(path), { waitUntil: 'networkidle' })
    if (await page.getByText('This page failed to load.').count()) return fail('error boundary tripped')
    const h1 = await page.getByRole('heading', { level: 1 }).first().innerText().catch(() => '')
    if (!h1) return fail('no h1 rendered')
    if (mustText && !(await page.getByText(mustText).count())) return fail(`expected to see "${mustText}"`)
    const bodyLen = (await page.locator('main').innerText().catch(() => '')).length
    if (bodyLen < 200) return fail(`page looks empty (body ${bodyLen} chars)`)
    return pass(mustText ? `renders with "${mustText}"` : `renders (${bodyLen} chars)`)
  }
}

Object.assign(CHECKS, {
  'Drill into an abstraction layer': rendersWithContent('domains/business/conceptual'),
  'View a business capability catalogue': rendersWithContent('domains/business/conceptual/BUS-CAP', 'Customer Management'),
  'View a data domains & concepts catalogue': rendersWithContent('domains/data/conceptual/DAT-DAC'),
  'View principles and guardrails': rendersWithContent('domains/business/logical/BUS-PRN'),
  'View the application landscape': rendersWithContent('domains/application/logical/APP-DAP'),
  'View the business capability model': rendersWithContent('domains/business/conceptual/BUS-BCM', 'Customer Management'),
  'View the business process model': rendersWithContent('domains/business/conceptual/BUS-BPM'),
  'Read an architecture vision': rendersWithContent('domains/solution/conceptual/SOL-AVI'),
  'Read a solution intent': rendersWithContent('domains/solution/logical/SOL-SVI'),
  'Read an interface specification': rendersWithContent('domains/solution/physical/SOL-ISP'),
  'See an artefact’s change history': rendersWithContent('domains/business/conceptual/BUS-CAP', 'Joe B'),
  'Export the raw JSON of an artefact': rendersWithContent('domains/business/conceptual/BUS-CAP', 'BUS-CAP.json'),
})

const data = JSON.parse(readFileSync(JSON_PATH, 'utf8'))
const all = data['use-cases']
// COMPLEXITY / PRIORITY accept a comma-separated list (or "all").
const cset = FILTER_C.split(',').map(s => s.trim())
const pset = FILTER_P.split(',').map(s => s.trim())
const selected = all.filter(u =>
  (FILTER_C === 'all' || cset.includes(u.complexity)) &&
  (FILTER_P === 'all' || pset.includes(u.priority)),
)

console.log(`Running ${selected.length} use case(s) — complexity=${FILTER_C}, priority=${FILTER_P}\n`)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const checkedAt = new Date().toISOString()

for (const uc of selected) {
  const check = CHECKS[uc.title]
  let outcome
  if (!check) {
    outcome = { status: 'todo', note: 'No automated check yet' }
  } else {
    try { outcome = await check(page) }
    catch (err) { outcome = fail(err.message) }
  }
  outcome.checkedAt = checkedAt
  uc.outcome = outcome
  const icon = outcome.status === 'passed' ? '[PASS]' : outcome.status === 'failed' ? '[FAIL]' : '[TODO]'
  console.log(`${icon} ${uc.id} ${uc.title} (${uc.actor}) — ${outcome.status}: ${outcome.note}`)
}

await browser.close()

// Persist outcomes back into the corpus.
writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + '\n')

// ── Report ────────────────────────────────────────────────────────────────
const tally = (key) => {
  const m = {}
  for (const u of selected) {
    const k = u[key]
    m[k] ??= { passed: 0, failed: 0, todo: 0, total: 0 }
    m[k][u.outcome.status]++; m[k].total++
  }
  return m
}
const statusTotals = selected.reduce((m, u) => { m[u.outcome.status]++; m.total++; return m }, { passed: 0, failed: 0, todo: 0, total: 0 })

const table = (title, m) => {
  let s = `### By ${title}\n\n| ${title} | Passed | Failed | To do | Total |\n|---|---|---|---|---|\n`
  for (const [k, v] of Object.entries(m)) s += `| ${k} | ${v.passed} | ${v.failed} | ${v.todo} | ${v.total} |\n`
  return s + '\n'
}

let md = `# Use Case Outcomes\n\n`
md += `Results of running the use-case corpus ([use-cases.json](use-cases.json)) against the product. Generated by [run-use-cases.mjs](run-use-cases.mjs).\n\n`
md += `- **Run:** ${checkedAt}\n- **Filter:** complexity \`${FILTER_C}\` · priority \`${FILTER_P}\`\n- **Target:** ${BASE}\n\n`
md += `## Summary\n\n**${statusTotals.passed} passed · ${statusTotals.failed} failed · ${statusTotals.todo} to do** (of ${statusTotals.total} run)\n\n`
md += table('complexity', tally('complexity'))
md += table('priority', tally('priority'))
md += `## Results\n\n| ID | Title | Actor | Complexity | Priority | Outcome | Note |\n|---|---|---|---|---|---|---|\n`
for (const u of selected) {
  const icon = u.outcome.status === 'passed' ? '✅ passed' : u.outcome.status === 'failed' ? '❌ failed' : '⬜ to do'
  md += `| ${u.id} | ${u.title} | ${u.actor} | ${u.complexity} | ${u.priority} | ${icon} | ${u.outcome.note} |\n`
}
md += '\n'
writeFileSync(MD_PATH, md)

console.log(`\n${statusTotals.passed} passed, ${statusTotals.failed} failed, ${statusTotals.todo} to do`)
console.log(`Wrote outcomes to use-cases.json and tests/use-case-outcomes.md`)
// Emit failures for backlog triage.
const failures = selected.filter(u => u.outcome.status === 'failed')
if (failures.length) {
  console.log('\nFAILURES:')
  for (const f of failures) console.log(`  ${f.id} ${f.title} — ${f.outcome.note}`)
}
