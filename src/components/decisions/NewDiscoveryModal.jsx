import { useState } from 'react'
import { createPortal } from 'react-dom'
import { DOMAIN_COLORS } from '../../lib/artefacts'
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
  const [saved, setSaved] = useState(false)

  const canSave = title.trim() && context.trim() && request.trim()

  const isDirty = !!(title || context || request)
  const requestClose = () => {
    if (!saved && isDirty && !window.confirm('Discard this discovery? Your changes will be lost.')) return
    onClose()
  }
  useEscapeKey(requestClose)

  function handleSave() {
    // TODO: persist to repo and dispatch the Virtual Architect Agent workflow.
    setSaved(true)
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
          {/* Header — AI gradient to match the Virtual Architect Agent */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-50 to-rose-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center flex-shrink-0">
                <RobotIcon className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">New Architecture Discovery</h2>
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

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {saved ? (
              <div className="py-6 text-center">
                <div className="text-success-700 font-medium text-sm mb-1">Discovery captured.</div>
                <p className="text-xs text-gray-400">
                  The Virtual Architect Agent workflow will run it in a future release.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Which capabilities depend on this platform?"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
                    autoFocus
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

                <div className="pt-2 border-t border-gray-100">
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
                  disabled={!canSave}
                  className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-red-600 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RobotIcon className="w-4 h-4" />
                  New Architecture Discovery
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
