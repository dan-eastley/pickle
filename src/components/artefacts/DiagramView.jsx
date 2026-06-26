import { useState, useEffect } from 'react'
import EmptyState from '../ui/EmptyState'
import EntityPanel from './EntityPanel'
import NestedGroupDiagram from './diagrams/NestedGroupDiagram'
import ProcessFlowDiagram from './diagrams/ProcessFlowDiagram'
import WiringDiagram from './diagrams/WiringDiagram'

const NESTED_GROUP_TYPES = new Set(['card-based', 'entity-based'])
const PROCESS_FLOW_TYPES = new Set(['process-flow'])

function countSummary(groups, labels) {
  const groupCount = groups.length
  const itemCount = groups.reduce((sum, g) => sum + (g.items?.length ?? 0), 0)
  const subitemCount = groups.reduce(
    (sum, g) => sum + (g.items?.reduce((s, item) => s + (item.items?.length ?? 0), 0) ?? 0),
    0
  )
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

export default function DiagramView({ data, artefact, schema, clientId, versionId }) {
  const diagramType = artefact?.diagramType ?? schema?.meta?.diagramType
  const groups = data?.groups

  const [selectedId, setSelectedId] = useState(null)

  // Reset selection when navigating between diagrams
  useEffect(() => {
    setSelectedId(null)
  }, [artefact?.id])

  if (diagramType === 'wiring') {
    return <WiringDiagram clientId={clientId} versionId={versionId} />
  }

  if (PROCESS_FLOW_TYPES.has(diagramType) && Array.isArray(groups)) {
    return (
      <>
        <div className="bg-white overflow-hidden shadow-xl">
          <div className="p-4 overflow-x-auto">
            <ProcessFlowDiagram
              groups={groups}
              domain={artefact.domain}
              onItemClick={(id) => setSelectedId(id === selectedId ? null : id)}
              selectedId={selectedId}
            />
          </div>
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
            {countSummary(groups, schema?.meta?.countLabels)}
          </div>
        </div>
        <EntityPanel
          entityId={selectedId}
          clientId={clientId}
          versionId={versionId}
          onOpenEntity={setSelectedId}
          onClose={() => setSelectedId(null)}
        />
      </>
    )
  }

  if (NESTED_GROUP_TYPES.has(diagramType) && Array.isArray(groups)) {
    return (
      <>
        <div className="bg-white overflow-hidden shadow-xl">
          <div className="p-4 overflow-x-auto">
            <NestedGroupDiagram
              groups={groups}
              domain={artefact.domain}
              diagramType={diagramType}
              onItemClick={(id) => setSelectedId(id === selectedId ? null : id)}
              selectedId={selectedId}
            />
          </div>
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
            {countSummary(groups, schema?.meta?.countLabels)}
          </div>
        </div>
        <EntityPanel
          entityId={selectedId}
          clientId={clientId}
          versionId={versionId}
          onOpenEntity={setSelectedId}
          onClose={() => setSelectedId(null)}
        />
      </>
    )
  }

  return (
    <div className="bg-white overflow-hidden shadow-xl">
      <EmptyState
        illustration="diagram"
        title={`${artefact?.name ?? 'Diagram'} not yet available`}
        description="Diagram rendering is not yet implemented for this diagram type."
      />
    </div>
  )
}
