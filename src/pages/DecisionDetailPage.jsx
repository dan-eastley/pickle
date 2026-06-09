import { useEffect, useState } from 'react'
import { useParams, Navigate, useLocation, Link } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { getDecision } from '../lib/api'
import { getDomain, getAbstraction, getArtefact, DOMAIN_COLORS, ABSTRACTION_COLORS } from '../lib/artefacts'
import DomainIcon from '../components/ui/DomainIcon'
import FormatIcon from '../components/ui/FormatIcon'
import Spinner from '../components/ui/Spinner'
import JsonPreview from '../components/ui/JsonPreview'
import usePageTitle from '../hooks/usePageTitle'

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  draft:     'bg-amber-50 text-amber-700',
  proposed:  'bg-blue-50 text-blue-700',
  accepted:  'bg-success-50 text-success-700',
  staged:    'bg-emerald-100 text-emerald-800',
  committed: 'bg-gray-800 text-white',
  rejected:  'bg-error-50 text-error-700',
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

const STATUS_STEPS = ['draft', 'proposed', 'accepted', 'staged', 'committed']
const STATUS_TERMINAL = { rejected: 'error' }

const STATUS_TOOLTIPS = {
  draft:     'The decision is being drafted. Not yet submitted for analysis.',
  proposed:  'Submitted for AI analysis. Findings are generated at this stage.',
  accepted:  'Reviewed and accepted. Ready to be staged for application.',
  staged:    'Architecture changes are being applied via a pull request.',
  committed: 'Merged to main. Architecture changes are live.',
  rejected:  'This decision has been rejected and will not proceed.',
}

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
            <div className="flex flex-col items-center" title={STATUS_TOOLTIPS[step]}>
              <div className={`w-7 h-7 flex items-center justify-center text-xs font-semibold cursor-default
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
          <div className="flex flex-col items-center" title={STATUS_TOOLTIPS.rejected}>
            <div className="w-7 h-7 flex items-center justify-center text-xs font-semibold bg-error-50 text-error-700 ring-2 ring-error-200 cursor-default">!</div>
            <span className="mt-1 text-xs capitalize font-semibold text-error-700">{status}</span>
          </div>
        </>
      )}
    </div>
  )
}

// ── Status transition actions ─────────────────────────────────────────────────

const REJECTION_REASONS = [
  { value: 'duplicate',  label: 'Duplicate — a similar decision already exists or has been accepted' },
  { value: 'superseded', label: 'Superseded — replaced by a newer or broader decision' },
]

function StatusActions({ status, onTransition, transitioning, decision, versionId }) {
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('duplicate')

  if (status === 'draft') {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 bg-blue-50 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-blue-900">Ready to propose this decision?</p>
            <p className="text-xs text-blue-600 mt-0.5">Moving to Proposed submits it for analysis and opens a pull request.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button disabled={transitioning} onClick={() => setRejectOpen(r => !r)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-error-50 border border-error-300 hover:bg-error-100 text-error-700 text-sm font-medium transition-colors disabled:opacity-40">
              Reject
            </button>
            <button disabled={transitioning} onClick={() => onTransition('proposed')}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-40">
              {transitioning ? 'Updating…' : 'Propose'}
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </button>
          </div>
        </div>
        {rejectOpen && (
          <div className="bg-error-50 border-t border-error-200 px-5 py-4 flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-error-700 mb-1">Reason for rejection</label>
              <select value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-error-300 bg-white focus:outline-none">
                {REJECTION_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button disabled={transitioning}
              onClick={() => { setRejectOpen(false); onTransition('rejected', { 'rejection-reason': rejectReason }) }}
              className="px-4 py-1.5 bg-error-600 hover:bg-error-700 text-white text-sm font-medium transition-colors disabled:opacity-40">
              Confirm Rejection
            </button>
            <button onClick={() => setRejectOpen(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        )}
      </div>
    )
  }

  if (status === 'proposed') {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 bg-success-50 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-success-700">Accept, reject, or return this decision?</p>
            <p className="text-xs text-success-600 mt-0.5">Accepting approves the change; it must then be Applied once delivered.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button disabled={transitioning} onClick={() => onTransition('draft')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-colors disabled:opacity-40">
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
              Back to Draft
            </button>
            <button disabled={transitioning} onClick={() => setRejectOpen(r => !r)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-error-50 border border-error-300 hover:bg-error-100 text-error-700 text-sm font-medium transition-colors disabled:opacity-40">
              Reject
            </button>
            <button disabled={transitioning} onClick={() => onTransition('accepted')}
              className="flex items-center gap-2 px-4 py-1.5 bg-success-500 hover:bg-success-700 text-white text-sm font-medium transition-colors disabled:opacity-40">
              {transitioning ? 'Updating…' : 'Accept'}
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </button>
          </div>
        </div>
        {rejectOpen && (
          <div className="bg-error-50 border-t border-error-200 px-5 py-4 flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-error-700 mb-1">Reason for rejection</label>
              <select value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-error-300 bg-white focus:outline-none">
                {REJECTION_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button disabled={transitioning}
              onClick={() => { setRejectOpen(false); onTransition('rejected', { 'rejection-reason': rejectReason }) }}
              className="px-4 py-1.5 bg-error-600 hover:bg-error-700 text-white text-sm font-medium transition-colors disabled:opacity-40">
              Confirm Rejection
            </button>
            <button onClick={() => setRejectOpen(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        )}
      </div>
    )
  }

  if (status === 'accepted') {
    return (
      <div className="flex items-center justify-between gap-4 bg-emerald-50 px-5 py-4 mb-6">
        <div>
          <p className="text-sm font-semibold text-emerald-800">Stage this decision for application?</p>
          <p className="text-xs text-emerald-600 mt-0.5">Staging kicks off the Apply Changes workflow, which applies artefact edits on the decisions branch and opens a PR.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button disabled={transitioning} onClick={() => onTransition('proposed')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-colors disabled:opacity-40">
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
              <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
            Back to Proposed
          </button>
          <button disabled={transitioning} onClick={() => onTransition('staged')}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium transition-colors disabled:opacity-40">
            {transitioning ? 'Staging…' : 'Stage'}
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  if (status === 'staged') {
    return (
      <div className="flex items-center justify-between gap-4 bg-gray-800 px-5 py-4 mb-6">
        <div>
          <p className="text-sm font-semibold text-white">Ready to commit?</p>
          <p className="text-xs text-gray-300 mt-0.5">Committing merges the architecture changes PR into main and closes the decisions branch.</p>
        </div>
        <button disabled={transitioning} onClick={() => onTransition('committed', { prNumber: decision?.['pr-number'] })}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-40">
          {transitioning ? 'Committing…' : `Commit to v${versionId}`}
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </button>
      </div>
    )
  }

  return null
}

// ── Analysis table ────────────────────────────────────────────────────────────

function AnalysisTable({ rows, sectionKey, accepted, onAccept, saving }) {
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
            const key = `${sectionKey}-${i}`
            // Accept/decline state: local `accepted` map takes precedence over the JSON field
            const state = accepted[key] ?? row.review ?? null
            const isSaving = saving === key
            return (
              <tr key={i} className={`align-top ${state === 'accepted' ? 'bg-success-50' : state === 'declined' ? 'bg-error-50' : ''}`}>
                <td className="px-3 py-2.5 text-gray-700 w-1/5">{row.finding ?? '—'}</td>
                <td className="px-3 py-2.5 text-gray-700 w-1/5">{row.impact ?? '—'}</td>
                <td className="px-3 py-2.5 text-gray-700 w-1/5">{row.recommendation ?? '—'}</td>
                <td className="px-3 py-2.5 text-gray-700 w-1/5">{row.rationale ?? '—'}</td>
                <td className="px-3 py-2.5 w-28">
                  {isSaving ? (
                    <span className="text-xs text-gray-400">Saving…</span>
                  ) : !state ? (
                    <div className="flex gap-1">
                      <button onClick={() => onAccept(sectionKey, i, 'accepted')}
                        className="px-2 py-0.5 text-xs bg-success-50 text-success-700 hover:bg-success-100 transition-colors">Accept</button>
                      <button onClick={() => onAccept(sectionKey, i, 'declined')}
                        className="px-2 py-0.5 text-xs bg-error-50 text-error-700 hover:bg-error-100 transition-colors">Decline</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-medium ${state === 'accepted' ? 'text-success-700' : 'text-error-700'}`}>
                        {state === 'accepted' ? 'Accepted' : 'Declined'}
                      </span>
                      <button onClick={() => onAccept(sectionKey, i, null)}
                        className="text-xs text-gray-400 hover:text-gray-600 ml-1">×</button>
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

// ── Review section (narrative-validation findings, separate from Analysis) ────

function ReviewSection({ decision, accepted, onAccept, saving }) {
  const rows = decision['narrative-validation']
  if (!rows?.length) return null
  return (
    <div id="section-review">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Review</h3>
      <AnalysisTable rows={rows} sectionKey="narrative-validation" accepted={accepted} onAccept={onAccept} saving={saving} />
    </div>
  )
}

// ── Analysis tabs (Untitled UI underline style) ───────────────────────────────

const ANALYSIS_SECTIONS = [
  { key: 'impact-assessment',     label: 'Impact Assessment' },
  { key: 'referential-integrity', label: 'Referential Integrity' },
  { key: 'strategy-alignment',    label: 'Strategy Alignment' },
  { key: 'principles-alignment',  label: 'Principles Alignment' },
  { key: 'proponent-analysis',    label: 'Proponent Analysis' },
  { key: 'challenger-analysis',   label: 'Challenger Analysis' },
]

function ArchitectureChanges({ changes }) {
  if (!changes?.length) return null
  const TYPE_STYLES = {
    create: 'bg-success-50 text-success-700',
    update: 'bg-blue-50 text-blue-700',
    delete: 'bg-error-50 text-error-700',
    rename: 'bg-amber-50 text-amber-700',
    move:   'bg-violet-50 text-violet-700',
  }
  return (
    <div id="section-architecture-changes">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Architecture Changes</h3>
      <div className="border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Artefact', 'Change', 'Description', 'Detail'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {changes.map((c, i) => (
              <tr key={i} className="align-top">
                <td className="px-3 py-2.5">
                  <span className="font-mono text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5">{c['artefact-id']}</span>
                  <span className="text-xs text-gray-500 ml-1.5">{c['artefact-name']}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 capitalize ${TYPE_STYLES[c['change-type']] ?? 'bg-gray-100 text-gray-600'}`}>
                    {c['change-type']}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-gray-700">{c.description}</td>
                <td className="px-3 py-2.5 text-gray-400 text-xs">{c.detail ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AnalysisTabs({ decision, accepted, onAccept, saving }) {
  // Always show all tabs — never filter by whether data exists
  const [activeTab, setActiveTab] = useState(ANALYSIS_SECTIONS[0]?.key ?? null)

  const activeSections = decision[activeTab] ?? []
  const hasFindings = activeSections.length > 0

  return (
    <div id="section-analysis">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Analysis</h3>

      {/* Underline tab bar — all sections always shown */}
      <div className="border-b border-gray-200 flex gap-0 flex-wrap">
        {ANALYSIS_SECTIONS.map(section => {
          const count = decision[section.key]?.length ?? 0
          const isActive = section.key === activeTab
          return (
            <button
              key={section.key}
              onClick={() => setActiveTab(section.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {section.label}
              <span className={`text-xs px-1.5 py-0.5 font-medium tabular-nums ${
                isActive ? 'bg-brand-100 text-brand-700' : count > 0 ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-300'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="pt-4">
        {hasFindings ? (
          <AnalysisTable
            rows={activeSections}
            sectionKey={activeTab ?? ''}
            accepted={accepted}
            onAccept={onAccept}
            saving={saving}
          />
        ) : (
          <div className="border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
            <p className="text-sm font-medium text-gray-500">No findings yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              This section will be populated once the analysis workflow has run.
              Workflows can take a few minutes — check back shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── History section ───────────────────────────────────────────────────────────

const HISTORY_STYLES = {
  opened:    'bg-gray-100 text-gray-600',
  proposed:  'bg-blue-50 text-blue-700',
  accepted:  'bg-success-50 text-success-700',
  staged:    'bg-emerald-100 text-emerald-800',
  committed: 'bg-gray-800 text-white',
  rejected:  'bg-error-50 text-error-700',
}

function formatTs(ts) {
  try {
    const d = new Date(ts)
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return ts }
}

function HistorySection({ history }) {
  if (!history?.length) return null
  return (
    <div id="section-history">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">History</h3>
      <div className="border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-48">Date / Time</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Event</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((entry, i) => (
              <tr key={i} className="align-top">
                <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{formatTs(entry.timestamp)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 capitalize ${HISTORY_STYLES[entry.event] ?? 'bg-gray-100 text-gray-600'}`}>
                    {entry.event}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{entry.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Scope chip (consistent format across detail + index pages) ───────────────

function ScopeChipDetail({ scope }) {
  if (!scope?.domain) return null
  const domainData = getDomain(scope.domain)
  const dc = DOMAIN_COLORS[scope.domain]
  const abstractionName = scope.abstraction ? getAbstraction(scope.abstraction)?.name ?? scope.abstraction : null
  const artefactName    = scope.artefact    ? getArtefact(scope.artefact)?.name    ?? scope.artefact    : null
  const extra = [abstractionName, artefactName].filter(Boolean)
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 flex-shrink-0 ${dc?.bg ?? 'bg-gray-100'} ${dc?.text ?? 'text-gray-700'}`}>
      <DomainIcon domain={scope.domain} className="w-3 h-3 flex-shrink-0" />
      {domainData?.name ?? scope.domain}
      {extra.length > 0 && <span className="opacity-60 ml-0.5">› {extra.join(' › ')}</span>}
    </span>
  )
}

// ── Section jump nav ──────────────────────────────────────────────────────────

function SectionNav({ decision }) {
  const sections = [
    { id: 'section-narrative',    label: 'Narrative' },
    decision.requirements?.length && { id: 'section-requirements',       label: 'Requirements' },
    decision['narrative-validation']?.length && { id: 'section-review',  label: 'Review' },
    { id: 'section-analysis',     label: 'Analysis' },
    decision['architecture-changes']?.length && { id: 'section-architecture-changes', label: 'Architecture Changes' },
    decision.history?.length     && { id: 'section-history',             label: 'History' },
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
  const location = useLocation()
  const { clientsMetadata } = useArchitecture()
  const [decision, setDecision] = useState(undefined)
  const [accepted, setAccepted] = useState({})    // local overrides for finding review state
  const [saving, setSaving] = useState(null)       // key of the finding being saved, e.g. 'impact-assessment-0'
  const [transitioning, setTransitioning] = useState(false)
  const [transitionError, setTransitionError] = useState(null)
  const clientName = clientsMetadata[clientId]?.name ?? clientId

  usePageTitle(decision?.title ? `${decision.title} — Decisions` : 'Decision')

  // Use branch-then-main fallback via getDecision helper.
  // Bust CDN cache if we just navigated back from the editor after a save.
  useEffect(() => {
    const bust = !!location.state?.cacheBust
    getDecision(clientId, versionId, decisionId, undefined, { bust })
      .then(setDecision)
      .catch(() => setDecision(null))
  }, [clientId, versionId, decisionId])

  async function handleAccept(sectionKey, findingIndex, review) {
    const key = `${sectionKey}-${findingIndex}`
    // Optimistic update
    setAccepted(prev => {
      if (review === null) { const n = { ...prev }; delete n[key]; return n }
      return { ...prev, [key]: review }
    })
    setSaving(key)
    try {
      await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-finding', clientId, versionId, decisionId, sectionKey, findingIndex, review }),
      })
    } catch { /* optimistic — failure leaves local state changed */ }
    finally { setSaving(null) }
  }

  async function handleTransition(newStatus, extraFields = {}) {
    setTransitioning(true)
    setTransitionError(null)
    const updates = { status: newStatus, ...extraFields }
    setDecision(prev => prev ? { ...prev, ...updates } : prev)
    try {
      const action = newStatus === 'committed' ? 'commit-decision' : 'update-decision'
      const body = action === 'commit-decision'
        ? { action, clientId, versionId, decisionId, prNumber: decision?.['pr-number'] }
        : { action, clientId, versionId, decisionId, updates }
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Update failed')
      // Re-fetch busting CDN cache so the new status is immediately visible
      getDecision(clientId, versionId, decisionId, newStatus, { bust: true }).then(setDecision).catch(() => {})
    } catch (err) {
      setTransitionError(err.message)
    } finally {
      setTransitioning(false)
    }
  }

  if (decision === undefined) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
  }
  if (decision === null) {
    return <Navigate to={`/clients/${clientId}/${versionId}/decisions`} replace />
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 pb-5 border-b border-gray-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 14 14" fill="none">
              <path d="M2 2h10v10H2zM2 5h10M5 5v7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900">{decision.title}</h1>
            {decision.scope && (
              <div className="mt-2">
                <ScopeChipDetail scope={decision.scope} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 self-start">
            <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1">
              {decision['decision-id']}
            </span>
            {decision['rejection-reason'] && (
              <span className="text-xs text-gray-400">{decision['rejection-reason']}</span>
            )}
            {decision.status === 'draft' && (
              <Link
                to={`/clients/${clientId}/${versionId}/decisions/${decisionId}/edit`}
                className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                  <path d="M9.5 1.5l3 3-8 8H1.5v-3l8-8z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>

      <StatusProgress status={decision.status} />
      <SectionNav decision={decision} />

      <div className="space-y-8">
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

        {/* Review — narrative-validation findings, separate from analysis tabs */}
        <ReviewSection decision={decision} accepted={accepted} onAccept={handleAccept} saving={saving} />

        {/* Status actions — above analysis */}
        <StatusActions status={decision.status} onTransition={handleTransition} transitioning={transitioning} decision={decision} versionId={versionId} />
        {transitionError && (
          <div className="px-4 py-3 bg-error-50 border border-error-300 text-error-700 text-sm">
            Failed to update: {transitionError}
          </div>
        )}

        {/* Divider before analysis */}
        <hr className="border-gray-200" />

        {/* Analysis — tabbed (excludes Narrative Review) */}
        <AnalysisTabs decision={decision} accepted={accepted} onAccept={handleAccept} saving={saving} />

        {/* Status actions — duplicated below analysis for convenience */}
        <StatusActions status={decision.status} onTransition={handleTransition} transitioning={transitioning} decision={decision} versionId={versionId} />

        {/* Architecture Changes */}
        <ArchitectureChanges changes={decision['architecture-changes']} />

        {/* History */}
        <HistorySection history={decision.history} />
      </div>

      <JsonPreview data={decision} label={`${decision['decision-id']}.json`} />
    </div>
  )
}
