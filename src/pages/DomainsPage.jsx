import { Link, useParams } from 'react-router-dom'
import { DOMAINS, DOMAIN_COLORS, getArtefactsForDomain } from '../lib/artefacts'
import FormatIcon from '../components/ui/FormatIcon'

function DomainCard({ domain, base }) {
  const colors = DOMAIN_COLORS[domain.id]
  const artefacts = getArtefactsForDomain(domain.id)
  const catalogues = artefacts.filter(a => a.format === 'catalogue').length
  const diagrams = artefacts.filter(a => a.format === 'diagram').length

  return (
    <Link
      to={`${base}/domains/${domain.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 hover:shadow-md transition-all shadow-xs"
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
          <span className={`text-xs font-bold ${colors.text}`}>{domain.acronym}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
            {domain.name} Architecture
          </h3>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">{domain.description}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <FormatIcon format="catalogue" className="w-3.5 h-3.5" />
              {catalogues} {catalogues === 1 ? 'catalogue' : 'catalogues'}
            </span>
            {diagrams > 0 && (
              <span className="flex items-center gap-1">
                <FormatIcon format="diagram" className="w-3.5 h-3.5" />
                {diagrams} {diagrams === 1 ? 'diagram' : 'diagrams'}
              </span>
            )}
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 flex-shrink-0 mt-0.5 transition-colors" viewBox="0 0 20 20" fill="none">
          <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  )
}

export default function DomainsPage() {
  const { clientId, versionId } = useParams()
  const base = `/clients/${clientId}/${versionId}`

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Architecture Domains</h1>
        <p className="mt-1 text-sm text-gray-500">
          Five domains, each modelled at three abstraction layers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DOMAINS.map(domain => (
          <DomainCard key={domain.id} domain={domain} base={base} />
        ))}
      </div>
    </div>
  )
}
