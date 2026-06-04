import { Link, useParams, Navigate } from 'react-router-dom'
import { getDomain, ABSTRACTIONS, getArtefactsForDomain, DOMAIN_COLORS, ABSTRACTION_COLORS } from '../lib/artefacts'
import FormatIcon from '../components/ui/FormatIcon'

function AbstractionCard({ abstraction, artefacts, base, domain }) {
  const colors = ABSTRACTION_COLORS[abstraction.id]

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
      <Link
        to={`${base}/domains/${domain}/${abstraction.id}`}
        className="group block px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5 ${colors.badge}`}>
              {abstraction.label}
            </span>
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
              {abstraction.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{abstraction.description}</p>
          </div>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition-colors" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Link>

      <div className="divide-y divide-gray-50">
        {artefacts.map(artefact => (
          <Link
            key={artefact.id}
            to={`${base}/domains/${domain}/${abstraction.id}/${artefact.id}`}
            className="group flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-400 group-hover:text-gray-600 flex-shrink-0">
              <FormatIcon format={artefact.format} className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">
                {artefact.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{artefact.description}</p>
            </div>
            <span className="text-xs font-mono text-gray-300 flex-shrink-0">{artefact.id}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function DomainPage() {
  const { clientId, versionId, domain } = useParams()
  const base = `/clients/${clientId}/${versionId}`
  const domainData = getDomain(domain)
  const colors = DOMAIN_COLORS[domain]

  if (!domainData) return <Navigate to={`${base}/domains`} replace />

  return (
    <div>
      <div className="mb-6 flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors?.bg}`}>
          <span className={`text-xs font-bold ${colors?.text}`}>{domainData.acronym}</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{domainData.name} Architecture</h1>
          <p className="mt-1 text-sm text-gray-500">{domainData.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {ABSTRACTIONS.map(abstraction => {
          const artefacts = getArtefactsForDomain(domain, abstraction.id)
          return (
            <AbstractionCard
              key={abstraction.id}
              abstraction={abstraction}
              artefacts={artefacts}
              base={base}
              domain={domain}
            />
          )
        })}
      </div>
    </div>
  )
}
