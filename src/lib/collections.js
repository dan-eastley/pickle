// Returns a new Set with `id` toggled — added if absent, removed if present.
// Used for expand/collapse state across the catalogue and document views.
export function toggleInSet(set, id) {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

// The first array-valued property of a catalogue payload — the row collection.
export function getRootArrayKey(data) {
  if (!data) return undefined
  return Object.keys(data).find(k => Array.isArray(data[k]))
}
