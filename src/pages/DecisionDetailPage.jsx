import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { getDomain, getAbstraction, getArtefact } from '../lib/artefacts'
import Spinner from '../components/ui/Spinner'
import usePageTitle from '../hooks/usePageTitle'

// ── Status badge ─────────────────────────────────────────────────────────────

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

// ── Status progress bar ───────────────────────────────────────────────────────

const STATUS_STEPS = ['draft', 'proposed', 'accepted']
const STATUS_TERMINAL = { rejected: 'error', superseded: 'gray' }

function StatusProgress({ status }) {
  const isTerminal = status in STATUS_TERMINAL
  const activeStep = STATUS_STEPS.indexOf(status)

  return (
    <div className="mb-8 flex items-center gap-0">
      {STATUS_STEPS.map((step, i) => {
        const isPast = !isTerminal && i < activeStep
        const isCurrent = !isTerminal && i === activeStep
        const isFuture = isTerminal || i > activeStep

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Step */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 flex items-center justify-center text-xs font-semibold
                ${isPast ? 'bg-brand-600 text-white' : ''}
                ${isCurrent ? 'bg-brand-600 text-white ring-2 ring-brand-200' : ''}
                ${isFuture && !isTerminal ? 'bg-gray-100 text-gray-400' : ''}
                ${isTerminal ? 'bg-gray-100 text-gray-400' : ''}
              `}>
                {isPast ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`mt-1 text-xs whitespace-nowrap capitalize
                ${isCurrent ? 'font-semibold text-brand-700' : 'text-gray-400'}
              `}>
                {step}
              </span>
            </div>
            {/* Connector (not after last step) */}
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-4 ${isPast ? 'bg-brand-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}

      {/* Terminal state (rejected / superseded) shown separately */}
      {isTerminal && (
        <>
          <div className="h-px w-6 bg-gray-200 mx-2 mb-4" />
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 flex items-center justify-center text-xs font-semibold
              ${status === 'rejected' ? 'bg-error-50 text-error-700 ring-2 ring-error-200' : 'bg-gray-100 text-gray-500 ring-2 ring-gray-200'}
            `}>
              !
            </div>
            <span className={`mt-1 text-xs capitalize font-semibold
              ${status === 'rejected' ? 'text-error-700' : 'text-gray-500'}
            `}>
              {status}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

// ── Analysis ──────────────────────────────────────────────────────────────────

const ANALYSIS_SECTIONS = [
  { key: 'architecture-review',   label: 'Architecture Review' },
  { key: 'referential-integrity', label: 'Referential Integrity' },
  { key: 'strategy-alignment',    label: 'Strategy Alignment' },
  { key: 'principles-alignment',  label: 'Principles Alignment' },
  { key: 'proponent-analysis',    label: 'Proponent Analysis' },
  { key: 'challenger-analysis',   label: 'Challenger Analysis' },
]

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
              <td className="px-3 py-2.5 text-gray-700 w-1/4">{row.finding ?? '—'}</td>
              <td className="px-3 py-2.5 text-gray-700 w-1/4">{row.impact ?? '—'}</td>
              <td className="px-3 py-2.5 text-gray-700 w-1/4">{row.recommendation ?? '—'}</td>
              <td className="px-3 py-2.5 text-gray-700 w-1/4">{row.rationale ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Scope display ─────────────────────────────────────────────────────────────

function ScopeSection({ scope }) {
  if (!scope) return null
  const domainData = scope.domain ? getDomain(scope.domain) : null
  const abstractionData = scope.abstraction ? getAbstraction(scope.abstraction) : null
  const artefactData = scope.artefact ? getArtefact(scope.artefact) : null

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Scope</h3>
      <div className="flex items-center gap-2 flex-wrap">
        {domainData && (
          <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700">
            {domainData.name}
          </span>
        )}
        {abstractionData && (
          <>
            <span className="text-gray-300">›</span>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700">
              {abstractionData.name}
            </span>
          </>
        )}
        {artefactData && (
          <>
            <span className="text-gray-300">›</span>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700">
              <span className="font-mono mr-1">{artefactData.id}</span>{artefactData.name}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DecisionDetailPage() {
  const { clientId, versionId, decisionId } = useParams()
  const { clientsMetadata } = useArchitecture()
  const [decision, setDecision] = useState(undefined) // undefined=loading, null=not found
  const clientName = clientsMetadata[clientId]?.name ?? clientId

  usePageTitle(decision?.title ? `${decision.title} — Decisions` : 'Decision')

  useEffect(() => {
    fetch(`/api/arch/clients/${clientId}/${versionId}/decisions/${decisionId}/decision.json`)
      .then(r => r.ok ? r.json() : null)
      .then(setDecision)
      .catch(() => setDecision(null))
  }, [clientId, versionId, decisionId])

  if (decision === undefined) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
  }

  if (decision === null) {
    return <Navigate to={`/clients/${clientId}/${versionId}/decisions`} replace />
  }

  const hasAnalysis = ANALYSIS_SECTIONS.some(s => decision[s.key]?.length)

  return (
    <div>
      {/* Header — matches ArtefactPage style */}
      <div className="mb-6 pb-5 border-b border-gray-200">
        {/* Status badge */}
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={decision.status} />
        </div>
        {/* Icon + title + ID */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 14 14" fill="none">
              <path d="M2 2h10v10H2zM2 5h10M5 5v7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900">{decision.title}</h1>
          </div>
          <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 flex-shrink-0 self-start">
            {decision['decision-id']}
          </span>
        </div>
      </div>

      {/* Status progress */}
      <StatusProgress status={decision.status} />

      {/* Content sections */}
      <div className="space-y-8">
        {/* Scope */}
        <ScopeSection scope={decision.scope} />

        {/* Narrative */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Narrative</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{decision.narrative}</p>
        </div>

        {/* Requirements */}
        {decision.requirements?.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Requirements</h3>
            <div className="border border-gray-200 divide-y divide-gray-100">
              {decision.requirements.map((req, i) => {
                const title = typeof req === 'string' ? null : req.title
                const description = typeof req === 'string' ? req : req.description
                const type = typeof req === 'object' ? req.type : null
                return (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      {title && <span className="text-sm font-medium text-gray-900">{title}</span>}
                      {type && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500">{type}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Analysis sections */}
        {hasAnalysis && (
          <div className="space-y-6">
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
  )
}
