import { ARTEFACTS } from './artefacts'

// Per-client/version metrics, computed from the live repository.
//
// Cost model: one directory listing per domain×layer (cheap) tells us which
// artefacts are *populated* (a file is present). Only document-format artefacts
// are then read in full, to sum document *instances* (a single document
// artefact can hold many documents). Decisions/discoveries come from their
// indexes. So ~20 small requests per client, not a full catalogue read.

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

// Distinct domain×layer slots present in the registry.
const SLOTS = [...new Set(ARTEFACTS.map((a) => `${a.domain}/${a.abstraction}`))].map((s) => {
  const [domain, abstraction] = s.split('/')
  return { domain, abstraction }
})

const EMPTY_FORMAT = () => ({ catalogue: 0, diagram: 0, matrix: 0, document: 0 })

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

export async function loadClientMetrics(clientId, versionId) {
  // 1) Which artefacts are populated (present on disk), by domain×layer.
  const present = new Map() // "domain/abstraction" -> Set(ids)
  await Promise.all(
    SLOTS.map(async ({ domain, abstraction }) => {
      const ids = await listArtefactIds(clientId, versionId, domain, abstraction)
      present.set(`${domain}/${abstraction}`, new Set(ids))
    })
  )
  const isPresent = (a) => present.get(`${a.domain}/${a.abstraction}`)?.has(a.id) ?? false

  // 2) Format counts + per-domain breakdown over the populated artefacts.
  const byFormat = EMPTY_FORMAT()
  const perDomain = {}
  const populatedDocArtefacts = []
  for (const a of ARTEFACTS) {
    perDomain[a.domain] ??= { ...EMPTY_FORMAT(), populated: 0, total: 0, documents: 0 }
    perDomain[a.domain].total++
    if (!isPresent(a)) continue
    perDomain[a.domain].populated++
    byFormat[a.format] = (byFormat[a.format] ?? 0) + 1
    perDomain[a.domain][a.format] = (perDomain[a.domain][a.format] ?? 0) + 1
    if (a.format === 'document') populatedDocArtefacts.push(a)
  }

  // 3) Document *instances* — read only the populated document artefacts.
  let documents = 0
  await Promise.all(
    populatedDocArtefacts.map(async (a) => {
      const data = await fetchJson(
        `/api/arch/clients/${clientId}/${versionId}/domains/${a.domain}/${a.abstraction}/${a.id}.json`
      )
      const n = Array.isArray(data?.documents) ? data.documents.length : 0
      documents += n
      perDomain[a.domain].documents += n
    })
  )

  // 4) Governance activity.
  const [decIdx, discIdx] = await Promise.all([
    fetchJson(`/api/arch/clients/${clientId}/${versionId}/decisions/decisions.json`),
    fetchJson(`/api/arch/clients/${clientId}/${versionId}/discovery/discovery.json`),
  ])
  const decisions = decIdx?.decisions?.length ?? 0
  const discoveries = discIdx?.discoveries?.length ?? 0

  // 5) Maturity = share of registry artefact slots that are populated.
  const total = ARTEFACTS.length
  const populated = ARTEFACTS.filter(isPresent).length
  const maturity = total ? populated / total : 0

  return {
    artefacts: { populated, total },
    byFormat,
    documents, // instances, not types
    decisions,
    discoveries,
    maturity,
    maturityTier: maturityTier(maturity),
    perDomain,
  }
}
