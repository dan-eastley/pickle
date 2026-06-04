import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { getDomain, getAbstraction, getArtefact } from '../lib/artefacts'
import Spinner from '../components/ui/Spinner'
import usePageTitle from '../hooks/usePageTitle'

async function fetchDecisionIds(clientId, versionId) {
  const res = await fetch(`/api/arch/clients/${clientId}/${versionId}/decisions/decisions.json`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.decisions ?? []).map(d => d['decision-id'])
}

async function fetchDecision(clientId, versionId, decisionId) {
  const res = await fetch(`/api/arch/clients/${clientId}/${versionId}/decisions/${decisionId}/decision.json`)
  if (!res.ok) return null
  return res.json()
}

// Status order — drives grouping and default expand state
const STATUS_ORDER = ['draft', 'proposed', 'accepted', 'rejected', 'superseded']
const STATUS_DEFAULT_OPEN = new Set(['draft', 'proposed'])

const STATUS_STYLES = {
  draft:      'bg-amber-50 text-amber-700',
  proposed:   'bg-blue-50 text-blue-700',
  accepted:   'bg-success-50 text-success-700',
  rejected:   'bg-error-50 text-error-700',
  superseded: 'bg-gray-100 text-gray-500',
}

const STATUS_LABELS = {
  draft:      'Draft',
  proposed:   'Proposed',
  accepted:   'Accepted',
  rejected:   'Rejected',
  superseded: 'Superseded',
}

function ScopeChip({ scope }) {
  const parts = [
    scope.domain ? getDomain(scope.domain)?.name ?? scope.domain : null,
    scope.abstraction ? getAbstraction(scope.abstraction)?.name ?? scope.abstraction : null,
    scope.artefact ? getArtefact(scope.artefact)?.id ?? scope.artefact : null,
  ].filter(Boolean)
  if (!parts.length) return null
  return (
    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5">
      {parts.join(' › ')}
    </span>
  )
}

function StatusBadge({ status }) {
  if (!status) return null
  return (
    <span className={`text-xs font-medium px-2 py-0.5 ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function DecisionGroup({ status, decisions, clientId, versionId }) {
  const [open, setOpen] = useState(STATUS_DEFAULT_OPEN.has(status))

  return (
    <div className="border border-gray-200 bg-white">
      {/* Group header */}
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
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </button>

      {/* Rows */}
      {open && (
        <div className="divide-y divide-gray-100">
          {decisions.map((decision, i) => (
            <Link
              key={i}
              to={`/clients/${clientId}/${versionId}/decisions/${decision['decision-id']}`}
              className="group flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2h10v10H2zM2 5h10M5 5v7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400">{decision['decision-id']}</span>
                  {decision.scope && <ScopeChip scope={decision.scope} />}
                </div>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                  {decision.title}
                </p>
                {decision.narrative && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{decision.narrative}</p>
                )}
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-1 ml-4 transition-colors" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DecisionsPage() {
  const { clientId, versionId } = useParams()
  const { clientsMetadata } = useArchitecture()
  const [loading, setLoading] = useState(true)
  const [decisions, setDecisions] = useState([])

  const clientName = clientsMetadata[clientId]?.name ?? clientId
  usePageTitle(`${clientName} — Decisions`)

  useEffect(() => {
    async function load() {
      const ids = await fetchDecisionIds(clientId, versionId)
      const loaded = await Promise.all(ids.map(id => fetchDecision(clientId, versionId, id)))
      setDecisions(loaded.filter(Boolean))
      setLoading(false)
    }
    load()
  }, [clientId, versionId])

  // Group decisions by status, preserving STATUS_ORDER
  const grouped = STATUS_ORDER.reduce((acc, status) => {
    const group = decisions.filter(d => (d.status ?? 'draft') === status)
    if (group.length > 0) acc.push({ status, decisions: group })
    return acc
  }, [])
  // Any decisions with an unknown status go at the end
  const knownStatuses = new Set(STATUS_ORDER)
  const unknown = decisions.filter(d => !knownStatuses.has(d.status ?? 'draft'))
  if (unknown.length > 0) grouped.push({ status: 'unknown', decisions: unknown })

  return (
    <div className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Architecture Decisions</h1>
          <p className="mt-1 text-sm text-gray-500">
            {clientName} · v{versionId} — Architecture Decision Records for this version.
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

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
      ) : decisions.length === 0 ? (
        <div className="border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm font-medium text-gray-700">No decisions yet</p>
          <p className="mt-1 text-sm text-gray-400">Architecture Decision Records will appear here once raised.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ status, decisions: group }) => (
            <DecisionGroup
              key={status}
              status={status}
              decisions={group}
              clientId={clientId}
              versionId={versionId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
