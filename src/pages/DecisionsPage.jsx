import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { DECISION_STATUS_ORDER, decisionStatusBadge, decisionStatusLabel } from '../lib/theme'
import ScopeChip from '../components/decisions/ScopeChip'
import ScopeSelector from '../components/decisions/ScopeSelector'
import Button from '../components/ui/Button'
import JsonPreview from '../components/ui/JsonPreview'
import Spinner from '../components/ui/Spinner'
import { ChevronRight, ChevronDown, DecisionIcon, PlusIcon } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'
import useCollapsed from '../hooks/useCollapsed'

const STATUS_DEFAULT_OPEN = new Set(['draft', 'proposed'])

function DecisionGroup({ status, decisions, clientId, versionId }) {
  const defaultCollapsed = decisions.length === 0 || !STATUS_DEFAULT_OPEN.has(status)
  const [collapsed, toggleCollapsed] = useCollapsed(`decision-group-${status}-collapsed`, defaultCollapsed)
  const open = !collapsed

  return (
    <div className="border border-gray-200 bg-white">
      <button
        onClick={toggleCollapsed}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-200"
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-0.5 ${decisionStatusBadge(status)}`}>
            {decisionStatusLabel(status)}
          </span>
          <span className="text-xs text-gray-400">{decisions.length} {decisions.length === 1 ? 'record' : 'records'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && decisions.length === 0 && (
        <div className="px-5 py-3 text-xs text-gray-400">No decisions at this stage.</div>
      )}

      {open && decisions.length > 0 && (
        <div className="divide-y divide-gray-100">
          {decisions.map((d, i) => (
            <Link
              key={d['decision-id']}
              to={`/clients/${clientId}/${versionId}/decisions/${d['decision-id']}`}
              className="group flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              {/* Decision icon */}
              <div className="w-8 h-8 bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                <DecisionIcon className="w-4 h-4 text-gray-500" />
              </div>

              {/* Title */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors truncate">
                  {d.title}
                </p>
                {d.narrative && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{d.narrative}</p>
                )}
              </div>

              {/* Scope */}
              {d.scope && <ScopeChip scope={d.scope} />}

              {/* ID + chevron */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-mono text-gray-400">{d['decision-id']}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// Thin adapter: ScopeSelector drives the URL search params so filters are
// shareable / bookmarkable.
function ScopeFilter({ searchParams, setSearchParams }) {
  const scope = {
    domain:      searchParams.get('domain')      ?? '',
    abstraction: searchParams.get('abstraction') ?? '',
    artefact:    searchParams.get('artefact')    ?? '',
  }

  function handleChange({ domain, abstraction, artefact }) {
    const next = new URLSearchParams()
    if (domain)      next.set('domain', domain)
    if (abstraction) next.set('abstraction', abstraction)
    if (artefact)    next.set('artefact', artefact)
    setSearchParams(next)
  }

  return <ScopeSelector {...scope} onChange={handleChange} />
}

export default function DecisionsPage() {
  const { clientId, versionId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { clientsMetadata } = useArchitecture()
  const [loading, setLoading] = useState(true)
  const [decisions, setDecisions] = useState([])

  const filterDomain      = searchParams.get('domain')      ?? ''
  const filterAbstraction = searchParams.get('abstraction') ?? ''
  const filterArtefact    = searchParams.get('artefact')    ?? ''

  const clientName = clientsMetadata[clientId]?.name ?? clientId
  usePageTitle(`${clientName} — Decisions`)

  useEffect(() => {
    fetch(`/api/arch/clients/${clientId}/${versionId}/decisions/decisions.json`)
      .then(r => r.ok ? r.json() : { decisions: [] })
      .then(data => { setDecisions(data.decisions ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [clientId, versionId])

  const filtered = decisions.filter(d => {
    if (filterDomain && d.scope?.domain !== filterDomain) return false
    if (filterAbstraction && d.scope?.abstraction !== filterAbstraction) return false
    if (filterArtefact && d.scope?.artefact !== filterArtefact) return false
    return true
  })

  const grouped = DECISION_STATUS_ORDER.map(status => ({
    status,
    decisions: filtered.filter(d => (d.status ?? 'draft') === status),
  }))
  const knownStatuses = new Set(DECISION_STATUS_ORDER)
  const unknown = filtered.filter(d => !knownStatuses.has(d.status ?? 'draft'))
  if (unknown.length > 0) grouped.push({ status: 'unknown', decisions: unknown })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Architecture Decisions</h1>
          <p className="mt-1 text-sm text-gray-500">
            {clientName} · v{versionId}
          </p>
        </div>
        <Button to={`/clients/${clientId}/${versionId}/decisions/new`} size="lg">
          <PlusIcon className="w-4 h-4" />
          New Decision
        </Button>
      </div>

      <div className="mb-5 p-4 bg-gray-50 border border-gray-200">
        <ScopeFilter searchParams={searchParams} setSearchParams={setSearchParams} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ status, decisions: group }) => (
            <DecisionGroup key={status} status={status} decisions={group} clientId={clientId} versionId={versionId} />
          ))}
        </div>
      )}

      {/* JSON preview of decisions.json index — for debugging */}
      <JsonPreview
        data={{ decisions: decisions.map(d => ({ 'decision-id': d['decision-id'], title: d.title, status: d.status, scope: d.scope })) }}
        label="decisions.json"
      />
    </div>
  )
}
