import { useState, useEffect } from 'react'
import EmptyState from '../ui/EmptyState'
import SlidePanel from '../ui/SlidePanel'
import NestedGroupDiagram from './diagrams/NestedGroupDiagram'
import ProcessFlowDiagram from './diagrams/ProcessFlowDiagram'
import WiringDiagram from './diagrams/WiringDiagram'
import { getArtefact } from '../../lib/artefacts'
import { getArtefactData } from '../../lib/api'

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

// Recursively collect all objects with string `id` fields into a flat map
function buildItemMap(data) {
  const map = {}
  const collect = (obj) => {
    if (!obj || typeof obj !== 'object') return
    if (Array.isArray(obj)) {
      obj.forEach(collect)
      return
    }
    if (typeof obj.id === 'string') map[obj.id] = obj
    Object.values(obj).forEach((v) => {
      if (typeof v === 'object') collect(v)
    })
  }
  collect(data)
  return map
}

const FIELD_LABELS = {
  type: 'Type',
  level: 'Level',
  importance: 'Importance',
  'parent-id': 'Parent',
  trigger: 'Trigger',
  outcome: 'Outcome',
  owner: 'Owner',
  status: 'Status',
  maturity: 'Maturity',
  vendor: 'Vendor',
  product: 'Product',
  direction: 'Direction',
  source: 'Source',
  target: 'Target',
}

const SKIP_FIELDS = new Set(['id', 'name', 'description', 'items', '$schema', 'meta'])

function ItemDetail({ item }) {
  if (!item) return null
  const fields = Object.entries(item).filter(([k]) => !SKIP_FIELDS.has(k) && FIELD_LABELS[k])
  return (
    <div className="px-4 py-3 space-y-3">
      {item.description && (
        <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
      )}
      {fields.length > 0 && (
        <dl className="space-y-2">
          {fields.map(([key, value]) => (
            <div key={key}>
              <dt className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                {FIELD_LABELS[key]}
              </dt>
              <dd className="mt-0.5 text-xs text-gray-700">{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

export default function DiagramView({ data, artefact, schema, clientId, versionId }) {
  const diagramType = artefact?.diagramType ?? schema?.meta?.diagramType
  const groups = data?.groups

  const [selectedId, setSelectedId] = useState(null)
  const [itemMap, setItemMap] = useState({})

  const sourceArtefactId =
    NESTED_GROUP_TYPES.has(diagramType) || PROCESS_FLOW_TYPES.has(diagramType)
      ? artefact?.relatedTo?.find((r) => r.relationship === 'derived-from')?.artefactId
      : null
  const sourceArtefactDef = sourceArtefactId ? getArtefact(sourceArtefactId) : null

  // Reset selection when navigating between diagrams
  useEffect(() => {
    setSelectedId(null)
    setItemMap({})
  }, [artefact?.id])

  // Fetch source catalogue data to populate the slide panel
  useEffect(() => {
    if (!sourceArtefactDef || !clientId || !versionId) return
    getArtefactData(
      clientId,
      versionId,
      sourceArtefactDef.domain,
      sourceArtefactDef.abstraction,
      sourceArtefactDef.id
    )
      .then((d) => {
        if (d) setItemMap(buildItemMap(d))
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceArtefactId, clientId, versionId])

  const selectedItem = itemMap[selectedId]

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
        <SlidePanel
          open={!!selectedId}
          onClose={() => setSelectedId(null)}
          title={selectedItem?.name ?? selectedId ?? ''}
          subtitle={selectedItem ? selectedId : undefined}
        >
          <ItemDetail item={selectedItem} />
        </SlidePanel>
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
        <SlidePanel
          open={!!selectedId}
          onClose={() => setSelectedId(null)}
          title={selectedItem?.name ?? selectedId ?? ''}
          subtitle={selectedItem ? selectedId : undefined}
        >
          <ItemDetail item={selectedItem} />
        </SlidePanel>
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
