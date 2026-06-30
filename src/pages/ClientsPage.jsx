import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { loadClientRollup } from '../lib/metrics'
import MetricBars from '../components/common/MetricBars'
import Spinner from '../components/ui/Spinner'
import Illustration from '../components/ui/Illustration'
import ClientLogo from '../components/ui/ClientLogo'
import { ChevronRight } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

function ClientCard({ client, clientsMetadata, m }) {
  const clientId = client['client-id']
  const meta = clientsMetadata[clientId]
  const name = meta?.name ?? clientId

  return (
    <Link
      to={`/clients/${clientId}/versions`}
      className="group flex flex-col sm:flex-row sm:items-stretch bg-white border border-gray-200 hover:border-gray-400 transition-colors"
    >
      {/* Identity column */}
      <div className="flex items-center gap-4 px-5 py-5 sm:w-72 sm:flex-shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100">
        <ClientLogo clientId={clientId} name={name} className="w-12 h-12" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
            {name}
          </h3>
          <p className="text-xs font-mono text-gray-500 mt-0.5">{clientId}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors sm:hidden" />
      </div>

      {/* Metrics column */}
      <div className="flex-1 min-w-0 px-5 py-4">
        {m === undefined ? (
          <div className="flex items-center gap-2 py-2 text-xs text-gray-500">
            <Spinner size="sm" /> Loading metrics…
          </div>
        ) : m === null ? (
          <p className="py-2 text-xs text-gray-500">No architecture content yet.</p>
        ) : (
          <MetricBars
            perDomain={m.perDomain}
            governance={{ decisions: m.decisions, discoveries: m.discoveries }}
            empty={<p className="text-xs text-gray-500">No architecture content yet.</p>}
          />
        )}
      </div>
    </Link>
  )
}

export default function ClientsPage() {
  const { clients, clientsMetadata, loading } = useArchitecture()
  usePageTitle('Clients')

  // Per-client metrics (keyed by client-id), rolled up across every version.
  // Cards render immediately; metrics fill in as they resolve. A resolved value
  // of null means the client has no architecture content yet.
  const [metrics, setMetrics] = useState({})
  useEffect(() => {
    let live = true
    for (const c of clients) {
      const id = c['client-id']
      loadClientRollup(id)
        .then((m) => live && setMetrics((prev) => ({ ...prev, [id]: m })))
        .catch(() => live && setMetrics((prev) => ({ ...prev, [id]: null })))
    }
    return () => {
      live = false
    }
  }, [clients])

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
            Select a client to view its architecture versions. The bars compare how populated each
            client&rsquo;s architecture is.
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
        <div className="flex flex-col gap-3">
          {clients.map((client) => (
            <ClientCard
              key={client['client-id']}
              client={client}
              clientsMetadata={clientsMetadata}
              m={metrics[client['client-id']]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
