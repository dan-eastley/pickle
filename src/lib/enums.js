// Standardised enum-meta styling for entities across models ([UI-15]).
// Entities can carry enum attributes in their `meta` (e.g. capability
// `importance`, process `type`, application `status`/`lifecycle`). This module
// gives every such value one consistent look — a coloured dot/badge (HTML) and
// matching SVG fills — plus a legend, so a new enum "just works" when added to
// diagram data without bespoke styling.

import { humanize } from './format'

// A small, fixed palette. Each colour carries every token variant a badge or an
// SVG label needs, so callers never hand-pick Tailwind classes.
const PALETTE = {
  violet: {
    dot: 'bg-violet-500',
    badge: 'bg-violet-100 text-violet-800',
    fill: 'fill-violet-200',
    textFill: 'fill-violet-800',
  },
  blue: {
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800',
    fill: 'fill-blue-200',
    textFill: 'fill-blue-800',
  },
  emerald: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800',
    fill: 'fill-emerald-200',
    textFill: 'fill-emerald-800',
  },
  amber: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800',
    fill: 'fill-amber-200',
    textFill: 'fill-amber-800',
  },
  rose: {
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800',
    fill: 'fill-rose-200',
    textFill: 'fill-rose-800',
  },
  cyan: {
    dot: 'bg-cyan-500',
    badge: 'bg-cyan-100 text-cyan-800',
    fill: 'fill-cyan-200',
    textFill: 'fill-cyan-800',
  },
  gray: {
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-700',
    fill: 'fill-gray-200',
    textFill: 'fill-gray-700',
  },
}
const FALLBACK_ORDER = ['violet', 'blue', 'emerald', 'amber', 'rose', 'cyan', 'gray']

// Human label for an enum key (fallback: Title Case of the key).
const ENUM_LABELS = {
  importance: 'Importance',
  type: 'Type',
  status: 'Status',
  lifecycle: 'Lifecycle',
  criticality: 'Criticality',
}

// Explicit value → palette-colour overrides, where a natural mapping exists.
// Any value not listed is assigned a stable colour by hashing (see below).
const ENUM_VALUE_COLORS = {
  importance: { strategic: 'violet', differentiating: 'blue', foundational: 'gray' },
  lifecycle: {
    invest: 'emerald',
    adopt: 'blue',
    tolerate: 'amber',
    migrate: 'amber',
    contain: 'amber',
    eliminate: 'rose',
    retire: 'rose',
  },
  status: {
    active: 'emerald',
    current: 'emerald',
    planned: 'blue',
    deprecated: 'amber',
    retired: 'rose',
  },
}

// Stable hash so an unmapped value always gets the same colour.
function hashColour(value) {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return FALLBACK_ORDER[h % FALLBACK_ORDER.length]
}

export function enumLabel(enumKey) {
  return ENUM_LABELS[enumKey] ?? enumKey.charAt(0).toUpperCase() + enumKey.slice(1)
}

// Title-case a value for display (e.g. "system-of-engagement" → "System Of Engagement").
export function enumValueLabel(value) {
  return humanize(value)
}

// The full style token set for an (enum, value): { dot, badge, fill, textFill }.
export function enumValueStyle(enumKey, value) {
  const colour = ENUM_VALUE_COLORS[enumKey]?.[value] ?? hashColour(String(value))
  return PALETTE[colour]
}

// Walk a diagram's groups (and their nested items) and collect every enum key
// present in `meta`, with the distinct values seen — the input to a legend.
// Returns [{ key, label, values: [{ value, label, style }] }] in stable order.
export function collectEnums(groups) {
  const found = {} // key -> Set(values)
  const visit = (node) => {
    if (!node) return
    if (node.meta && typeof node.meta === 'object') {
      for (const [k, v] of Object.entries(node.meta)) {
        if (v == null || typeof v === 'object') continue
        ;(found[k] ??= new Set()).add(v)
      }
    }
    ;(node.items ?? []).forEach(visit)
  }
  ;(groups ?? []).forEach(visit)

  return Object.entries(found).map(([key, set]) => ({
    key,
    label: enumLabel(key),
    values: [...set].sort().map((value) => ({
      value,
      label: enumValueLabel(value),
      style: enumValueStyle(key, value),
    })),
  }))
}
