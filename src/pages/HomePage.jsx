import { Navigate } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import Spinner from '../components/ui/Spinner'

export default function HomePage() {
  const { selectedClientId, selectedVersionId, loading, clients } = useArchitecture()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  if (selectedClientId && selectedVersionId) {
    return <Navigate to={`/clients/${selectedClientId}/${selectedVersionId}/domains`} replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h12M3 18h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Architecture Browser</h1>
        <p className="mt-2 text-sm text-gray-500">
          {clients.length === 0
            ? 'No architecture data found. Add a client to architectures/clients/ to get started.'
            : 'Loading your architecture data…'}
        </p>
      </div>
    </div>
  )
}
