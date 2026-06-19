import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import RouteErrorBoundary from '../ui/RouteErrorBoundary'
import PageFallback from '../ui/PageFallback'

// The routed content region shared by every layout: an error boundary (resets
// on navigation) wrapping a Suspense boundary, so lazy page chunks load without
// disturbing the surrounding chrome and failures degrade gracefully.
export default function RouteContent() {
  const { pathname } = useLocation()
  return (
    <RouteErrorBoundary resetKey={pathname}>
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </RouteErrorBoundary>
  )
}
