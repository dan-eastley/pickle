import { useEffect, useState } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { getArtefact, DOMAIN_COLORS } from '../lib/artefacts'
import { getArtefactData, getSchema } from '../lib/api'
import { useArchitecture } from '../context/ArchitectureContext'
import CatalogueView from '../components/artefacts/CatalogueView'
import MatrixView from '../components/artefacts/MatrixView'
import DiagramView from '../components/artefacts/DiagramView'
import DocumentView, { DocumentSelector } from '../components/artefacts/DocumentView'
import NewDecisionModal from '../components/decisions/NewDecisionModal'
import NewDiscoveryModal from '../components/decisions/NewDiscoveryModal'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import DomainIcon from '../components/ui/DomainIcon'
import JsonPreview from '../components/ui/JsonPreview'
import ActivityHistory from '../components/common/ActivityHistory'
import ActionBar from '../components/ui/ActionBar'
import { KeyStar, DecisionIcon, RobotIcon } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'
import useCollapsed from '../hooks/useCollapsed'

function AdrActionBar({ artefact, documents, selectedDocument, clientId, versionId }) {
  const [decisionOpen, setDecisionOpen] = useState(false)
  const [discoveryOpen, setDiscoveryOpen] = useState(false)
  const colors = DOMAIN_COLORS[artefact.domain]
  const bgClass = colors?.bg ?? 'bg-gray-50'
  const btnClass = colors?.button ?? 'bg-brand-600 hover:bg-brand-700 text-white'
  const viewDecisionsUrl = `/clients/${clientId}/${versionId}/decisions?domain=${artefact.domain}&abstraction=${artefact.abstraction}&artefact=${artefact.id}`

  return (
    <>
      <ActionBar
        className="mb-5"
        tint={bgClass}
        strapline="Changes to this artefact must go through a Decision Record."
        secondary={
          <Link
            to={viewDecisionsUrl}
            className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-colors"
          >
            View Decisions
          </Link>
        }
        primary={
          <>
            <button
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-colors ${btnClass}`}
              onClick={() => setDecisionOpen(true)}
            >
              <DecisionIcon className="w-3.5 h-3.5" />
              New Decision
            </button>
            <button
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors"
              onClick={() => setDiscoveryOpen(true)}
            >
              <RobotIcon className="w-3.5 h-3.5" />
              New Discovery
            </button>
          </>
        }
      />

      {decisionOpen && (
        <NewDecisionModal
          artefact={artefact}
          documents={documents}
          selectedDocument={selectedDocument}
          clientId={clientId}
          versionId={versionId}
          onClose={() => setDecisionOpen(false)}
        />
      )}
      {discoveryOpen && (
        <NewDiscoveryModal
          artefact={artefact}
          clientId={clientId}
          versionId={versionId}
          onClose={() => setDiscoveryOpen(false)}
        />
      )}
    </>
  )
}

const PURPOSE_STORAGE_KEY = 'artefact-purpose-collapsed'
const RELATED_STORAGE_KEY = 'artefact-related-collapsed'

function ArtefactHeader({ artefact, schema, clientId, versionId }) {
  const colors = DOMAIN_COLORS[artefact.domain]
  const metaDescription = schema?.meta?.description
  const metaPurpose = schema?.meta?.purpose
  const relatedArtefacts = artefact.relatedTo ?? []
  const [purposeCollapsed, togglePurpose] = useCollapsed(PURPOSE_STORAGE_KEY)
  const [relatedCollapsed, toggleRelated] = useCollapsed(RELATED_STORAGE_KEY)

  return (
    <div className="mb-6">
      {artefact.key && (
        <div className="flex items-center gap-1 mb-3 text-xs text-amber-600 font-medium">
          <KeyStar className="w-3.5 h-3.5" /> Key artefact
        </div>
      )}
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${colors?.bg ?? 'bg-gray-100'}`}
        >
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
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`w-3 h-3 transition-transform ${purposeCollapsed ? '' : 'rotate-90'}`}
                >
                  <path
                    d="M6 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Artefact Purpose
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
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`w-3 h-3 transition-transform ${relatedCollapsed ? '' : 'rotate-90'}`}
                >
                  <path
                    d="M6 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
                        <span className="font-medium">{related.name}</span>
                        <span className="font-mono text-gray-400">[{related.id}]</span>
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
  const [docIdx, setDocIdx] = useState(0)

  const artefact = getArtefact(artefactId)
  usePageTitle(artefact?.name ?? null)

  useEffect(() => {
    if (!artefact) return
    setLoading(true)
    setData(undefined)
    setError(null)
    setDocIdx(0)

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
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, versionId, domain, abstraction, artefactId])

  if (!artefact) {
    return (
      <Navigate to={`/clients/${clientId}/${versionId}/domains/${domain}/${abstraction}`} replace />
    )
  }

  const isDocument = artefact.format === 'document'
  const documents = isDocument ? (data?.documents ?? []) : []
  const selectedDocument = documents[docIdx] ?? null

  return (
    <div>
      <ArtefactHeader
        artefact={artefact}
        schema={schema}
        clientId={clientId ?? selectedClientId}
        versionId={versionId ?? selectedVersionId}
      />
      {isDocument && documents.length > 0 && (
        <DocumentSelector
          artefact={artefact}
          documents={documents}
          selectedIdx={docIdx}
          onSelect={setDocIdx}
        />
      )}
      <AdrActionBar
        artefact={artefact}
        documents={documents}
        selectedDocument={selectedDocument}
        clientId={clientId ?? selectedClientId}
        versionId={versionId ?? selectedVersionId}
      />

      {loading && (
        <>
          <span className="sr-only" role="status">
            Loading artefact…
          </span>
          <Skeleton />
        </>
      )}

      {!loading && error && (
        <div className="border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          Failed to load artefact data: {error}
        </div>
      )}

      {!loading && !error && data === null && (
        <div className="border border-gray-200 bg-white">
          <EmptyState
            illustration={
              artefact.format === 'matrix'
                ? 'matrix'
                : artefact.format === 'diagram'
                  ? 'diagram'
                  : artefact.format === 'document'
                    ? 'catalogue'
                    : 'catalogue'
            }
            title="Nothing here yet"
            description="No content has been added for this version. Use the button above to raise an Architecture Decision Record and propose changes."
          />
        </div>
      )}

      <JsonPreview
        data={data ?? undefined}
        label={`${artefact.id}.json`}
        docUrl={`/docs/schemas/artefacts/domains/${artefact.domain}/${artefact.abstraction}/${artefact.id}`}
      />

      {!loading && !error && data !== null && data !== undefined && (
        <>
          {artefact.format === 'catalogue' && <CatalogueView data={data} schema={schema} />}
          {artefact.format === 'matrix' && (
            <MatrixView
              data={data}
              schema={schema}
              clientId={clientId ?? selectedClientId}
              versionId={versionId ?? selectedVersionId}
            />
          )}
          {artefact.format === 'diagram' && (
            <DiagramView
              data={data}
              artefact={artefact}
              schema={schema}
              clientId={clientId ?? selectedClientId}
              versionId={versionId ?? selectedVersionId}
            />
          )}
          {artefact.format === 'document' && (
            <DocumentView
              data={data}
              artefact={artefact}
              schema={schema}
              selectedIdx={docIdx}
              clientId={clientId ?? selectedClientId}
              versionId={versionId ?? selectedVersionId}
            />
          )}
          <ActivityHistory activity={data.activity} />
        </>
      )}
    </div>
  )
}
