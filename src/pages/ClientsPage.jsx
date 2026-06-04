import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { getVersions, getVersion } from '../lib/api'
import Spinner from '../components/ui/Spinner'
import DomainIcon from '../components/ui/DomainIcon'
import usePageTitle from '../hooks/usePageTitle'

const STATUS_STYLES = {
  draft:     'bg-amber-50 text-amber-700',
  active:    'bg-success-50 text-success-700',
  retired:   'bg-gray-100 text-gray-500',
}

function VersionRow({ clientId, version }) {
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    getVersion(clientId, version['version-id']).then(setMeta)
  }, [clientId, version])

  const vId = version['version-id']
  const statusStyle = STATUS_STYLES[meta?.status] ?? 'bg-gray-100 text-gray-500'

  return (
    <Link
      to={`/clients/${clientId}/${vId}/domains`}
      className="group flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <span className="text-sm font-medium text-gray-900 group-hover:text-brand-700 transition-colors">
            {meta?.name ?? vId}
          </span>
          <span className="ml-2 text-xs font-mono text-gray-400">{vId}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {meta?.status && (
          <span className={`text-xs font-medium px-2 py-0.5 ${statusStyle}`}>
            {meta.status}
          </span>
        )}
        <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </div>
    </Link>
  )
}

function ClientCard({ client, clientsMetadata }) {
  const clientId = client['client-id']
  const meta = clientsMetadata[clientId]
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVersions(clientId).then(v => { setVersions(v); setLoading(false) })
  }, [clientId])

  return (
    <div className="border border-gray-200 bg-white">
      <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center flex-shrink-0">
          <DomainIcon domain="business" className="w-5 h-5 text-gray-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{meta?.name ?? clientId}</h3>
          <p className="text-xs font-mono text-gray-400 mt-0.5">{clientId}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Spinner />
        </div>
      ) : versions.length === 0 ? (
        <div className="px-5 py-4 text-sm text-gray-400">No versions available.</div>
      ) : (
        <div>
          {versions.map(v => (
            <VersionRow key={v['version-id']} clientId={clientId} version={v} />
          ))}
        </div>
      )}
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
          Select a client and version to browse its architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
