import EmptyState from '../ui/EmptyState'

function DiagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M3 20L8 12l4 5 3-7 4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function DiagramView({ data, artefact }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
      <EmptyState
        title={`${artefact?.name ?? 'Diagram'} not yet available`}
        description="Diagram rendering is not yet implemented. Diagrams are derived from catalogue data — this view will be available once the diagram format is defined."
        icon={DiagramIcon}
      />
    </div>
  )
}
