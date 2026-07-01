import { DOMAINS, DOMAIN_COLORS } from '../../lib/artefacts'

// Shared metric display: architecture content grouped by domain, colour-coded by
// domain. Rendered as a compact table — each domain is a column with a coloured
// header and label/count rows; counts sit right, in the domain colour. Used on
// the architectures list, the transitions page, the domains page (single), and
// atop artefacts, so the numbers read the same everywhere.

function MetricRow({ label, count, countColor }) {
  return (
    <div className="flex items-center justify-between gap-3 px-2.5 py-1 text-xs">
      <span className="min-w-0 truncate text-gray-600">{label}</span>
      <span className={`flex-shrink-0 tabular-nums font-semibold ${countColor}`}>{count}</span>
    </div>
  )
}

// Build one group per domain (in DOMAINS order) that has content, in the domain's
// colour. Document instances are folded into their owning domain.
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
    groups.push({ key: d.id, title: d.name, headerColor: c.text, countColor: c.text, items })
  }
  return groups
}

export default function MetricBars({ perDomain, governance, single = false, empty = null }) {
  const groups = domainGroups(perDomain)

  if (governance) {
    const items = [
      { label: 'Decisions', count: governance.decisions ?? 0 },
      { label: 'Discovery', count: governance.discoveries ?? 0 },
    ].filter((i) => i.count > 0)
    if (items.length > 0) {
      groups.push({
        key: 'gov',
        title: 'Governance',
        headerColor: 'text-gray-500',
        countColor: 'text-gray-700',
        items,
      })
    }
  }

  if (groups.length === 0) return empty

  // Single mode (one domain card, or an artefact): a compact bordered table with
  // no domain header — the surrounding card already names the domain/artefact.
  if (single) {
    const g = groups[0]
    return (
      <div className="inline-block min-w-[220px] border border-gray-200 divide-y divide-gray-100">
        {g.items.map((i) => (
          <MetricRow key={i.label} label={i.label} count={i.count} countColor={g.countColor} />
        ))}
      </div>
    )
  }

  // Full mode: a grid of domain columns. The 1px grid gap over a gray background
  // draws the clean dividing lines between columns/rows.
  return (
    <div className="grid gap-px border border-gray-200 bg-gray-200 [grid-template-columns:repeat(auto-fit,minmax(155px,1fr))]">
      {groups.map((g) => (
        <div key={g.key} className="flex flex-col bg-white">
          <div
            className={`px-2.5 py-1.5 text-xs font-bold border-b border-gray-200 ${g.headerColor}`}
          >
            {g.title}
          </div>
          <div className="divide-y divide-gray-100">
            {g.items.map((i) => (
              <MetricRow key={i.label} label={i.label} count={i.count} countColor={g.countColor} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
