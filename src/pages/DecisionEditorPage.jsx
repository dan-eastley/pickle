import { useState, useEffect, useId } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { getDecision } from '../lib/api'
import ScopeSelector from '../components/decisions/ScopeSelector'
import TextLink from '../components/ui/TextLink'
import Button from '../components/ui/Button'
import ActionBar from '../components/ui/ActionBar'
import AutoGrowTextarea from '../components/ui/AutoGrowTextarea'
import FormHelp from '../components/ui/FormHelp'
import Spinner from '../components/ui/Spinner'
import { PlusIcon, CloseIcon, DecisionIcon } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

function RequirementsList({ requirements, onChange }) {
  function add() {
    onChange([...requirements, { title: '', description: '', type: 'Functional' }])
  }
  function update(i, field, val) {
    onChange(requirements.map((r, j) => (j === i ? { ...r, [field]: val } : r)))
  }
  function remove(i) {
    onChange(requirements.filter((_, j) => j !== i))
  }

  return (
    <div className="space-y-3">
      {requirements.map((req, i) => (
        <div key={i} className="border border-gray-200 bg-gray-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={req.title ?? ''}
              onChange={(e) => update(i, 'title', e.target.value)}
              placeholder="Requirement title"
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
            />
            <select
              value={req.type ?? 'Functional'}
              onChange={(e) => update(i, 'type', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
            >
              <option>Functional</option>
              <option>Non-Functional</option>
            </select>
            <button
              onClick={() => remove(i)}
              className="p-1.5 text-gray-400 hover:text-error-600 transition-colors flex-shrink-0"
              title="Remove"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={req.description ?? ''}
            onChange={(e) => update(i, 'description', e.target.value)}
            rows={2}
            placeholder="What must the system do or achieve? Be specific and testable."
            className="w-full px-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white resize-none"
          />
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

export default function DecisionEditorPage() {
  const fid = useId() // base for associating field labels with their inputs
  const { clientId, versionId, decisionId } = useParams()
  const [searchParams] = useSearchParams()
  const { clientsMetadata } = useArchitecture()
  const clientName = clientsMetadata[clientId]?.name ?? clientId
  const isEdit = !!decisionId

  usePageTitle(isEdit ? `Edit ${decisionId} — ${clientName}` : `New Decision — ${clientName}`)

  const [loadingExisting, setLoadingExisting] = useState(isEdit)
  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')
  const [problem, setProblem] = useState('')
  const [proposal, setProposal] = useState('')
  const [requirements, setRequirements] = useState([])
  const [scopeDomain, setScopeDomain] = useState(searchParams.get('domain') ?? '')
  const [scopeAbstraction, setScopeAbstraction] = useState(searchParams.get('abstraction') ?? '')
  const [scopeArtefact, setScopeArtefact] = useState(searchParams.get('artefact') ?? '')
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState(null)

  // In edit mode, fetch existing decision and pre-populate fields
  useEffect(() => {
    if (!isEdit) return
    getDecision(clientId, versionId, decisionId)
      .then((d) => {
        if (!d) return
        setTitle(d.title ?? '')
        // Prefer the split fields; fall back to legacy narrative → Context
        setContext(d.context ?? d.narrative ?? '')
        setProblem(d.problem ?? '')
        setProposal(d.proposal ?? '')
        setRequirements(d.requirements ?? [])
        setScopeDomain(d.scope?.domain ?? '')
        setScopeAbstraction(d.scope?.abstraction ?? '')
        setScopeArtefact(d.scope?.artefact ?? '')
      })
      .finally(() => setLoadingExisting(false))
  }, [isEdit, clientId, versionId, decisionId])

  const scope = scopeDomain
    ? {
        domain: scopeDomain,
        ...(scopeAbstraction && { abstraction: scopeAbstraction }),
        ...(scopeArtefact && { artefact: scopeArtefact }),
      }
    : null

  async function handleSave() {
    setSaving(true)
    setSaveResult(null)
    try {
      if (isEdit) {
        // Edit mode — update existing decision on branch, re-run narrative review
        const res = await fetch('/api/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'edit-decision',
            clientId,
            versionId,
            decisionId,
            title,
            context,
            problem,
            proposal,
            requirements: requirements.filter((r) => r.description?.trim()),
            scope,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to save changes')
        setSaveResult({ ok: true, edit: true, decisionId })
      } else {
        // Create mode — get next ID, create decision, open PR
        const idRes = await fetch(
          `/api/github?action=next-id&clientId=${clientId}&versionId=${versionId}`
        )
        const { nextId, error: idError } = await idRes.json()
        if (idError) throw new Error(idError)

        const decision = {
          'decision-id': nextId,
          title,
          status: 'draft',
          context,
          problem,
          proposal,
          narrative: [
            context && `## Context\n\n${context}`,
            problem && `## Problem\n\n${problem}`,
            proposal && `## Proposal\n\n${proposal}`,
          ]
            .filter(Boolean)
            .join('\n\n'),
          activity: [{ timestamp: new Date().toISOString(), action: 'Created', who: 'Joe B' }],
          ...(requirements.filter((r) => r.description?.trim()).length > 0 && {
            requirements: requirements.filter((r) => r.description?.trim()),
          }),
          ...(scope && { scope }),
        }

        const res = await fetch('/api/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create-decision', clientId, versionId, decision }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to create decision')
        setSaveResult({
          ok: true,
          edit: false,
          prUrl: data.prUrl,
          prNumber: data.prNumber,
          decisionId: nextId,
        })
      }
    } catch (err) {
      setSaveResult({ ok: false, error: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loadingExisting) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <ActionBar
        className="mb-6"
        title={isEdit ? `Edit ${decisionId}` : 'New Architecture Decision'}
        strapline={`${clientName} · v${versionId}`}
        secondary={
          isEdit && (
            <Button
              to={`/clients/${clientId}/${versionId}/decisions/${decisionId}`}
              variant="secondary"
              size="lg"
            >
              Cancel
            </Button>
          )
        }
        primary={
          <button
            onClick={handleSave}
            disabled={
              !title.trim() || !context.trim() || !problem.trim() || !proposal.trim() || saving
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <DecisionIcon className="w-4 h-4" />
            {saving
              ? isEdit
                ? 'Saving…'
                : 'Creating…'
              : isEdit
                ? 'Save Changes'
                : 'New Architecture Decision'}
          </button>
        }
      />

      {saveResult?.ok && isEdit && (
        <div className="mb-4 px-4 py-3 bg-success-50 border border-success-500 text-success-700 text-sm">
          Changes saved. Narrative Review is running to refresh the analysis.{' '}
          <TextLink
            to={`/clients/${clientId}/${versionId}/decisions/${decisionId}`}
            state={{ cacheBust: true }}
            className="font-medium"
          >
            Back to {decisionId} →
          </TextLink>
        </div>
      )}
      {saveResult?.ok && !isEdit && (
        <div className="mb-4 px-4 py-3 bg-success-50 border border-success-500 text-success-700 text-sm">
          <span className="font-semibold">{saveResult.decisionId}</span> created as a draft.
          Narrative Review is running to suggest improvements.{' '}
          <TextLink
            to={`/clients/${clientId}/${versionId}/decisions/${saveResult.decisionId}`}
            state={{ cacheBust: true }}
            className="font-medium"
          >
            Open {saveResult.decisionId} →
          </TextLink>
        </div>
      )}
      {saveResult?.ok === false && (
        <div className="mb-4 px-4 py-3 bg-error-50 border border-error-300 text-error-700 text-sm">
          {saveResult.error}
        </div>
      )}

      <p className="max-w-2xl mb-6 text-sm text-gray-500 leading-relaxed border-l-2 border-brand-200 pl-3">
        An Architecture Decision is how a change to the architecture gets proposed and governed.
        Capture the context, the problem, and your proposed direction — the agents then analyse its
        impact and alignment, and once accepted the change is applied through a reviewed pull
        request. Every change stays auditable.
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
              placeholder="e.g. Adopt event-driven integration for real-time data flows"
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

          {/* Problem */}
          <div>
            <label
              htmlFor={`${fid}-problem`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Problem <span className="text-error-500">*</span>
            </label>
            <AutoGrowTextarea
              id={`${fid}-problem`}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="This is a problem because..."
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
            />
          </div>

          {/* Proposal */}
          <div>
            <label
              htmlFor={`${fid}-proposal`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Proposal <span className="text-error-500">*</span>
            </label>
            <AutoGrowTextarea
              id={`${fid}-proposal`}
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="We propose to..."
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
            />
          </div>

          {/* Requirements */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">Requirements</span>
            <RequirementsList requirements={requirements} onChange={setRequirements} />
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
          title="Writing a good decision"
          tips={[
            ['Title', 'A short, plain-language summary — the headline, not the detail.'],
            [
              'Context',
              'Set the scene: what’s happening today that makes this worth deciding? Write it for a business reader.',
            ],
            ['Problem', 'Name the gap or the pain. What hurts if nothing changes?'],
            [
              'Proposal',
              'The direction you’re leaning, at a business level — the “how”, not the implementation.',
            ],
            [
              'Requirements',
              'Optional. The testable things this must achieve — the “what”, never the “how”.',
            ],
            [
              'Scope',
              'Optional. Pin it to a domain, layer, or artefact so the agents analyse just that slice.',
            ],
          ]}
          footer="Don’t overthink it — the agents will review your draft and suggest improvements."
        />
      </div>
    </div>
  )
}
