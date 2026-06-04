import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
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

const STATUS_STYLES = {
  draft:      'bg-amber-50 text-amber-700',
  proposed:   'bg-blue-50 text-blue-700',
  accepted:   'bg-success-50 text-success-700',
  rejected:   'bg-error-50 text-error-700',
  superseded: 'bg-gray-100 text-gray-500',
}

function StatusBadge({ status }) {
  if (!status) return null
  return (
    <span className={`text-xs font-medium px-2 py-0.5 ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
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
        <div className="border border-gray-200 bg-white divide-y divide-gray-100">
          {decisions.map((decision, i) => (
            <Link
              key={i}
              to={`/clients/${clientId}/${versionId}/decisions/${decision['decision-id']}`}
              className="group flex items-start justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={decision.status} />
                  <span className="text-xs font-mono text-gray-400">{decision['decision-id']}</span>
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
