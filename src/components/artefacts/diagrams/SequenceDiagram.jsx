import { getDiagramColors, wrapText } from '../../../lib/diagramTheme'

// UML sequence-diagram renderer (diagramType: 'sequence'). Shared by all four
// flow-type artefacts (System / Information / User / Process flows). An instance
// holds 0+ flows; each flow has participants (lifelines) and ordered messages.
// Participants with a `ref` are clickable and open the entity panel.

const PART_W = 150
const PART_H = 40
const COL_GAP = 64
const PAD_X = 28
const HEAD_TOP = 16
const LIFELINE_TOP = HEAD_TOP + PART_H
const FIRST_MSG = LIFELINE_TOP + 34
const STEP = 54
const SELF_W = 46

// A participant's kind maps to a domain palette so lifelines read by colour.
const KIND_DOMAIN = {
  system: 'application',
  component: 'application',
  integration: 'integration',
  data: 'data',
  process: 'business',
  actor: 'business',
}

const orderMessages = (messages) =>
  messages
    .map((m, i) => ({ ...m, _i: i }))
    .sort((a, b) => (a.order ?? a._i + 1) - (b.order ?? b._i + 1) || a._i - b._i)

function Flow({ flow, domain, onItemClick, selectedId }) {
  const participants = flow.participants ?? []
  const messages = orderMessages(flow.messages ?? [])
  const n = participants.length
  if (n === 0) return null

  const colX = (idx) => PAD_X + idx * (PART_W + COL_GAP) + PART_W / 2
  const idxOf = Object.fromEntries(participants.map((p, i) => [p.id, i]))

  const width = PAD_X * 2 + n * PART_W + (n - 1) * COL_GAP
  const height = FIRST_MSG + messages.length * STEP + 20
  const bottom = height - 12

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="max-w-full">
        <defs>
          <marker
            id="seq-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" className="fill-gray-500" />
          </marker>
          <marker
            id="seq-arrow-open"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10" className="fill-none stroke-gray-500" strokeWidth="1.3" />
          </marker>
        </defs>

        {/* Lifelines + participant headers */}
        {participants.map((p, i) => {
          const cx = colX(i)
          const pal = getDiagramColors(KIND_DOMAIN[p.kind] ?? domain)
          const isSel = selectedId && p.ref === selectedId
          const clickable = Boolean(p.ref)
          const nameLines = wrapText(p.name, 20, 2)
          return (
            <g key={p.id}>
              <line
                x1={cx}
                y1={LIFELINE_TOP}
                x2={cx}
                y2={bottom}
                className="stroke-gray-300"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <g
                className={clickable ? 'cursor-pointer group' : ''}
                onClick={clickable ? () => onItemClick?.(p.ref) : undefined}
              >
                <rect
                  x={cx - PART_W / 2}
                  y={HEAD_TOP}
                  width={PART_W}
                  height={PART_H}
                  className={`${isSel ? pal.selectedFill : pal.itemFill} ${clickable ? pal.itemHover : ''} stroke-gray-300`}
                  strokeWidth="1"
                />
                <text
                  x={cx}
                  y={HEAD_TOP + PART_H / 2 + (nameLines.length === 1 ? 4 : -2)}
                  textAnchor="middle"
                  className={`text-2xs font-medium ${isSel ? 'fill-white' : pal.itemText}`}
                >
                  {nameLines.map((ln, li) => (
                    <tspan key={li} x={cx} dy={li === 0 ? 0 : 12}>
                      {ln}
                    </tspan>
                  ))}
                </text>
              </g>
            </g>
          )
        })}

        {/* Messages */}
        {messages.map((m, i) => {
          const y = FIRST_MSG + i * STEP
          const fi = idxOf[m.from]
          const ti = idxOf[m.to]
          if (fi === undefined || ti === undefined) return null
          const isReturn = m.kind === 'return'
          const marker = m.kind === 'async' || isReturn ? 'url(#seq-arrow-open)' : 'url(#seq-arrow)'
          const dash = isReturn ? '5 4' : undefined
          const label = m.data ? `${m.label}` : m.label

          if (fi === ti) {
            // Self-message: a small loop to the right of the lifeline.
            const x = colX(fi)
            return (
              <g key={i}>
                <path
                  d={`M ${x} ${y} h ${SELF_W} v 22 h ${-SELF_W}`}
                  className="fill-none stroke-gray-500"
                  strokeWidth="1.3"
                  strokeDasharray={dash}
                  markerEnd={marker}
                />
                <text x={x + SELF_W + 8} y={y + 4} className="text-[10.5px] fill-gray-700">
                  {label}
                </text>
                {m.data && (
                  <text x={x + SELF_W + 8} y={y + 17} className="text-[9.5px] italic fill-gray-400">
                    {m.data}
                  </text>
                )}
              </g>
            )
          }

          const x1 = colX(fi)
          const x2 = colX(ti)
          const midX = (x1 + x2) / 2
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                className="stroke-gray-500"
                strokeWidth="1.3"
                strokeDasharray={dash}
                markerEnd={marker}
              />
              <text x={midX} y={y - 6} textAnchor="middle" className="text-[10.5px] fill-gray-700">
                {label}
              </text>
              {m.data && (
                <text
                  x={midX}
                  y={y + 12}
                  textAnchor="middle"
                  className="text-[9.5px] italic fill-gray-400"
                >
                  {m.data}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function SequenceDiagram({ flows, domain, onItemClick, selectedId }) {
  const list = Array.isArray(flows) ? flows : []
  if (list.length === 0) return null
  return (
    <div className="divide-y divide-gray-200">
      {list.map((flow) => (
        <div key={flow.id} className="p-4">
          <h3 className="text-sm font-semibold text-gray-900">{flow.name}</h3>
          {flow.description && <p className="mt-0.5 text-xs text-gray-500">{flow.description}</p>}
          <div className="mt-3">
            <Flow flow={flow} domain={domain} onItemClick={onItemClick} selectedId={selectedId} />
          </div>
        </div>
      ))}
    </div>
  )
}
