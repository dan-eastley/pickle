import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { CheckSquare, Square, Expand01, Minimize01 } from '@untitled-ui/icons-react'
import { getArtefact } from '../../lib/artefacts'
import { getArtefactData } from '../../lib/api'
import EmptyState from '../ui/EmptyState'
import Spinner from '../ui/Spinner'

function artefactUrl(artefact, clientId, versionId) {
  return `/clients/${clientId}/${versionId}/domains/${artefact.domain}/${artefact.abstraction}/${artefact.id}`
}

export default function MatrixView({ data, schema, clientId, versionId }) {
  const matrixMeta = schema?.meta?.matrix
  const colArtefact = matrixMeta ? getArtefact(matrixMeta.columns.artefact) : null
  const rowArtefact = matrixMeta ? getArtefact(matrixMeta.rows.artefact) : null

  const [columnData, setColumnData] = useState(undefined)
  const [rowData, setRowData] = useState(undefined)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (!colArtefact || !rowArtefact) return
    setColumnData(undefined)
    setRowData(undefined)

    Promise.all([
      getArtefactData(clientId, versionId, colArtefact.domain, colArtefact.abstraction, colArtefact.id),
      getArtefactData(clientId, versionId, rowArtefact.domain, rowArtefact.abstraction, rowArtefact.id),
    ]).then(([colD, rowD]) => {
      setColumnData(colD)
      setRowData(rowD)
    })
  }, [clientId, versionId, colArtefact?.id, rowArtefact?.id])

  useEffect(() => {
    if (!fullscreen) return
    function onKey(e) { if (e.key === 'Escape') setFullscreen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen])

  if (!data) return null

  if (!matrixMeta || !colArtefact || !rowArtefact) {
    return (
      <div className="border border-gray-200 bg-white overflow-hidden">
        <EmptyState
          title="Matrix view"
          description="Matrix format not yet defined. This artefact type will be available once the matrix schema and instance format are specified."
        />
      </div>
    )
  }

  if (columnData === undefined || rowData === undefined) {
    return (
      <div className="border border-gray-200 bg-white flex items-center justify-center py-16">
        <Spinner />
      </div>
    )
  }

  const { columns, rows } = matrixMeta
  const columnItems = columnData?.[columns.array] ?? []
  const rowItems = rowData?.[rows.array] ?? []

  if (columnItems.length === 0 || rowItems.length === 0) {
    const emptySide = columnItems.length === 0 ? columns.artefact : rows.artefact
    return (
      <div className="border border-gray-200 bg-white overflow-hidden">
        <EmptyState
          title="Nothing to map yet"
          description={`${emptySide} has no entries yet for this version. This matrix will populate automatically once that catalogue is filled in.`}
        />
      </div>
    )
  }

  const relMap = new Map()
  for (const rel of data.relationships ?? []) {
    relMap.set(`${rel['column-id']}|${rel['row-id']}`, rel.rationale)
  }

  const total = columnItems.length * rowItems.length
  const required = data.relationships?.length ?? 0
  const summary = `${required} of ${total} relationships mapped`

  const toolbar = (
    <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-3 bg-gray-50 flex-shrink-0">
      <span className="text-xs text-gray-500">{summary}</span>
      <div className="flex items-center gap-3 text-xs">
        <Link to={artefactUrl(colArtefact, clientId, versionId)} className="text-brand-600 hover:text-brand-700 font-mono">
          {columns.artefact}
        </Link>
        <span className="text-gray-300">·</span>
        <Link to={artefactUrl(rowArtefact, clientId, versionId)} className="text-brand-600 hover:text-brand-700 font-mono">
          {rows.artefact}
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-1">
        {fullscreen ? (
          <button onClick={() => setFullscreen(false)} title="Exit full screen (Esc)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors">
            <Minimize01 className="w-3.5 h-3.5" />Exit full screen
          </button>
        ) : (
          <button onClick={() => setFullscreen(true)} title="Full screen"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors">
            <Expand01 className="w-3.5 h-3.5" />Full screen
          </button>
        )}
      </div>
    </div>
  )

  const table = (
    <div className={`overflow-auto flex-1 ${fullscreen ? '' : 'max-h-[600px]'}`}>
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-30 bg-gray-50 border-b border-r border-gray-200 px-4 py-3 text-left align-bottom min-w-[260px]">
              <div className="text-xs text-gray-400 font-normal">
                <span className="font-mono">{rows.artefact}</span>
                <span className="px-1">↓</span>
                <span className="text-gray-300">/</span>
                <span className="font-mono px-1">{columns.artefact}</span>
                <span>→</span>
              </div>
            </th>
            {columnItems.map(col => (
              <th key={col[columns.idField]}
                className="sticky top-0 z-20 bg-gray-50 border-b border-gray-200 px-2 py-2 text-center align-bottom min-w-[120px] max-w-[160px]"
                title={col[columns.tooltipField]}
              >
                <div className="font-mono text-xs font-semibold text-gray-600">{col[columns.idField]}</div>
                <div className="text-xs text-gray-400 font-normal mt-0.5 line-clamp-2 leading-tight">
                  {col[columns.labelField ?? columns.tooltipField]}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rowItems.map(row => (
            <tr key={row[rows.idField]} className="group">
              <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-r border-gray-200 px-4 py-2.5 align-top transition-colors"
                title={row[rows.tooltipField]}
              >
                <div className="font-mono text-xs text-gray-400">{row[rows.idField]}</div>
                <div className="text-sm text-gray-700">{row[rows.labelField]}</div>
              </td>
              {columnItems.map(col => {
                const key = `${col[columns.idField]}|${row[rows.idField]}`
                const rationale = relMap.get(key)
                const checked = relMap.has(key)
                return (
                  <td key={key}
                    className="px-2 py-2.5 text-center group-hover:bg-gray-50 transition-colors"
                    title={rationale}
                  >
                    {checked
                      ? <CheckSquare className="w-4 h-4 text-brand-600 mx-auto" />
                      : <Square className="w-4 h-4 text-gray-200 mx-auto" />}
                  </td>
                )
              })}
            </tr>
          ))}
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
    <div className="border border-gray-200 bg-white overflow-hidden flex flex-col">
      {toolbar}
      {table}
      <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 text-xs text-gray-400 flex-shrink-0">{summary}</div>
    </div>
  )
}
