// Intermediate "block" model shared by every exporter. Catalogues and documents
// are flattened into an ordered list of blocks; each format renderer (CSV,
// Excel, Word, PDF) consumes the same blocks, so per-format code stays small and
// new content types are handled generically.
//
// Block shapes:
//   { type: 'heading', level: 1|2|3, text }
//   { type: 'paragraph', text }
//   { type: 'bullets', items: string[] }
//   { type: 'table', columns: string[], rows: string[][] }
//   { type: 'keyvalue', rows: [label, value][] }

import { humanize } from '../format'

// Re-exported for the per-format renderers (CSV, Excel, Word, PDF) that build
// their own labels from the same block model.
export { humanize }

// Render any leaf value as a single display string (used inside table cells and
// key/value rows). Arrays and objects are summarised compactly.
export function valueToString(value) {
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(valueToString).filter(Boolean).join(', ')
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([k, v]) => `${humanize(k)}: ${valueToString(v)}`)
      .join('; ')
  }
  return String(value)
}

const isScalar = (v) => v == null || typeof v !== 'object'

// Turn an array of like-shaped objects into a table block (columns = the union
// of their keys, in first-seen order). Falls back to a single "Value" column for
// arrays of scalars.
export function arrayToTable(items) {
  if (items.every(isScalar)) {
    return { type: 'table', columns: ['Value'], rows: items.map((v) => [valueToString(v)]) }
  }
  const columns = []
  for (const item of items) {
    if (item && typeof item === 'object') {
      for (const k of Object.keys(item)) if (!columns.includes(k)) columns.push(k)
    }
  }
  const rows = items.map((item) =>
    columns.map((c) => valueToString(item && typeof item === 'object' ? item[c] : ''))
  )
  return { type: 'table', columns: columns.map(humanize), rows }
}

// Flatten an arbitrary value into blocks under an already-emitted heading.
export function valueToBlocks(value) {
  if (value == null || value === '') return []
  if (typeof value === 'string') {
    // Split on blank lines so multi-paragraph prose stays readable.
    return value
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((text) => ({ type: 'paragraph', text }))
  }
  if (typeof value !== 'object') return [{ type: 'paragraph', text: String(value) }]
  if (Array.isArray(value)) {
    if (value.length === 0) return []
    if (value.every(isScalar)) return [{ type: 'bullets', items: value.map(valueToString) }]
    return [arrayToTable(value)]
  }
  // Plain object → key/value rows.
  const rows = Object.entries(value)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => [humanize(k), valueToString(v)])
  return rows.length ? [{ type: 'keyvalue', rows }] : []
}

// ── Catalogue → blocks ─────────────────────────────────────────────────────────
// Title + description, then one heading + table per array-valued property.
export function catalogueToBlocks(data, artefact) {
  const blocks = [
    { type: 'heading', level: 1, text: artefact?.name ?? artefact?.id ?? 'Catalogue' },
  ]
  if (data?.description) blocks.push({ type: 'paragraph', text: data.description })

  for (const [key, value] of Object.entries(data ?? {})) {
    if (!Array.isArray(value) || value.length === 0) continue
    if (key === 'activity') continue // change history is exported separately, not as content
    blocks.push({ type: 'heading', level: 2, text: humanize(key) })
    blocks.push(arrayToTable(value))
  }
  return blocks
}

// Tables only — used for the Excel exporter, which maps each table to a sheet.
export function catalogueTables(data) {
  const tables = []
  for (const [key, value] of Object.entries(data ?? {})) {
    if (!Array.isArray(value) || value.length === 0 || key === 'activity') continue
    tables.push({ name: humanize(key), ...arrayToTable(value) })
  }
  return tables
}

// ── Document → blocks ──────────────────────────────────────────────────────────
// Walks the schema's meta.sections tree. A node with `content` is a leaf whose
// value lives at doc[key]; otherwise its `subsections` are walked recursively.
// Document fields that are metadata/identity, not body content — skipped by the
// fallback walk used when a schema has no meta.sections.
const DOC_META_KEYS = new Set(['id', 'title', 'description', 'status', 'scope'])

export function documentToBlocks(doc, sections) {
  const blocks = [{ type: 'heading', level: 1, text: doc?.title ?? doc?.id ?? 'Document' }]
  if (doc?.description) blocks.push({ type: 'paragraph', text: doc.description })

  // Legacy / schema-less documents: walk the instance's own content fields.
  if (!Array.isArray(sections) || sections.length === 0) {
    for (const [key, value] of Object.entries(doc ?? {})) {
      if (DOC_META_KEYS.has(key)) continue
      const child = valueToBlocks(value)
      if (child.length === 0) continue
      blocks.push({ type: 'heading', level: 2, text: humanize(key) })
      blocks.push(...child)
    }
    return blocks
  }

  const walk = (nodes, level) => {
    for (const node of nodes ?? []) {
      const value = node.content ? doc?.[node.key] : undefined
      const children = node.subsections
      // Skip empty branches entirely so the export has no hollow headings.
      const hasLeaf = value != null && value !== '' && !(Array.isArray(value) && value.length === 0)
      const hasChildren = Array.isArray(children) && children.length > 0
      if (!hasLeaf && !hasChildren) continue

      blocks.push({
        type: 'heading',
        level: Math.min(level, 3),
        text: node.title ?? humanize(node.key),
      })
      if (hasLeaf) blocks.push(...valueToBlocks(value))
      if (hasChildren) walk(children, level + 1)
    }
  }
  walk(sections, 2)
  return blocks
}
