import { ARTEFACTS } from './artefacts'

// Architecture *content* metrics, computed from the live repository.
//
// The headline numbers describe the architecture content itself — how many
// capabilities, processes, data concepts, interfaces, etc. — rather than how
// many artefact *types* are populated (which is near-constant). Counts come from
// the catalogue arrays; capabilities and processes are split by level. Document
// artefacts contribute their document-instance count. Decisions and discoveries
// come from their indexes.
//
// Cost model: one directory listing per domain×layer tells us which artefacts
// are populated; only populated catalogue/document artefacts are then read.

async function fetchJson(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function listArtefactIds(clientId, versionId, domain, abstraction) {
  const data = await fetchJson(
    `/api/arch/clients/${clientId}/${versionId}/domains/${domain}/${abstraction}`
  )
  return (data?.entries ?? [])
    .filter((e) => !e.isDir && e.name.endsWith('.json'))
    .map((e) => e.name.replace(/\.json$/, ''))
}

const humanize = (key) =>
  String(key)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())

// Distinct domain×layer slots present in the registry.
const SLOTS = [...new Set(ARTEFACTS.map((a) => `${a.domain}/${a.abstraction}`))].map((s) => {
  const [domain, abstraction] = s.split('/')
  return { domain, abstraction }
})

const MATURITY_TIERS = [
  { min: 1, label: 'Complete' },
  { min: 0.75, label: 'Mature' },
  { min: 0.5, label: 'Established' },
  { min: 0.25, label: 'Developing' },
  { min: 0, label: 'Seed' },
]
export function maturityTier(ratio) {
  return MATURITY_TIERS.find((t) => ratio >= t.min)?.label ?? 'Seed'
}

// ── Content extraction ──────────────────────────────────────────────────────────

// Array properties that are document metadata, not architecture content.
const META_ARRAY_KEYS = new Set(['audience', 'author', 'activity'])
// Catalogue arrays that warrant a per-level breakdown.
const LEVEL_KEYS = new Set(['capabilities', 'processes'])
// Domain-qualified labels where the bare key would be ambiguous across domains.
const LABEL_OVERRIDES = {
  'data:domains': 'Data Domains',
  'application:domains': 'Application Domains',
  'data:concepts': 'Data Concepts',
}
// Display order for the aggregated headline list.
const CONTENT_ORDER = [
  'Capabilities',
  'Processes',
  'Data Concepts',
  'Data Domains',
  'Application Domains',
  'Platforms',
  'Applications',
  'Interfaces',
  'Strategies',
  'Principles',
  'Guardrails',
]
const orderIndex = (label) => {
  const i = CONTENT_ORDER.indexOf(label)
  return i === -1 ? CONTENT_ORDER.length : i
}

// Per-level breakdown for a level-bearing array, e.g. [{label:'L1',count:9}, …].
function levelSub(items) {
  const counts = {}
  for (const item of items) {
    const lvl = item?.level
    if (lvl == null) continue
    counts[lvl] = (counts[lvl] ?? 0) + 1
  }
  return Object.keys(counts)
    .sort()
    .map((lvl) => ({ label: `L${lvl}`, count: counts[lvl] }))
}

// Content items from one catalogue's data, tagged for the given architecture
// domain: [{ label, count, sub? }].
export function extractContentItems(data, archDomain) {
  const items = []
  for (const [key, value] of Object.entries(data ?? {})) {
    if (!Array.isArray(value) || value.length === 0 || META_ARRAY_KEYS.has(key)) continue
    const label = LABEL_OVERRIDES[`${archDomain}:${key}`] ?? humanize(key)
    const item = { label, count: value.length }
    if (LEVEL_KEYS.has(key)) {
      const sub = levelSub(value)
      if (sub.length > 1) item.sub = sub
    }
    items.push(item)
  }
  return items
}

// Merge content-item lists by label (summing counts and per-level sub-counts).
export function mergeContent(lists) {
  const byLabel = new Map()
  for (const list of lists) {
    for (const item of list) {
      const existing = byLabel.get(item.label)
      if (!existing) {
        byLabel.set(item.label, { ...item, sub: item.sub ? [...item.sub] : undefined })
        continue
      }
      existing.count += item.count
      if (item.sub) {
        existing.sub ??= []
        for (const s of item.sub) {
          const hit = existing.sub.find((x) => x.label === s.label)
          if (hit) hit.count += s.count
          else existing.sub.push({ ...s })
        }
      }
    }
  }
  const merged = [...byLabel.values()]
  for (const item of merged) item.sub?.sort((a, b) => a.label.localeCompare(b.label))
  return merged.sort(
    (a, b) => orderIndex(a.label) - orderIndex(b.label) || a.label.localeCompare(b.label)
  )
}

function countByStatus(items, statuses) {
  const counts = Object.fromEntries(statuses.map((s) => [s, 0]))
  for (const item of items ?? []) {
    const s = item.status ?? statuses[0]
    counts[s] = (counts[s] ?? 0) + 1
  }
  return counts
}

const DECISION_STATUSES = ['draft', 'proposed', 'accepted', 'staged', 'committed', 'rejected']
const DISCOVERY_STATUSES = ['active', 'archived']

// ── Per-version metrics ─────────────────────────────────────────────────────────
export async function loadVersionMetrics(clientId, versionId) {
  // 1) Which artefacts are populated, by domain×layer.
  const present = new Map()
  await Promise.all(
    SLOTS.map(async ({ domain, abstraction }) => {
      const ids = await listArtefactIds(clientId, versionId, domain, abstraction)
      present.set(`${domain}/${abstraction}`, new Set(ids))
    })
  )
  const isPresent = (a) => present.get(`${a.domain}/${a.abstraction}`)?.has(a.id) ?? false

  // 2) Read populated catalogue + document artefacts for their content.
  const perDomain = {}
  for (const a of ARTEFACTS) {
    perDomain[a.domain] ??= { items: [], populated: 0, total: 0, documents: 0 }
    perDomain[a.domain].total++
    if (isPresent(a)) perDomain[a.domain].populated++
  }

  let documents = 0
  await Promise.all(
    ARTEFACTS.filter(isPresent)
      .filter((a) => a.format === 'catalogue' || a.format === 'document')
      .map(async (a) => {
        const data = await fetchJson(
          `/api/arch/clients/${clientId}/${versionId}/domains/${a.domain}/${a.abstraction}/${a.id}.json`
        )
        if (!data) return
        if (a.format === 'document') {
          const n = Array.isArray(data.documents) ? data.documents.length : 0
          documents += n
          perDomain[a.domain].documents += n
        } else {
          perDomain[a.domain].items.push(...extractContentItems(data, a.domain))
        }
      })
  )

  // Merge each domain's raw items, and build the cross-domain aggregate.
  for (const domain of Object.keys(perDomain)) {
    perDomain[domain].items = mergeContent([perDomain[domain].items])
  }
  const content = mergeContent(Object.values(perDomain).map((d) => d.items))

  // 3) Governance.
  const [decIdx, discIdx] = await Promise.all([
    fetchJson(`/api/arch/clients/${clientId}/${versionId}/decisions/decisions.json`),
    fetchJson(`/api/arch/clients/${clientId}/${versionId}/discovery/discovery.json`),
  ])
  const decisionsList = decIdx?.decisions ?? []
  const discoveriesList = discIdx?.discoveries ?? []

  // 4) Maturity = share of registry slots populated.
  const total = ARTEFACTS.length
  const populated = ARTEFACTS.filter(isPresent).length
  const maturity = total ? populated / total : 0

  return {
    artefacts: { populated, total },
    perDomain,
    content,
    documents,
    decisions: decisionsList.length,
    discoveries: discoveriesList.length,
    decisionsByStatus: countByStatus(decisionsList, DECISION_STATUSES),
    discoveriesByStatus: countByStatus(discoveriesList, DISCOVERY_STATUSES),
    maturity,
    maturityTier: maturityTier(maturity),
  }
}

// ── Per-client roll-up (across every version) ────────────────────────────────────
export async function loadClientRollup(clientId) {
  const idx = await fetchJson(`/api/arch/clients/${clientId}/versions.json`)
  const versionIds = (idx?.versions ?? []).map((v) => v['version-id']).filter(Boolean)
  if (versionIds.length === 0) return null

  const perVersion = await Promise.all(versionIds.map((v) => loadVersionMetrics(clientId, v)))

  const content = mergeContent(perVersion.map((m) => m.content))
  const sum = (key) => perVersion.reduce((acc, m) => acc + m[key], 0)
  const sumStatus = (key, statuses) => {
    const out = Object.fromEntries(statuses.map((s) => [s, 0]))
    for (const m of perVersion) for (const s of statuses) out[s] += m[key][s] ?? 0
    return out
  }
  const maturity = Math.max(...perVersion.map((m) => m.maturity))

  // Merge per-domain content across versions so the clients list can group by domain.
  const domains = new Set(perVersion.flatMap((m) => Object.keys(m.perDomain)))
  const perDomain = {}
  for (const d of domains) {
    perDomain[d] = {
      items: mergeContent(perVersion.map((m) => m.perDomain[d]?.items ?? [])),
      documents: perVersion.reduce((acc, m) => acc + (m.perDomain[d]?.documents ?? 0), 0),
    }
  }

  return {
    versions: versionIds.length,
    content,
    perDomain,
    documents: sum('documents'),
    decisions: sum('decisions'),
    discoveries: sum('discoveries'),
    decisionsByStatus: sumStatus('decisionsByStatus', DECISION_STATUSES),
    discoveriesByStatus: sumStatus('discoveriesByStatus', DISCOVERY_STATUSES),
    maturity,
    maturityTier: maturityTier(maturity),
  }
}
