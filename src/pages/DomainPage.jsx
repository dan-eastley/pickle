import { Link, useParams, Navigate } from 'react-router-dom'
import {
  getDomain, ABSTRACTIONS, getArtefactsForDomain,
  DOMAIN_COLORS, ABSTRACTION_COLORS, FORMAT_ORDER, getFormat,
} from '../lib/artefacts'
import DomainIcon from '../components/ui/DomainIcon'
import FormatIcon from '../components/ui/FormatIcon'
import ArtefactRow from '../components/artefacts/ArtefactRow'
import usePageTitle from '../hooks/usePageTitle'

function AbstractionSection({ abstraction, artefacts, base, domain, clientId, versionId }) {
  const colors = ABSTRACTION_COLORS[abstraction.id]

  // Build format groups in canonical order, starred at top of each group
  const groups = FORMAT_ORDER
    .map(fmtId => {
      const items = artefacts.filter(a => a.format === fmtId)
      if (!items.length) return null
      return {
        format: fmtId,
        fmt: getFormat(fmtId),
        items: [...items.filter(a => a.key), ...items.filter(a => !a.key)],
      }
    })
    .filter(Boolean)

  // Flat list with group-header markers for rendering
  const rows = []
  groups.forEach(group => {
    rows.push({ type: 'header', format: group.format, fmt: group.fmt })
    group.items.forEach((artefact, i) => rows.push({ type: 'artefact', artefact, firstInGroup: i === 0 }))
  })

  return (
    <div className="border border-gray-200 bg-white">
      {/* Abstraction header */}
      <Link
        to={`${base}/domains/${domain}/${abstraction.id}`}
        className="group flex items-center justify-between px-5 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-0.5 ${colors.badge}`}>
            {abstraction.label}
          </span>
          <span className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
            {abstraction.name}
          </span>
          <span className="text-xs text-gray-400">{abstraction.description}</span>
        </div>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </Link>

      {/* Format-grouped artefacts */}
      {rows.map((row, i) =>
        row.type === 'header' ? (
          <div key={`h-${row.format}`} className="flex items-center gap-1.5 px-5 py-1.5 bg-gray-50 border-b border-gray-100">
            <FormatIcon format={row.format} className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {row.fmt?.label ?? row.format}
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
  const base = `/clients/${clientId}/${versionId}`
  const domainData = getDomain(domain)
  const colors = DOMAIN_COLORS[domain]
  usePageTitle(domainData ? `${domainData.name} Architecture` : null)

  if (!domainData) return <Navigate to={`${base}/domains`} replace />

  return (
    <div>
      <div className="mb-6 flex items-start gap-4 pb-5 border-b border-gray-200">
        <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${colors?.bg}`}>
          <span className={colors?.text}>
            <DomainIcon domain={domain} className="w-5 h-5" />
          </span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{domainData.name} Architecture</h1>
          <p className="mt-1 text-sm text-gray-500 max-w-3xl">{domainData.description}</p>
        </div>
      </div>

      <div>
        {ABSTRACTIONS.map((abstraction, idx) => {
          const artefacts = getArtefactsForDomain(domain, abstraction.id)
          return (
            <div key={abstraction.id}>
              {idx > 0 && <div className="h-px bg-gray-300 my-5" />}
              <AbstractionSection
                abstraction={abstraction}
                artefacts={artefacts}
                base={base}
                domain={domain}
                clientId={clientId}
                versionId={versionId}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
