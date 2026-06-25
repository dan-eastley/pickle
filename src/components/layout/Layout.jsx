import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useArchitecture } from '../../context/ArchitectureContext'
import TopBar from './TopBar'
import DomainNav from './DomainNav'
import Breadcrumb from './Breadcrumb'
import Footer from './Footer'
import RouteContent from './RouteContent'
import Spinner from '../ui/Spinner'

export default function Layout() {
  const { clientId, versionId } = useParams()
  const { selectedClientId, selectedVersionId, loading, setClientId, setVersionId } = useArchitecture()

  // URL is the source of truth — sync params into context when navigating directly to a URL.
  // This fixes the case where localStorage has a different client than the URL being visited.
  useEffect(() => {
    if (clientId && clientId !== selectedClientId) setClientId(clientId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  useEffect(() => {
    if (versionId && versionId !== selectedVersionId) setVersionId(versionId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionId])

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
      <main className="relative flex-1">
        {/* Soft brand wash echoing the homepage hero */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-brand-50 to-transparent" />
        <div className="relative max-w-[1400px] mx-auto px-6 pb-12">
          <Breadcrumb />
          <RouteContent />
        </div>
      </main>
      <Footer />
    </div>
  )
}
