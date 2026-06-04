import { Link, useParams } from 'react-router-dom'
import { getDomain, getAbstraction, getArtefact } from '../../lib/artefacts'

function ChevronRight() {
  return (
    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Breadcrumb() {
  const { clientId, versionId, domain, abstraction, artefactId } = useParams()

  const base = `/clients/${clientId}/${versionId}`

  const crumbs = [
    { label: 'Domains', to: `${base}/domains` },
  ]

  if (domain) {
    const d = getDomain(domain)
    crumbs.push({ label: d?.name ?? domain, to: `${base}/domains/${domain}` })
  }

  if (abstraction) {
    const a = getAbstraction(abstraction)
    crumbs.push({ label: a?.name ?? abstraction, to: `${base}/domains/${domain}/${abstraction}` })
  }

  if (artefactId) {
    const art = getArtefact(artefactId)
    crumbs.push({ label: art?.name ?? artefactId, to: null })
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 py-3 text-sm" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight />}
            {crumb.to ? (
              <Link to={crumb.to} className="text-gray-500 hover:text-gray-700 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="border-b border-gray-200 mb-5" />
    </div>
  )
}
