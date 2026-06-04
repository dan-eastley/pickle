import { Link, useParams, Navigate } from 'react-router-dom'
import { getDomain, ABSTRACTIONS, getArtefactsForDomain, DOMAIN_COLORS, ABSTRACTION_COLORS } from '../lib/artefacts'
import DomainIcon from '../components/ui/DomainIcon'
import FormatIcon from '../components/ui/FormatIcon'
import usePageTitle from '../hooks/usePageTitle'

function KeyStar() {
  return (
    <svg className="w-3 h-3 text-amber-500 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 1l1.29 3.09L10.5 4.5 8.25 6.65l.54 3.1L6 8.25 3.21 9.75l.54-3.1L1.5 4.5l3.21-.41z" />
    </svg>
  )
}

function AbstractionSection({ abstraction, artefacts, base, domain }) {
  const colors = ABSTRACTION_COLORS[abstraction.id]
  const keyArtefacts = artefacts.filter(a => a.key)
  const otherArtefacts = artefacts.filter(a => !a.key)
  const sorted = [...keyArtefacts, ...otherArtefacts]

  return (
    <div className="border border-gray-200 bg-white">
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

      <div>
        {sorted.map((artefact, i) => (
          <Link
            key={artefact.id}
            to={`${base}/domains/${domain}/${abstraction.id}/${artefact.id}`}
            className={`group flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors border-l-4 ${artefact.key ? 'border-amber-400' : 'border-transparent'} ${i > 0 ? 'border-t border-gray-100' : ''}`}
          >
            <span className="text-gray-400 group-hover:text-gray-600 flex-shrink-0">
              <FormatIcon format={artefact.format} className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                {artefact.key && <KeyStar />}
                <p className={`text-sm font-medium truncate ${artefact.key ? 'text-gray-900' : 'text-gray-700'} group-hover:text-gray-900 transition-colors`}>
                  {artefact.name}
                </p>
              </div>
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
  usePageTitle(domainData ? `${domainData.name} Architecture` : null)

  if (!domainData) return <Navigate to={`${base}/domains`} replace />

  return (
    <div>
      <div className="mb-6 flex items-center gap-4 pb-5 border-b border-gray-200">
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

      <div className="space-y-4">
        {ABSTRACTIONS.map(abstraction => {
          const artefacts = getArtefactsForDomain(domain, abstraction.id)
          return (
            <AbstractionSection
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
