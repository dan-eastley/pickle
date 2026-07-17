// Canonical way to render a named entity alongside its ID, used across the UI:
//   "<Name> [<ID>]"  e.g.  "Solution Design [SOL-SDE]"
// Falls back gracefully when only one of the two is present.
export function nameWithId(name, id) {
  if (name && id) return `${name} [${id}]`
  return name || id || ''
}

// Human label for a machine key or enum value: kebab/snake case to Title Case
// (e.g. "system-of-engagement" → "System Of Engagement"). The single canonical
// implementation — exporters, metrics, enums, and entity panels all share it.
export function humanize(key) {
  return String(key)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// Canonical en-GB timestamp formatting, shared by the activity table, decision
// history, and discovery views. Both fall back to the raw value on a bad date.
// (new Date(bad) yields an Invalid Date rather than throwing, so the guard is
// an explicit NaN check, not try/catch.)

// "04 Mar 2026, 14:10" — date + time.
export function formatDateTime(ts) {
  const date = new Date(ts)
  if (Number.isNaN(date.getTime())) return ts
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// "04 Mar 2026" — date only.
export function formatDate(ts) {
  const date = new Date(ts)
  if (Number.isNaN(date.getTime())) return ts
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
