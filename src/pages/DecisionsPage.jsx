import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { DECISION_STATUS_ORDER, decisionStatusBadge, decisionStatusLabel } from '../lib/theme'
import ScopeChip from '../components/decisions/ScopeChip'
import ScopeFilter from '../components/decisions/ScopeFilter'
import Button from '../components/ui/Button'
import ActionBar from '../components/ui/ActionBar'
import JsonPreview from '../components/ui/JsonPreview'
import Spinner from '../components/ui/Spinner'
import ExpandCollapseAll from '../components/ui/ExpandCollapseAll'
import { ChevronRight, ChevronDown, DecisionIcon } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

const STATUS_DEFAULT_OPEN = new Set(['draft', 'proposed'])

function DecisionGroup({ status, decisions, clientId, versionId, collapsed, onToggle }) {
  const open = !collapsed

  return (
    <div className="border border-gray-200 bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-200"
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-0.5 ${decisionStatusBadge(status)}`}>
            {decisionStatusLabel(status)}
          </span>
          <span className="text-xs text-gray-400">
            {decisions.length} {decisions.length === 1 ? 'Decision' : 'Decisions'}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && decisions.length === 0 && (
        <div className="px-5 py-3 text-xs text-gray-400">No decisions at this stage.</div>
      )}

      {open && decisions.length > 0 && (
        <div className="divide-y divide-gray-100">
          {decisions.map((d) => (
            <Link
              key={d['decision-id']}
              to={`/clients/${clientId}/${versionId}/decisions/${d['decision-id']}`}
              className="group flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              {/* Decision icon */}
              <div className="w-8 h-8 bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                <DecisionIcon className="w-4 h-4 text-gray-500" />
              </div>

              {/* Title */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors truncate">
                  {d.title}
                </p>
                {d.narrative && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{d.narrative}</p>
                )}
              </div>

              {/* Scope */}
              {d.scope && <ScopeChip scope={d.scope} />}

              {/* ID + chevron */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-mono text-gray-400">{d['decision-id']}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DecisionsPage() {
  const { clientId, versionId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { clientsMetadata } = useArchitecture()
  const [loading, setLoading] = useState(true)
  const [decisions, setDecisions] = useState([])
  // Collapsed group keys. null = "use the default" (open draft/proposed + any
  // non-empty group); Expand/Collapse all replaces it with an explicit set.
  const [collapsedOverride, setCollapsedOverride] = useState(null)

  const filterDomain = searchParams.get('domain') ?? ''
  const filterAbstraction = searchParams.get('abstraction') ?? ''
  const filterArtefact = searchParams.get('artefact') ?? ''
  const statusParam = searchParams.get('status') ?? ''

  const clientName = clientsMetadata[clientId]?.name ?? clientId
  usePageTitle(`${clientName} — Decisions`)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/arch/clients/${clientId}/${versionId}/decisions/decisions.json`)
      .then((r) => (r.ok ? r.json() : { decisions: [] }))
      .then((data) => {
        if (cancelled) return
        setDecisions(data.decisions ?? [])
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [clientId, versionId])

  // Deep-link: ?status=<s> opens just that status group (e.g. from the domains
  // overview), collapsing the rest so the user lands focused on it.
  useEffect(() => {
    if (statusParam)
      setCollapsedOverride(new Set(DECISION_STATUS_ORDER.filter((s) => s !== statusParam)))
  }, [statusParam])

  const isFiltered = !!(filterDomain || filterAbstraction || filterArtefact)
  const filtered = decisions.filter((d) => {
    if (filterDomain && d.scope?.domain !== filterDomain) return false
    if (filterAbstraction && d.scope?.abstraction !== filterAbstraction) return false
    if (filterArtefact && d.scope?.artefact !== filterArtefact) return false
    return true
  })
  const hiddenByFilter = decisions.length - filtered.length

  const grouped = DECISION_STATUS_ORDER.map((status) => ({
    status,
    decisions: filtered.filter((d) => (d.status ?? 'draft') === status),
  }))
  const knownStatuses = new Set(DECISION_STATUS_ORDER)
  const unknown = filtered.filter((d) => !knownStatuses.has(d.status ?? 'draft'))
  if (unknown.length > 0) grouped.push({ status: 'unknown', decisions: unknown })

  const isCollapsed = (status, count) =>
    collapsedOverride
      ? collapsedOverride.has(status)
      : count === 0 || !STATUS_DEFAULT_OPEN.has(status)
  const toggleGroup = (status) =>
    setCollapsedOverride((prev) => {
      const next = new Set(
        prev ??
          grouped.filter((g) => isCollapsed(g.status, g.decisions.length)).map((g) => g.status)
      )
      next.has(status) ? next.delete(status) : next.add(status)
      return next
    })
  const expandAll = () => setCollapsedOverride(new Set())
  const collapseAll = () => setCollapsedOverride(new Set(grouped.map((g) => g.status)))

  return (
    <div>
      <ActionBar
        className="mb-6"
        title="Architecture Decisions"
        strapline={`${clientName} · v${versionId}`}
        primary={
          <Button to={`/clients/${clientId}/${versionId}/decisions/new`} size="lg">
            <DecisionIcon className="w-4 h-4" />
            New Architecture Decision
          </Button>
        }
      />

      <div className="mb-5 p-4 bg-gray-50 border border-gray-200">
        <ScopeFilter searchParams={searchParams} setSearchParams={setSearchParams} />
      </div>

      {isFiltered && (
        <div className="mb-5 flex items-center justify-between gap-3 px-4 py-2.5 bg-brand-50 border border-brand-200 text-sm text-brand-800">
          <span>
            Showing {filtered.length} of {decisions.length} decision
            {decisions.length === 1 ? '' : 's'}
            {hiddenByFilter > 0 && ` — ${hiddenByFilter} hidden by the scope filter`}.
          </span>
          <button
            onClick={() => setSearchParams(new URLSearchParams())}
            className="flex-shrink-0 font-medium text-brand-700 hover:text-brand-900 transition-colors"
          >
            Clear filter
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="mb-2 flex justify-end">
            <ExpandCollapseAll onExpandAll={expandAll} onCollapseAll={collapseAll} />
          </div>
          <div className="space-y-3">
            {grouped.map(({ status, decisions: group }) => (
              <DecisionGroup
                key={status}
                status={status}
                decisions={group}
                clientId={clientId}
                versionId={versionId}
                collapsed={isCollapsed(status, group.length)}
                onToggle={() => toggleGroup(status, group.length)}
              />
            ))}
          </div>
        </>
      )}

      {/* JSON preview of decisions.json index — for debugging */}
      <JsonPreview
        data={{
          decisions: decisions.map((d) => ({
            'decision-id': d['decision-id'],
            title: d.title,
            status: d.status,
            scope: d.scope,
          })),
        }}
        label="decisions.json"
      />
    </div>
  )
}
