import { getDiagramColors, DIAGRAM_VARIANTS, wrapText } from '../../../lib/diagramTheme'
import { enumValueStyle, enumValueLabel } from '../../../lib/enums'

const VIEW_WIDTH = 1200
const OUTER_PADDING = 20
const GROUP_GAP = 16
const GROUP_PADDING = 14
const GROUP_HEADER_HEIGHT = 52
const ITEM_GAP = 8
const ITEM_HEIGHT = 48
const ITEM_MIN_WIDTH = 110
const ITEM_PADDING = 8

function WrappedText({ text, x, y, maxChars, maxLines, lineHeight, className }) {
  const lines = wrapText(text, maxChars, maxLines)
  return (
    <text x={x} y={y} className={className}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

// Renders a badge for every enum value in a node's `meta`, laid out right-to-left
// from `right`. Standardised colours/labels via lib/enums ([UI-15]).
function MetaBadges({ meta, right, top }) {
  if (!meta) return null
  const entries = Object.entries(meta).filter(([, v]) => v != null && typeof v !== 'object')
  if (entries.length === 0) return null
  let x = right
  const badges = entries.map(([key, value]) => {
    const style = enumValueStyle(key, value)
    const label = enumValueLabel(value)
    const width = label.length * 5.5 + 14
    x -= width
    const bx = x
    x -= 4
    return (
      <g key={key}>
        <title>{`${enumValueLabel(key)}: ${label}`}</title>
        <rect x={bx} y={top} width={width} height={16} className={style.fill} />
        <text
          x={bx + width / 2}
          y={top + 11}
          textAnchor="middle"
          className={`text-[9px] font-medium ${style.textFill}`}
        >
          {label}
        </text>
      </g>
    )
  })
  return <g>{badges}</g>
}

function GroupGrid({ groups, colors, variant, onItemClick, selectedId }) {
  const groupCols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(groups.length || 1))))
  const groupWidth = (VIEW_WIDTH - OUTER_PADDING * 2 - GROUP_GAP * (groupCols - 1)) / groupCols
  const itemCols = Math.max(
    1,
    Math.floor((groupWidth - GROUP_PADDING * 2 + ITEM_GAP) / (ITEM_MIN_WIDTH + ITEM_GAP))
  )
  const itemWidth = (groupWidth - GROUP_PADDING * 2 - ITEM_GAP * (itemCols - 1)) / itemCols
  const itemMaxChars = Math.floor((itemWidth - ITEM_PADDING * 2) / 5.5)
  const groupMaxChars = Math.floor((groupWidth - GROUP_PADDING * 2) / 6.5)

  const groupHeight = (group) => {
    const rows = group.items?.length ? Math.ceil(group.items.length / itemCols) : 0
    return (
      GROUP_HEADER_HEIGHT +
      GROUP_PADDING * 2 +
      (rows > 0 ? rows * ITEM_HEIGHT + (rows - 1) * ITEM_GAP : 0)
    )
  }

  const rows = []
  for (let i = 0; i < groups.length; i += groupCols) rows.push(groups.slice(i, i + groupCols))

  const positioned = []
  let y = OUTER_PADDING
  for (const row of rows) {
    const rowHeight = Math.max(...row.map(groupHeight))
    row.forEach((group, i) => {
      positioned.push({
        group,
        x: OUTER_PADDING + i * (groupWidth + GROUP_GAP),
        y,
        height: rowHeight,
      })
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
            <rect
              x={x}
              y={y}
              width={groupWidth}
              height={height}
              rx={variant.groupRadius}
              className={`${groupSelected ? colors.itemFill : colors.groupFill} ${onItemClick ? 'cursor-pointer' : ''}`}
              onClick={onItemClick ? () => onItemClick(group.id) : undefined}
            />
            <text
              x={x + GROUP_PADDING}
              y={y + 18}
              className={`text-[9px] font-mono uppercase tracking-wide ${colors.label}`}
            >
              {group.id}
            </text>
            <MetaBadges meta={group.meta} right={x + groupWidth - GROUP_PADDING} top={y + 10} />
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
                <g
                  key={item.id}
                  className="group"
                  style={{ cursor: onItemClick ? 'pointer' : 'default' }}
                  onClick={
                    onItemClick
                      ? (e) => {
                          e.stopPropagation()
                          onItemClick(item.id)
                        }
                      : undefined
                  }
                >
                  <title>{`${item.id}: ${item.name}`}</title>
                  <rect
                    x={ix}
                    y={iy}
                    width={itemWidth}
                    height={ITEM_HEIGHT}
                    rx={variant.itemRadius}
                    className={`transition-colors ${itemSelected ? colors.selectedFill : `${colors.itemFill} ${onItemClick ? colors.itemHover : ''}`}`}
                  />
                  <text
                    x={ix + ITEM_PADDING}
                    y={iy + 13}
                    className={`text-[8px] font-mono uppercase tracking-wide ${itemSelected ? colors.selectedId : 'fill-gray-400'}`}
                  >
                    {item.id}
                  </text>
                  <WrappedText
                    text={item.name}
                    x={ix + ITEM_PADDING}
                    y={iy + 27}
                    maxChars={itemMaxChars}
                    maxLines={2}
                    lineHeight={13}
                    className={`text-2xs font-medium ${itemSelected ? 'fill-white' : colors.itemText}`}
                  />
                  <MetaBadges meta={item.meta} right={ix + itemWidth - ITEM_PADDING} top={iy + 4} />
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

export default function NestedGroupDiagram({
  groups,
  domain,
  diagramType,
  onItemClick,
  selectedId,
}) {
  const colors = getDiagramColors(domain)
  const variant = DIAGRAM_VARIANTS[diagramType] ?? DIAGRAM_VARIANTS['card-based']
  const hasThirdLevel = groups.some((g) => g.items?.some((item) => item.items?.length))

  if (!hasThirdLevel) {
    return (
      <GroupGrid
        groups={groups}
        colors={colors}
        variant={variant}
        onItemClick={onItemClick}
        selectedId={selectedId}
      />
    )
  }

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <h4 className="text-sm font-semibold text-gray-800">Overview</h4>
        <span className="text-xs text-gray-500">Level 1 and 2</span>
      </div>
      <GroupGrid
        groups={groups}
        colors={colors}
        variant={variant}
        onItemClick={onItemClick}
        selectedId={selectedId}
      />
      {groups.map((group) => (
        <div key={group.id} className="mt-6 pt-5 border-t border-gray-200">
          <div className="mb-3">
            <span className="block font-mono text-xs text-gray-500">{group.id}</span>
            <div className="flex items-baseline gap-2">
              <h4 className="text-sm font-semibold text-gray-800">{group.name}</h4>
              <span className="text-xs text-gray-500">Level 2 and 3</span>
            </div>
          </div>
          <GroupGrid
            groups={(group.items ?? []).map((item) => ({ ...item, items: item.items ?? [] }))}
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
