import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import ScopeChip from '../components/decisions/ScopeChip'
import Button from '../components/ui/Button'
import JsonPreview from '../components/ui/JsonPreview'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { ChevronRight, ChevronDown, RobotIcon, PlusIcon } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'
import useCollapsed from '../hooks/useCollapsed'

const POTS = [
  { status: 'active', label: 'Active', badge: 'bg-emerald-50 text-emerald-700' },
  { status: 'archived', label: 'Archived', badge: 'bg-gray-100 text-gray-500' },
]

function DiscoveryGroup({ pot, discoveries, clientId, versionId }) {
  const defaultCollapsed = pot.status !== 'active' && discoveries.length === 0
  const [collapsed, toggleCollapsed] = useCollapsed(`discovery-group-${pot.status}-collapsed`, defaultCollapsed)
  const open = !collapsed

  return (
    <div className="border border-gray-200 bg-white">
      <button
        onClick={toggleCollapsed}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-200"
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-0.5 ${pot.badge}`}>{pot.label}</span>
          <span className="text-xs text-gray-400">{discoveries.length} {discoveries.length === 1 ? 'Discovery' : 'Discoveries'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && discoveries.length === 0 && (
        <div className="px-5 py-3 text-xs text-gray-400">No discoveries in this pot.</div>
      )}

      {open && discoveries.length > 0 && (
        <div className="divide-y divide-gray-100">
          {discoveries.map(d => (
            <Link
              key={d['discovery-id']}
              to={`/clients/${clientId}/${versionId}/discovery/${d['discovery-id']}`}
              className="group flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center flex-shrink-0">
                <RobotIcon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors truncate">
                  {d.title}
                </p>
              </div>
              {d.scope && <ScopeChip scope={d.scope} />}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-mono text-gray-400">{d['discovery-id']}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DiscoveryPage() {
  const { clientId, versionId } = useParams()
  const { clientsMetadata } = useArchitecture()
  const [loading, setLoading] = useState(true)
  const [discoveries, setDiscoveries] = useState([])

  const clientName = clientsMetadata[clientId]?.name ?? clientId
  usePageTitle(`${clientName} — Discovery`)

  useEffect(() => {
    fetch(`/api/arch/clients/${clientId}/${versionId}/discovery/discovery.json`)
      .then(r => r.ok ? r.json() : { discoveries: [] })
      .then(data => { setDiscoveries(data.discoveries ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [clientId, versionId])

  const grouped = POTS.map(pot => ({
    pot,
    discoveries: discoveries.filter(d => (d.status ?? 'active') === pot.status),
  }))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            Architecture Discovery
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {clientName} · v{versionId}
          </p>
        </div>
        <Button to={`/clients/${clientId}/${versionId}/discovery/new`} size="lg">
          <PlusIcon className="w-4 h-4" />
          New Discovery
        </Button>
      </div>

      <div className="mb-5 px-4 py-3 bg-blue-50 border border-blue-200 text-sm text-blue-800">
        Discovery is a preview. The Virtual Architect Agent that produces point-in-time views from your
        questions is not yet wired up — this is the framework for it.
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
      ) : discoveries.length === 0 ? (
        <div className="border border-gray-200 bg-white">
          <EmptyState
            illustration="catalogue"
            title="No discoveries yet"
            description="Raise a discovery to ask the Virtual Architect Agent a question about this architecture."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ pot, discoveries: group }) => (
            <DiscoveryGroup key={pot.status} pot={pot} discoveries={group} clientId={clientId} versionId={versionId} />
          ))}
        </div>
      )}

      <JsonPreview data={{ discoveries }} label="discovery.json" />
    </div>
  )
}
