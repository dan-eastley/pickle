import EmptyState from '../ui/EmptyState'
import NestedGroupDiagram from './diagrams/NestedGroupDiagram'

// Diagram types rendered by NestedGroupDiagram — a grid of group cards, each
// containing a wrapped grid of item cards. Other diagram types fall back to
// the "not yet available" state below until a renderer exists for them.
const NESTED_GROUP_TYPES = new Set(['card-based', 'entity-based'])

function countSummary(groups, labels) {
  const groupCount = groups.length
  const itemCount = groups.reduce((sum, g) => sum + (g.items?.length ?? 0), 0)
  const subitemCount = groups.reduce(
    (sum, g) => sum + (g.items?.reduce((s, item) => s + (item.items?.length ?? 0), 0) ?? 0), 0)
  const groupWord = labels?.groups ?? 'groups'
  const itemWord = labels?.items ?? 'items'
  const groupLabel = groupCount === 1 ? groupWord.replace(/s$/, '') : groupWord
  const itemLabel = itemCount === 1 ? itemWord.replace(/s$/, '') : itemWord
  let summary = `${groupCount} ${groupLabel} · ${itemCount} ${itemLabel}`
  if (subitemCount > 0) {
    const subitemWord = labels?.subitems ?? 'sub-items'
    const subitemLabel = subitemCount === 1 ? subitemWord.replace(/s$/, '') : subitemWord
    summary += ` · ${subitemCount} ${subitemLabel}`
  }
  return summary
}

export default function DiagramView({ data, artefact, schema }) {
  const diagramType = artefact?.diagramType ?? schema?.meta?.diagramType
  const groups = data?.groups

  if (NESTED_GROUP_TYPES.has(diagramType) && Array.isArray(groups)) {
    return (
      <div className="border border-gray-200 bg-white overflow-hidden shadow-xl">
        <div className="p-4 overflow-x-auto">
          <NestedGroupDiagram groups={groups} domain={artefact.domain} diagramType={diagramType} />
        </div>
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
          {countSummary(groups, schema?.meta?.countLabels)}
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 bg-white overflow-hidden shadow-xl">
      <EmptyState
        illustration="diagram"
        title={`${artefact?.name ?? 'Diagram'} not yet available`}
        description="Diagram rendering is not yet implemented for this diagram type."
      />
    </div>
  )
}
