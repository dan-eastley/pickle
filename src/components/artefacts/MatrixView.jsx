import EmptyState from '../ui/EmptyState'

export default function MatrixView({ data }) {
  if (!data) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
      <EmptyState
        title="Matrix view"
        description="Matrix format not yet defined. This artefact type will be available once the matrix schema and instance format are specified."
      />
    </div>
  )
}
