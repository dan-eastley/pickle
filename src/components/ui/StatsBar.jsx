// Stats strip (HANDOFF §5). Attaches directly beneath a PageActionBar (shares
// the card edge — no top border). Left: stat cells (big number over a small
// uppercase label), divided by hairlines. Right: optional meta (e.g. "Updated
// {date} by {user}") and utility nodes (Share / Download / filename chip).
//
// Props:
//   stats  — [{ label, value }]
//   meta   — right-side node (string or element), shown before utilities.
//   right  — utility nodes (buttons, filename chip).
export default function StatsBar({ stats = [], meta, right, className = '' }) {
  return (
    <div
      className={`bg-white border border-t-0 border-gray-200 flex items-stretch flex-wrap justify-between ${className}`}
    >
      <div className="flex items-stretch divide-x divide-gray-100">
        {stats.map((s, i) => (
          <div key={i} className="px-5 py-2.5">
            <div className="text-[19px] font-semibold text-gray-900 tabular-nums leading-tight">
              {s.value}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      {(meta || right) && (
        <div className="flex items-center gap-3 px-4 py-2 ml-auto">
          {meta && <span className="text-[12px] text-gray-500">{meta}</span>}
          {meta && right && <span className="h-4 w-px bg-gray-200" />}
          {right}
        </div>
      )}
    </div>
  )
}
