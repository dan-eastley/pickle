// Canonical way to render a named entity alongside its ID, used across the UI:
//   "<Name> [<ID>]"  e.g.  "Solution Design [SOL-SDE]"
// Falls back gracefully when only one of the two is present.
export function nameWithId(name, id) {
  if (name && id) return `${name} [${id}]`
  return name || id || ''
}
