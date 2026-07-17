import { useState, useEffect } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { getDomain, getAbstraction, getArtefact } from '../../lib/artefacts'
import { useArchitecture } from '../../context/ArchitectureContext'
import { ChevronRight } from '../ui/icons'

function Crumbs({ crumbs }) {
  return (
    <div>
      <nav className="flex items-center gap-1.5 py-3 text-sm" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />}
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

// Reads a single field (e.g. title) from a decision/discovery record for the
// breadcrumb leaf label.
function useRecordTitle(url, id) {
  const [title, setTitle] = useState(null)
  useEffect(() => {
    if (!id) return
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.title) setTitle(d.title)
      })
      .catch(() => {})
  }, [url, id])
  return title
}

export default function Breadcrumb() {
  const { clientId, versionId, domain, abstraction, artefactId, decisionId, discoveryId } =
    useParams()
  const { pathname } = useLocation()
  const { clientsMetadata } = useArchitecture()
  const base = `/architectures/${clientId}/${versionId}`
  const archName = clientsMetadata?.[clientId]?.name ?? clientId

  // Every trail roots back through Architectures → this architecture's
  // transitions → the current transition.
  const lead = [
    { label: 'Architectures', to: '/architectures' },
    { label: archName, to: `/architectures/${clientId}/transitions` },
    { label: versionId, to: `${base}/domains` },
  ]

  const decisionTitle = useRecordTitle(
    `/api/arch/${clientId}/${versionId}/decisions/${decisionId}/decision.json`,
    decisionId
  )
  const discoveryTitle = useRecordTitle(
    `/api/arch/${clientId}/${versionId}/discovery/${discoveryId}/discovery.json`,
    discoveryId
  )

  // ── Discovery routes ──────────────────────────────────────────────────────
  if (pathname.includes('/discovery')) {
    const discoveryBase = `${base}/discovery`
    const isNew = pathname.endsWith('/new')

    const crumbs = [...lead, { label: 'Discovery', to: discoveryId || isNew ? discoveryBase : null }]
    if (isNew) crumbs.push({ label: 'New Discovery', to: null })
    if (discoveryId) crumbs.push({ label: discoveryTitle ?? discoveryId, to: null })

    return <Crumbs crumbs={crumbs} />
  }

  // ── Decisions routes ──────────────────────────────────────────────────────
  if (pathname.includes('/decisions')) {
    const decisionsBase = `${base}/decisions`
    const isNew = pathname.endsWith('/new')

    const crumbs = [...lead, { label: 'Decisions', to: decisionId || isNew ? decisionsBase : null }]
    if (isNew) crumbs.push({ label: 'New Decision', to: null })
    if (decisionId) crumbs.push({ label: decisionTitle ?? decisionId, to: null })

    return <Crumbs crumbs={crumbs} />
  }

  // ── Architecture domain routes ────────────────────────────────────────────
  const crumbs = [...lead, { label: 'Domains', to: `${base}/domains` }]

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
