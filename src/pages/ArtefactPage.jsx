import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { getArtefact, getDomain, getAbstraction, DOMAIN_COLORS } from '../lib/artefacts'
import { getArtefactData, getSchema } from '../lib/api'
import { useArchitecture } from '../context/ArchitectureContext'
import CatalogueView from '../components/artefacts/CatalogueView'
import MatrixView from '../components/artefacts/MatrixView'
import DiagramView from '../components/artefacts/DiagramView'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import DomainIcon from '../components/ui/DomainIcon'
import usePageTitle from '../hooks/usePageTitle'

const FORMAT_LABELS = { catalogue: 'Catalogue', matrix: 'Matrix', diagram: 'Diagram' }
const FORMAT_VARIANTS = { catalogue: 'blue', matrix: 'violet', diagram: 'amber' }

// Solid button colour per domain — matches DOMAIN_COLORS palette
const DOMAIN_BUTTON = {
  business:    'bg-violet-600 hover:bg-violet-700 text-white',
  data:        'bg-blue-600 hover:bg-blue-700 text-white',
  integration: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  application: 'bg-amber-500 hover:bg-amber-600 text-white',
  solution:    'bg-rose-600 hover:bg-rose-700 text-white',
}

function KeyStar() {
  return (
    <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 1l1.29 3.09L10.5 4.5 8.25 6.65l.54 3.1L6 8.25 3.21 9.75l.54-3.1L1.5 4.5l3.21-.41z" />
    </svg>
  )
}

function AdrActionBar({ artefact }) {
  const btnClass = DOMAIN_BUTTON[artefact.domain] ?? 'bg-brand-600 hover:bg-brand-700 text-white'
  return (
    <div className="mb-5 flex items-center justify-between gap-4 bg-gray-50 border border-gray-200 px-5 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 16 16" fill="none">
          <path d="M8 1v6M5 4l3-3 3 3M3 10h10M3 13h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
        <span className="text-sm text-gray-600">
          Changes to this artefact must be made through an Architecture Decision Record.
        </span>
      </div>
      <button
        className={`flex-shrink-0 flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-colors ${btnClass}`}
        onClick={() => {/* TODO: ADR workflow */}}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
        Open ADR
      </button>
    </div>
  )
}

function ArtefactHeader({ artefact }) {
  const domain = getDomain(artefact.domain)
  const abstraction = getAbstraction(artefact.abstraction)
  const colors = DOMAIN_COLORS[artefact.domain]

  return (
    <div className="mb-6 pb-5 border-b border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Badge label={domain?.name ?? artefact.domain} variant="gray" />
        <span className="text-gray-300">·</span>
        <Badge label={abstraction?.name ?? artefact.abstraction} variant="gray" />
        <span className="text-gray-300">·</span>
        <Badge
          label={FORMAT_LABELS[artefact.format]}
          variant={FORMAT_VARIANTS[artefact.format]}
        />
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
          <p className="mt-1 text-sm text-gray-500">{artefact.description}</p>
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
      <ArtefactHeader artefact={artefact} />
      <AdrActionBar artefact={artefact} />

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
          <p className="text-sm font-medium text-gray-700">No data yet</p>
          <p className="mt-1 text-sm text-gray-500">
            This artefact hasn't been populated for this architecture version.
            Raise an Architecture Decision Record to add entries.
          </p>
        </div>
      )}

      {!loading && !error && data !== null && data !== undefined && (
        <>
          {artefact.format === 'catalogue' && (
            <CatalogueView data={data} schema={schema} />
          )}
          {artefact.format === 'matrix' && (
            <MatrixView data={data} />
          )}
          {artefact.format === 'diagram' && (
            <DiagramView data={data} artefact={artefact} />
          )}
        </>
      )}
    </div>
  )
}
