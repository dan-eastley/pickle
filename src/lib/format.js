// Canonical way to render a named entity alongside its ID, used across the UI:
//   "<Name> [<ID>]"  e.g.  "Solution Design [SOL-SDE]"
// Falls back gracefully when only one of the two is present.
export function nameWithId(name, id) {
  if (name && id) return `${name} [${id}]`
  return name || id || ''
}

// Canonical en-GB timestamp formatting, shared by the activity table, decision
// history, and discovery views. Both fall back to the raw value on a bad date.

// "04 Mar 2026, 14:10" — date + time.
export function formatDateTime(ts) {
  try {
    return new Date(ts).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ts
  }
}

// "04 Mar 2026" — date only.
export function formatDate(ts) {
  try {
    return new Date(ts).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ts
  }
}
