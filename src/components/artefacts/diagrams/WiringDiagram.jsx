import { useEffect, useState, useMemo } from 'react'
import Spinner from '../../ui/Spinner'
import EntityPanel from '../EntityPanel'
import { getDiagramColors, wrapText } from '../../../lib/diagramTheme'

// Wiring diagram for INT-IFC (platform-to-platform interfaces), rendered in the
// same block/colour language as the platforms model (APP-DPM): amber application
// blocks, emerald integration connections, square corners, simple.
//
// Two views, drilled one into the other:
//   • System view — one focus platform plus every directly connected platform.
//     Each connection line shows how many interfaces run between the pair;
//     clicking it drills into the source/target view for that pair.
//   • Source/target view — a single pair of platforms with every interface that
//     flows between them, one line per interface (id + name, directional arrow).
//
// Clicking a platform block or an interface line opens the usual entity popout.

const BLOCK_W = 240
const BLOCK_H = 52
const PAD = 24
const ROW_GAP = 18
const FLOW_ROW_H = 50
const SVG_W = 900
const NEIGHBOUR_X = SVG_W - PAD - BLOCK_W

const EMERALD = '#34d399' // emerald-400 — connection lines
const EMERALD_DK = '#059669' // emerald-600 — active / arrowheads

const app = getDiagramColors('application')

// Short platform label, dropping the PLAT- prefix used everywhere else.
const shortId = (id) => id.replace(/^PLAT-/, '')

function PlatformBlock({ x, y, platform, id, focused, onClick }) {
  const name = platform?.name ?? id
  const lines = wrapText(name, 28, 2)
  const rectFill = focused ? app.selectedFill : app.itemFill
  const rectHover = focused ? '' : app.itemHover
  const idFill = focused ? app.selectedId : app.label
  const nameFill = focused ? 'fill-white' : app.itemText
  return (
    <g className="group cursor-pointer" onClick={onClick}>
      <title>{name}</title>
      <rect
        x={x}
        y={y}
        width={BLOCK_W}
        height={BLOCK_H}
        className={`${rectFill} ${rectHover} transition-colors`}
      />
      <text x={x + 12} y={y + 16} className={`${idFill} text-[10px] font-mono`}>
        {shortId(id)}
      </text>
      {lines.map((ln, i) => (
        <text
          key={i}
          x={x + 12}
          y={y + 30 + i * 12}
          className={`${nameFill} text-[12px] font-semibold`}
        >
          {ln}
        </text>
      ))}
    </g>
  )
}

// ── System view: focus platform + its connected platforms ───────────────────
function SystemView({ focusId, neighbours, platformsById, onOpenPair, onOpenEntity }) {
  const focus = platformsById[focusId]
  const contentH = Math.max(neighbours.length * (BLOCK_H + ROW_GAP) - ROW_GAP, BLOCK_H)
  const svgH = contentH + PAD * 2
  const focusY = PAD + contentH / 2 - BLOCK_H / 2
  const focusCx = PAD + BLOCK_W
  const focusCy = focusY + BLOCK_H / 2

  if (neighbours.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-gray-500">
        {focus?.name ?? focusId} has no interfaces to other platforms.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${SVG_W} ${svgH}`} className="w-full min-w-[640px]" style={{ maxHeight: 680 }}>
        {/* Connections (drawn under the blocks) */}
        {neighbours.map((n, i) => {
          const ny = PAD + i * (BLOCK_H + ROW_GAP)
          const ncy = ny + BLOCK_H / 2
          const midX = (focusCx + NEIGHBOUR_X) / 2
          return (
            <g
              key={n.id}
              className="group cursor-pointer"
              onClick={() => onOpenPair(n.id)}
            >
              <title>
                {n.count} interface{n.count !== 1 ? 's' : ''} — click to view
              </title>
              {/* hit area */}
              <line x1={focusCx} y1={focusCy} x2={NEIGHBOUR_X} y2={ncy} stroke="transparent" strokeWidth="18" />
              <line
                x1={focusCx}
                y1={focusCy}
                x2={NEIGHBOUR_X}
                y2={ncy}
                stroke={EMERALD}
                strokeWidth="1.5"
                className="group-hover:stroke-emerald-600 transition-colors"
              />
              {/* count label */}
              <g>
                <rect x={midX - 52} y={ncy - 11} width="104" height="22" rx="2" className="fill-emerald-50" />
                <text
                  x={midX}
                  y={ncy + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-emerald-700 text-[11px] font-semibold"
                >
                  {n.count} × Interface{n.count !== 1 ? 's' : ''}
                </text>
              </g>
            </g>
          )
        })}

        {/* Focus platform */}
        <PlatformBlock
          x={PAD}
          y={focusY}
          id={focusId}
          platform={focus}
          focused
          onClick={() => onOpenEntity(focusId)}
        />

        {/* Connected platforms */}
        {neighbours.map((n, i) => {
          const ny = PAD + i * (BLOCK_H + ROW_GAP)
          return (
            <PlatformBlock
              key={n.id}
              x={NEIGHBOUR_X}
              y={ny}
              id={n.id}
              platform={platformsById[n.id]}
              onClick={() => onOpenEntity(n.id)}
            />
          )
        })}
      </svg>
    </div>
  )
}

// ── Source/target view: one pair, every interface between them ───────────────
function PairView({ leftId, rightId, interfaces, platformsById, onOpenEntity }) {
  const contentH = Math.max(interfaces.length * FLOW_ROW_H, BLOCK_H)
  const svgH = contentH + PAD * 2
  const blockY = PAD + contentH / 2 - BLOCK_H / 2
  const leftEdge = PAD + BLOCK_W
  const rightEdge = NEIGHBOUR_X

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${SVG_W} ${svgH}`} className="w-full min-w-[640px]" style={{ maxHeight: 680 }}>
        <defs>
          <marker id="wd-arrow-r" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 Z" fill={EMERALD_DK} />
          </marker>
          <marker id="wd-arrow-l" markerWidth="9" markerHeight="9" refX="2" refY="4.5" orient="auto">
            <path d="M9,0 L0,4.5 L9,9 Z" fill={EMERALD_DK} />
          </marker>
        </defs>

        {/* Flows */}
        {interfaces.map((iface, i) => {
          const cy = PAD + i * FLOW_ROW_H + FLOW_ROW_H / 2
          const bi = iface.direction === 'bi-directional'
          const fromId = iface.direction === 'target-to-source' ? iface.target : iface.source
          const pointsRight = fromId === leftId
          return (
            <g key={iface.id} className="group cursor-pointer" onClick={() => onOpenEntity(iface.id)}>
              <title>{`${iface.id} · ${iface.name}`}</title>
              <line x1={leftEdge} y1={cy} x2={rightEdge} y2={cy} stroke="transparent" strokeWidth="20" />
              <line
                x1={leftEdge + 4}
                y1={cy}
                x2={rightEdge - 4}
                y2={cy}
                stroke={EMERALD}
                strokeWidth="1.5"
                className="group-hover:stroke-emerald-600 transition-colors"
                markerEnd={bi || pointsRight ? 'url(#wd-arrow-r)' : undefined}
                markerStart={bi || !pointsRight ? 'url(#wd-arrow-l)' : undefined}
              />
              <text
                x={(leftEdge + rightEdge) / 2}
                y={cy - 8}
                textAnchor="middle"
                className="fill-gray-900 text-[12px] font-semibold"
              >
                {iface.name}
              </text>
              <text
                x={(leftEdge + rightEdge) / 2}
                y={cy + 15}
                textAnchor="middle"
                className="fill-gray-400 text-[10px] font-mono"
              >
                {iface.id}
              </text>
            </g>
          )
        })}

        {/* Endpoints */}
        <PlatformBlock
          x={PAD}
          y={blockY}
          id={leftId}
          platform={platformsById[leftId]}
          focused
          onClick={() => onOpenEntity(leftId)}
        />
        <PlatformBlock
          x={NEIGHBOUR_X}
          y={blockY}
          id={rightId}
          platform={platformsById[rightId]}
          onClick={() => onOpenEntity(rightId)}
        />
      </svg>
    </div>
  )
}

export default function WiringDiagram({ clientId, versionId }) {
  const [ifc, setIfc] = useState(null)
  const [dap, setDap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [focusId, setFocusId] = useState(null)
  const [pairTargetId, setPairTargetId] = useState(null) // non-null => source/target view
  const [selectedEntityId, setSelectedEntityId] = useState(null)

  useEffect(() => {
    setLoading(true)
    const base = `/api/arch/${clientId}/${versionId}/domains`
    Promise.all([
      fetch(`${base}/integration/logical/INT-IFC.json`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${base}/application/logical/APP-DAP.json`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([ifcData, dapData]) => {
        setIfc(ifcData)
        setDap(dapData)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [clientId, versionId])

  const model = useMemo(() => {
    if (!ifc || !dap) return null
    const platformsById = Object.fromEntries(dap.platforms.map((p) => [p.id, p]))

    // Adjacency: focusId -> [{ id, count, interfaces }], sorted by interface count.
    const adjacency = {}
    const add = (a, b, iface) => {
      if (!adjacency[a]) adjacency[a] = {}
      if (!adjacency[a][b]) adjacency[a][b] = []
      adjacency[a][b].push(iface)
    }
    for (const iface of ifc.interfaces ?? []) {
      if (!iface.source || !iface.target || iface.source === iface.target) continue
      add(iface.source, iface.target, iface)
      add(iface.target, iface.source, iface)
    }

    const neighboursOf = (id) =>
      Object.entries(adjacency[id] ?? {})
        .map(([nid, list]) => ({ id: nid, count: list.length, interfaces: list }))
        .filter((n) => platformsById[n.id])
        .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))

    // Platforms that actually have at least one interface, for the picker.
    const connectedIds = Object.keys(adjacency)
      .filter((id) => platformsById[id])
      .sort((a, b) => (platformsById[a].name ?? a).localeCompare(platformsById[b].name ?? b))

    // Default focus: the most connected platform.
    const defaultFocus = connectedIds
      .slice()
      .sort((a, b) => neighboursOf(b).length - neighboursOf(a).length)[0]

    return { platformsById, neighboursOf, connectedIds, defaultFocus }
  }, [ifc, dap])

  // Seed / re-seed focus when the model (or architecture/transition) changes.
  useEffect(() => {
    if (model) {
      setFocusId((cur) => (cur && model.platformsById[cur] ? cur : (model.defaultFocus ?? null)))
      setPairTargetId(null)
    }
  }, [model])

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  if (error)
    return <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>
  if (!model || !model.connectedIds.length)
    return <div className="p-4 text-sm text-gray-500">No integration data available.</div>

  const { platformsById, neighboursOf, connectedIds } = model
  const neighbours = focusId ? neighboursOf(focusId) : []
  const focus = platformsById[focusId]

  const pair = pairTargetId
    ? neighbours.find((n) => n.id === pairTargetId)
    : null
  const inPairView = !!pair

  return (
    <div className="bg-white overflow-hidden shadow-xl">
      {/* Header / controls */}
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-3 flex-wrap text-xs">
        {inPairView ? (
          <>
            <button
              onClick={() => setPairTargetId(null)}
              className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ‹ Back
            </button>
            <span className="text-gray-300">|</span>
            <span className="font-semibold text-gray-900">
              <span className="font-mono text-gray-500">{shortId(focusId)}</span> {focus?.name}
              <span className="mx-1.5 text-gray-400">↔</span>
              <span className="font-mono text-gray-500">{shortId(pairTargetId)}</span>{' '}
              {platformsById[pairTargetId]?.name}
            </span>
            <span className="ml-auto text-gray-500">
              {pair.count} interface{pair.count !== 1 ? 's' : ''}
            </span>
          </>
        ) : (
          <>
            <label htmlFor="wd-focus" className="text-gray-500">
              Platform
            </label>
            <select
              id="wd-focus"
              value={focusId ?? ''}
              onChange={(e) => {
                setFocusId(e.target.value)
                setPairTargetId(null)
              }}
              className="px-2 py-1 border border-gray-300 bg-white text-gray-900 text-xs focus:outline-none focus:border-brand-500 max-w-[16rem]"
            >
              {connectedIds.map((id) => (
                <option key={id} value={id}>
                  {platformsById[id]?.name ?? id} ({shortId(id)})
                </option>
              ))}
            </select>
            <span className="ml-auto text-gray-500">
              {neighbours.length} connected platform{neighbours.length !== 1 ? 's' : ''}
            </span>
          </>
        )}
      </div>

      {inPairView ? (
        <PairView
          leftId={focusId}
          rightId={pairTargetId}
          interfaces={pair.interfaces}
          platformsById={platformsById}
          onOpenEntity={setSelectedEntityId}
        />
      ) : (
        <SystemView
          focusId={focusId}
          neighbours={neighbours}
          platformsById={platformsById}
          onOpenPair={setPairTargetId}
          onOpenEntity={setSelectedEntityId}
        />
      )}

      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-500 text-center">
        {inPairView
          ? 'Click an interface line or a platform to view details'
          : 'Click a connection to see its interfaces, or a platform for details'}
      </div>

      <EntityPanel
        entityId={selectedEntityId}
        clientId={clientId}
        versionId={versionId}
        onClose={() => setSelectedEntityId(null)}
      />
    </div>
  )
}
