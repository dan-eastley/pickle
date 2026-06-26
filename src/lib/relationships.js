import { ARTEFACTS, getArtefact, resolveRefArtefactId } from './artefacts'
import { getArtefactData } from './api'

// UI-9 — navigate the architecture via its matrices.
//
// Matrices are the edges of the architecture graph. Given an entity (a
// capability, process, data concept, platform, …) this finds every other entity
// related to it across all matrices, resolved to {id, name} and grouped by the
// related artefact type — so the entity panel can let you step from a capability
// to its processes, a process to its data and systems, and so on.

// Matrices that reference a given artefact type (via relatedTo derived-from).
function matricesFor(artefactId) {
  return ARTEFACTS.filter(
    (a) => a.format === 'matrix' && a.relatedTo?.some((r) => r.artefactId === artefactId)
  )
}

// Flatten a catalogue's array entries into an id → name map.
function nameMap(catalogue) {
  const out = {}
  for (const v of Object.values(catalogue ?? {})) {
    if (Array.isArray(v)) for (const item of v) if (item?.id) out[item.id] = item.name ?? item.id
  }
  return out
}

export async function loadEntityRelationships(entityId, clientId, versionId) {
  const artefactId = resolveRefArtefactId(entityId)
  if (!artefactId) return []

  // Collect related entity ids across every matrix that references this type.
  const related = new Map() // relatedId -> { id, artefactId, via: Set<matrixName> }
  await Promise.all(
    matricesFor(artefactId).map(async (m) => {
      const data = await getArtefactData(clientId, versionId, m.domain, m.abstraction, m.id).catch(
        () => null
      )
      for (const rel of data?.relationships ?? []) {
        let other = null
        if (rel['column-id'] === entityId) other = rel['row-id']
        else if (rel['row-id'] === entityId) other = rel['column-id']
        if (!other || other === entityId) continue
        const oa = resolveRefArtefactId(other)
        if (!oa) continue
        const entry = related.get(other) ?? { id: other, artefactId: oa, via: new Set() }
        entry.via.add(m.name)
        related.set(other, entry)
      }
    })
  )
  if (related.size === 0) return []

  // Group by related artefact type and resolve names from each catalogue.
  const byType = new Map()
  for (const e of related.values()) {
    const list = byType.get(e.artefactId) ?? []
    list.push(e)
    byType.set(e.artefactId, list)
  }
  const groups = await Promise.all(
    [...byType.entries()].map(async ([aid, entries]) => {
      const artefact = getArtefact(aid)
      let names = {}
      if (artefact) {
        const cat = await getArtefactData(
          clientId,
          versionId,
          artefact.domain,
          artefact.abstraction,
          artefact.id
        ).catch(() => null)
        names = nameMap(cat)
      }
      return {
        artefact,
        entities: entries
          .map((e) => ({ id: e.id, name: names[e.id] ?? e.id, via: [...e.via] }))
          .sort((a, b) => a.id.localeCompare(b.id)),
      }
    })
  )
  return groups
    .filter((g) => g.entities.length)
    .sort((a, b) => (a.artefact?.name ?? '').localeCompare(b.artefact?.name ?? ''))
}
