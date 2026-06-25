import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import useEscapeKey from '../../hooks/useEscapeKey'
import ScopeSelector from './ScopeSelector'
import TextLink from '../ui/TextLink'
import AutoGrowTextarea from '../ui/AutoGrowTextarea'
import { RobotIcon } from '../ui/icons'

export default function NewDiscoveryModal({ artefact, clientId, versionId, onClose }) {
  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')
  const [request, setRequest] = useState('')
  const [scopeDomain, setScopeDomain] = useState(artefact.domain)
  const [scopeAbstraction, setScopeAbstraction] = useState(artefact.abstraction)
  const [scopeArtefact, setScopeArtefact] = useState(artefact.id)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null) // { ok, discoveryId } | { ok:false, error }
  const saved = !!result?.ok
  const titleRef = useRef(null)
  useEffect(() => { titleRef.current?.focus() }, [])

  const canSave = title.trim() && context.trim() && request.trim()

  const isDirty = !!(title || context || request)
  const requestClose = () => {
    if (!saved && isDirty && !window.confirm('Discard this discovery? Your changes will be lost.')) return
    onClose()
  }
  useEscapeKey(requestClose)

  async function handleSave() {
    setSaving(true)
    setResult(null)
    const scope = scopeDomain ? {
      domain: scopeDomain,
      ...(scopeAbstraction && { abstraction: scopeAbstraction }),
      ...(scopeArtefact && { artefact: scopeArtefact }),
    } : null
    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-discovery',
          clientId, versionId,
          discovery: { title, context, request, ...(scope && { scope }) },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create discovery')
      setResult({ ok: true, discoveryId: data.discoveryId })
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
  ].filter(Boolean).join('&')
  const fullEditorUrl = `/clients/${clientId}/${versionId}/discovery/new${scopeParams ? `?${scopeParams}` : ''}`

  return createPortal(
    <>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div className="fixed inset-0 bg-black/30 z-[150]" onClick={requestClose} />

      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-4xl flex flex-col shadow-xl max-h-[90vh]">
          {/* Header — plain coloured bar, icon, title + purpose */}
          <div className="flex items-start justify-between gap-3 px-5 py-4 bg-blue-50 flex-shrink-0">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 bg-white/70 flex items-center justify-center flex-shrink-0">
                <RobotIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">New Architecture Discovery</h2>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Ask the Virtual Architect Agent a question about your architecture — describe the
                  situation and what you want to know, and it produces a point-in-time view from the
                  model as it stands today. It's read-only; nothing is changed.
                </p>
              </div>
            </div>
            <button
              onClick={requestClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white/50 transition-colors flex-shrink-0"
              title="Close (Esc)"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {saved ? (
              <div className="py-6 text-center">
                <div className="text-success-700 font-medium text-sm mb-1">
                  {result.discoveryId} created.
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  The Virtual Architect Agent is running to produce its findings.
                </p>
                <TextLink to={`/clients/${clientId}/${versionId}/discovery/${result.discoveryId}`} onClick={onClose} className="text-sm font-medium">
                  Open {result.discoveryId} →
                </TextLink>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-error-500">*</span>
                  </label>
                  <input
                    ref={titleRef}
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Which capabilities depend on this platform?"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Context <span className="text-error-500">*</span>
                  </label>
                  <AutoGrowTextarea
                    value={context}
                    onChange={e => setContext(e.target.value)}
                    placeholder="Today we..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request <span className="text-error-500">*</span>
                  </label>
                  <AutoGrowTextarea
                    value={request}
                    onChange={e => setRequest(e.target.value)}
                    placeholder="List the..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
                  />
                </div>

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
                    }}
                  />
                </div>
              </>
            )}
          </div>

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
                  className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RobotIcon className="w-4 h-4" />
                  {saving ? 'Creating…' : 'New Architecture Discovery'}
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
