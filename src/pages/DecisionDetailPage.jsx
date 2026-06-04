import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { getDomain, getAbstraction, getArtefact } from '../lib/artefacts'
import Spinner from '../components/ui/Spinner'
import JsonPreview from '../components/ui/JsonPreview'
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

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 flex items-center justify-center text-xs font-semibold
                ${isPast ? 'bg-brand-600 text-white' : ''}
                ${isCurrent ? 'bg-brand-600 text-white ring-2 ring-brand-200' : ''}
                ${!isPast && !isCurrent ? 'bg-gray-100 text-gray-400' : ''}
              `}>
                {isPast ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                  </svg>
                ) : i + 1}
              </div>
              <span className={`mt-1 text-xs whitespace-nowrap capitalize ${isCurrent ? 'font-semibold text-brand-700' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-4 ${isPast ? 'bg-brand-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
      {isTerminal && (
        <>
          <div className="h-px w-6 bg-gray-200 mx-2 mb-4" />
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 flex items-center justify-center text-xs font-semibold ring-2
              ${status === 'rejected' ? 'bg-error-50 text-error-700 ring-error-200' : 'bg-gray-100 text-gray-500 ring-gray-200'}
            `}>!</div>
            <span className={`mt-1 text-xs capitalize font-semibold ${status === 'rejected' ? 'text-error-700' : 'text-gray-500'}`}>
              {status}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

// ── Status transition actions ─────────────────────────────────────────────────

function StatusActions({ status, onTransition }) {
  if (status === 'draft') {
    return (
      <div className="flex items-center justify-between gap-4 bg-blue-50 px-5 py-4 mb-6">
        <div>
          <p className="text-sm font-semibold text-blue-900">Ready to propose this decision?</p>
          <p className="text-xs text-blue-600 mt-0.5">Moving to Proposed submits it for analysis.</p>
        </div>
        <button
          onClick={() => onTransition('proposed')}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          Propose
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </button>
      </div>
    )
  }

  if (status === 'proposed') {
    return (
      <div className="flex items-center justify-between gap-4 bg-success-50 px-5 py-4 mb-6">
        <div>
          <p className="text-sm font-semibold text-success-700">Accept or return this decision?</p>
          <p className="text-xs text-success-600 mt-0.5">Accepting applies the change to the architecture.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onTransition('draft')}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
              <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
            Back to Draft
          </button>
          <button
            onClick={() => onTransition('accepted')}
            className="flex items-center gap-2 px-4 py-1.5 bg-success-500 hover:bg-success-700 text-white text-sm font-medium transition-colors"
          >
            Accept
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return null
}

// ── Analysis table ────────────────────────────────────────────────────────────

function AnalysisTable({ rows, sectionKey, accepted, onAccept }) {
  if (!rows?.length) return <p className="text-sm text-gray-400">No findings recorded.</p>
  return (
    <div className="border border-gray-200 overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {['Finding', 'Impact', 'Recommendation', 'Rationale', ''].map((h, i) => (
              <th key={i} className={`px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 4 ? 'w-28' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => {
            const state = accepted[`${sectionKey}-${i}`]
            return (
              <tr key={i} className={`align-top ${state === 'accepted' ? 'bg-success-50' : state === 'declined' ? 'bg-error-50' : ''}`}>
                <td className="px-3 py-2.5 text-gray-700 w-1/5">{row.finding ?? '—'}</td>
                <td className="px-3 py-2.5 text-gray-700 w-1/5">{row.impact ?? '—'}</td>
                <td className="px-3 py-2.5 text-gray-700 w-1/5">{row.recommendation ?? '—'}</td>
                <td className="px-3 py-2.5 text-gray-700 w-1/5">{row.rationale ?? '—'}</td>
                <td className="px-3 py-2.5 w-28">
                  {!state ? (
                    <div className="flex gap-1">
                      <button onClick={() => onAccept(`${sectionKey}-${i}`, 'accepted')}
                        className="px-2 py-0.5 text-xs bg-success-50 text-success-700 hover:bg-success-100 transition-colors">
                        Accept
                      </button>
                      <button onClick={() => onAccept(`${sectionKey}-${i}`, 'declined')}
                        className="px-2 py-0.5 text-xs bg-error-50 text-error-700 hover:bg-error-100 transition-colors">
                        Decline
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-medium ${state === 'accepted' ? 'text-success-700' : 'text-error-700'}`}>
                        {state === 'accepted' ? 'Accepted' : 'Declined'}
                      </span>
                      <button onClick={() => onAccept(`${sectionKey}-${i}`, null)}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors ml-1">
                        ×
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
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
    <div id="section-scope">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Scope</h3>
      <div className="flex items-center gap-2 flex-wrap">
        {domainData && <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700">{domainData.name}</span>}
        {abstractionData && (<><span className="text-gray-300">›</span><span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700">{abstractionData.name}</span></>)}
        {artefactData && (<><span className="text-gray-300">›</span><span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700"><span className="font-mono mr-1">{artefactData.id}</span>{artefactData.name}</span></>)}
      </div>
    </div>
  )
}

// ── Section jump navigation ───────────────────────────────────────────────────

const ANALYSIS_SECTIONS = [
  { key: 'narrative-validation', label: 'Narrative Review' },
  { key: 'impact-assessment',    label: 'Impact Assessment' },
  { key: 'referential-integrity',label: 'Referential Integrity' },
  { key: 'strategy-alignment',   label: 'Strategy Alignment' },
  { key: 'principles-alignment', label: 'Principles Alignment' },
  { key: 'proponent-analysis',   label: 'Proponent Analysis' },
  { key: 'challenger-analysis',  label: 'Challenger Analysis' },
]

function SectionNav({ decision }) {
  const sections = [
    { id: 'section-narrative', label: 'Narrative' },
    decision.requirements?.length && { id: 'section-requirements', label: 'Requirements' },
    decision.scope && { id: 'section-scope', label: 'Scope' },
    ...ANALYSIS_SECTIONS.filter(s => decision[s.key]?.length).map(s => ({ id: `section-${s.key}`, label: s.label })),
  ].filter(Boolean)

  if (sections.length < 3) return null

  return (
    <div className="flex items-center gap-1 flex-wrap mb-6 pb-4 border-b border-gray-100">
      <span className="text-xs text-gray-400 mr-1">Jump to:</span>
      {sections.map(s => (
        <a key={s.id} href={`#${s.id}`}
          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
          {s.label}
        </a>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DecisionDetailPage() {
  const { clientId, versionId, decisionId } = useParams()
  const { clientsMetadata } = useArchitecture()
  const [decision, setDecision] = useState(undefined)
  const [accepted, setAccepted] = useState({})
  const clientName = clientsMetadata[clientId]?.name ?? clientId

  usePageTitle(decision?.title ? `${decision.title} — Decisions` : 'Decision')

  useEffect(() => {
    fetch(`/api/arch/clients/${clientId}/${versionId}/decisions/${decisionId}/decision.json`)
      .then(r => r.ok ? r.json() : null)
      .then(setDecision)
      .catch(() => setDecision(null))
  }, [clientId, versionId, decisionId])

  function handleAccept(key, value) {
    setAccepted(prev => {
      if (value === null) { const n = { ...prev }; delete n[key]; return n }
      return { ...prev, [key]: value }
    })
  }

  function handleTransition(newStatus) {
    setDecision(prev => prev ? { ...prev, status: newStatus } : prev)
  }

  if (decision === undefined) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
  }
  if (decision === null) {
    return <Navigate to={`/clients/${clientId}/${versionId}/decisions`} replace />
  }

  const hasAnalysis = ANALYSIS_SECTIONS.some(s => decision[s.key]?.length)

  return (
    <div>
      {/* Header */}
      <div className="mb-6 pb-5 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={decision.status} />
        </div>
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

      {/* Section jump nav */}
      <SectionNav decision={decision} />

      {/* Status transitions (before analysis) */}
      <StatusActions status={decision.status} onTransition={handleTransition} />

      {/* Content */}
      <div className="space-y-8">
        <ScopeSection scope={decision.scope} />

        <div id="section-narrative">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Narrative</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{decision.narrative}</p>
        </div>

        {decision.requirements?.length > 0 && (
          <div id="section-requirements">
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
                      {type && <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500">{type}</span>}
                    </div>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {hasAnalysis && (
          <div className="space-y-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Analysis</h3>
            {ANALYSIS_SECTIONS.map(section => {
              const rows = decision[section.key]
              if (!rows?.length) return null
              return (
                <div key={section.key} id={`section-${section.key}`}>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">{section.label}</h4>
                  <AnalysisTable
                    rows={rows}
                    sectionKey={section.key}
                    accepted={accepted}
                    onAccept={handleAccept}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <JsonPreview data={decision} label={`${decision['decision-id']}.json`} />
    </div>
  )
}
