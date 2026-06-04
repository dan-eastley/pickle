import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { getVersions } from '../lib/api'
import Spinner from '../components/ui/Spinner'
import usePageTitle from '../hooks/usePageTitle'

// ── API helpers ───────────────────────────────────────────────────────────────

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

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  draft:     'bg-amber-50 text-amber-700',
  approved:  'bg-success-50 text-success-700',
  rejected:  'bg-error-50 text-error-700',
  superseded:'bg-gray-100 text-gray-500',
}

function StatusBadge({ status }) {
  if (!status) return null
  return (
    <span className={`text-xs font-medium px-2 py-0.5 ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

// ── Analysis table ────────────────────────────────────────────────────────────

function AnalysisTable({ rows }) {
  if (!rows?.length) return <p className="text-sm text-gray-400">No findings recorded.</p>
  return (
    <div className="border border-gray-200 overflow-x-auto">
      <table className="w-full min-w-[600px] text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {['Finding', 'Impact', 'Recommendation', 'Rationale'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={i} className="align-top">
              <td className="px-3 py-2 text-gray-700 w-1/4">{row.finding ?? '—'}</td>
              <td className="px-3 py-2 text-gray-700 w-1/4">{row.impact ?? '—'}</td>
              <td className="px-3 py-2 text-gray-700 w-1/4">{row.recommendation ?? '—'}</td>
              <td className="px-3 py-2 text-gray-700 w-1/4">{row.rationale ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Slide-out panel ───────────────────────────────────────────────────────────

const ANALYSIS_SECTIONS = [
  { key: 'architecture-review',   label: 'Architecture Review' },
  { key: 'referential-integrity', label: 'Referential Integrity' },
  { key: 'strategy-alignment',    label: 'Strategy Alignment' },
  { key: 'principles-alignment',  label: 'Principles Alignment' },
  { key: 'proponent-analysis',    label: 'Proponent Analysis' },
  { key: 'challenger-analysis',   label: 'Challenger Analysis' },
]

function SlideOut({ decision, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!decision) return null

  const hasAnalysis = ANALYSIS_SECTIONS.some(s => decision[s.key]?.length)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[90]"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-[100] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={decision.status} />
              <span className="text-xs font-mono text-gray-400">{decision['decision-id']}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{decision.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Close (Esc)"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Narrative */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Narrative</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{decision.narrative}</p>
          </div>

          {/* Requirements */}
          {decision.requirements?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Requirements</h3>
              <ul className="space-y-1">
                {decision.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-gray-300 flex-shrink-0" />
                    {typeof req === 'string' ? req : req.description ?? JSON.stringify(req)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Analysis sections */}
          {hasAnalysis && (
            <div className="space-y-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Analysis</h3>
              {ANALYSIS_SECTIONS.map(section => {
                const rows = decision[section.key]
                if (!rows?.length) return null
                return (
                  <div key={section.key}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">{section.label}</h4>
                    <AnalysisTable rows={rows} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DecisionsPage() {
  const { clientId } = useParams()
  const { clientsMetadata } = useArchitecture()
  const [loading, setLoading] = useState(true)
  const [decisions, setDecisions] = useState([]) // [{ versionId, decision }]
  const [selected, setSelected] = useState(null)

  const clientName = clientsMetadata[clientId]?.name ?? clientId
  usePageTitle(`${clientName} — Decisions`)

  useEffect(() => {
    async function load() {
      const versions = await getVersions(clientId)
      const all = []
      await Promise.all(versions.map(async v => {
        const vId = v['version-id']
        const ids = await fetchDecisionIds(clientId, vId)
        const loaded = await Promise.all(ids.map(id => fetchDecision(clientId, vId, id)))
        loaded.forEach((d, i) => d && all.push({ versionId: vId, decision: d }))
      }))
      // Sort by decision-id within each version
      all.sort((a, b) => {
        if (a.versionId !== b.versionId) return a.versionId.localeCompare(b.versionId)
        return (a.decision['decision-id'] ?? '').localeCompare(b.decision['decision-id'] ?? '')
      })
      setDecisions(all)
      setLoading(false)
    }
    load()
  }, [clientId])

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-2">
        <Link to={`/clients`} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Clients
        </Link>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Architecture Decisions</h1>
          <p className="mt-1 text-sm text-gray-500">
            {clientName} — all Architecture Decision Records across all versions.
          </p>
        </div>
        <Link
          to={`/clients/${clientId}/decisions/new`}
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
          {decisions.map(({ versionId, decision }, i) => (
            <button
              key={i}
              onClick={() => setSelected(decision)}
              className="w-full text-left group flex items-start justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={decision.status} />
                  <span className="text-xs font-mono text-gray-400">{decision['decision-id']}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">v{versionId}</span>
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
            </button>
          ))}
        </div>
      )}

      {selected && <SlideOut decision={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
