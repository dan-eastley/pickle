// Shared SVG theme for diagram artefacts (DiagramView and the components under
// src/components/artefacts/diagrams/). Keeps diagrams of the same type visually
// consistent with each other, and with the rest of the UI, by reusing the same
// per-domain palette as DOMAIN_COLORS (src/lib/artefacts.js) — just expressed as
// fill-*/stroke-* utilities instead of bg-*/text-*.

export const DIAGRAM_DOMAIN_COLORS = {
  business:    { groupFill: 'fill-violet-50',  groupStroke: 'stroke-violet-200',  itemStroke: 'stroke-violet-300',  heading: 'fill-violet-900',  label: 'fill-violet-500' },
  data:        { groupFill: 'fill-blue-50',    groupStroke: 'stroke-blue-200',    itemStroke: 'stroke-blue-300',    heading: 'fill-blue-900',    label: 'fill-blue-500' },
  integration: { groupFill: 'fill-emerald-50', groupStroke: 'stroke-emerald-200', itemStroke: 'stroke-emerald-300', heading: 'fill-emerald-900', label: 'fill-emerald-500' },
  application: { groupFill: 'fill-amber-50',   groupStroke: 'stroke-amber-200',   itemStroke: 'stroke-amber-300',   heading: 'fill-amber-900',   label: 'fill-amber-500' },
  solution:    { groupFill: 'fill-rose-50',    groupStroke: 'stroke-rose-200',    itemStroke: 'stroke-rose-300',    heading: 'fill-rose-900',    label: 'fill-rose-500' },
}

export const getDiagramColors = (domain) => DIAGRAM_DOMAIN_COLORS[domain] ?? DIAGRAM_DOMAIN_COLORS.business

// Mirrors the importance -> Badge variant mapping used by CatalogueView's CellValue,
// for the "importance" meta attribute on Business Capability Model cards.
export const IMPORTANCE_COLORS = {
  strategic:       { fill: 'fill-violet-100', text: 'fill-violet-700' },
  differentiating: { fill: 'fill-blue-100',   text: 'fill-blue-700' },
  foundational:    { fill: 'fill-gray-100',   text: 'fill-gray-600' },
}

// Per-diagramType visual variants for NestedGroupDiagram. Both card-based and
// entity-based diagrams share the same grouped-card layout algorithm; this is
// the only place their appearance diverges.
export const DIAGRAM_VARIANTS = {
  'card-based':   { groupRadius: 10, itemRadius: 6, itemFill: 'fill-white' },
  'entity-based': { groupRadius: 2,  itemRadius: 0, itemFill: 'fill-white' },
}
