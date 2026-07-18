import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import RouteErrorBoundary from '../ui/RouteErrorBoundary'
import PageFallback from '../ui/PageFallback'
import { usePermissions } from '../../context/PermissionsContext'

// The routed content region shared by every layout: an error boundary (resets
// on navigation) wrapping a Suspense boundary, so lazy page chunks load without
// disturbing the surrounding chrome and failures degrade gracefully. Admins see
// full error detail in the boundary (isAdmin).
export default function RouteContent() {
  const { pathname } = useLocation()
  const { isAdmin } = usePermissions()
  return (
    <RouteErrorBoundary resetKey={pathname} isAdmin={isAdmin}>
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </RouteErrorBoundary>
  )
}
