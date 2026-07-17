import { DOMAINS, DOMAIN_COLORS } from '../../lib/artefacts'

// Shared metric display: architecture content as bordered stat chips, colour-coded
// by domain (the count takes the domain colour, the label stays muted). Used on
// the architectures list, the transitions page, the domains overview, and the
// domain page — so the numbers read the same everywhere. Documents fold into
// their owning domain; governance counts (decisions/discovery) render in gray.

function Chip({ label, count, colorText }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-gray-200 px-2.5 py-1 text-xs">
      <span className={`font-semibold tabular-nums ${colorText}`}>{count}</span>
      <span className="text-gray-500">{label}</span>
    </span>
  )
}

// Flatten per-domain content into a single chip list (in DOMAINS order), each
// chip tagged with its domain's text colour.
function domainChips(perDomain) {
  const chips = []
  for (const d of DOMAINS) {
    const dm = perDomain?.[d.id]
    const colorText = DOMAIN_COLORS[d.id].text
    for (const i of dm?.items ?? []) {
      if (i.count > 0) chips.push({ label: i.label, count: i.count, colorText })
    }
    if (dm?.documents) chips.push({ label: 'Documents', count: dm.documents, colorText })
  }
  return chips
}

export default function MetricBars({ perDomain, governance, single = false, empty = null }) {
  let chips = domainChips(perDomain)

  // Single mode = one domain card / artefact: keep only that domain's chips
  // (perDomain already holds a single entry in that case).
  if (single) chips = domainChips(perDomain)

  if (governance) {
    const gov = [
      { label: 'Decisions', count: governance.decisions ?? 0 },
      { label: 'Discovery', count: governance.discoveries ?? 0 },
    ].filter((i) => i.count > 0)
    for (const i of gov) chips.push({ label: i.label, count: i.count, colorText: 'text-gray-700' })
  }

  if (chips.length === 0) return empty

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {chips.map((c) => (
        <Chip key={c.label} label={c.label} count={c.count} colorText={c.colorText} />
      ))}
    </div>
  )
}
