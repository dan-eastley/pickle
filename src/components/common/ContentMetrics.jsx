// Shared, consistent display for architecture *content* metrics — the counts of
// capabilities, processes, concepts, interfaces, documents, decisions, etc.
// Used on the clients, versions, and domains pages so the presentation is
// identical everywhere. Zero-valued stats are never rendered.
import { Link } from 'react-router-dom'

// One stat: a prominent number, a label, and an optional per-level breakdown.
function Stat({ label, count, sub, to }) {
  const body = (
    <>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-semibold text-gray-900 tabular-nums leading-none">
          {count}
        </span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      {sub?.length > 0 && (
        <div className="mt-1 text-[11px] text-gray-500 tabular-nums">
          {sub.map((s, i) => (
            <span key={s.label}>
              {i > 0 && <span className="text-gray-300"> · </span>}
              {s.label} {s.count}
            </span>
          ))}
        </div>
      )}
    </>
  )
  const cls = 'px-3 py-2 bg-gray-50 border border-gray-100'
  return to ? (
    <Link to={to} className={`${cls} block hover:border-gray-300 transition-colors`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

// A responsive grid of content stats. `items` is [{ label, count, sub? }];
// `extra` is an optional trailing list of governance stats (with links).
export default function ContentMetrics({ items = [], extra = [], dense = false, empty = null }) {
  const stats = [...items.filter((i) => i.count > 0), ...extra.filter((i) => i.count > 0)]
  if (stats.length === 0) return empty

  return (
    <div
      className={`grid gap-2 ${
        dense ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      }`}
    >
      {stats.map((s) => (
        <Stat key={s.label} label={s.label} count={s.count} sub={s.sub} to={s.to} />
      ))}
    </div>
  )
}
