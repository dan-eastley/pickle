// Shared SVG theme for diagram artefacts (DiagramView and the components under
// src/components/artefacts/diagrams/). Keeps diagrams of the same type visually
// consistent with each other, and with the rest of the UI, by reusing the same
// per-domain palette as DOMAIN_COLORS (src/lib/artefacts.js).
//
// Elements are differentiated by BLOCK COLOUR rather than outlines: a light
// group fill with a one-step-darker item fill sitting on top, and a darker
// hover fill to signal that an element is clickable. (Hover utilities are
// written as literal strings so Tailwind's JIT picks them up.)

// itemHover uses group-hover (not hover) so the fill responds to the pointer
// being anywhere over the node — including the text drawn on top of the rect.
export const DIAGRAM_DOMAIN_COLORS = {
  business:    { groupFill: 'fill-violet-50',  itemFill: 'fill-violet-100',  itemHover: 'group-hover:fill-violet-200',  selectedFill: 'fill-violet-600',  selectedId: 'fill-violet-200',  heading: 'fill-violet-900',  label: 'fill-violet-600',  itemText: 'fill-violet-900' },
  data:        { groupFill: 'fill-blue-50',    itemFill: 'fill-blue-100',    itemHover: 'group-hover:fill-blue-200',    selectedFill: 'fill-blue-600',    selectedId: 'fill-blue-200',    heading: 'fill-blue-900',    label: 'fill-blue-600',    itemText: 'fill-blue-900' },
  integration: { groupFill: 'fill-emerald-50', itemFill: 'fill-emerald-100', itemHover: 'group-hover:fill-emerald-200', selectedFill: 'fill-emerald-600', selectedId: 'fill-emerald-200', heading: 'fill-emerald-900', label: 'fill-emerald-600', itemText: 'fill-emerald-900' },
  application: { groupFill: 'fill-amber-50',   itemFill: 'fill-amber-100',   itemHover: 'group-hover:fill-amber-200',   selectedFill: 'fill-amber-600',   selectedId: 'fill-amber-100',   heading: 'fill-amber-900',   label: 'fill-amber-600',   itemText: 'fill-amber-900' },
  solution:    { groupFill: 'fill-rose-50',    itemFill: 'fill-rose-100',    itemHover: 'group-hover:fill-rose-200',    selectedFill: 'fill-rose-600',    selectedId: 'fill-rose-200',    heading: 'fill-rose-900',    label: 'fill-rose-600',    itemText: 'fill-rose-900' },
}

export const getDiagramColors = (domain) => DIAGRAM_DOMAIN_COLORS[domain] ?? DIAGRAM_DOMAIN_COLORS.business

// Mirrors the importance -> Badge variant mapping used by CatalogueView's CellValue,
// for the "importance" meta attribute on Business Capability Model cards.
export const IMPORTANCE_COLORS = {
  strategic:       { fill: 'fill-violet-200', text: 'fill-violet-800' },
  differentiating: { fill: 'fill-blue-200',   text: 'fill-blue-800' },
  foundational:    { fill: 'fill-gray-200',   text: 'fill-gray-700' },
}

// Per-diagramType corner radius for NestedGroupDiagram. Both card-based and
// entity-based diagrams share the same grouped-card layout algorithm and use
// square corners throughout.
export const DIAGRAM_VARIANTS = {
  'card-based':   { groupRadius: 0, itemRadius: 0 },
  'entity-based': { groupRadius: 0, itemRadius: 0 },
}

// Greedy word-wrap into at most `maxLines` lines of roughly `maxChars` each,
// truncating the last line with an ellipsis. Shared by the SVG diagram
// components so their label wrapping stays consistent.
export function wrapText(text, maxChars, maxLines = 2) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  if (lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines)
    let last = truncated[maxLines - 1]
    if (last.length > maxChars - 1) last = last.slice(0, maxChars - 1)
    truncated[maxLines - 1] = last.replace(/\s+$/, '') + '…'
    return truncated
  }
  return lines
}
