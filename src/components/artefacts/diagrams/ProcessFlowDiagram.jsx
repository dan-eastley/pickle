import { getDiagramColors, wrapText } from '../../../lib/diagramTheme'

const VIEW_W = 1200
const OUTER_PAD = 16
const LABEL_W = 200
const LABEL_GAP = 14
const CHEV_H = 56
const CHEV_BODY_W = 150
const CHEV_POINT = 22
const STEP = CHEV_BODY_W // chevrons overlap: next starts CHEV_BODY_W from prev
const ROW_GAP = 8
const CHEV_X0 = OUTER_PAD + LABEL_W + LABEL_GAP

// Build absolute SVG polygon points for one chevron
function chevronPts(cx, y, w, h, pt, index) {
  const p =
    index === 0
      ? [
          [cx, y],
          [cx + w, y],
          [cx + w + pt, y + h / 2],
          [cx + w, y + h],
          [cx, y + h],
        ]
      : [
          [cx, y],
          [cx + w, y],
          [cx + w + pt, y + h / 2],
          [cx + w, y + h],
          [cx, y + h],
          [cx + pt, y + h / 2],
        ]
  return p.map(([x, py]) => `${x},${py}`).join(' ')
}

// Triangle that masks the previous chevron's point from showing through the notch
function notchMaskPts(cx, y, h, pt) {
  return `${cx},${y} ${cx + pt},${y + h / 2} ${cx},${y + h}`
}

function ProcessFlowSVG({ rows, colors, onItemClick, selectedId }) {
  const ROW_H = CHEV_H + ROW_GAP
  const totalH = OUTER_PAD * 2 + rows.length * ROW_H - ROW_GAP
  const sepX = OUTER_PAD + LABEL_W + LABEL_GAP / 2
  const LABEL_CHARS = Math.floor((LABEL_W - 8) / 6.5)
  const CHEV_CHARS = Math.floor((CHEV_BODY_W - CHEV_POINT - 10) / 6.5)

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${totalH}`} className="w-full h-auto">
      {/* Vertical separator between label and chevron area */}
      <line
        x1={sepX}
        y1={OUTER_PAD / 2}
        x2={sepX}
        y2={totalH - OUTER_PAD / 2}
        strokeWidth={1}
        className="stroke-gray-200"
      />

      {rows.map(({ group, items }, rowIndex) => {
        const y = OUTER_PAD + rowIndex * ROW_H
        const labelSel = selectedId === group.id
        const nameLines = wrapText(group.name, LABEL_CHARS, 2)

        return (
          <g key={group.id}>
            {/* Row divider */}
            {rowIndex > 0 && (
              <line
                x1={OUTER_PAD}
                y1={y - ROW_GAP / 2}
                x2={VIEW_W - OUTER_PAD}
                y2={y - ROW_GAP / 2}
                strokeWidth={1}
                className="stroke-gray-100"
              />
            )}

            {/* Label column (clickable = navigates to the item in the slide panel) */}
            <g
              onClick={() => onItemClick?.(group.id === selectedId ? null : group.id)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={OUTER_PAD} y={y} width={LABEL_W} height={CHEV_H} fill="transparent" />
              <text
                x={OUTER_PAD + 4}
                y={y + 13}
                className={`text-[9px] font-mono uppercase tracking-wide ${labelSel ? colors.heading : colors.label}`}
              >
                {group.id}
              </text>
              {nameLines.map((line, i) => (
                <text
                  key={i}
                  x={OUTER_PAD + 4}
                  y={y + 27 + i * 14}
                  className={`text-[11px] font-semibold ${labelSel ? colors.heading : 'fill-gray-700'}`}
                >
                  {line}
                </text>
              ))}
            </g>

            {/* Chevron sequence */}
            {items.map((item, i) => {
              const cx = CHEV_X0 + i * STEP
              const sel = selectedId === item.id
              // Center text x: first chevron has flat left, others have a notch
              const textCX = i === 0 ? cx + CHEV_BODY_W / 2 : cx + (CHEV_POINT + CHEV_BODY_W) / 2
              const nameLines = wrapText(item.name, CHEV_CHARS, 2)
              // Vertically center ID + name lines within CHEV_H
              const totalLinesH = (nameLines.length + 1) * 13
              const topBaseline = y + (CHEV_H - totalLinesH) / 2 + 11

              return (
                <g
                  key={item.id}
                  className="group"
                  onClick={() => onItemClick?.(item.id === selectedId ? null : item.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <title>{`${item.id}: ${item.name}`}</title>

                  {/* Mask the previous chevron's point in this chevron's own
                      fill, so the whole arrow reads as one solid colour. */}
                  {i > 0 && (
                    <polygon
                      points={notchMaskPts(cx, y, CHEV_H, CHEV_POINT)}
                      className={`transition-colors ${sel ? colors.selectedFill : `${colors.itemFill} ${colors.itemHover}`}`}
                    />
                  )}

                  {/* Chevron polygon */}
                  <polygon
                    points={chevronPts(cx, y, CHEV_BODY_W, CHEV_H, CHEV_POINT, i)}
                    className={`transition-colors ${sel ? colors.selectedFill : `${colors.itemFill} ${colors.itemHover}`}`}
                  />

                  {/* ID */}
                  <text
                    x={textCX}
                    y={topBaseline}
                    textAnchor="middle"
                    className={`text-[8px] font-mono uppercase tracking-wide ${sel ? colors.selectedId : colors.label}`}
                  >
                    {item.id}
                  </text>

                  {/* Name lines */}
                  {nameLines.map((line, li) => (
                    <text
                      key={li}
                      x={textCX}
                      y={topBaseline + 13 + li * 13}
                      textAnchor="middle"
                      className={`text-[11px] font-medium ${sel ? 'fill-white' : colors.itemText}`}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

export default function ProcessFlowDiagram({ groups, domain, onItemClick, selectedId }) {
  const colors = getDiagramColors(domain)

  const hasL3 = groups.some((g) => g.items?.some((item) => item.items?.length))

  // Overview: rows = L1 groups, items = L2 steps
  const overviewRows = groups.map((g) => ({ group: g, items: g.items ?? [] }))

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <h4 className="text-sm font-semibold text-gray-800">Overview</h4>
        <span className="text-xs text-gray-500">Level 1 and 2</span>
      </div>
      <ProcessFlowSVG
        rows={overviewRows}
        colors={colors}
        onItemClick={onItemClick}
        selectedId={selectedId}
      />

      {hasL3 &&
        groups.map((group) => (
          <div key={group.id} className="mt-6 pt-5 border-t border-gray-200">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-mono text-xs text-gray-500">{group.id}</span>
              <h4 className="text-sm font-semibold text-gray-800">{group.name}</h4>
              <span className="text-xs text-gray-500">Level 2 and 3</span>
            </div>
            {/* Drill-down: rows = L2 steps, items = L3 steps */}
            <ProcessFlowSVG
              rows={(group.items ?? []).map((item) => ({ group: item, items: item.items ?? [] }))}
              colors={colors}
              onItemClick={onItemClick}
              selectedId={selectedId}
            />
          </div>
        ))}
    </div>
  )
}
