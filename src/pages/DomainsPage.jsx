import { Link, useParams } from 'react-router-dom'
import { DOMAINS, DOMAIN_COLORS, getArtefactsForDomain } from '../lib/artefacts'
import DomainIcon from '../components/ui/DomainIcon'
import FormatIcon from '../components/ui/FormatIcon'
import usePageTitle from '../hooks/usePageTitle'

// Per-domain accent border colours (solid, not the -50 tint)
const DOMAIN_ACCENT = {
  business:    'border-violet-400',
  data:        'border-blue-400',
  integration: 'border-emerald-400',
  application: 'border-amber-400',
  solution:    'border-rose-400',
}

function DomainCard({ domain, base }) {
  const colors = DOMAIN_COLORS[domain.id]
  const accent = DOMAIN_ACCENT[domain.id]
  const artefacts = getArtefactsForDomain(domain.id)
  const catalogues = artefacts.filter(a => a.format === 'catalogue').length
  const diagrams = artefacts.filter(a => a.format === 'diagram').length

  return (
    <Link
      to={`${base}/domains/${domain.id}`}
      className={`group flex items-start gap-4 p-5 bg-white hover:bg-gray-50 transition-colors border-l-4 ${accent}`}
    >
      <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
        <span className={colors.text}>
          <DomainIcon domain={domain.id} className="w-5 h-5" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
          {domain.name} Architecture
        </h3>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed line-clamp-2">{domain.description}</p>
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
      <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors" viewBox="0 0 16 16" fill="none">
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      </svg>
    </Link>
  )
}

export default function DomainsPage() {
  const { clientId, versionId } = useParams()
  const base = `/clients/${clientId}/${versionId}`
  usePageTitle('Architecture Domains')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Architecture Domains</h1>
        <p className="mt-1 text-sm text-gray-500">
          The architecture is organised into five domains — Business, Data, Integration, Application, and Solution.
          Within each domain, content is grouped into three levels of detail: Conceptual (what and why), Logical (how), and Physical (where and with what).
          Select a domain to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOMAINS.map(domain => (
          <DomainCard key={domain.id} domain={domain} base={base} />
        ))}
      </div>
    </div>
  )
}
