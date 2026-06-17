import { useEffect, useState, useMemo } from 'react'
import Spinner from '../../ui/Spinner'

const DOMAIN_PALETTE = [
  '#2563eb', // Customer
  '#16a34a', // Field
  '#dc2626', // Trading
  '#7c3aed', // Network
  '#ea580c', // Billing
  '#0891b2', // Metering
  '#d97706', // Regulatory
  '#059669', // Sustainability
  '#6366f1', // Data
  '#64748b', // Enterprise
  '#0d9488', // Integration
]

const DIRECTION_ICONS = {
  'source-to-target': '→',
  'target-to-source': '←',
  'bi-directional': '↔',
}

// Split a PLAT-id (minus "PLAT-") into at most 2 lines for SVG labels
function splitLabel(s) {
  if (s.length <= 9) return [s]
  const h = s.indexOf('-', 4)
  if (h < 0) return [s.slice(0, 8) + '…']
  return [s.slice(0, h), s.slice(h + 1)]
}

function buildLayout(orderedDomains) {
  const cx = 500, cy = 450
  const R = 310, arcR = 338, labelR = 395
  const N = orderedDomains.length
  const sectorAngle = (2 * Math.PI) / N
  const startAngle = -Math.PI / 2

  const nodePositions = {}
  const domainMeta = []

  orderedDomains.forEach((dom, di) => {
    const secStart = startAngle + di * sectorAngle
    const secEnd = secStart + sectorAngle
    const pads = dom.platforms

    pads.forEach((platId, pi) => {
      const t = pads.length === 1 ? 0.5 : pi / (pads.length - 1)
      const angle = secStart + sectorAngle * 0.12 + t * sectorAngle * 0.76
      nodePositions[platId] = { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle), angle, domainIndex: di }
    })

    const midAngle = secStart + sectorAngle / 2
    const arcStart = secStart + sectorAngle * 0.04
    const arcEnd = secEnd - sectorAngle * 0.04

    domainMeta.push({
      id: dom.id,
      name: dom.name,
      color: DOMAIN_PALETTE[di % DOMAIN_PALETTE.length],
      midAngle,
      arcStart,
      arcEnd,
      labelX: cx + labelR * Math.cos(midAngle),
      labelY: cy + labelR * Math.sin(midAngle),
      arcR,
    })
  })

  return { nodePositions, domainMeta, cx, cy }
}

function PairDetail({ pair, platformsById }) {
  const srcPlat = platformsById[pair.src]
  const tgtPlat = platformsById[pair.tgt]

  return (
    <div className="border-t border-gray-200">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-gray-900">{srcPlat?.name ?? pair.src}</span>
        <span className="font-mono text-xs text-gray-400">{pair.src}</span>
        <span className="text-gray-400">↔</span>
        <span className="text-sm font-semibold text-gray-900">{tgtPlat?.name ?? pair.tgt}</span>
        <span className="font-mono text-xs text-gray-400">{pair.tgt}</span>
        <span className="ml-auto text-xs text-gray-500">
          {pair.interfaces.length} interface{pair.interfaces.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {pair.interfaces.map(iface => {
          const icon = DIRECTION_ICONS[iface.direction] ?? '—'
          const ifcSrc = platformsById[iface.source]?.name ?? iface.source
          const ifcTgt = platformsById[iface.target]?.name ?? iface.target

          return (
            <div key={iface.id} className="px-4 py-3 flex items-start gap-4">
              <span className="text-xl font-bold text-gray-500 flex-shrink-0 w-6 text-center leading-none mt-0.5">
                {icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-xs text-gray-400">{iface.id}</span>
                  <span className="text-sm font-medium text-gray-900">{iface.name}</span>
                </div>
                {iface.description && (
                  <p className="mt-0.5 text-xs text-gray-500">{iface.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {ifcSrc} <span className="font-bold">{icon}</span> {ifcTgt}
                </p>
              </div>
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
  const [selected, setSelected] = useState(null) // normalised "A|B" key

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

    const orderedDomains = dap.domains.map(d => ({
      ...d,
      platforms: dap.platforms.filter(p => p['domain-id'] === d.id).map(p => p.id),
    }))

    const pairMap = {}
    for (const iface of ifc.interfaces) {
      const [a, b] = [iface.source, iface.target].sort()
      const key = `${a}|${b}`
      if (!pairMap[key]) pairMap[key] = { src: a, tgt: b, interfaces: [] }
      pairMap[key].interfaces.push(iface)
    }

    const { nodePositions, domainMeta, cx, cy } = buildLayout(orderedDomains)

    const edges = Object.entries(pairMap)
      .map(([key, pair]) => {
        const sp = nodePositions[pair.src]
        const tp = nodePositions[pair.tgt]
        if (!sp || !tp) return null
        return { key, ...pair, srcPos: sp, tgtPos: tp, count: pair.interfaces.length }
      })
      .filter(Boolean)

    return { platformsById, pairMap, nodePositions, domainMeta, edges, cx, cy }
  }, [ifc, dap])

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
  if (error) return <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>
  if (!derived) return <div className="p-4 text-sm text-gray-500">No integration data available.</div>

  const { platformsById, pairMap, nodePositions, domainMeta, edges } = derived
  const selectedPair = selected ? pairMap[selected] : null
  const totalPlatforms = Object.keys(platformsById).length
  const totalInterfaces = ifc.interfaces.length
  const totalPairs = Object.keys(pairMap).length

  return (
    <div className="border border-gray-200 bg-white overflow-hidden shadow-xl">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-3 text-xs text-gray-500">
        <span>{totalPlatforms} platforms</span>
        <span>·</span>
        <span>{totalInterfaces} interfaces</span>
        <span>·</span>
        <span>{totalPairs} connected pairs</span>
        {selectedPair && (
          <>
            <span>·</span>
            <span className="text-brand-600 font-medium">
              {platformsById[selectedPair.src]?.name ?? selectedPair.src}
              {' ↔ '}
              {platformsById[selectedPair.tgt]?.name ?? selectedPair.tgt}
            </span>
            <button
              onClick={() => setSelected(null)}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕ Clear
            </button>
          </>
        )}
      </div>

      <div className="p-2 overflow-x-auto">
        <svg viewBox="0 0 1000 900" className="w-full min-w-[640px]" style={{ maxHeight: '560px' }}>

          {/* Domain arc segments */}
          {domainMeta.map(dom => {
            const { arcR, arcStart, arcEnd, color } = dom
            const cx2 = 500, cy2 = 450
            const x1 = cx2 + arcR * Math.cos(arcStart)
            const y1 = cy2 + arcR * Math.sin(arcStart)
            const x2 = cx2 + arcR * Math.cos(arcEnd)
            const y2 = cy2 + arcR * Math.sin(arcEnd)
            const large = (arcEnd - arcStart) > Math.PI ? 1 : 0
            return (
              <path
                key={dom.id}
                d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${arcR} ${arcR} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`}
                stroke={color}
                strokeWidth="3.5"
                fill="none"
                opacity="0.55"
              />
            )
          })}

          {/* Domain labels */}
          {domainMeta.map(dom => {
            const cos = Math.cos(dom.midAngle)
            const anchor = cos > 0.2 ? 'start' : cos < -0.2 ? 'end' : 'middle'
            const words = dom.name.split(' ')
            const lines = words.length <= 2 ? [dom.name]
              : [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
            return (
              <text
                key={dom.id}
                x={dom.labelX.toFixed(1)}
                y={dom.labelY.toFixed(1)}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize="9"
                fontWeight="700"
                fill={dom.color}
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="0.02em"
              >
                {lines.map((line, li) => (
                  <tspan
                    key={li}
                    x={dom.labelX.toFixed(1)}
                    dy={li === 0 ? (lines.length > 1 ? '-5.5' : '0') : '11'}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            )
          })}

          {/* Edges — drawn before nodes so nodes appear on top */}
          {edges.map(edge => {
            const isSelected = selected === edge.key
            const isRelated = selectedPair && (
              edge.src === selectedPair.src || edge.src === selectedPair.tgt ||
              edge.tgt === selectedPair.src || edge.tgt === selectedPair.tgt
            )
            const opacity = selected
              ? (isSelected ? 1 : isRelated ? 0.5 : 0.08)
              : 0.4
            const stroke = isSelected ? '#2563eb' : '#6b7280'
            const strokeWidth = isSelected ? 2.5 : 1.5
            const mx = (edge.srcPos.x + edge.tgtPos.x) / 2
            const my = (edge.srcPos.y + edge.tgtPos.y) / 2

            return (
              <g key={edge.key} style={{ cursor: 'pointer' }} onClick={() => setSelected(isSelected ? null : edge.key)}>
                {/* Invisible wide hit area */}
                <line
                  x1={edge.srcPos.x.toFixed(1)} y1={edge.srcPos.y.toFixed(1)}
                  x2={edge.tgtPos.x.toFixed(1)} y2={edge.tgtPos.y.toFixed(1)}
                  stroke="transparent"
                  strokeWidth="14"
                />
                <line
                  x1={edge.srcPos.x.toFixed(1)} y1={edge.srcPos.y.toFixed(1)}
                  x2={edge.tgtPos.x.toFixed(1)} y2={edge.tgtPos.y.toFixed(1)}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                />
                {edge.count > 1 && (
                  <g opacity={opacity}>
                    <rect x={mx - 8} y={my - 7} width="16" height="14" fill="white" rx="2" />
                    <text
                      x={mx.toFixed(1)} y={my.toFixed(1)}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize="8.5" fontWeight="700"
                      fill={isSelected ? '#2563eb' : '#4b5563'}
                      fontFamily="system-ui, sans-serif"
                    >
                      {edge.count}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Platform nodes */}
          {Object.entries(nodePositions).map(([platId, pos]) => {
            const color = DOMAIN_PALETTE[pos.domainIndex % DOMAIN_PALETTE.length]
            const isInSelected = selectedPair && (platId === selectedPair.src || platId === selectedPair.tgt)
            const nodeOpacity = selected ? (isInSelected ? 1 : 0.3) : 1
            const labelOpacity = selected ? (isInSelected ? 1 : 0.2) : 1

            const shortId = platId.replace(/^PLAT-/, '')
            const lines = splitLabel(shortId)
            const cos = Math.cos(pos.angle)
            const labelDist = 17
            const lx = pos.x + labelDist * Math.cos(pos.angle)
            const ly = pos.y + labelDist * Math.sin(pos.angle)
            const anchor = cos > 0.2 ? 'start' : cos < -0.2 ? 'end' : 'middle'

            return (
              <g key={platId}>
                <title>{platformsById[platId]?.name ?? platId}</title>
                <circle
                  cx={pos.x.toFixed(1)} cy={pos.y.toFixed(1)} r="7"
                  fill={color}
                  stroke={isInSelected ? 'white' : 'white'}
                  strokeWidth={isInSelected ? 2.5 : 1.5}
                  opacity={nodeOpacity}
                />
                {isInSelected && (
                  <circle
                    cx={pos.x.toFixed(1)} cy={pos.y.toFixed(1)} r="11"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity="0.5"
                  />
                )}
                <text
                  x={lx.toFixed(1)} y={ly.toFixed(1)}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  fontSize="8"
                  fontWeight="500"
                  fill="#374151"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  opacity={labelOpacity}
                >
                  {lines.length === 1 ? (
                    lines[0]
                  ) : (
                    <>
                      <tspan x={lx.toFixed(1)} dy="-4.5">{lines[0]}</tspan>
                      <tspan x={lx.toFixed(1)} dy="9">{lines[1]}</tspan>
                    </>
                  )}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {selectedPair && (
        <PairDetail pair={selectedPair} platformsById={platformsById} />
      )}

      {!selected && (
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 text-center">
          Click a line to see the interfaces between that platform pair
        </div>
      )}
    </div>
  )
}
