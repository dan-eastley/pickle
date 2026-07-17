// DEC-3 — decision narrative migration.
//
// New decisions carry split Context / Problem / Proposal fields; the legacy
// `narrative` is composed from them as "## Context … ## Problem … ## Proposal"
// (composeNarrative). Older decisions carry only `narrative`. parseNarrative is
// the inverse of that composition, so an old decision can be split back into
// the three fields when it is next edited (a backfill-on-edit migration).
//
// TypeScript (not .js) so the serverless functions — compiled with
// allowJs: false — can share it; the SPA imports it extensionlessly via Vite.

export interface NarrativeFields {
  context: string
  problem: string
  proposal: string
}

interface NarrativeSource extends Partial<NarrativeFields> {
  narrative?: string
}

// Compose the legacy single `narrative` string from the split fields, falling
// back to an existing narrative when none of the split fields are present.
// Retained for downstream workflows/prompts that still read the legacy field.
export function composeNarrative({
  context,
  problem,
  proposal,
  narrative,
}: NarrativeSource): string {
  const parts = [
    context && `## Context\n\n${context}`,
    problem && `## Problem\n\n${problem}`,
    proposal && `## Proposal\n\n${proposal}`,
  ].filter(Boolean)
  return parts.length ? parts.join('\n\n') : (narrative ?? '')
}

export function parseNarrative(narrative = ''): NarrativeFields {
  const out: NarrativeFields = { context: '', problem: '', proposal: '' }
  if (!narrative) return out
  // Capture each "## Heading\n\n<body>" up to the next heading (or end).
  const re =
    /##\s*(Context|Problem|Proposal)\s*\n+([\s\S]*?)(?=\n#{1,6}\s*(?:Context|Problem|Proposal)\b|$)/gi
  let m
  let matched = false
  while ((m = re.exec(narrative))) {
    matched = true
    out[m[1].toLowerCase() as keyof NarrativeFields] = m[2].trim()
  }
  // No recognisable headings → treat the whole thing as Context.
  if (!matched) out.context = narrative.trim()
  return out
}

// The Change fields for a decision, preferring the split fields and falling back
// to a parsed narrative for legacy records.
export function decisionChangeFields(d?: NarrativeSource | null): NarrativeFields {
  if (d?.context || d?.problem || d?.proposal) {
    return { context: d.context ?? '', problem: d.problem ?? '', proposal: d.proposal ?? '' }
  }
  return parseNarrative(d?.narrative ?? '')
}
