import { useState } from 'react'
import { createPortal } from 'react-dom'
import { DOMAIN_COLORS } from '../../lib/artefacts'
import { nameWithId } from '../../lib/format'
import useEscapeKey from '../../hooks/useEscapeKey'
import ScopeSelector from './ScopeSelector'
import TextLink from '../ui/TextLink'
import { PlusIcon, CloseIcon } from '../ui/icons'

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
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Add requirement
      </button>
    </div>
  )
}

export default function NewDecisionModal({ artefact, documents = [], selectedDocument, clientId, versionId, onClose }) {
  const [narrative, setNarrative] = useState('')
  const [requirements, setRequirements] = useState([])
  const [scopeDomain, setScopeDomain] = useState(artefact.domain)
  const [scopeAbstraction, setScopeAbstraction] = useState(artefact.abstraction)
  const [scopeArtefact, setScopeArtefact] = useState(artefact.id)
  const [scopeDocument, setScopeDocument] = useState(selectedDocument?.id ?? '')
  const [saved, setSaved] = useState(false)

  const colors = DOMAIN_COLORS[artefact.domain]

  // A document-level scope is only offered when the scoped artefact is the
  // document artefact we're viewing (the one whose documents we have to hand).
  const showDocumentScope =
    artefact.format === 'document' && scopeArtefact === artefact.id && documents.length > 0

  useEscapeKey(onClose)

  function handleSave() {
    // TODO: push to repo on new branch
    setSaved(true)
  }

  const scopeParams = [
    scopeDomain      && `domain=${scopeDomain}`,
    scopeAbstraction && `abstraction=${scopeAbstraction}`,
    scopeArtefact    && `artefact=${scopeArtefact}`,
    showDocumentScope && scopeDocument && `document=${scopeDocument}`,
  ].filter(Boolean).join('&')
  const fullEditorUrl = `/clients/${clientId}/${versionId}/decisions/new${scopeParams ? `?${scopeParams}` : ''}`

  return createPortal(
    <>
      {/* Backdrop: click dismisses; keyboard users dismiss with Escape (useEscapeKey). */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div className="fixed inset-0 bg-black/30 z-[150]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-4xl flex flex-col shadow-xl max-h-[90vh]">
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
                      if (a !== artefact.id) setScopeDocument('')
                    }}
                  />

                  {showDocumentScope && (
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Document</label>
                      <select
                        value={scopeDocument}
                        onChange={e => setScopeDocument(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 bg-white focus:outline-none focus:border-brand-500 text-gray-700"
                      >
                        <option value="">Whole artefact (all documents)</option>
                        {documents.map(d => (
                          <option key={d.id} value={d.id}>{nameWithId(d.title, d.id)}</option>
                        ))}
                      </select>
                    </div>
                  )}
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
                    List the specific things this decision must achieve. Each requirement should be testable, free of implementation detail, and state the "what" not the "how".
                  </p>
                  <RequirementsList requirements={requirements} onChange={setRequirements} />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {!saved && (
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <TextLink to={fullEditorUrl} onClick={onClose} className="text-sm">
                Open full editor →
              </TextLink>
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
                  className={`px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    colors?.button ?? 'bg-brand-600 hover:bg-brand-700 text-white'
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
