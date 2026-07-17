import { DOMAINS, DOMAIN_COLORS } from '../../lib/artefacts'

// Shared metric display: architecture content grouped by domain, colour-coded by
// domain. Each domain is a column with a bold coloured title; each row shows a
// label, a count (right, in the domain colour), and a proportional bar beneath.
// Bars are scaled per-column (sqrt, so smaller values stay visible) so the
// tallest count in a domain fills the track. Used on the architectures list, the
// transitions page, the domains page (single), and atop artefacts.

// sqrt scaling keeps small counts legible while the column max fills the track.
function barPct(count, max) {
  if (!max || count <= 0) return 0
  return Math.max(6, Math.round(Math.sqrt(count / max) * 100))
}

function MetricRow({ label, count, max, barColor, countColor }) {
  return (
    <div className="py-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-sm text-gray-700">{label}</span>
        <span className={`flex-shrink-0 tabular-nums text-sm font-semibold ${countColor}`}>
          {count}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full bg-gray-100">
        <div className={`h-full ${barColor}`} style={{ width: `${barPct(count, max)}%` }} />
      </div>
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
    groups.push({
      key: d.id,
      title: d.name,
      headerColor: c.text,
      countColor: c.text,
      barColor: c.dot,
      items,
    })
  }
  return groups
}

function withMax(g) {
  return { ...g, max: Math.max(...g.items.map((i) => i.count), 1) }
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
        barColor: 'bg-gray-400',
        items,
      })
    }
  }

  if (groups.length === 0) return empty

  // Single mode (one domain card, or an artefact): just the rows — the
  // surrounding card already names the domain/artefact.
  if (single) {
    const g = withMax(groups[0])
    return (
      <div className="min-w-[220px] space-y-1">
        {g.items.map((i) => (
          <MetricRow
            key={i.label}
            label={i.label}
            count={i.count}
            max={g.max}
            barColor={g.barColor}
            countColor={g.countColor}
          />
        ))}
      </div>
    )
  }

  // Full mode: a row of domain columns, each headed by its bold coloured name,
  // separated by thin vertical rules.
  return (
    <div className="grid gap-x-8 gap-y-6 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
      {groups.map(withMax).map((g, gi) => (
        <div
          key={g.key}
          className={gi === 0 ? 'min-w-0' : 'min-w-0 border-l border-gray-200 pl-6'}
        >
          <h4 className={`mb-2 text-sm font-bold ${g.headerColor}`}>{g.title}</h4>
          <div className="space-y-1">
            {g.items.map((i) => (
              <MetricRow
                key={i.label}
                label={i.label}
                count={i.count}
                max={g.max}
                barColor={g.barColor}
                countColor={g.countColor}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
