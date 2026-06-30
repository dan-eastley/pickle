import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import ScopeChip from '../components/decisions/ScopeChip'
import ScopeFilter from '../components/decisions/ScopeFilter'
import Button from '../components/ui/Button'
import ActionBar from '../components/ui/ActionBar'
import JsonPreview from '../components/ui/JsonPreview'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ExpandCollapseAll from '../components/ui/ExpandCollapseAll'
import { ChevronRight, ChevronDown, RobotIcon } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

const POTS = [
  { status: 'active', label: 'Active', badge: 'bg-emerald-50 text-emerald-700' },
  { status: 'archived', label: 'Archived', badge: 'bg-gray-100 text-gray-500' },
]

function DiscoveryGroup({ pot, discoveries, clientId, versionId, collapsed, onToggle }) {
  const open = !collapsed

  return (
    <div className="border border-gray-200 bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-200"
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-0.5 ${pot.badge}`}>{pot.label}</span>
          <span className="text-xs text-gray-500">
            {discoveries.length} {discoveries.length === 1 ? 'Discovery' : 'Discoveries'}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && discoveries.length === 0 && (
        <div className="px-5 py-3 text-xs text-gray-500">No discoveries in this pot.</div>
      )}

      {open && discoveries.length > 0 && (
        <div className="divide-y divide-gray-100">
          {discoveries.map((d) => (
            <Link
              key={d['discovery-id']}
              to={`/architectures/${clientId}/${versionId}/discovery/${d['discovery-id']}`}
              className="group flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center flex-shrink-0">
                <RobotIcon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors truncate">
                  {d.title}
                </p>
              </div>
              {d.scope && <ScopeChip scope={d.scope} />}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-mono text-gray-500">{d['discovery-id']}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DiscoveryPage() {
  const { clientId, versionId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { clientsMetadata } = useArchitecture()
  const [loading, setLoading] = useState(true)
  const [discoveries, setDiscoveries] = useState([])
  const [collapsedOverride, setCollapsedOverride] = useState(null)

  const filterDomain = searchParams.get('domain') ?? ''
  const filterAbstraction = searchParams.get('abstraction') ?? ''
  const filterArtefact = searchParams.get('artefact') ?? ''
  const statusParam = searchParams.get('status') ?? ''

  const clientName = clientsMetadata[clientId]?.name ?? clientId
  usePageTitle(`${clientName} · Discovery`)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/arch/${clientId}/${versionId}/discovery/discovery.json`)
      .then((r) => (r.ok ? r.json() : { discoveries: [] }))
      .then((data) => {
        if (cancelled) return
        setDiscoveries(data.discoveries ?? [])
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [clientId, versionId])

  // Deep-link: ?status=<s> opens just that pot (e.g. from the domains overview).
  useEffect(() => {
    if (statusParam)
      setCollapsedOverride(new Set(POTS.map((p) => p.status).filter((s) => s !== statusParam)))
  }, [statusParam])

  const isFiltered = !!(filterDomain || filterAbstraction || filterArtefact)
  const filtered = discoveries.filter((d) => {
    if (filterDomain && d.scope?.domain !== filterDomain) return false
    if (filterAbstraction && d.scope?.abstraction !== filterAbstraction) return false
    if (filterArtefact && d.scope?.artefact !== filterArtefact) return false
    return true
  })
  const hiddenByFilter = discoveries.length - filtered.length

  const grouped = POTS.map((pot) => ({
    pot,
    discoveries: filtered.filter((d) => (d.status ?? 'active') === pot.status),
  }))

  const isCollapsed = (status, count) =>
    collapsedOverride ? collapsedOverride.has(status) : status !== 'active' && count === 0
  const toggleGroup = (status) =>
    setCollapsedOverride((prev) => {
      const next = new Set(
        prev ??
          grouped
            .filter((g) => isCollapsed(g.pot.status, g.discoveries.length))
            .map((g) => g.pot.status)
      )
      next.has(status) ? next.delete(status) : next.add(status)
      return next
    })
  const expandAll = () => setCollapsedOverride(new Set())
  const collapseAll = () => setCollapsedOverride(new Set(POTS.map((p) => p.status)))

  return (
    <div>
      <ActionBar
        className="mb-6"
        title="Architecture Discovery"
        strapline={`${clientName} · v${versionId}`}
        primary={
          <Button
            to={`/architectures/${clientId}/${versionId}/discovery/new`}
            size="lg"
            variant="primary"
          >
            <RobotIcon className="w-4 h-4" />
            New Architecture Discovery
          </Button>
        }
      />

      <div className="mb-5 p-4 bg-gray-50 border border-gray-200">
        <ScopeFilter searchParams={searchParams} setSearchParams={setSearchParams} />
      </div>

      {isFiltered && (
        <div className="mb-5 flex items-center justify-between gap-3 px-4 py-2.5 bg-brand-50 border border-brand-200 text-sm text-brand-800">
          <span>
            Showing {filtered.length} of {discoveries.length} discover
            {discoveries.length === 1 ? 'y' : 'ies'}
            {hiddenByFilter > 0 && `, ${hiddenByFilter} hidden by the scope filter`}.
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
      ) : discoveries.length === 0 ? (
        <div className="border border-gray-200 bg-white">
          <EmptyState
            illustration="catalogue"
            title="No discoveries yet"
            description="Raise a discovery to ask the Virtual Architect Agent a question about this architecture."
          />
        </div>
      ) : (
        <>
          <div className="mb-2 flex justify-end">
            <ExpandCollapseAll onExpandAll={expandAll} onCollapseAll={collapseAll} />
          </div>
          <div className="space-y-3">
            {grouped.map(({ pot, discoveries: group }) => (
              <DiscoveryGroup
                key={pot.status}
                pot={pot}
                discoveries={group}
                clientId={clientId}
                versionId={versionId}
                collapsed={isCollapsed(pot.status, group.length)}
                onToggle={() => toggleGroup(pot.status)}
              />
            ))}
          </div>
        </>
      )}

      <JsonPreview data={{ discoveries }} label="discovery.json" />
    </div>
  )
}
