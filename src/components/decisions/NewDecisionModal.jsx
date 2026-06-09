import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { DOMAIN_COLORS } from '../../lib/artefacts'
import ScopeSelector from './ScopeSelector'

function RequirementsList({ requirements, onChange }) {
  const add = () => onChange([...requirements, ''])
  const update = (i, val) => onChange(requirements.map((r, j) => j === i ? val : r))
  const remove = (i) => onChange(requirements.filter((_, j) => j !== i))

  return (
    <div className="space-y-2">
      {requirements.map((req, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={req}
            onChange={e => update(i, e.target.value)}
            placeholder={`Requirement ${i + 1}`}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
          />
          <button onClick={() => remove(i)} className="p-1 text-gray-400 hover:text-error-600 transition-colors">
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

export default function NewDecisionModal({ artefact, clientId, versionId, onClose }) {
  const [narrative, setNarrative] = useState('')
  const [requirements, setRequirements] = useState([])
  const [scopeDomain, setScopeDomain] = useState(artefact.domain)
  const [scopeAbstraction, setScopeAbstraction] = useState(artefact.abstraction)
  const [scopeArtefact, setScopeArtefact] = useState(artefact.id)
  const [saved, setSaved] = useState(false)

  const colors = DOMAIN_COLORS[artefact.domain]

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSave() {
    // TODO: push to repo on new branch
    setSaved(true)
  }

  const scopeParams = [
    scopeDomain      && `domain=${scopeDomain}`,
    scopeAbstraction && `abstraction=${scopeAbstraction}`,
    scopeArtefact    && `artefact=${scopeArtefact}`,
  ].filter(Boolean).join('&')
  const fullEditorUrl = `/clients/${clientId}/${versionId}/decisions/new${scopeParams ? `?${scopeParams}` : ''}`

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-[150]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-xl flex flex-col shadow-xl max-h-[90vh]">
          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-4 ${colors.bg} flex-shrink-0`}>
            <div>
              <h2 className="text-base font-semibold text-gray-900">New Architecture Decision</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white/50 transition-colors"
              title="Close (Esc)"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {saved ? (
              <div className="py-6 text-center">
                <div className="text-success-700 font-medium text-sm mb-1">Decision record saved.</div>
                <p className="text-xs text-gray-400">
                  Branch creation and PR workflow will be available in a future release.
                </p>
              </div>
            ) : (
              <>
                {/* Scope */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                  <ScopeSelector
                    domain={scopeDomain}
                    abstraction={scopeAbstraction}
                    artefact={scopeArtefact}
                    onChange={({ domain, abstraction, artefact: a }) => {
                      setScopeDomain(domain)
                      setScopeAbstraction(abstraction)
                      setScopeArtefact(a)
                    }}
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
                    rows={5}
                    placeholder="We require... This is based on... The proposed approach is..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white resize-vertical"
                    autoFocus
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                  <p className="text-xs text-gray-400 mb-2">
                    List the specific things this decision must achieve. Each requirement should be testable, free of implementation detail, and state the <em>what</em> not the <em>how</em>.
                  </p>
                  <RequirementsList requirements={requirements} onChange={setRequirements} />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {!saved && (
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <Link
                to={fullEditorUrl}
                onClick={onClose}
                className="text-sm text-brand-600 hover:text-brand-700 transition-colors"
              >
                Open full editor →
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!narrative.trim()}
                  className={`px-4 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    {
                      business: 'bg-violet-600 hover:bg-violet-700',
                      data: 'bg-blue-600 hover:bg-blue-700',
                      integration: 'bg-emerald-600 hover:bg-emerald-700',
                      application: 'bg-amber-500 hover:bg-amber-600',
                      solution: 'bg-rose-600 hover:bg-rose-700',
                    }[artefact.domain] ?? 'bg-brand-600 hover:bg-brand-700'
                  }`}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
