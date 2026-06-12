import { getDiagramColors, IMPORTANCE_COLORS, DIAGRAM_VARIANTS } from '../../../lib/diagramTheme'

// Layout constants — tuned so a typical 9-12 group diagram fits close to a
// single 16:9 slide when exported. All sizes are in SVG user units (viewBox),
// so the diagram scales losslessly to whatever size it's embedded at.
const VIEW_WIDTH = 1200
const OUTER_PADDING = 20
const GROUP_GAP = 16
const GROUP_PADDING = 14
const GROUP_HEADER_HEIGHT = 52
const ITEM_GAP = 8
const ITEM_HEIGHT = 48
const ITEM_MIN_WIDTH = 110
const ITEM_PADDING = 8

// Greedy word-wrap for SVG <text>, which doesn't wrap on its own. Truncates
// with an ellipsis if the text still doesn't fit in maxLines.
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

// Renders a small pill in the top-right of a group card for additional
// per-item meta info (currently just "importance" on BUS-BCM groups). Other
// meta keys are ignored — this is the extension point for future attributes.
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

// One grid of group cards, each containing a wrapped grid of item cards.
// Rendered as a standalone SVG; NestedGroupDiagram composes one or more of
// these (overview plus optional per-group drill-downs).
function GroupGrid({ groups, colors, variant }) {
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
      {positioned.map(({ group, x, y, height }) => (
        <g key={group.id}>
          <rect x={x} y={y} width={groupWidth} height={height} rx={variant.groupRadius}
            strokeWidth={1} className={`${colors.groupFill} ${colors.groupStroke}`} />
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
            className={`text-[13px] font-semibold ${colors.heading}`}
          />
          {group.items?.map((item, i) => {
            const col = i % itemCols
            const row = Math.floor(i / itemCols)
            const ix = x + GROUP_PADDING + col * (itemWidth + ITEM_GAP)
            const iy = y + GROUP_HEADER_HEIGHT + row * (ITEM_HEIGHT + ITEM_GAP)
            return (
              <g key={item.id}>
                <title>{`${item.id}: ${item.name}`}</title>
                <rect x={ix} y={iy} width={itemWidth} height={ITEM_HEIGHT} rx={variant.itemRadius}
                  strokeWidth={1} className={`${variant.itemFill} ${colors.itemStroke}`} />
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
                  className="text-[11px] font-medium fill-gray-700"
                />
              </g>
            )
          })}
        </g>
      ))}
    </svg>
  )
}

/**
 * Generic "groups containing items" diagram — a grid of group cards, each
 * containing a wrapped grid of item cards. Used for both card-based diagrams
 * (e.g. BUS-BCM, capabilities -> sub-capabilities) and entity-based diagrams
 * (e.g. DAT-CDM, data domains -> concepts). The two diagram types share this
 * layout algorithm and theme, and differ only via DIAGRAM_VARIANTS.
 *
 * `groups` is `[{ id, name, meta?, items: [{ id, name, meta?, items? }] }]`.
 *
 * When any item carries a third level of nested `items`, the overview grid
 * (levels 1-2) is followed by one drill-down grid per group: its items become
 * the group cards, with their nested items as the cards inside.
 */
export default function NestedGroupDiagram({ groups, domain, diagramType }) {
  const colors = getDiagramColors(domain)
  const variant = DIAGRAM_VARIANTS[diagramType] ?? DIAGRAM_VARIANTS['card-based']

  const hasThirdLevel = groups.some(g => g.items?.some(item => item.items?.length))

  if (!hasThirdLevel) {
    return <GroupGrid groups={groups} colors={colors} variant={variant} />
  }

  return (
    <div>
      {/* Overview — levels 1 and 2 on a single grid */}
      <div className="flex items-baseline gap-2 mb-3">
        <h4 className="text-sm font-semibold text-gray-800">Overview</h4>
        <span className="text-xs text-gray-400">Level 1 and 2</span>
      </div>
      <GroupGrid groups={groups} colors={colors} variant={variant} />

      {/* Drill-down — one grid per group, its items as cards containing the third level */}
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
          />
        </div>
      ))}
    </div>
  )
}
