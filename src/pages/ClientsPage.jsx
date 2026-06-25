import { Link } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import Spinner from '../components/ui/Spinner'
import Illustration from '../components/ui/Illustration'
import { ChevronRight } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

function clientInitials(name) {
  return (
    name
      .split(/\s+/)
      .filter((w) => /^[A-Z]/.test(w))
      .map((w) => w[0])
      .slice(0, 3)
      .join('') || name.slice(0, 2).toUpperCase()
  )
}

function ClientCard({ client, clientsMetadata }) {
  const clientId = client['client-id']
  const meta = clientsMetadata[clientId]
  const name = meta?.name ?? clientId
  const initials = clientInitials(name)

  return (
    <Link
      to={`/clients/${clientId}/versions`}
      className="group bg-white border border-gray-200 hover:border-gray-400 transition-colors flex flex-col"
    >
      <div className="flex items-center gap-4 px-5 py-5">
        <div className="w-12 h-12 bg-brand-50 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-brand-600 tracking-tight">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
            {name}
          </h3>
          <p className="text-xs font-mono text-gray-400 mt-0.5">{clientId}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
      </div>
    </Link>
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
    <div className="max-w-[1400px] mx-auto px-6 pt-8 pb-12">
      <div className="mb-8 flex items-center justify-between gap-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">
            Select a client to view its architecture versions.
          </p>
        </div>
        <Illustration name="select-option" className="hidden md:block w-52 flex-shrink-0" />
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Illustration name="no-data" className="w-56 mb-6" />
          <p className="text-sm font-semibold text-gray-700">No clients yet</p>
          <p className="mt-1 text-sm text-gray-500 max-w-sm">
            Architecture is organised per client. Add a client folder under{' '}
            <code className="font-mono text-xs bg-gray-100 px-1">architectures/clients/</code> to
            get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard
              key={client['client-id']}
              client={client}
              clientsMetadata={clientsMetadata}
            />
          ))}
        </div>
      )}
    </div>
  )
}
