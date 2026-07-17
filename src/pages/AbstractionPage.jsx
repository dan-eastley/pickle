import { useParams, Navigate } from 'react-router-dom'
import {
  getDomain,
  getAbstraction,
  getArtefactsForDomain,
  ABSTRACTION_COLORS,
  FORMAT_ORDER,
  getFormat,
} from '../lib/artefacts'
import FormatIcon from '../components/ui/FormatIcon'
import Button from '../components/ui/Button'
import ArtefactRow from '../components/artefacts/ArtefactRow'
import usePageTitle from '../hooks/usePageTitle'

export default function AbstractionPage() {
  const { clientId, versionId, domain, abstraction } = useParams()
  const base = `/architectures/${clientId}/${versionId}`
  const domainData = getDomain(domain)
  const abstractionData = getAbstraction(abstraction)
  const colors = ABSTRACTION_COLORS[abstraction]
  usePageTitle(
    abstractionData && domainData ? `${abstractionData.name} · ${domainData.name}` : null
  )

  if (!domainData || !abstractionData) {
    return <Navigate to={`${base}/domains/${domain}`} replace />
  }

  const artefacts = getArtefactsForDomain(domain, abstraction)

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
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 ${colors?.badge}`}>
            {abstractionData.label}
          </span>
          <span className="text-xs text-gray-500">{domainData.name} Architecture</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">{abstractionData.name}</h1>
        <p className="mt-1 text-sm text-gray-500 max-w-3xl">{abstractionData.description}</p>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">View for this domain &amp; abstraction</span>
          <Button
            to={`${base}/decisions?domain=${domain}&abstraction=${abstraction}`}
            variant="secondary"
            size="sm"
          >
            Decisions
          </Button>
          <Button
            to={`${base}/discovery?domain=${domain}&abstraction=${abstraction}`}
            variant="secondary"
            size="sm"
          >
            Discovery
          </Button>
        </div>
      </div>

      <div className="border border-gray-200 bg-white">
        {rows.map((row) =>
          row.type === 'header' ? (
            <div
              key={`h-${row.format}`}
              className="flex items-center gap-1.5 px-5 py-1.5 bg-gray-50 border-b border-gray-100"
            >
              <FormatIcon format={row.format} className="w-3 h-3 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {row.format === 'document' ? 'Document Types' : (row.fmt?.label ?? row.format)} (
                {row.count})
              </span>
            </div>
          ) : (
            <ArtefactRow
              key={row.artefact.id}
              artefact={row.artefact}
              to={`${base}/domains/${domain}/${abstraction}/${row.artefact.id}`}
              clientId={clientId}
              versionId={versionId}
              divider={!row.firstInGroup}
            />
          )
        )}
      </div>
    </div>
  )
}
