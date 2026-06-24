import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import ScopeSelector from '../components/decisions/ScopeSelector'
import TextLink from '../components/ui/TextLink'
import AutoGrowTextarea from '../components/ui/AutoGrowTextarea'
import FormHelp from '../components/ui/FormHelp'
import ActionBar from '../components/ui/ActionBar'
import { RobotIcon } from '../components/ui/icons'
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
      <ActionBar
        className="mb-6"
        title="New Architecture Discovery"
        strapline={`${clientName} · v${versionId}`}
        primary={
          <button
            onClick={handleSave}
            disabled={!canSave || saved}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-red-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <RobotIcon className="w-4 h-4" />
            New Architecture Discovery
          </button>
        }
      />

      {saved && (
        <div className="mb-4 px-4 py-3 bg-success-50 border border-success-500 text-success-700 text-sm">
          Discovery captured. The Virtual Architect Agent workflow will run it in a future release.{' '}
          <TextLink to={`/clients/${clientId}/${versionId}/discovery`} className="font-medium">
            Back to Discovery →
          </TextLink>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 max-w-2xl space-y-5">
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
            <AutoGrowTextarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Today we..."
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
            />
          </div>

          {/* Request */}
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

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
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

        <FormHelp
          title="Asking a good question"
          tips={[
            ['Title', 'The question in a nutshell — short and scannable.'],
            ['Context', 'Why are you asking now, and what does the architecture look like today?'],
            ['Request', 'Exactly what you want the agent to find, trace, or compare across the model.'],
            ['Scope', 'Optional. Narrow it to a domain, layer, or artefact to focus the answer.'],
          ]}
          footer="The Virtual Architect Agent reads the architecture as data and produces a point-in-time view you can keep."
        />
      </div>
    </div>
  )
}
