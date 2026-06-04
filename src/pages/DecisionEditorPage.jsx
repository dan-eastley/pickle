import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
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

function PreviewPanel({ decision }) {
  return (
    <div className="bg-gray-900 text-gray-100 p-4 overflow-auto text-xs font-mono leading-relaxed h-full">
      <pre>{JSON.stringify(decision, null, 2)}</pre>
    </div>
  )
}

export default function DecisionEditorPage() {
  const { clientId } = useParams()
  const { clientsMetadata } = useArchitecture()
  const clientName = clientsMetadata[clientId]?.name ?? clientId
  usePageTitle(`New Decision — ${clientName}`)

  const [title, setTitle] = useState('')
  const [narrative, setNarrative] = useState('')
  const [requirements, setRequirements] = useState([])
  const [scopeDomain, setScopeDomain] = useState('')
  const [scopeAbstraction, setScopeAbstraction] = useState('')
  const [scopeArtefact, setScopeArtefact] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [saved, setSaved] = useState(false)

  const filteredAbstractions = scopeDomain ? ABSTRACTIONS : []
  const filteredArtefacts = scopeDomain
    ? ARTEFACTS.filter(a =>
        a.domain === scopeDomain &&
        (!scopeAbstraction || a.abstraction === scopeAbstraction)
      )
    : []

  const decision = {
    'decision-id': 'adr-NEW',
    title: title || '(untitled)',
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

  function handleSave() {
    // TODO: push to repo on a new branch — deferred to a later implementation
    setSaved(true)
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-2">
        <Link to={`/clients/${clientId}/decisions`} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Decisions
        </Link>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">New Architecture Decision Record</h1>
          <p className="mt-1 text-sm text-gray-500">{clientName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(p => !p)}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {showPreview ? 'Hide Preview' : 'Preview JSON'}
          </button>
          <button
            onClick={handleSave}
            disabled={!narrative.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Save Decision
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 bg-success-50 border border-success-500 text-success-700 text-sm">
          Decision record saved. Branch creation and PR workflow will be available in a future release.
        </div>
      )}

      <div className={`grid gap-6 ${showPreview ? 'grid-cols-2' : 'grid-cols-1 max-w-3xl'}`}>
        {/* Form */}
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
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
              Describe the context, the problem being solved, and the proposed direction. This is the core of the decision record.
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
              Optional. List the specific requirements this decision must address.
            </p>
            <RequirementsList requirements={requirements} onChange={setRequirements} />
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scope constraint</label>
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

        {/* JSON preview */}
        {showPreview && (
          <div className="border border-gray-200 overflow-hidden">
            <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-500">
              decision.json preview
            </div>
            <PreviewPanel decision={decision} />
          </div>
        )}
      </div>
    </div>
  )
}
