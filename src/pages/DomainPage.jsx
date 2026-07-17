import { useState, useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import {
  getDomain,
  ABSTRACTIONS,
  getArtefactsForDomain,
  DOMAIN_COLORS,
  FORMAT_ORDER,
  getFormat,
} from '../lib/artefacts'
import { loadVersionMetrics } from '../lib/metrics'
import FormatIcon from '../components/ui/FormatIcon'
import Button from '../components/ui/Button'
import PageActionBar from '../components/ui/PageActionBar'
import StatsBar from '../components/ui/StatsBar'
import ArtefactRow from '../components/artefacts/ArtefactRow'
import { DecisionIcon, RobotIcon, ChevronRight } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

function AbstractionSection({ abstraction, artefacts, base, domain, clientId, versionId }) {
  // Build format groups in canonical order, starred at top of each group
  const groups = FORMAT_ORDER.map((fmtId) => {
    const items = artefacts.filter((a) => a.format === fmtId)
    if (!items.length) return null
    return {
      format: fmtId,
      fmt: getFormat(fmtId),
      items: [...items.filter((a) => a.key), ...items.filter((a) => !a.key)],
    }
  }).filter(Boolean)

  const rows = []
  groups.forEach((group) => {
    rows.push({ type: 'header', format: group.format, fmt: group.fmt, count: group.items.length })
    group.items.forEach((artefact, i) =>
      rows.push({ type: 'artefact', artefact, firstInGroup: i === 0 })
    )
  })

  return (
    <div className="border border-gray-200 bg-white">
      {/* Abstraction header: dark band with a layer chip (HANDOFF §6) */}
      <Link
        to={`${base}/domains/${domain}/${abstraction.id}`}
        className="group flex items-center justify-between px-5 py-2.5 bg-gray-800 text-white hover:bg-gray-900 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[11px] font-semibold px-2 py-0.5 bg-white/15">
            {abstraction.label}
          </span>
          <span className="text-sm font-semibold">{abstraction.name}</span>
          <span className="text-xs text-gray-400 truncate">{abstraction.description}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white flex-shrink-0 transition-colors" />
      </Link>

      {rows.map((row) =>
        row.type === 'header' ? (
          <div
            key={`h-${row.format}`}
            className="flex items-center gap-1.5 px-5 py-1.5 bg-gray-50 border-b border-gray-100"
          >
            <FormatIcon format={row.format} className="w-3 h-3 text-gray-500" />
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              {row.format === 'document' ? 'Document Types' : (row.fmt?.label ?? row.format)} (
              {row.count})
            </span>
          </div>
        ) : (
          <ArtefactRow
            key={row.artefact.id}
            artefact={row.artefact}
            to={`${base}/domains/${domain}/${row.artefact.abstraction}/${row.artefact.id}`}
            clientId={clientId}
            versionId={versionId}
            divider={!row.firstInGroup}
          />
        )
      )}
    </div>
  )
}

export default function DomainPage() {
  const { clientId, versionId, domain } = useParams()
  const base = `/architectures/${clientId}/${versionId}`
  const domainData = getDomain(domain)
  usePageTitle(domainData ? `${domainData.name} Architecture` : null)

  const [stats, setStats] = useState(null)
  useEffect(() => {
    let live = true
    setStats(null)
    loadVersionMetrics(clientId, versionId)
      .then((m) => {
        if (!live) return
        const dm = m?.perDomain?.[domain]
        const cells = (dm?.items ?? [])
          .filter((i) => i.count > 0)
          .map((i) => ({ value: i.count, label: i.label }))
        if (dm?.documents) cells.push({ value: dm.documents, label: 'Documents' })
        setStats(cells)
      })
      .catch(() => live && setStats([]))
    return () => {
      live = false
    }
  }, [clientId, versionId, domain])

  if (!domainData) return <Navigate to={`${base}/domains`} replace />

  return (
    <div>
      <div className="mb-6">
        <PageActionBar
          domain={domain}
          showIcon
          title={`${domainData.name} Architecture`}
          id={domainData.acronym}
          description={domainData.description}
          tertiary={
            <Button to={`${base}/decisions?domain=${domain}`} variant="tertiary" size="h8">
              View Decisions
            </Button>
          }
          secondary={
            <Button to={`${base}/discovery/new`} variant="secondary" size="h8">
              <RobotIcon className="w-3.5 h-3.5" />
              New Discovery
            </Button>
          }
          primary={
            <Button to={`${base}/decisions/new`} variant="primary" domain={domain} size="h8">
              <DecisionIcon className="w-3.5 h-3.5" />
              New Decision
            </Button>
          }
        >
          {stats && stats.length > 0 && <StatsBar stats={stats} />}
        </PageActionBar>
      </div>

      <div className="space-y-6">
        {ABSTRACTIONS.map((abstraction) => {
          const artefacts = getArtefactsForDomain(domain, abstraction.id)
          return (
            <AbstractionSection
              key={abstraction.id}
              abstraction={abstraction}
              artefacts={artefacts}
              base={base}
              domain={domain}
              clientId={clientId}
              versionId={versionId}
            />
          )
        })}
      </div>
    </div>
  )
}
