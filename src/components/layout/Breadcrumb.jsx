import { useState, useEffect } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { getDomain, getAbstraction, getArtefact } from '../../lib/artefacts'
import { ChevronRight } from '../ui/icons'

function Crumbs({ crumbs }) {
  return (
    <div>
      <nav className="flex items-center gap-1.5 py-3 text-sm" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            {crumb.to ? (
              <Link to={crumb.to} className="text-gray-500 hover:text-gray-700 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-700">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="border-b border-gray-200 mb-5" />
    </div>
  )
}

function useDecisionTitle(clientId, versionId, decisionId) {
  const [title, setTitle] = useState(null)
  useEffect(() => {
    if (!decisionId) return
    fetch(`/api/arch/clients/${clientId}/${versionId}/decisions/${decisionId}/decision.json`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.title) setTitle(d.title) })
      .catch(() => {})
  }, [clientId, versionId, decisionId])
  return title
}

export default function Breadcrumb() {
  const { clientId, versionId, domain, abstraction, artefactId, decisionId } = useParams()
  const { pathname } = useLocation()
  const base = `/clients/${clientId}/${versionId}`

  const decisionTitle = useDecisionTitle(clientId, versionId, decisionId)

  // ── Decisions routes ──────────────────────────────────────────────────────
  if (pathname.includes('/decisions')) {
    const decisionsBase = `${base}/decisions`
    const isNew = pathname.endsWith('/new')

    const crumbs = [{ label: 'Decisions', to: decisionId || isNew ? decisionsBase : null }]
    if (isNew)      crumbs.push({ label: 'New Decision', to: null })
    if (decisionId) crumbs.push({ label: decisionTitle ?? decisionId, to: null })

    return <Crumbs crumbs={crumbs} />
  }

  // ── Architecture domain routes ────────────────────────────────────────────
  const crumbs = [{ label: 'Domains', to: `${base}/domains` }]

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

  return <Crumbs crumbs={crumbs} />
}
