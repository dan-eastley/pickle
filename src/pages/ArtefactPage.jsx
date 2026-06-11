import { useEffect, useState, useCallback } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { getArtefact, getDomain, getAbstraction, DOMAIN_COLORS } from '../lib/artefacts'
import { getArtefactData, getSchema } from '../lib/api'
import { useArchitecture } from '../context/ArchitectureContext'
import CatalogueView from '../components/artefacts/CatalogueView'
import MatrixView from '../components/artefacts/MatrixView'
import DiagramView from '../components/artefacts/DiagramView'
import NewDecisionModal from '../components/decisions/NewDecisionModal'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import DomainIcon from '../components/ui/DomainIcon'
import JsonPreview from '../components/ui/JsonPreview'
import TextLink from '../components/ui/TextLink'
import usePageTitle from '../hooks/usePageTitle'

const FORMAT_LABELS = { catalogue: 'Catalogue', matrix: 'Matrix', diagram: 'Diagram' }
const FORMAT_VARIANTS = { catalogue: 'blue', matrix: 'violet', diagram: 'amber' }

// Button colours per domain
const DOMAIN_BUTTON = {
  business:    'bg-violet-600 hover:bg-violet-700 text-white',
  data:        'bg-blue-600 hover:bg-blue-700 text-white',
  integration: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  application: 'bg-amber-500 hover:bg-amber-600 text-white',
  solution:    'bg-rose-600 hover:bg-rose-700 text-white',
}

// Light background per domain for the action bar
const DOMAIN_ACTION_BG = {
  business:    'bg-violet-50',
  data:        'bg-blue-50',
  integration: 'bg-emerald-50',
  application: 'bg-amber-50',
  solution:    'bg-rose-50',
}

function KeyStar() {
  return (
    <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 1l1.29 3.09L10.5 4.5 8.25 6.65l.54 3.1L6 8.25 3.21 9.75l.54-3.1L1.5 4.5l3.21-.41z" />
    </svg>
  )
}

function AdrActionBar({ artefact, clientId, versionId }) {
  const [modalOpen, setModalOpen] = useState(false)
  const bgClass = DOMAIN_ACTION_BG[artefact.domain] ?? 'bg-gray-50'
  const btnClass = DOMAIN_BUTTON[artefact.domain] ?? 'bg-brand-600 hover:bg-brand-700 text-white'
  const viewDecisionsUrl = `/clients/${clientId}/${versionId}/decisions?domain=${artefact.domain}&abstraction=${artefact.abstraction}&artefact=${artefact.id}`

  return (
    <>
      <div className={`mb-5 flex items-center justify-between gap-4 px-5 py-3 ${bgClass}`}>
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v6M5 4l3-3 3 3M3 10h10M3 13h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
          <span className="text-sm text-gray-600">
            Changes to this artefact must go through a Decision Record.{' '}
            <TextLink to={viewDecisionsUrl}>View decisions</TextLink>
          </span>
        </div>
        <button
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-colors ${btnClass}`}
          onClick={() => setModalOpen(true)}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
          New Decision
        </button>
      </div>

      {modalOpen && (
        <NewDecisionModal
          artefact={artefact}
          clientId={clientId}
          versionId={versionId}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

const PURPOSE_STORAGE_KEY = 'artefact-purpose-collapsed'
const RELATED_STORAGE_KEY = 'artefact-related-collapsed'

function useCollapsed(storageKey, defaultCollapsed = false) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored === null ? defaultCollapsed : stored === 'true'
    } catch { return defaultCollapsed }
  })
  const toggle = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem(storageKey, String(next)) } catch {}
      return next
    })
  }, [storageKey])
  return [collapsed, toggle]
}

function ArtefactHeader({ artefact, schema, clientId, versionId }) {
  const domain = getDomain(artefact.domain)
  const abstraction = getAbstraction(artefact.abstraction)
  const colors = DOMAIN_COLORS[artefact.domain]
  const metaDescription = schema?.meta?.description
  const metaPurpose = schema?.meta?.purpose
  const relatedArtefacts = artefact.relatedTo ?? []
  const [purposeCollapsed, togglePurpose] = useCollapsed(PURPOSE_STORAGE_KEY)
  const [relatedCollapsed, toggleRelated] = useCollapsed(RELATED_STORAGE_KEY)

  return (
    <div className="mb-6 pb-5 border-b border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Badge label={domain?.name ?? artefact.domain} variant="gray" />
        <span className="text-gray-300">·</span>
        <Badge label={abstraction?.name ?? artefact.abstraction} variant="gray" />
        <span className="text-gray-300">·</span>
        <Badge label={FORMAT_LABELS[artefact.format]} variant={FORMAT_VARIANTS[artefact.format]} />
        {artefact.key && (
          <>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
              <KeyStar /> Key artefact
            </span>
          </>
        )}
      </div>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${colors?.bg ?? 'bg-gray-100'}`}>
          <span className={colors?.text ?? 'text-gray-500'}>
            <DomainIcon domain={artefact.domain} className="w-5 h-5" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-gray-900">{artefact.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{metaDescription ?? artefact.description}</p>
          {metaPurpose?.length > 0 && (
            <div className="mt-4">
              <button
                onClick={togglePurpose}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 hover:text-gray-600 transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="none"
                  className={`w-3 h-3 transition-transform ${purposeCollapsed ? '' : 'rotate-90'}`}>
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Purpose
              </button>
              {!purposeCollapsed && (
                <ul className="space-y-1">
                  {metaPurpose.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 w-1.5 h-1.5 bg-gray-300 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {relatedArtefacts.length > 0 && (
            <div className="mt-4">
              <button
                onClick={toggleRelated}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 hover:text-gray-600 transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="none"
                  className={`w-3 h-3 transition-transform ${relatedCollapsed ? '' : 'rotate-90'}`}>
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Related Artefacts
              </button>
              {!relatedCollapsed && (
                <div className="flex flex-wrap gap-2">
                  {relatedArtefacts.map(({ artefactId, relationship }) => {
                    const related = getArtefact(artefactId)
                    if (!related) return null
                    return (
                      <Link
                        key={artefactId}
                        to={`/clients/${clientId}/${versionId}/domains/${related.domain}/${related.abstraction}/${related.id}`}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                      >
                        <span className="text-gray-400">{relationship}</span>
                        <span className="font-mono text-gray-400">{related.id}</span>
                        <span className="font-medium">{related.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 flex-shrink-0 self-start">
          {artefact.id}
        </span>
      </div>
    </div>
  )
}

export default function ArtefactPage() {
  const { clientId, versionId, domain, abstraction, artefactId } = useParams()
  const { selectedClientId, selectedVersionId } = useArchitecture()
  const [data, setData] = useState(undefined)
  const [schema, setSchema] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const artefact = getArtefact(artefactId)
  usePageTitle(artefact?.name ?? null)

  useEffect(() => {
    if (!artefact) return
    setLoading(true)
    setData(undefined)
    setError(null)

    const cId = clientId ?? selectedClientId
    const vId = versionId ?? selectedVersionId

    Promise.all([
      getArtefactData(cId, vId, domain, abstraction, artefactId),
      getSchema(domain, abstraction, artefactId),
    ])
      .then(([artefactData, schemaData]) => {
        setData(artefactData)
        setSchema(schemaData)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [clientId, versionId, domain, abstraction, artefactId])

  if (!artefact) {
    return <Navigate to={`/clients/${clientId}/${versionId}/domains/${domain}/${abstraction}`} replace />
  }

  return (
    <div>
      <ArtefactHeader artefact={artefact} schema={schema} clientId={clientId ?? selectedClientId} versionId={versionId ?? selectedVersionId} />
      <AdrActionBar artefact={artefact} clientId={clientId ?? selectedClientId} versionId={versionId ?? selectedVersionId} />

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <div className="border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          Failed to load artefact data: {error}
        </div>
      )}

      {!loading && !error && data === null && (
        <div className="border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-gray-700">Nothing here yet</p>
          <p className="mt-1 text-sm text-gray-500">
            No content has been added for this version. Use the button above to raise an Architecture Decision Record and propose changes.
          </p>
        </div>
      )}

      <JsonPreview data={data ?? undefined} label={`${artefact.id}.json`} />

      {!loading && !error && data !== null && data !== undefined && (
        <>
          {artefact.format === 'catalogue' && (
            <CatalogueView data={data} schema={schema} />
          )}
          {artefact.format === 'matrix' && (
            <MatrixView data={data} />
          )}
          {artefact.format === 'diagram' && (
            <DiagramView data={data} artefact={artefact} schema={schema} />
          )}
        </>
      )}
    </div>
  )
}
