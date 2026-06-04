import { Outlet, useParams, Navigate } from 'react-router-dom'
import { useArchitecture } from '../../context/ArchitectureContext'
import TopBar from './TopBar'
import DomainNav from './DomainNav'
import Breadcrumb from './Breadcrumb'
import Spinner from '../ui/Spinner'

export default function Layout() {
  const { clientId, versionId } = useParams()
  const { selectedClientId, selectedVersionId, loading } = useArchitecture()

  // If context has resolved a different client/version, redirect
  if (!loading && selectedClientId && selectedVersionId) {
    if (clientId !== selectedClientId || versionId !== selectedVersionId) {
      return <Navigate to={`/clients/${selectedClientId}/${selectedVersionId}/domains`} replace />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <DomainNav />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 pb-12">
          <Breadcrumb />
          <Outlet />
        </div>
      </main>
    </div>
  )
}
