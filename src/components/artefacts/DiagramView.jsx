import EmptyState from '../ui/EmptyState'
import NestedGroupDiagram from './diagrams/NestedGroupDiagram'

// Diagram types rendered by NestedGroupDiagram — a grid of group cards, each
// containing a wrapped grid of item cards. Other diagram types fall back to
// the "not yet available" state below until a renderer exists for them.
const NESTED_GROUP_TYPES = new Set(['card-based', 'entity-based'])

function countSummary(groups, labels) {
  const groupCount = groups.length
  const itemCount = groups.reduce((sum, g) => sum + (g.items?.length ?? 0), 0)
  const groupWord = labels?.groups ?? 'groups'
  const itemWord = labels?.items ?? 'items'
  const groupLabel = groupCount === 1 ? groupWord.replace(/s$/, '') : groupWord
  const itemLabel = itemCount === 1 ? itemWord.replace(/s$/, '') : itemWord
  return `${groupCount} ${groupLabel} · ${itemCount} ${itemLabel}`
}

export default function DiagramView({ data, artefact, schema }) {
  const diagramType = artefact?.diagramType ?? schema?.meta?.diagramType
  const groups = data?.groups

  if (NESTED_GROUP_TYPES.has(diagramType) && Array.isArray(groups)) {
    return (
      <div className="border border-gray-200 bg-white overflow-hidden shadow-xs">
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
    <div className="border border-gray-200 bg-white overflow-hidden shadow-xs">
      <EmptyState
        illustration="diagram"
        title={`${artefact?.name ?? 'Diagram'} not yet available`}
        description="Diagram rendering is not yet implemented for this diagram type."
      />
    </div>
  )
}
