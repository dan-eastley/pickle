// DEC-3 — decision narrative migration.
//
// New decisions carry split Context / Problem / Proposal fields; the legacy
// `narrative` is composed from them as "## Context … ## Problem … ## Proposal".
// Older decisions carry only `narrative`. parseNarrative is the inverse of that
// composition, so an old decision can be split back into the three fields when
// it is next edited (a backfill-on-edit migration).

export function parseNarrative(narrative = '') {
  const out = { context: '', problem: '', proposal: '' }
  if (!narrative) return out
  // Capture each "## Heading\n\n<body>" up to the next heading (or end).
  const re =
    /##\s*(Context|Problem|Proposal)\s*\n+([\s\S]*?)(?=\n#{1,6}\s*(?:Context|Problem|Proposal)\b|$)/gi
  let m
  let matched = false
  while ((m = re.exec(narrative))) {
    matched = true
    out[m[1].toLowerCase()] = m[2].trim()
  }
  // No recognisable headings → treat the whole thing as Context.
  if (!matched) out.context = narrative.trim()
  return out
}

// The Change fields for a decision, preferring the split fields and falling back
// to a parsed narrative for legacy records.
export function decisionChangeFields(d) {
  if (d?.context || d?.problem || d?.proposal) {
    return { context: d.context ?? '', problem: d.problem ?? '', proposal: d.proposal ?? '' }
  }
  return parseNarrative(d?.narrative ?? '')
}
