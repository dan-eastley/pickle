import Spinner from './Spinner'

// Shown in the content region while a route's code chunk loads.
export default function PageFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <Spinner size="lg" />
    </div>
  )
}
