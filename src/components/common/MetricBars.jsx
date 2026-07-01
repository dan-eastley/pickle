import { DOMAINS, DOMAIN_COLORS } from '../../lib/artefacts'

// Shared metric display: architecture content grouped by domain, colour-coded by
// domain, as a simple bar chart with uniform text-xs. Used on the architectures
// list, the transitions page, the domains page, and atop artefacts so the
// numbers read the same everywhere. Bars are scaled to each group's own max so
// every group stays readable; the number gives the precise value.

function BarRow({ label, count, max, bar }) {
  const pct = max > 0 ? Math.max(3, Math.round((count / max) * 100)) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 sm:w-32 flex-shrink-0 text-gray-500 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100">
        <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-9 flex-shrink-0 text-right tabular-nums font-medium text-gray-700">
        {count}
      </span>
    </div>
  )
}

function Group({ title, text, dot, bar, items, showTitle = true }) {
  const max = Math.max(1, ...items.map((i) => i.count))
  return (
    <div>
      {showTitle && (
        <div className={`mb-1.5 flex items-center gap-1.5 text-xs font-semibold ${text}`}>
          <span className={`h-2 w-2 ${dot}`} />
          {title}
        </div>
      )}
      <div className={`space-y-1 ${showTitle ? 'pl-3.5' : ''}`}>
        {items.map((i) => (
          <BarRow key={i.label} label={i.label} count={i.count} max={max} bar={bar} />
        ))}
      </div>
    </div>
  )
}

// Build one group per domain (in DOMAINS order) that has content, in the
// domain's colour. Document instances are folded into their owning domain.
function domainGroups(perDomain) {
  const groups = []
  for (const d of DOMAINS) {
    const dm = perDomain?.[d.id]
    const items = (dm?.items ?? [])
      .filter((i) => i.count > 0)
      .map((i) => ({ label: i.label, count: i.count }))
    if (dm?.documents) items.push({ label: 'Documents', count: dm.documents })
    if (items.length === 0) continue
    const c = DOMAIN_COLORS[d.id]
    groups.push({ key: d.id, title: d.name, text: c.text, dot: c.dot, bar: c.dot, items })
  }
  return groups
}

export default function MetricBars({ perDomain, governance, single = false, empty = null }) {
  const groups = domainGroups(perDomain)

  if (governance) {
    const items = [
      { label: 'Decisions', count: governance.decisions ?? 0 },
      { label: 'Discoveries', count: governance.discoveries ?? 0 },
    ].filter((i) => i.count > 0)
    if (items.length > 0) {
      groups.push({
        key: 'gov',
        title: 'Governance',
        text: 'text-gray-600',
        dot: 'bg-gray-400',
        bar: 'bg-gray-400',
        items,
      })
    }
  }

  if (groups.length === 0) return empty

  // `single` (e.g. one domain card, or an artefact) hides the group heading,
  // since the surrounding card already names the domain/artefact.
  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <Group key={g.key} {...g} showTitle={!single} />
      ))}
    </div>
  )
}
