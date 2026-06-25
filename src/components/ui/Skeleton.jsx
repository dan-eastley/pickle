// Animated placeholder blocks shown while content loads — gives the page its
// eventual shape (heading, intro, rows) instead of a bare centred spinner, so
// the layout doesn't jump when data arrives.

// A single shimmering bar. `className` controls width/height/spacing.
export function SkeletonBar({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 ${className}`} />
}

// Default artefact-surface skeleton: a title, a couple of intro lines, then a
// stack of card rows roughly matching a catalogue/document layout.
export default function Skeleton({ rows = 5 }) {
  return (
    <div aria-hidden="true" className="space-y-6">
      <div className="space-y-3">
        <SkeletonBar className="h-6 w-1/3" />
        <SkeletonBar className="h-4 w-2/3" />
        <SkeletonBar className="h-4 w-1/2" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border border-gray-200 bg-white p-4 space-y-2">
            <SkeletonBar className="h-4 w-1/4" />
            <SkeletonBar className="h-3 w-full" />
            <SkeletonBar className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  )
}
