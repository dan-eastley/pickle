import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { DOMAINS, ABSTRACTIONS, ARTEFACTS } from '../lib/artefacts'
import usePageTitle from '../hooks/usePageTitle'

function RequirementsList({ requirements, onChange }) {
  function add() { onChange([...requirements, '']) }
  function update(i, val) { onChange(requirements.map((r, j) => j === i ? val : r)) }
  function remove(i) { onChange(requirements.filter((_, j) => j !== i)) }

  return (
    <div className="space-y-2">
      {requirements.map((req, i) => (
        <div key={i} className="flex items-start gap-2">
          <input
            type="text"
            value={req}
            onChange={e => update(i, e.target.value)}
            placeholder={`Requirement ${i + 1}`}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
          />
          <button
            onClick={() => remove(i)}
            className="p-2 text-gray-400 hover:text-error-600 transition-colors flex-shrink-0"
            title="Remove"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
        Add requirement
      </button>
    </div>
  )
}

export default function DecisionEditorPage() {
  const { clientId, versionId } = useParams()
  const [searchParams] = useSearchParams()
  const { clientsMetadata } = useArchitecture()
  const clientName = clientsMetadata[clientId]?.name ?? clientId
  usePageTitle(`New Decision — ${clientName}`)

  const [title, setTitle] = useState('')
  const [narrative, setNarrative] = useState('')
  const [requirements, setRequirements] = useState([])
  const [scopeDomain, setScopeDomain] = useState(searchParams.get('domain') ?? '')
  const [scopeAbstraction, setScopeAbstraction] = useState(searchParams.get('abstraction') ?? '')
  const [scopeArtefact, setScopeArtefact] = useState(searchParams.get('artefact') ?? '')
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState(null)

  const filteredAbstractions = scopeDomain ? ABSTRACTIONS : []
  const filteredArtefacts = scopeDomain
    ? ARTEFACTS.filter(a =>
        a.domain === scopeDomain &&
        (!scopeAbstraction || a.abstraction === scopeAbstraction)
      )
    : []

  const decision = {
    'decision-id': 'ADR-NEW',
    title: title,
    status: 'draft',
    narrative: narrative || '',
    ...(requirements.filter(Boolean).length > 0 && {
      requirements: requirements.filter(Boolean).map((r, i) => ({
        id: `REQ-${String(i + 1).padStart(3, '0')}`,
        description: r,
      })),
    }),
    ...(scopeDomain && {
      scope: {
        domain: scopeDomain,
        ...(scopeAbstraction && { abstraction: scopeAbstraction }),
        ...(scopeArtefact && { artefact: scopeArtefact }),
      },
    }),
  }

  async function handleSave() {
    setSaving(true)
    setSaveResult(null)
    try {
      const idRes = await fetch(`/api/github?action=next-id&clientId=${clientId}&versionId=${versionId}`)
      const { nextId, error: idError } = await idRes.json()
      if (idError) throw new Error(idError)

      const fullDecision = { ...decision, 'decision-id': nextId }

      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-decision', clientId, versionId, decision: fullDecision }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create decision')
      setSaveResult({ ok: true, prUrl: data.prUrl, prNumber: data.prNumber, decisionId: nextId })
    } catch (err) {
      setSaveResult({ ok: false, error: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">New Decision</h1>
          <p className="mt-1 text-sm text-gray-500">{clientName} · v{versionId}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!title.trim() || !narrative.trim() || saving}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Creating…' : 'Create Decision & Open PR'}
        </button>
      </div>

      {saveResult?.ok && (
        <div className="mb-4 px-4 py-3 bg-success-50 border border-success-500 text-success-700 text-sm">
          <span className="font-semibold">{saveResult.decisionId}</span> created.{' '}
          <a href={saveResult.prUrl} target="_blank" rel="noreferrer" className="underline font-medium">
            View PR #{saveResult.prNumber} on GitHub →
          </a>
        </div>
      )}
      {saveResult?.ok === false && (
        <div className="mb-4 px-4 py-3 bg-error-50 border border-error-300 text-error-700 text-sm">
          Failed to create decision: {saveResult.error}
        </div>
      )}

      <div className="max-w-3xl space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-error-500">*</span></label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Adopt event-driven integration for real-time data flows"
            className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
          />
        </div>

        {/* Narrative */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Narrative <span className="text-error-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-1.5">
            State the business context, the problem being solved, and the proposed direction. Be specific — name the artefacts, capabilities, or systems affected, and explain why the change is needed now.
          </p>
          <textarea
            value={narrative}
            onChange={e => setNarrative(e.target.value)}
            rows={6}
            placeholder="We require... This is based on... The proposed approach is..."
            className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white resize-vertical"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
          <p className="text-xs text-gray-400 mb-2">
            Optional. List the specific things this decision must achieve. Each requirement should be testable and state the <em>what</em>, not the <em>how</em>.
          </p>
          <RequirementsList requirements={requirements} onChange={setRequirements} />
        </div>

        {/* Scope */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
          <p className="text-xs text-gray-400 mb-2">
            Optional. Constrain the decision to a specific domain, abstraction layer, or artefact type.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Domain</label>
              <select
                value={scopeDomain}
                onChange={e => { setScopeDomain(e.target.value); setScopeAbstraction(''); setScopeArtefact('') }}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
              >
                <option value="">Any</option>
                {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Abstraction</label>
              <select
                value={scopeAbstraction}
                onChange={e => { setScopeAbstraction(e.target.value); setScopeArtefact('') }}
                disabled={!scopeDomain}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white disabled:opacity-40"
              >
                <option value="">Any</option>
                {filteredAbstractions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Artefact type</label>
              <select
                value={scopeArtefact}
                onChange={e => setScopeArtefact(e.target.value)}
                disabled={!scopeDomain}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white disabled:opacity-40"
              >
                <option value="">Any</option>
                {filteredArtefacts.map(a => <option key={a.id} value={a.id}>{a.id} — {a.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
