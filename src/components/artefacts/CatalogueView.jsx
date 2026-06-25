import { useState } from 'react'
import { createPortal } from 'react-dom'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import FullscreenToggle from '../ui/FullscreenToggle'
import useEscapeKey from '../../hooks/useEscapeKey'
import { toggleInSet, getRootArrayKey, META_ARRAY_KEYS } from '../../lib/collections'

// ── Schema helpers ───────────────────────────────────────────────────────────

function getColumnsFromProps(itemProps) {
  const priority = ['id', 'name', 'statement', 'rule', 'title']
  const keys = [
    ...priority.filter(k => k in itemProps),
    ...Object.keys(itemProps).filter(k => !priority.includes(k) && k !== 'parent-id'),
  ]
  return keys.map(key => {
    const prop = itemProps[key]
    const title = key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    return { key, title, type: prop?.type, enum: prop?.enum }
  })
}

function getSchemaColumns(schema) {
  if (!schema?.properties) return []
  const arrayEntry = Object.entries(schema.properties).find(([k, v]) => v.type === 'array' && !META_ARRAY_KEYS.has(k))
  if (!arrayEntry) return []
  const itemProps = arrayEntry[1]?.items?.properties ?? {}
  return getColumnsFromProps(itemProps)
}

function isHierarchical(schema) {
  const arrayEntry = Object.entries(schema?.properties ?? {}).find(([k, v]) => v.type === 'array' && !META_ARRAY_KEYS.has(k))
  return !!arrayEntry?.[1]?.items?.properties?.['parent-id']
}

function isGrouped(schema) {
  return schema?.meta?.renderAs === 'grouped'
}

// ── Tree builder ─────────────────────────────────────────────────────────────

function buildTree(items) {
  const byId = {}
  items.forEach(item => { byId[item.id] = { ...item, _children: [] } })
  const roots = []
  items.forEach(item => {
    const parent = item['parent-id']
    if (parent && byId[parent]) byId[parent]._children.push(byId[item.id])
    else roots.push(byId[item.id])
  })
  return roots
}

function buildGroupedTree(data, grouping) {
  const { parentArray, childArray, foreignKey } = grouping
  const parents = (data[parentArray] ?? []).map(p => ({ ...p, _children: [] }))
  const byId = Object.fromEntries(parents.map(p => [p.id, p]))
  ;(data[childArray] ?? []).forEach(child => {
    const parent = byId[child[foreignKey]]
    // `_children: []` so grouped rows render through the same TreeRow as
    // hierarchical catalogues (BUS-CAP), keeping the two layouts identical.
    if (parent) parent._children.push({ ...child, _children: [] })
  })
  return parents
}

// ── Count label helpers ───────────────────────────────────────────────────────

function countSummary(items, schema, data) {
  const meta = schema?.meta
  const labels = meta?.countLabels

  if (meta?.renderAs === 'grouped' && meta?.grouping) {
    const { parentArray, childArray } = meta.grouping
    const pCount = data?.[parentArray]?.length ?? 0
    const cCount = data?.[childArray]?.length ?? 0
    const pLabel = (pCount === 1 ? labels?.parent : (labels?.parent ? labels.parent + 's' : 'groups')) ?? 'groups'
    const cLabel = (cCount === 1 ? labels?.child : (labels?.child ? labels.child + 's' : 'items')) ?? 'items'
    return `${pCount} ${pLabel} · ${cCount} ${cLabel}`
  }

  const total = items?.length ?? 0
  const isHier = items?.some(i => i['parent-id'])
  if (isHier && labels?.level1) {
    const l1Items = items.filter(i => !i['parent-id'])
    const l1Ids = new Set(l1Items.map(i => i.id))
    const l2 = items.filter(i => l1Ids.has(i['parent-id'])).length
    return `${l1Items.length} ${labels.level1} · ${l2} ${labels.level2 ?? 'Level 2'}`
  }

  const plural = labels?.plural ?? 'entries'
  const sing = labels?.singular ?? 'entry'
  return `${total} ${total === 1 ? sing : plural}`
}

// ── Cell rendering ───────────────────────────────────────────────────────────

function CellValue({ value, colDef }) {
  if (value == null || value === '') return <span className="text-gray-300">—</span>

  if (colDef.enum) {
    const variantMap = {
      initial: 'gray', repeatable: 'warning', defined: 'blue', managed: 'success', optimised: 'success',
      strategic: 'violet', differentiating: 'blue', foundational: 'gray',
      adopt: 'success', trial: 'blue', hold: 'warning', retire: 'error',
      'short-term': 'success', 'medium-term': 'blue', 'long-term': 'violet',
      core: 'violet', supporting: 'blue', management: 'gray',
      'system-of-record': 'gray', 'system-of-engagement': 'blue', 'system-of-insight': 'violet', 'system-of-innovation': 'amber',
      entity: 'blue', event: 'amber', reference: 'gray',
      public: 'success', internal: 'blue', confidential: 'warning', restricted: 'error',
    }
    return <Badge label={value} variant={variantMap[value] ?? 'gray'} />
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-300">—</span>
    return (
      <ul className="space-y-0.5">
        {value.slice(0, 3).map((v, i) => (
          <li key={i} className="text-xs text-gray-600 before:content-['•'] before:mr-1.5 before:text-gray-300">{String(v)}</li>
        ))}
        {value.length > 3 && <li className="text-xs text-gray-400">+{value.length - 3} more</li>}
      </ul>
    )
  }

  if (colDef.key === 'id') {
    return <span className="font-mono text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5">{value}</span>
  }

  if (typeof value === 'number') return <span className="tabular-nums">{value}</span>
  return <span className="text-gray-700">{String(value)}</span>
}

// ── Table rows (flat or hierarchical tree) ────────────────────────────────────

function FlatRow({ item, columns }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {columns.map(col => (
        <td key={col.key} className="px-4 py-3 text-sm align-top">
          <CellValue value={item[col.key]} colDef={col} />
        </td>
      ))}
    </tr>
  )
}

function TreeRow({ node, columns, depth = 0, expanded, onToggle }) {
  const hasChildren = node._children.length > 0
  const isExpanded = expanded.has(node.id)

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        {columns.map((col, ci) => (
          <td key={col.key} className="px-4 py-3 text-sm align-top">
            {ci === 1 ? (
              <div className="flex items-start gap-2" style={{ paddingLeft: depth * 20 }}>
                {hasChildren ? (
                  <button onClick={() => onToggle(node.id)}
                    className="mt-0.5 w-4 h-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <span className="w-4 flex-shrink-0" />
                )}
                <CellValue value={node[col.key]} colDef={col} />
              </div>
            ) : (
              <CellValue value={node[col.key]} colDef={col} />
            )}
          </td>
        ))}
      </tr>
      {hasChildren && isExpanded && node._children.map(child => (
        <TreeRow key={child.id} node={child} columns={columns} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
      ))}
    </>
  )
}

// ── Column header row ─────────────────────────────────────────────────────────

function ColHeaders({ columns }) {
  return (
    <tr className="border-b border-gray-200">
      {columns.map(col => (
        <th key={col.key} className="px-4 py-3 text-left bg-gray-50 whitespace-nowrap">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{col.title}</div>
        </th>
      ))}
    </tr>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CatalogueView({ data, schema }) {
  const [expanded, setExpanded] = useState(new Set())
  const [fullscreen, setFullscreen] = useState(false)

  useEscapeKey(() => setFullscreen(false), fullscreen)

  if (!data || !schema) return null

  const meta = schema.meta ?? {}
  const grouped = isGrouped(schema)
  const hierarchical = !grouped && isHierarchical(schema)

  // ── Grouped mode (two-array schemas like DAT-DAC, APP-DAP) ──
  if (grouped && meta.grouping) {
    const { childArray, foreignKey } = meta.grouping
    const childItemProps = schema.properties?.[childArray]?.items?.properties ?? {}
    // Exclude the foreign key column from the child table display
    const filteredProps = Object.fromEntries(
      Object.entries(childItemProps).filter(([k]) => k !== foreignKey)
    )
    const childColumns = getColumnsFromProps(filteredProps)
    const groupedData = buildGroupedTree(data, meta.grouping)

    function toggleGrouped(id) {
      setExpanded(prev => toggleInSet(prev, id))
    }
    function expandAllGrouped() { setExpanded(new Set(groupedData.map(p => p.id))) }
    function collapseAllGrouped() { setExpanded(new Set()) }

    const summary = countSummary(null, schema, data)

    const toolbar = (
      <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-3 bg-gray-50 flex-shrink-0">
        <span className="text-xs text-gray-500">{summary}</span>
        <div className="flex items-center gap-2">
          <button onClick={expandAllGrouped} className="text-xs text-brand-600 hover:text-brand-700">Expand all</button>
          <span className="text-gray-300">·</span>
          <button onClick={collapseAllGrouped} className="text-xs text-brand-600 hover:text-brand-700">Collapse all</button>
        </div>
        <FullscreenToggle fullscreen={fullscreen} onToggle={() => setFullscreen(f => !f)} />
      </div>
    )

    const groupedTable = (
      <table className="w-full min-w-max">
        <thead><ColHeaders columns={childColumns} /></thead>
        <tbody className="divide-y divide-gray-100">
          {groupedData.map(parent => (
            <TreeRow key={parent.id} node={parent} columns={childColumns} depth={0}
              expanded={expanded} onToggle={toggleGrouped} />
          ))}
        </tbody>
      </table>
    )

    if (fullscreen) {
      return createPortal(
        <div className="fixed inset-0 z-[200] bg-white flex flex-col">
          {toolbar}
          <div className="overflow-auto flex-1">{groupedTable}</div>
          <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 text-xs text-gray-400 flex-shrink-0">{summary}</div>
        </div>,
        document.body
      )
    }

    return (
      <div className="bg-white overflow-hidden flex flex-col shadow-xl">
        {toolbar}
        <div className="overflow-x-auto">{groupedTable}</div>
        <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 text-xs text-gray-400 flex-shrink-0">{summary}</div>
      </div>
    )
  }

  // ── Flat / hierarchical mode ──────────────────────────────────────────────
  const rootKey = getRootArrayKey(data)
  if (!rootKey) return <p className="text-sm text-gray-500">No data found.</p>

  const items = data[rootKey]
  if (!items || items.length === 0) {
    return (
      <div className="bg-white shadow-xl">
        <EmptyState
          illustration="catalogue"
          title="Nothing here yet"
          description="No entries have been added to this catalogue for this version."
        />
      </div>
    )
  }

  const columns = getSchemaColumns(schema)
  const treeData = hierarchical ? buildTree(items) : null
  const summary = countSummary(items, schema, data)

  function toggleExpanded(id) {
    setExpanded(prev => toggleInSet(prev, id))
  }
  function expandAll() { setExpanded(new Set(items.map(i => i.id))) }
  function collapseAll() { setExpanded(new Set()) }

  const toolbar = (
    <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-3 bg-gray-50 flex-shrink-0">
      <span className="text-xs text-gray-500">{summary}</span>
      {hierarchical && (
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="text-xs text-brand-600 hover:text-brand-700">Expand all</button>
          <span className="text-gray-300">·</span>
          <button onClick={collapseAll} className="text-xs text-brand-600 hover:text-brand-700">Collapse all</button>
        </div>
      )}
      <FullscreenToggle fullscreen={fullscreen} onToggle={() => setFullscreen(f => !f)} />
    </div>
  )

  const table = (
    <div className="overflow-auto flex-1">
      <table className="w-full min-w-max">
        <thead>
          <ColHeaders columns={columns} />
        </thead>
        <tbody className="divide-y divide-gray-100">
          {hierarchical
            ? treeData.map(node => (
                <TreeRow key={node.id} node={node} columns={columns} depth={0} expanded={expanded} onToggle={toggleExpanded} />
              ))
            : items.map(item => <FlatRow key={item.id} item={item} columns={columns} />)}
        </tbody>
      </table>
    </div>
  )

  if (fullscreen) {
    return createPortal(
      <div className="fixed inset-0 z-[200] bg-white flex flex-col">
        {toolbar}{table}
        <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 text-xs text-gray-400 flex-shrink-0">{summary}</div>
      </div>,
      document.body
    )
  }

  return (
    <div className="bg-white overflow-hidden flex flex-col shadow-xl">
      {toolbar}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead><ColHeaders columns={columns} /></thead>
          <tbody className="divide-y divide-gray-100">
            {hierarchical
              ? treeData.map(node => (
                  <TreeRow key={node.id} node={node} columns={columns} depth={0} expanded={expanded} onToggle={toggleExpanded} />
                ))
              : items.map(item => <FlatRow key={item.id} item={item} columns={columns} />)}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 text-xs text-gray-400 flex-shrink-0">{summary}</div>
    </div>
  )
}
