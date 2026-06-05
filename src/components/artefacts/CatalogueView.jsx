import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LayersThree01, Expand01, Minimize01 } from '@untitled-ui/icons-react'
import Badge from '../ui/Badge'

// ── Schema helpers ───────────────────────────────────────────────────────────

function getRootArrayKey(data) {
  return Object.keys(data).find(k => Array.isArray(data[k]))
}

function getSchemaColumns(schema) {
  if (!schema?.properties) return []

  const arrayEntry = Object.entries(schema.properties).find(([, v]) => v.type === 'array')
  if (!arrayEntry) return []

  const itemProps = arrayEntry[1]?.items?.properties ?? {}

  const priority = ['id', 'name', 'statement', 'rule', 'title']
  const keys = [
    ...priority.filter(k => k in itemProps),
    ...Object.keys(itemProps).filter(k => !priority.includes(k) && k !== 'parent-id'),
  ]

  return keys.map(key => {
    const prop = itemProps[key]
    // title = the field key, formatted for display
    const title = key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    // subtitle = the full description from the schema property
    const subtitle = prop?.description ?? null
    return { key, title, subtitle, type: prop?.type, enum: prop?.enum }
  })
}

function isHierarchical(schema) {
  const arrayProp = Object.values(schema?.properties ?? {}).find(v => v.type === 'array')
  return !!arrayProp?.items?.properties?.['parent-id']
}

// ── Tree builder ─────────────────────────────────────────────────────────────

function buildTree(items) {
  const byId = {}
  items.forEach(item => { byId[item.id] = { ...item, _children: [] } })
  const roots = []
  items.forEach(item => {
    const parent = item['parent-id']
    if (parent && byId[parent]) {
      byId[parent]._children.push(byId[item.id])
    } else {
      roots.push(byId[item.id])
    }
  })
  return roots
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
          <li key={i} className="text-xs text-gray-600 before:content-['•'] before:mr-1.5 before:text-gray-300">
            {String(v)}
          </li>
        ))}
        {value.length > 3 && (
          <li className="text-xs text-gray-400">+{value.length - 3} more</li>
        )}
      </ul>
    )
  }

  if (colDef.key === 'id') {
    return <span className="font-mono text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5">{value}</span>
  }

  if (typeof value === 'number') {
    return <span className="tabular-nums">{value}</span>
  }

  return <span className="text-gray-700">{String(value)}</span>
}

// ── Table rows (flat or tree) ─────────────────────────────────────────────────

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
                  <button
                    onClick={() => onToggle(node.id)}
                    className="mt-0.5 w-4 h-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  >
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
        <TreeRow
          key={child.id}
          node={child}
          columns={columns}
          depth={depth + 1}
          expanded={expanded}
          onToggle={onToggle}
        />
      ))}
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CatalogueView({ data, schema }) {
  const [expanded, setExpanded] = useState(new Set())
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (!fullscreen) return
    function onKey(e) { if (e.key === 'Escape') setFullscreen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen])

  if (!data || !schema) return null

  const rootKey = getRootArrayKey(data)
  if (!rootKey) return <p className="text-sm text-gray-500">No data found.</p>

  const items = data[rootKey]
  if (!items || items.length === 0) {
    return (
      <div className="border border-gray-200 bg-white py-16 text-center">
        <div className="flex items-center justify-center mx-auto mb-5 w-20 h-20 bg-gray-50 border border-gray-200">
          <LayersThree01 className="w-10 h-10 text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-700">Nothing here yet</p>
        <p className="mt-1 text-sm text-gray-400">No entries have been added to this catalogue for this version.</p>
      </div>
    )
  }

  const columns = getSchemaColumns(schema)
  const hierarchical = isHierarchical(schema)
  const treeData = hierarchical ? buildTree(items) : null

  function toggleExpanded(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function expandAll() { setExpanded(new Set(items.map(i => i.id))) }
  function collapseAll() { setExpanded(new Set()) }

  const toolbar = (
    <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-3 bg-gray-50 flex-shrink-0">
      <span className="text-xs text-gray-500">{items.length} {items.length === 1 ? 'entry' : 'entries'}</span>
      {hierarchical && (
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="text-xs text-brand-600 hover:text-brand-700">Expand all</button>
          <span className="text-gray-300">·</span>
          <button onClick={collapseAll} className="text-xs text-brand-600 hover:text-brand-700">Collapse all</button>
        </div>
      )}
      <div className="ml-auto flex items-center gap-1">
        {fullscreen ? (
          <button
            onClick={() => setFullscreen(false)}
            title="Exit full screen (Esc)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <Minimize01 className="w-3.5 h-3.5" />
            Exit full screen
          </button>
        ) : (
          <button
            onClick={() => setFullscreen(true)}
            title="Full screen"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <Expand01 className="w-3.5 h-3.5" />
            Full screen
          </button>
        )}
      </div>
    </div>
  )

  const table = (
    <div className="overflow-auto flex-1">
      <table className="w-full min-w-max">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map(col => (
              <th
                key={col.key}
                className="px-4 py-3 text-left bg-gray-50 sticky top-0 whitespace-nowrap"
              >
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{col.title}</div>
                {col.subtitle && <div className="text-xs font-normal text-gray-400 mt-0.5 normal-case tracking-normal max-w-[200px] whitespace-normal">{col.subtitle}</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {hierarchical
            ? treeData.map(node => (
                <TreeRow key={node.id} node={node} columns={columns} depth={0} expanded={expanded} onToggle={toggleExpanded} />
              ))
            : items.map(item => (
                <FlatRow key={item.id} item={item} columns={columns} />
              ))}
        </tbody>
      </table>
    </div>
  )

  const footer = (
    <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 text-xs text-gray-400 flex-shrink-0">
      {items.length} {items.length === 1 ? 'entry' : 'entries'}
    </div>
  )

  if (fullscreen) {
    return createPortal(
      <div className="fixed inset-0 z-[200] bg-white flex flex-col">
        {toolbar}
        {table}
        {footer}
      </div>,
      document.body
    )
  }

  return (
    <div className="border border-gray-200 bg-white overflow-hidden flex flex-col">
      {toolbar}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left bg-gray-50 whitespace-nowrap">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{col.title}</div>
                  {col.subtitle && <div className="text-xs font-normal text-gray-400 mt-0.5 normal-case tracking-normal max-w-[200px] whitespace-normal">{col.subtitle}</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {hierarchical
              ? treeData.map(node => (
                  <TreeRow key={node.id} node={node} columns={columns} depth={0} expanded={expanded} onToggle={toggleExpanded} />
                ))
              : items.map(item => (
                  <FlatRow key={item.id} item={item} columns={columns} />
                ))}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  )
}
