// Decision lifecycle stepper (HANDOFF §7): Draft → Proposed → Accepted →
// Staged → Committed. Steps before the current are done (brand), the current is
// active (ring), later steps muted. A rejected decision shows a terminal red
// marker instead of a stage.
const STEPS = [
  { key: 'draft', label: 'Draft' },
  { key: 'proposed', label: 'Proposed' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'staged', label: 'Staged' },
  { key: 'committed', label: 'Committed' },
]

export default function WorkflowStepper({ status, className = '' }) {
  const s = String(status ?? '').toLowerCase()

  if (s === 'rejected') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="w-2 h-2 bg-error-500" />
        <span className="text-[12px] font-medium text-error-700">Rejected</span>
      </div>
    )
  }

  const currentIdx = STEPS.findIndex((step) => step.key === s)
  return (
    <div className={`flex items-center ${className}`}>
      {STEPS.map((step, i) => {
        const done = currentIdx > -1 && i < currentIdx
        const active = i === currentIdx
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 ${active ? 'bg-brand-600 ring-2 ring-brand-200' : done ? 'bg-brand-600' : 'bg-gray-300'}`}
              />
              <span
                className={`text-[11px] ${active ? 'font-semibold text-gray-900' : done ? 'text-gray-600' : 'text-gray-400'}`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={`mx-2 h-px w-4 ${done ? 'bg-brand-300' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
