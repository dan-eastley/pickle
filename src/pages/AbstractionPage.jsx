import { Link, useParams, Navigate } from 'react-router-dom'
import { getDomain, getAbstraction, getArtefactsForDomain, ABSTRACTION_COLORS } from '../lib/artefacts'
import FormatIcon from '../components/ui/FormatIcon'
import Badge from '../components/ui/Badge'
import usePageTitle from '../hooks/usePageTitle'

const FORMAT_LABELS = { catalogue: 'Catalogue', matrix: 'Matrix', diagram: 'Diagram' }
const FORMAT_VARIANTS = { catalogue: 'blue', matrix: 'violet', diagram: 'amber' }

function KeyStar() {
  return (
    <svg className="w-3 h-3 text-amber-500 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 1l1.29 3.09L10.5 4.5 8.25 6.65l.54 3.1L6 8.25 3.21 9.75l.54-3.1L1.5 4.5l3.21-.41z" />
    </svg>
  )
}

export default function AbstractionPage() {
  const { clientId, versionId, domain, abstraction } = useParams()
  const base = `/clients/${clientId}/${versionId}`
  const domainData = getDomain(domain)
  const abstractionData = getAbstraction(abstraction)
  const colors = ABSTRACTION_COLORS[abstraction]
  usePageTitle(abstractionData && domainData ? `${abstractionData.name} — ${domainData.name}` : null)

  if (!domainData || !abstractionData) {
    return <Navigate to={`${base}/domains/${domain}`} replace />
  }

  const artefacts = getArtefactsForDomain(domain, abstraction)
  const keyArtefacts = artefacts.filter(a => a.key)
  const otherArtefacts = artefacts.filter(a => !a.key)
  const sorted = [...keyArtefacts, ...otherArtefacts]

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 ${colors?.badge}`}>
            {abstractionData.label}
          </span>
          <span className="text-xs text-gray-400">{domainData.name} Architecture</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">
          {abstractionData.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500 max-w-3xl">{abstractionData.description}</p>
      </div>

      <div className="border border-gray-200 divide-y divide-gray-100 bg-white">
        {sorted.map(artefact => (
          <Link
            key={artefact.id}
            to={`${base}/domains/${domain}/${abstraction}/${artefact.id}`}
            className={`group flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${artefact.key ? 'border-l-4 border-amber-400' : 'border-l-4 border-transparent'}`}
          >
            <div className="w-8 h-8 bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
              <span className="text-gray-500">
                <FormatIcon format={artefact.format} className="w-4 h-4" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {artefact.key && <KeyStar />}
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
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
