import { Link } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import Spinner from '../components/ui/Spinner'
import DomainIcon from '../components/ui/DomainIcon'
import usePageTitle from '../hooks/usePageTitle'

function ClientCard({ client, clientsMetadata }) {
  const clientId = client['client-id']
  const meta = clientsMetadata[clientId]

  return (
    <div className="bg-white border border-gray-200 flex flex-col">
      <div className="flex items-center gap-4 px-5 py-5">
        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center flex-shrink-0">
          <DomainIcon domain="business" className="w-6 h-6 text-gray-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900">{meta?.name ?? clientId}</h3>
          <p className="text-xs font-mono text-gray-400 mt-0.5">{clientId}</p>
        </div>
      </div>
      <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
        <Link
          to={`/clients/${clientId}/versions`}
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          View Versions
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default function ClientsPage() {
  const { clients, clientsMetadata, loading } = useArchitecture()
  usePageTitle('Clients')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select a client to view its architecture versions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client => (
          <ClientCard
            key={client['client-id']}
            client={client}
            clientsMetadata={clientsMetadata}
          />
        ))}
      </div>
    </div>
  )
}
