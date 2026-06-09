import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { getDomain, getAbstraction, getArtefact, DOMAINS, ABSTRACTIONS, ARTEFACTS, DOMAIN_COLORS } from '../lib/artefacts'
import DomainIcon from '../components/ui/DomainIcon'
import JsonPreview from '../components/ui/JsonPreview'
import Spinner from '../components/ui/Spinner'
import usePageTitle from '../hooks/usePageTitle'

// Status order and display config
const STATUS_ORDER = ['draft', 'proposed', 'accepted', 'staged', 'committed', 'rejected']
const STATUS_DEFAULT_OPEN = new Set(['draft', 'proposed'])

// Colours aligned with the status progress bar on the decision detail page:
// in-flight steps use brand blue; staged uses emerald; committed is dark/done;
// rejected is error red; draft is neutral (step 1, not yet active).
const STATUS_STYLES = {
  draft:     'bg-gray-100 text-gray-600',
  proposed:  'bg-brand-50 text-brand-700',
  accepted:  'bg-success-50 text-success-700',
  staged:    'bg-emerald-100 text-emerald-800',
  committed: 'bg-gray-800 text-white',
  rejected:  'bg-error-50 text-error-700',
}

const STATUS_LABELS = {
  draft:     'Draft',
  proposed:  'Proposed',
  accepted:  'Accepted',
  staged:    'Staged',
  committed: 'Committed',
  rejected:  'Rejected',
}

function ScopeChip({ scope }) {
  if (!scope?.domain) return null
  const domainData = getDomain(scope.domain)
  const dc = DOMAIN_COLORS[scope.domain]
  const extra = [
    scope.abstraction ? getAbstraction(scope.abstraction)?.name ?? scope.abstraction : null,
    scope.artefact    ? getArtefact(scope.artefact)?.name ?? scope.artefact           : null,
  ].filter(Boolean)
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 flex-shrink-0 ${dc?.bg ?? 'bg-gray-100'} ${dc?.text ?? 'text-gray-700'}`}>
      <DomainIcon domain={scope.domain} className="w-3 h-3 flex-shrink-0" />
      {domainData?.name ?? scope.domain}
      {extra.length > 0 && <span className="opacity-60 ml-0.5">› {extra.join(' › ')}</span>}
    </span>
  )
}

function DecisionGroup({ status, decisions, clientId, versionId }) {
  // Empty groups always start collapsed; non-empty follow the default open set
  const [open, setOpen] = useState(decisions.length > 0 && STATUS_DEFAULT_OPEN.has(status))

  return (
    <div className="border border-gray-200 bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-200"
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-0.5 ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABELS[status] ?? status}
          </span>
          <span className="text-xs text-gray-400">{decisions.length} {decisions.length === 1 ? 'record' : 'records'}</span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </button>

      {open && decisions.length === 0 && (
        <div className="px-5 py-3 text-xs text-gray-400 italic">No decisions at this stage.</div>
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
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2h10v10H2zM2 5h10M5 5v7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
                </svg>
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
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function ScopeFilter({ searchParams, setSearchParams }) {
  const domain      = searchParams.get('domain')      ?? ''
  const abstraction = searchParams.get('abstraction') ?? ''
  const artefact    = searchParams.get('artefact')    ?? ''

  function set(key, value) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      // Clear child filters when parent changes
      if (key === 'domain')      { next.delete('abstraction'); next.delete('artefact') }
      if (key === 'abstraction') { next.delete('artefact') }
      return next
    })
  }

  const availableAbstractions = domain ? ABSTRACTIONS : []
  const availableArtefacts = ARTEFACTS.filter(a =>
    (!domain || a.domain === domain) && (!abstraction || a.abstraction === abstraction)
  )

  const selectClass = "px-3 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-brand-500 text-gray-700"

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      </svg>
      <select value={domain} onChange={e => set('domain', e.target.value)} className={selectClass}>
        <option value="">All Domains</option>
        {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      <select value={abstraction} onChange={e => set('abstraction', e.target.value)}
        disabled={!domain} className={`${selectClass} disabled:opacity-40`}>
        <option value="">All Abstractions</option>
        {availableAbstractions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <select value={artefact} onChange={e => set('artefact', e.target.value)}
        disabled={!domain} className={`${selectClass} disabled:opacity-40`}>
        <option value="">All Artefacts</option>
        {availableArtefacts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      {(domain || abstraction || artefact) && (
        <button onClick={() => setSearchParams({})}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1">
          Clear
        </button>
      )}
    </div>
  )
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

  const grouped = STATUS_ORDER.map(status => ({
    status,
    decisions: filtered.filter(d => (d.status ?? 'draft') === status),
  }))
  const knownStatuses = new Set(STATUS_ORDER)
  const unknown = filtered.filter(d => !knownStatuses.has(d.status ?? 'draft'))
  if (unknown.length > 0) grouped.push({ status: 'unknown', decisions: unknown })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Architecture Decisions</h1>
          <p className="mt-1 text-sm text-gray-500">
            {clientName} · v{versionId}
          </p>
        </div>
        <Link
          to={`/clients/${clientId}/${versionId}/decisions/new`}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
          New Decision
        </Link>
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
