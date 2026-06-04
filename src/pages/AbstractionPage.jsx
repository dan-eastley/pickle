import { Link, useParams, Navigate } from 'react-router-dom'
import { getDomain, getAbstraction, getArtefactsForDomain, ABSTRACTION_COLORS } from '../lib/artefacts'
import FormatIcon from '../components/ui/FormatIcon'
import Badge from '../components/ui/Badge'

const FORMAT_LABELS = { catalogue: 'Catalogue', matrix: 'Matrix', diagram: 'Diagram' }
const FORMAT_VARIANTS = { catalogue: 'blue', matrix: 'violet', diagram: 'amber' }

export default function AbstractionPage() {
  const { clientId, versionId, domain, abstraction } = useParams()
  const base = `/clients/${clientId}/${versionId}`
  const domainData = getDomain(domain)
  const abstractionData = getAbstraction(abstraction)
  const colors = ABSTRACTION_COLORS[abstraction]

  if (!domainData || !abstractionData) {
    return <Navigate to={`${base}/domains/${domain}`} replace />
  }

  const artefacts = getArtefactsForDomain(domain, abstraction)

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors?.badge}`}>
            {abstractionData.label}
          </span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">
          {abstractionData.name} — {domainData.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{abstractionData.description}</p>
      </div>

      <div className="space-y-2">
        {artefacts.map(artefact => (
          <Link
            key={artefact.id}
            to={`${base}/domains/${domain}/${abstraction}/${artefact.id}`}
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 hover:border-gray-300 hover:shadow-sm transition-all shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
              <span className="text-gray-500">
                <FormatIcon format={artefact.format} className="w-5 h-5" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                  {artefact.name}
                </p>
                <Badge
                  label={FORMAT_LABELS[artefact.format]}
                  variant={FORMAT_VARIANTS[artefact.format]}
                  size="xs"
                />
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{artefact.description}</p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs font-mono text-gray-300">{artefact.id}</span>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
