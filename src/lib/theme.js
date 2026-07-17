// Shared semantic colour maps and labels, used wherever a status or change
// type is rendered. Domain and abstraction colours live in lib/artefacts.js
// (DOMAIN_COLORS / ABSTRACTION_COLORS) alongside the data they describe.
//
// Colour language:
//   gray   = not yet active (draft) / neutral
//   brand  = in flight (proposed, in-progress steps)
//   success / emerald = approved and progressing
//   gray-800 inverted  = done (committed)
//   error  = terminal failure (rejected)
// Raw blue/violet/amber/emerald/rose are reserved for the five domains —
// semantic states use brand or the success/warning/error scales.

// Decision lifecycle — order matters: this is the progression rendered by
// the status progress bar and the grouping order on the decisions index.
export const DECISION_STATUS = {
  draft: { label: 'Draft', badge: 'bg-gray-100 text-gray-600' },
  proposed: { label: 'Proposed', badge: 'bg-brand-50 text-brand-700' },
  accepted: { label: 'Accepted', badge: 'bg-success-50 text-success-700' },
  staged: { label: 'Staged', badge: 'bg-emerald-100 text-emerald-800' },
  committed: { label: 'Committed', badge: 'bg-gray-800 text-white' },
  rejected: { label: 'Rejected', badge: 'bg-error-50 text-error-700' },
}

export const DECISION_STATUS_ORDER = [
  'draft',
  'proposed',
  'accepted',
  'staged',
  'committed',
  'rejected',
]

export const decisionStatusBadge = (status) =>
  DECISION_STATUS[status]?.badge ?? 'bg-gray-100 text-gray-600'

export const decisionStatusLabel = (status) => DECISION_STATUS[status]?.label ?? status

// History events reuse decision-status colours; 'opened' is history-only.
export const HISTORY_EVENT_STYLES = {
  opened: 'bg-gray-100 text-gray-600',
  ...Object.fromEntries(Object.entries(DECISION_STATUS).map(([k, v]) => [k, v.badge])),
}

// Discovery lifecycle — shared by the discovery index, detail, and domain views.
export const DISCOVERY_STATUS = {
  active: { label: 'Active', badge: 'bg-emerald-50 text-emerald-700' },
  archived: { label: 'Archived', badge: 'bg-gray-100 text-gray-500' },
}

export const DISCOVERY_STATUS_ORDER = ['active', 'archived']

export const discoveryStatusBadge = (status) =>
  DISCOVERY_STATUS[status]?.badge ?? DISCOVERY_STATUS.active.badge

export const discoveryStatusLabel = (status) => DISCOVERY_STATUS[status]?.label ?? status

// Transition lifecycle (architectures/<architecture>/<transition>/transition.json).
export const VERSION_STATUS = {
  draft: { label: 'Draft', badge: 'bg-warning-50 text-warning-700' },
  active: { label: 'Active', badge: 'bg-success-50 text-success-700' },
  retired: { label: 'Retired', badge: 'bg-gray-100 text-gray-500' },
}

export const versionStatusBadge = (status) =>
  VERSION_STATUS[status]?.badge ?? 'bg-gray-100 text-gray-500'

// Architecture-change types on a decision record.
export const CHANGE_TYPE_STYLES = {
  create: 'bg-success-50 text-success-700',
  update: 'bg-brand-50 text-brand-700',
  delete: 'bg-error-50 text-error-700',
  rename: 'bg-warning-50 text-warning-700',
  move: 'bg-gray-100 text-gray-600',
}
