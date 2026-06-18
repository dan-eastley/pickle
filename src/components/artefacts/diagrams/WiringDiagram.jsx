import { useEffect, useState, useMemo } from 'react'
import Spinner from '../../ui/Spinner'
import SlidePanel from '../../ui/SlidePanel'

// Grid placement of the 11 APP-DOM domains — arranged to minimise cross-domain edge lengths
const DOMAIN_GRID = [
  ['APP-DOM-CUSTOMER',   'APP-DOM-BILLING',      'APP-DOM-DATA'],
  ['APP-DOM-NETWORK',    'APP-DOM-METERING',     'APP-DOM-ENTERPRISE'],
  ['APP-DOM-FIELD',      'APP-DOM-SUSTAIN',      'APP-DOM-TRADING'],
  ['APP-DOM-REGULATORY', 'APP-DOM-INTEGRATION',  null],
]

const COLS = 3
const COL_W = 340
const COL_GAP = 20
const ROW_GAP = 20
const OUTER_PAD = 20
const HEADER_H = 28
const DOM_PAD = 10
const PLAT_H = 28
const PLAT_GAP = 5
const SVG_W = OUTER_PAD * 2 + COLS * COL_W + (COLS - 1) * COL_GAP  // 1100

const DIRECTION_ICONS = {
  'source-to-target': '→',
  'target-to-source': '←',
  'bi-directional': '↔',
}

// Domain colours — emerald/green theme (integration domain)
const DOM_COLORS = [
  '#0891b2', // cyan  — Customer
  '#ea580c', // orange — Billing
  '#6366f1', // indigo — Data
  '#7c3aed', // purple — Network
  '#0891b2', // cyan  — Metering
  '#64748b', // slate  — Enterprise
  '#16a34a', // green  — Field
  '#059669', // emerald — Sustain
  '#dc2626', // red   — Trading
  '#d97706', // amber  — Regulatory
  '#0d9488', // teal  — Integration
]

function domHeight(nPlats) {
  return HEADER_H + DOM_PAD * 2 + nPlats * PLAT_H + Math.max(0, nPlats - 1) * PLAT_GAP
}

function buildLayout(orderedDomains) {
  const domById = Object.fromEntries(orderedDomains.map(d => [d.id, d]))

  // Row heights = max domain height per row
  const rowHeights = DOMAIN_GRID.map(row =>
    Math.max(...row.map(id => (id && domById[id] ? domHeight(domById[id].platforms.length) : 0)))
  )

  // Accumulate y offsets per row
  const rowY = []
  let y = OUTER_PAD
  rowHeights.forEach(h => { rowY.push(y); y += h + ROW_GAP })
  const svgH = y - ROW_GAP + OUTER_PAD

  // Domain box positions
  const domBoxes = {}
  DOMAIN_GRID.forEach((row, ri) => {
    row.forEach((domId, ci) => {
      if (!domId || !domById[domId]) return
      const dom = domById[domId]
      const bx = OUTER_PAD + ci * (COL_W + COL_GAP)
      const by = rowY[ri]
      const bh = domHeight(dom.platforms.length)
      domBoxes[domId] = { x: bx, y: by, w: COL_W, h: bh, dom }
    })
  })

  // Platform box positions & centres
  const platBoxes = {}
  Object.values(domBoxes).forEach(({ x, y: by, w, dom }) => {
    dom.platforms.forEach((platId, pi) => {
      const px = x + DOM_PAD
      const py = by + HEADER_H + DOM_PAD + pi * (PLAT_H + PLAT_GAP)
      const pw = w - DOM_PAD * 2
      platBoxes[platId] = {
        x: px, y: py, w: pw, h: PLAT_H,
        cx: px + pw / 2,
        cy: py + PLAT_H / 2,
        domId: dom.id,
      }
    })
  })

  return { domBoxes, platBoxes, svgH, rowHeights, rowY }
}

function PlatformDetail({ plat, domName }) {
  const fields = [
    { label: 'Domain', value: domName },
    { label: 'Type', value: plat?.type },
    { label: 'Lifecycle', value: plat?.lifecycle },
    { label: 'Description', value: plat?.description },
  ].filter(f => f.value)

  return (
    <div className="p-4 space-y-3">
      {fields.map(f => (
        <div key={f.label}>
          <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{f.label}</dt>
          <dd className="mt-0.5 text-sm text-gray-800">{f.value}</dd>
        </div>
      ))}
    </div>
  )
}

function PairDetail({ pair, platformsById }) {
  const srcPlat = platformsById[pair.src]
  const tgtPlat = platformsById[pair.tgt]

  return (
    <div>
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
          <span className="font-mono">{pair.src}</span>
          <span>↔</span>
          <span className="font-mono">{pair.tgt}</span>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {pair.interfaces.length} interface{pair.interfaces.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {pair.interfaces.map(iface => {
          const icon = DIRECTION_ICONS[iface.direction] ?? '—'
          const ifcSrc = platformsById[iface.source]?.name ?? iface.source
          const ifcTgt = platformsById[iface.target]?.name ?? iface.target
          return (
            <div key={iface.id} className="px-4 py-3">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-gray-500 leading-none">{icon}</span>
                <span className="font-mono text-xs text-gray-400">{iface.id}</span>
                <span className="text-sm font-medium text-gray-900">{iface.name}</span>
              </div>
              {iface.description && (
                <p className="mt-1 text-xs text-gray-500 ml-6">{iface.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-400 ml-6">
                {ifcSrc} <span className="font-bold">{icon}</span> {ifcTgt}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function WiringDiagram({ clientId, versionId }) {
  const [ifc, setIfc] = useState(null)
  const [dap, setDap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selection, setSelection] = useState(null) // { type: 'platform'|'pair', id }

  useEffect(() => {
    const base = `/api/arch/clients/${clientId}/${versionId}/domains`
    Promise.all([
      fetch(`${base}/integration/logical/INT-IFC.json`).then(r => r.ok ? r.json() : null),
      fetch(`${base}/application/logical/APP-DAP.json`).then(r => r.ok ? r.json() : null),
    ])
      .then(([ifcData, dapData]) => { setIfc(ifcData); setDap(dapData) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [clientId, versionId])

  const derived = useMemo(() => {
    if (!ifc || !dap) return null

    const platformsById = Object.fromEntries(dap.platforms.map(p => [p.id, p]))
    const domainsById = Object.fromEntries(dap.domains.map(d => [d.id, d]))

    const orderedDomains = dap.domains.map(d => ({
      ...d,
      colorIndex: dap.domains.indexOf(d),
      platforms: dap.platforms.filter(p => p['domain-id'] === d.id).map(p => p.id),
    }))

    const pairMap = {}
    for (const iface of ifc.interfaces) {
      const [a, b] = [iface.source, iface.target].sort()
      const key = `${a}|${b}`
      if (!pairMap[key]) pairMap[key] = { src: a, tgt: b, interfaces: [] }
      pairMap[key].interfaces.push(iface)
    }

    const layout = buildLayout(orderedDomains)

    const edges = Object.entries(pairMap).map(([key, pair]) => {
      const sp = layout.platBoxes[pair.src]
      const tp = layout.platBoxes[pair.tgt]
      if (!sp || !tp) return null
      return { key, ...pair, sp, tp }
    }).filter(Boolean)

    return { platformsById, domainsById, orderedDomains, pairMap, edges, layout }
  }, [ifc, dap])

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
  if (error) return <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>
  if (!derived) return <div className="p-4 text-sm text-gray-500">No integration data available.</div>

  const { platformsById, domainsById, orderedDomains, pairMap, edges, layout } = derived
  const { domBoxes, platBoxes, svgH } = layout

  const selectedPair = selection?.type === 'pair' ? pairMap[selection.id] : null
  const selectedPlatId = selection?.type === 'platform' ? selection.id : null

  const domColorMap = Object.fromEntries(
    orderedDomains.map((d, i) => [d.id, DOM_COLORS[i % DOM_COLORS.length]])
  )

  const panelTitle = selectedPair
    ? `${platformsById[selectedPair.src]?.name ?? selectedPair.src} ↔ ${platformsById[selectedPair.tgt]?.name ?? selectedPair.tgt}`
    : selectedPlatId
      ? (platformsById[selectedPlatId]?.name ?? selectedPlatId)
      : ''

  const panelSubtitle = selectedPair
    ? `${selectedPair.interfaces.length} interface${selectedPair.interfaces.length !== 1 ? 's' : ''}`
    : selectedPlatId
      ? domainsById[platformsById[selectedPlatId]?.['domain-id']]?.name
      : ''

  return (
    <div className="border border-gray-200 bg-white overflow-hidden shadow-xl">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-3 text-xs text-gray-500">
        <span>{Object.keys(platformsById).length} platforms</span>
        <span>·</span>
        <span>{ifc.interfaces.length} interfaces</span>
        <span>·</span>
        <span>{Object.keys(pairMap).length} connected pairs</span>
        {selection && (
          <button
            onClick={() => setSelection(null)}
            className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕ Clear selection
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${svgH}`}
          className="w-full min-w-[640px]"
          style={{ maxHeight: '680px' }}
        >
          {/* Edges — drawn first so they appear beneath boxes */}
          {edges.map(edge => {
            const { key, sp, tp } = edge
            const isSel = selection?.type === 'pair' && selection.id === key
            const isRelated = selectedPair && (
              edge.src === selectedPair.src || edge.src === selectedPair.tgt ||
              edge.tgt === selectedPair.src || edge.tgt === selectedPair.tgt
            )
            const isPlatRelated = selectedPlatId && (edge.src === selectedPlatId || edge.tgt === selectedPlatId)

            const opacity = selection
              ? (isSel ? 1 : (isRelated || isPlatRelated) ? 0.6 : 0.1)
              : 0.55

            const stroke = isSel ? '#2563eb' : '#94a3b8'
            const strokeW = isSel ? 2.5 : 1.5

            // For same-domain edges, use a curve that exits to the right
            const sameDomain = sp.domId === tp.domId
            let d = ''
            if (sameDomain) {
              const rightEdge = (domBoxes[sp.domId]?.x ?? 0) + COL_W + 14
              d = `M ${sp.cx} ${sp.cy} C ${rightEdge} ${sp.cy} ${rightEdge} ${tp.cy} ${tp.cx} ${tp.cy}`
            } else {
              d = `M ${sp.cx} ${sp.cy} L ${tp.cx} ${tp.cy}`
            }

            const midX = (sp.cx + tp.cx) / 2
            const midY = (sp.cy + tp.cy) / 2

            return (
              <g key={key} style={{ cursor: 'pointer' }}
                onClick={() => setSelection(isSel ? null : { type: 'pair', id: key })}>
                {/* Wide invisible hit area */}
                {sameDomain
                  ? <path d={d} stroke="transparent" strokeWidth="14" fill="none" />
                  : <line x1={sp.cx} y1={sp.cy} x2={tp.cx} y2={tp.cy} stroke="transparent" strokeWidth="14" />
                }
                {sameDomain
                  ? <path d={d} stroke={stroke} strokeWidth={strokeW} fill="none" opacity={opacity} />
                  : <line x1={sp.cx} y1={sp.cy} x2={tp.cx} y2={tp.cy} stroke={stroke} strokeWidth={strokeW} opacity={opacity} />
                }
                {edge.interfaces.length > 1 && !sameDomain && (
                  <g opacity={opacity}>
                    <rect x={midX - 8} y={midY - 7} width="16" height="14" fill="white" rx="2" />
                    <text x={midX} y={midY} textAnchor="middle" dominantBaseline="middle"
                      fontSize="9" fontWeight="700" fill={isSel ? '#2563eb' : '#64748b'}
                      fontFamily="system-ui, sans-serif">
                      {edge.interfaces.length}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Domain group boxes */}
          {Object.entries(domBoxes).map(([domId, box]) => {
            const color = domColorMap[domId] ?? '#94a3b8'
            const dom = box.dom
            return (
              <g key={domId}>
                {/* Domain border */}
                <rect x={box.x} y={box.y} width={box.w} height={box.h}
                  fill="white" stroke={color} strokeWidth="1.5" strokeOpacity="0.35" />
                {/* Domain header */}
                <rect x={box.x} y={box.y} width={box.w} height={HEADER_H}
                  fill={color} fillOpacity="0.1" />
                <text x={box.x + DOM_PAD} y={box.y + HEADER_H / 2}
                  dominantBaseline="middle"
                  fontSize="9.5" fontWeight="700" fill={color}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  letterSpacing="0.025em">
                  {dom.name.toUpperCase()}
                </text>

                {/* Platform boxes */}
                {dom.platforms.map((platId, pi) => {
                  const pb = platBoxes[platId]
                  if (!pb) return null
                  const plat = platformsById[platId]
                  const isSel = selectedPlatId === platId
                  const isRelated = selectedPair && (platId === selectedPair.src || platId === selectedPair.tgt)
                  const dim = selection && !isSel && !isRelated ? 0.25 : 1
                  const shortId = platId.replace(/^PLAT-/, '')

                  return (
                    <g key={platId} style={{ cursor: 'pointer' }}
                      onClick={() => setSelection(isSel ? null : { type: 'platform', id: platId })}>
                      <title>{plat?.name ?? platId}{plat?.description ? `\n${plat.description}` : ''}</title>
                      <rect x={pb.x} y={pb.y} width={pb.w} height={pb.h}
                        fill={isSel ? color : '#f9fafb'}
                        fillOpacity={isSel ? 0.15 : 1}
                        stroke={isSel ? color : '#e2e8f0'}
                        strokeWidth={isSel ? 1.5 : 1}
                        opacity={dim}
                      />
                      <text x={pb.x + 6} y={pb.cy}
                        dominantBaseline="middle"
                        fontSize="8" fontWeight="700" fill="#94a3b8"
                        fontFamily="system-ui, sans-serif" opacity={dim}>
                        {shortId}
                      </text>
                      <text x={pb.x + 6 + shortId.length * 5.5 + 6} y={pb.cy}
                        dominantBaseline="middle"
                        fontSize="10" fontWeight="500" fill={isSel ? color : '#374151'}
                        fontFamily="system-ui, -apple-system, sans-serif" opacity={dim}>
                        {plat?.name ?? platId}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 text-center">
        Click a platform or connection line to view details
      </div>

      <SlidePanel
        open={!!selection}
        onClose={() => setSelection(null)}
        title={panelTitle}
        subtitle={panelSubtitle}
      >
        {selectedPair && (
          <PairDetail pair={selectedPair} platformsById={platformsById} />
        )}
        {selectedPlatId && platformsById[selectedPlatId] && (
          <PlatformDetail
            plat={platformsById[selectedPlatId]}
            domName={domainsById[platformsById[selectedPlatId]?.['domain-id']]?.name}
          />
        )}
      </SlidePanel>
    </div>
  )
}
