import { getDiagramColors, IMPORTANCE_COLORS, DIAGRAM_VARIANTS } from '../../../lib/diagramTheme'

const VIEW_WIDTH = 1200
const OUTER_PADDING = 20
const GROUP_GAP = 16
const GROUP_PADDING = 14
const GROUP_HEADER_HEIGHT = 52
const ITEM_GAP = 8
const ITEM_HEIGHT = 48
const ITEM_MIN_WIDTH = 110
const ITEM_PADDING = 8

function wrapText(text, maxChars, maxLines = 2) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  if (lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines)
    let last = truncated[maxLines - 1]
    if (last.length > maxChars - 1) last = last.slice(0, maxChars - 1)
    truncated[maxLines - 1] = last.replace(/\s+$/, '') + '…'
    return truncated
  }
  return lines
}

function WrappedText({ text, x, y, maxChars, maxLines, lineHeight, className }) {
  const lines = wrapText(text, maxChars, maxLines)
  return (
    <text x={x} y={y} className={className}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lineHeight}>{line}</tspan>
      ))}
    </text>
  )
}

function ImportanceBadge({ importance, right, top }) {
  const colors = IMPORTANCE_COLORS[importance]
  if (!colors) return null
  const label = importance.charAt(0).toUpperCase() + importance.slice(1)
  const width = label.length * 5.5 + 14
  return (
    <g>
      <title>{`Importance: ${label}`}</title>
      <rect x={right - width} y={top} width={width} height={16} className={colors.fill} />
      <text x={right - width / 2} y={top + 11} textAnchor="middle" className={`text-[9px] font-medium ${colors.text}`}>
        {label}
      </text>
    </g>
  )
}

function GroupGrid({ groups, colors, variant, onItemClick, selectedId }) {
  const groupCols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(groups.length || 1))))
  const groupWidth = (VIEW_WIDTH - OUTER_PADDING * 2 - GROUP_GAP * (groupCols - 1)) / groupCols
  const itemCols = Math.max(1, Math.floor((groupWidth - GROUP_PADDING * 2 + ITEM_GAP) / (ITEM_MIN_WIDTH + ITEM_GAP)))
  const itemWidth = (groupWidth - GROUP_PADDING * 2 - ITEM_GAP * (itemCols - 1)) / itemCols
  const itemMaxChars = Math.floor((itemWidth - ITEM_PADDING * 2) / 5.5)
  const groupMaxChars = Math.floor((groupWidth - GROUP_PADDING * 2) / 6.5)

  const groupHeight = (group) => {
    const rows = group.items?.length ? Math.ceil(group.items.length / itemCols) : 0
    return GROUP_HEADER_HEIGHT + GROUP_PADDING * 2 + (rows > 0 ? rows * ITEM_HEIGHT + (rows - 1) * ITEM_GAP : 0)
  }

  const rows = []
  for (let i = 0; i < groups.length; i += groupCols) rows.push(groups.slice(i, i + groupCols))

  const positioned = []
  let y = OUTER_PADDING
  for (const row of rows) {
    const rowHeight = Math.max(...row.map(groupHeight))
    row.forEach((group, i) => {
      positioned.push({ group, x: OUTER_PADDING + i * (groupWidth + GROUP_GAP), y, height: rowHeight })
    })
    y += rowHeight + GROUP_GAP
  }
  const totalHeight = y - GROUP_GAP + OUTER_PADDING

  return (
    <svg viewBox={`0 0 ${VIEW_WIDTH} ${totalHeight}`} className="w-full h-auto" role="img">
      {positioned.map(({ group, x, y, height }) => {
        const groupSelected = selectedId === group.id
        return (
          <g key={group.id}>
            <rect x={x} y={y} width={groupWidth} height={height} rx={variant.groupRadius}
              strokeWidth={groupSelected ? 2 : 1}
              className={`${colors.groupFill} ${groupSelected ? colors.groupStroke.replace('stroke-', 'stroke-') : colors.groupStroke} ${onItemClick ? 'cursor-pointer' : ''}`}
              onClick={onItemClick ? () => onItemClick(group.id) : undefined}
            />
            <text x={x + GROUP_PADDING} y={y + 18} className={`text-[9px] font-mono uppercase tracking-wide ${colors.label}`}>
              {group.id}
            </text>
            {group.meta?.importance && (
              <ImportanceBadge importance={group.meta.importance} right={x + groupWidth - GROUP_PADDING} top={y + 10} />
            )}
            <WrappedText
              text={group.name}
              x={x + GROUP_PADDING}
              y={y + 35}
              maxChars={groupMaxChars}
              maxLines={2}
              lineHeight={15}
              className={`text-[13px] font-semibold ${colors.heading} ${onItemClick ? 'cursor-pointer' : ''}`}
            />
            {group.items?.map((item, i) => {
              const col = i % itemCols
              const row = Math.floor(i / itemCols)
              const ix = x + GROUP_PADDING + col * (itemWidth + ITEM_GAP)
              const iy = y + GROUP_HEADER_HEIGHT + row * (ITEM_HEIGHT + ITEM_GAP)
              const itemSelected = selectedId === item.id
              return (
                <g key={item.id}
                  style={{ cursor: onItemClick ? 'pointer' : 'default' }}
                  onClick={onItemClick ? (e) => { e.stopPropagation(); onItemClick(item.id) } : undefined}>
                  <title>{`${item.id}: ${item.name}`}</title>
                  <rect x={ix} y={iy} width={itemWidth} height={ITEM_HEIGHT} rx={variant.itemRadius}
                    strokeWidth={itemSelected ? 1.5 : 1}
                    className={`${itemSelected ? 'fill-brand-50 stroke-brand-400' : `${variant.itemFill} ${colors.itemStroke}`}`} />
                  <text x={ix + ITEM_PADDING} y={iy + 13} className="text-[8px] font-mono uppercase tracking-wide fill-gray-400">
                    {item.id}
                  </text>
                  <WrappedText
                    text={item.name}
                    x={ix + ITEM_PADDING}
                    y={iy + 27}
                    maxChars={itemMaxChars}
                    maxLines={2}
                    lineHeight={13}
                    className={`text-[11px] font-medium ${itemSelected ? 'fill-brand-700' : 'fill-gray-700'}`}
                  />
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

export default function NestedGroupDiagram({ groups, domain, diagramType, onItemClick, selectedId }) {
  const colors = getDiagramColors(domain)
  const variant = DIAGRAM_VARIANTS[diagramType] ?? DIAGRAM_VARIANTS['card-based']
  const hasThirdLevel = groups.some(g => g.items?.some(item => item.items?.length))

  if (!hasThirdLevel) {
    return (
      <GroupGrid
        groups={groups} colors={colors} variant={variant}
        onItemClick={onItemClick} selectedId={selectedId}
      />
    )
  }

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <h4 className="text-sm font-semibold text-gray-800">Overview</h4>
        <span className="text-xs text-gray-400">Level 1 and 2</span>
      </div>
      <GroupGrid
        groups={groups} colors={colors} variant={variant}
        onItemClick={onItemClick} selectedId={selectedId}
      />
      {groups.map(group => (
        <div key={group.id} className="mt-6 pt-5 border-t border-gray-200">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-mono text-xs text-gray-400">{group.id}</span>
            <h4 className="text-sm font-semibold text-gray-800">{group.name}</h4>
            <span className="text-xs text-gray-400">Level 2 and 3</span>
          </div>
          <GroupGrid
            groups={(group.items ?? []).map(item => ({ ...item, items: item.items ?? [] }))}
            colors={colors}
            variant={variant}
            onItemClick={onItemClick}
            selectedId={selectedId}
          />
        </div>
      ))}
    </div>
  )
}
