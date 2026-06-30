import { useState, useId } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { githubAction } from '../lib/api'
import { buildScope } from '../lib/scope'
import ScopeSelector from '../components/decisions/ScopeSelector'
import TextLink from '../components/ui/TextLink'
import AutoGrowTextarea from '../components/ui/AutoGrowTextarea'
import FormHelp from '../components/ui/FormHelp'
import ActionBar from '../components/ui/ActionBar'
import { RobotIcon } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

export default function DiscoveryEditorPage() {
  const fid = useId() // base for associating field labels with their inputs
  const { clientId, versionId } = useParams()
  const [searchParams] = useSearchParams()
  const { clientsMetadata } = useArchitecture()
  const clientName = clientsMetadata[clientId]?.name ?? clientId

  usePageTitle(`New Discovery · ${clientName}`)

  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')
  const [request, setRequest] = useState('')
  const [scopeDomain, setScopeDomain] = useState(searchParams.get('domain') ?? '')
  const [scopeAbstraction, setScopeAbstraction] = useState(searchParams.get('abstraction') ?? '')
  const [scopeArtefact, setScopeArtefact] = useState(searchParams.get('artefact') ?? '')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null) // { ok, discoveryId } | { ok:false, error }

  const canSave = title.trim() && context.trim() && request.trim()

  const scope = buildScope(scopeDomain, scopeAbstraction, scopeArtefact)

  async function handleSave() {
    setSaving(true)
    setResult(null)
    try {
      const data = await githubAction({
        action: 'create-discovery',
        clientId,
        versionId,
        discovery: { title, context, request, ...(scope && { scope }) },
      })
      setResult({ ok: true, discoveryId: data.discoveryId })
    } catch (err) {
      setResult({ ok: false, error: err.message })
    } finally {
      setSaving(false)
    }
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
            disabled={!canSave || saving || result?.ok}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RobotIcon className="w-4 h-4" />
            {saving ? 'Creating…' : 'New Architecture Discovery'}
          </button>
        }
      />

      {result?.ok && (
        <div className="mb-4 px-4 py-3 bg-success-50 border border-success-500 text-success-700 text-sm">
          <span className="font-semibold">{result.discoveryId}</span> created. The Virtual Architect
          Agent is running to produce its findings.{' '}
          <TextLink
            to={`/architectures/${clientId}/${versionId}/discovery/${result.discoveryId}`}
            className="font-medium"
          >
            Open {result.discoveryId} →
          </TextLink>
        </div>
      )}
      {result?.ok === false && (
        <div className="mb-4 px-4 py-3 bg-error-50 border border-error-300 text-error-700 text-sm">
          {result.error}
        </div>
      )}

      <p className="max-w-2xl mb-6 text-sm text-gray-500 leading-relaxed border-l-2 border-blue-200 pl-3">
        A Discovery asks the Virtual Architect Agent a question about your architecture. Describe
        the situation and what you want to know, and it interrogates the model as it stands today to
        produce a point-in-time view you can keep: it's read-only, nothing is changed.
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 max-w-2xl space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor={`${fid}-title`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title <span className="text-error-500">*</span>
            </label>
            <input
              id={`${fid}-title`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Which capabilities depend on Oracle CC&B?"
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
            />
          </div>

          {/* Context */}
          <div>
            <label
              htmlFor={`${fid}-context`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Context <span className="text-error-500">*</span>
            </label>
            <AutoGrowTextarea
              id={`${fid}-context`}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Today we..."
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
            />
          </div>

          {/* Request */}
          <div>
            <label
              htmlFor={`${fid}-request`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Request <span className="text-error-500">*</span>
            </label>
            <AutoGrowTextarea
              id={`${fid}-request`}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="List the..."
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
            />
          </div>

          {/* Scope */}
          <div className="border border-gray-200 bg-gray-50 p-4">
            <span className="block text-sm font-medium text-gray-700 mb-1">Scope</span>
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
            ['Title', 'The question in a nutshell: short and scannable.'],
            ['Context', 'Why are you asking now, and what does the architecture look like today?'],
            [
              'Request',
              'Exactly what you want the agent to find, trace, or compare across the model.',
            ],
            ['Scope', 'Optional. Narrow it to a domain, layer, or artefact to focus the answer.'],
          ]}
          footer="The Virtual Architect Agent reads the architecture as data and produces a point-in-time view you can keep."
        />
      </div>
    </div>
  )
}
