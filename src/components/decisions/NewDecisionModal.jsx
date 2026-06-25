import { useState } from 'react'
import { createPortal } from 'react-dom'
import { DOMAIN_COLORS } from '../../lib/artefacts'
import { nameWithId } from '../../lib/format'
import useEscapeKey from '../../hooks/useEscapeKey'
import ScopeSelector from './ScopeSelector'
import TextLink from '../ui/TextLink'
import AutoGrowTextarea from '../ui/AutoGrowTextarea'
import { DecisionIcon } from '../ui/icons'

export default function NewDecisionModal({ artefact, documents = [], selectedDocument, clientId, versionId, onClose }) {
  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')
  const [problem, setProblem] = useState('')
  const [proposal, setProposal] = useState('')
  const [scopeDomain, setScopeDomain] = useState(artefact.domain)
  const [scopeAbstraction, setScopeAbstraction] = useState(artefact.abstraction)
  const [scopeArtefact, setScopeArtefact] = useState(artefact.id)
  const [scopeDocument, setScopeDocument] = useState(selectedDocument?.id ?? '')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)  // { ok, decisionId } | { ok:false, error }
  const saved = !!result?.ok

  const colors = DOMAIN_COLORS[artefact.domain]

  // A document-level scope is only offered when the scoped artefact is the
  // document artefact we're viewing (the one whose documents we have to hand).
  const showDocumentScope =
    artefact.format === 'document' && scopeArtefact === artefact.id && documents.length > 0

  // Confirm before discarding in-progress input.
  const isDirty = !!(title || context || problem || proposal)
  const requestClose = () => {
    if (!saved && isDirty && !window.confirm('Discard this decision? Your changes will be lost.')) return
    onClose()
  }

  useEscapeKey(requestClose)

  const canSave = title.trim() && context.trim() && problem.trim() && proposal.trim()

  async function handleSave() {
    setSaving(true)
    setResult(null)
    // Decision scope is domain/abstraction/artefact only (no document level).
    const scope = scopeDomain ? {
      domain: scopeDomain,
      ...(scopeAbstraction && { abstraction: scopeAbstraction }),
      ...(scopeArtefact && { artefact: scopeArtefact }),
    } : null
    try {
      const idRes = await fetch(`/api/github?action=next-id&clientId=${clientId}&versionId=${versionId}`)
      const { nextId, error: idError } = await idRes.json()
      if (idError) throw new Error(idError)
      const decision = {
        'decision-id': nextId,
        title,
        status: 'draft',
        context, problem, proposal,
        narrative: [
          context && `## Context\n\n${context}`,
          problem && `## Problem\n\n${problem}`,
          proposal && `## Proposal\n\n${proposal}`,
        ].filter(Boolean).join('\n\n'),
        ...(scope && { scope }),
        activity: [{ timestamp: new Date().toISOString(), action: 'Created', who: 'Joe B' }],
      }
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-decision', clientId, versionId, decision }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create decision')
      setResult({ ok: true, decisionId: nextId })
    } catch (err) {
      setResult({ ok: false, error: err.message })
    } finally {
      setSaving(false)
    }
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
      <div className="fixed inset-0 bg-black/30 z-[150]" onClick={requestClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-4xl flex flex-col shadow-xl max-h-[90vh]">
          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-4 ${colors.bg} flex-shrink-0`}>
            <div>
              <h2 className="text-base font-semibold text-gray-900">New Architecture Decision</h2>
            </div>
            <button
              onClick={requestClose}
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
                <div className="text-success-700 font-medium text-sm mb-1">{result.decisionId} created as a draft.</div>
                <p className="text-xs text-gray-400 mb-3">Narrative Review is running to suggest improvements.</p>
                <TextLink to={`/clients/${clientId}/${versionId}/decisions/${result.decisionId}`} state={{ cacheBust: true }} onClick={onClose} className="text-sm font-medium">
                  Open {result.decisionId} →
                </TextLink>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 leading-relaxed border-l-2 border-brand-200 pl-3">
                  An Architecture Decision is how a change to the architecture gets proposed and governed —
                  capture the context, problem, and proposed direction; the agents analyse it and, once
                  accepted, the change is applied through a reviewed pull request.
                </p>
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Short, human-readable summary of the decision"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
                    autoFocus
                  />
                </div>

                {/* Context */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Context <span className="text-error-500">*</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-1.5">
                    The current situation — what is happening that prompts this decision. Written for a business audience.
                  </p>
                  <AutoGrowTextarea
                    value={context}
                    onChange={e => setContext(e.target.value)}
                    placeholder="Today we..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
                  />
                </div>

                {/* Problem */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problem <span className="text-error-500">*</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-1.5">
                    What needs to be fixed or addressed — the gap or pain in the current situation.
                  </p>
                  <AutoGrowTextarea
                    value={problem}
                    onChange={e => setProblem(e.target.value)}
                    placeholder="This is a problem because..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
                  />
                </div>

                {/* Proposal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proposal <span className="text-error-500">*</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-1.5">
                    How we propose to solve it — the direction, at a business level.
                  </p>
                  <AutoGrowTextarea
                    value={proposal}
                    onChange={e => setProposal(e.target.value)}
                    placeholder="We propose to..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
                  />
                </div>

                {/* Scope */}
                <div className="border border-gray-200 bg-gray-50 p-4">
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
                  onClick={requestClose}
                  className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!canSave || saving}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    colors?.button ?? 'bg-brand-600 hover:bg-brand-700 text-white'
                  }`}
                >
                  <DecisionIcon className="w-4 h-4" />
                  {saving ? 'Creating…' : 'New Architecture Decision'}
                </button>
              </div>
            </div>
          )}
          {result?.ok === false && (
            <div className="px-5 py-2.5 border-t border-error-200 bg-error-50 text-error-700 text-xs flex-shrink-0">
              {result.error}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
