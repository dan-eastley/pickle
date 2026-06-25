import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { getVersions } from '../lib/api'
import { loadClientMetrics } from '../lib/metrics'
import Spinner from '../components/ui/Spinner'
import Illustration from '../components/ui/Illustration'
import ClientLogo from '../components/ui/ClientLogo'
import { ChevronRight } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

// A labelled value with a comparison bar (normalised to the max across clients,
// so the bars are directly comparable card-to-card).
function StatBar({ label, value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700 tabular-nums">{value}</span>
      </div>
      <div className="mt-0.5 h-1.5 bg-gray-100">
        <div className="h-full bg-brand-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function MaturityBar({ m }) {
  const pct = Math.round(m.maturity * 100)
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs mb-1">
        <span className="font-semibold text-gray-700">Maturity</span>
        <span className="text-gray-500">
          {m.maturityTier} · {pct}%
        </span>
      </div>
      <div className="h-2 bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ClientCard({ client, clientsMetadata, m, maxes }) {
  const clientId = client['client-id']
  const meta = clientsMetadata[clientId]
  const name = meta?.name ?? clientId

  return (
    <Link
      to={`/clients/${clientId}/versions`}
      className="group bg-white border border-gray-200 hover:border-gray-400 transition-colors flex flex-col"
    >
      <div className="flex items-center gap-4 px-5 py-5 border-b border-gray-100">
        <ClientLogo clientId={clientId} name={name} className="w-12 h-12" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
            {name}
          </h3>
          <p className="text-xs font-mono text-gray-400 mt-0.5">{clientId}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
      </div>

      <div className="px-5 py-4 space-y-3">
        {m ? (
          <>
            <MaturityBar m={m} />
            <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 pt-1">
              <StatBar label="Artefacts" value={m.artefacts.populated} max={maxes.artefacts} />
              <StatBar label="Documents" value={m.documents} max={maxes.documents} />
              <StatBar label="Decisions" value={m.decisions} max={maxes.decisions} />
              <StatBar label="Discoveries" value={m.discoveries} max={maxes.discoveries} />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
            <Spinner size="sm" /> Loading metrics…
          </div>
        )}
      </div>
    </Link>
  )
}

export default function ClientsPage() {
  const { clients, clientsMetadata, loading } = useArchitecture()
  usePageTitle('Clients')

  // Per-client metrics (keyed by client-id), loaded against each client's latest
  // version. Cards render immediately; metrics fill in as they resolve.
  const [metrics, setMetrics] = useState({})
  useEffect(() => {
    let live = true
    for (const c of clients) {
      const id = c['client-id']
      getVersions(id)
        .then((vs) => {
          const v = vs[vs.length - 1]?.['version-id']
          if (!v) return null
          return loadClientMetrics(id, v)
        })
        .then((m) => live && m && setMetrics((prev) => ({ ...prev, [id]: m })))
        .catch(() => {})
    }
    return () => {
      live = false
    }
  }, [clients])

  // Normalise the comparison bars to the max across all loaded clients.
  const resolved = Object.values(metrics)
  const maxes = {
    artefacts: Math.max(1, ...resolved.map((m) => m.artefacts.populated)),
    documents: Math.max(1, ...resolved.map((m) => m.documents)),
    decisions: Math.max(1, ...resolved.map((m) => m.decisions)),
    discoveries: Math.max(1, ...resolved.map((m) => m.discoveries)),
  }

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard
              key={client['client-id']}
              client={client}
              clientsMetadata={clientsMetadata}
              m={metrics[client['client-id']]}
              maxes={maxes}
            />
          ))}
        </div>
      )}
    </div>
  )
}
