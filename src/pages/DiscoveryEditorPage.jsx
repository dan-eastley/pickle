import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import ScopeSelector from '../components/decisions/ScopeSelector'
import TextLink from '../components/ui/TextLink'
import usePageTitle from '../hooks/usePageTitle'

export default function DiscoveryEditorPage() {
  const { clientId, versionId } = useParams()
  const [searchParams] = useSearchParams()
  const { clientsMetadata } = useArchitecture()
  const clientName = clientsMetadata[clientId]?.name ?? clientId

  usePageTitle(`New Discovery — ${clientName}`)

  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')
  const [request, setRequest] = useState('')
  const [status, setStatus] = useState('active')
  const [scopeDomain, setScopeDomain] = useState(searchParams.get('domain') ?? '')
  const [scopeAbstraction, setScopeAbstraction] = useState(searchParams.get('abstraction') ?? '')
  const [scopeArtefact, setScopeArtefact] = useState(searchParams.get('artefact') ?? '')
  const [saved, setSaved] = useState(false)

  const canSave = title.trim() && context.trim() && request.trim()

  function handleSave() {
    // TODO: persist to repo and dispatch the Virtual Architect Agent workflow.
    setSaved(true)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">New Discovery</h1>
          <p className="mt-1 text-sm text-gray-500">{clientName} · v{versionId}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!canSave || saved}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Raise Discovery
        </button>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 bg-success-50 border border-success-500 text-success-700 text-sm">
          Discovery captured. The Virtual Architect Agent workflow will run it in a future release.{' '}
          <TextLink to={`/clients/${clientId}/${versionId}/discovery`} className="font-medium">
            Back to Discovery →
          </TextLink>
        </div>
      )}

      <div className="max-w-3xl space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Which capabilities depend on Oracle CC&B?"
            className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
          />
        </div>

        {/* Context */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Context <span className="text-error-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-1.5">
            The situation framing the question — what the architecture currently looks like and why you are asking.
          </p>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            rows={4}
            placeholder="Today we..."
            className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white resize-vertical"
          />
        </div>

        {/* Request */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Request <span className="text-error-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-1.5">
            The question or analysis you want the Virtual Architect Agent to perform against the architecture.
          </p>
          <textarea
            value={request}
            onChange={e => setRequest(e.target.value)}
            rows={4}
            placeholder="List the..."
            className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white resize-vertical"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Scope */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
          <p className="text-xs text-gray-400 mb-2">
            Optional. Constrain the discovery to a specific domain, abstraction layer, or artefact type.
          </p>
          <ScopeSelector
            domain={scopeDomain}
            abstraction={scopeAbstraction}
            artefact={scopeArtefact}
            onChange={({ domain, abstraction, artefact }) => {
              setScopeDomain(domain)
              setScopeAbstraction(abstraction)
              setScopeArtefact(artefact)
            }}
          />
        </div>
      </div>
    </div>
  )
}
