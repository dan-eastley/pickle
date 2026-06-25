// Returns a new Set with `id` toggled — added if absent, removed if present.
// Used for expand/collapse state across the catalogue and document views.
export function toggleInSet(set, id) {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

// Metadata arrays that can sit alongside the content array on any artefact
// instance — not the row collection. Excluded from root-array detection.
export const META_ARRAY_KEYS = new Set(['audience', 'author', 'activity'])

// The first content array-valued property of a catalogue payload — the row
// collection — skipping metadata arrays (audience / author / activity).
export function getRootArrayKey(data) {
  if (!data) return undefined
  return Object.keys(data).find(k => !META_ARRAY_KEYS.has(k) && Array.isArray(data[k]))
}
