import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { getArtefact, getDomain, getAbstraction } from '../lib/artefacts'
import { getArtefactData, getSchema } from '../lib/api'
import { useArchitecture } from '../context/ArchitectureContext'
import CatalogueView from '../components/artefacts/CatalogueView'
import MatrixView from '../components/artefacts/MatrixView'
import DiagramView from '../components/artefacts/DiagramView'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import FormatIcon from '../components/ui/FormatIcon'

const FORMAT_LABELS = { catalogue: 'Catalogue', matrix: 'Matrix', diagram: 'Diagram' }
const FORMAT_VARIANTS = { catalogue: 'blue', matrix: 'violet', diagram: 'amber' }

function ArtefactHeader({ artefact }) {
  const domain = getDomain(artefact.domain)
  const abstraction = getAbstraction(artefact.abstraction)

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Badge label={domain?.name ?? artefact.domain} variant="gray" />
        <span className="text-gray-300">·</span>
        <Badge label={abstraction?.name ?? artefact.abstraction} variant="gray" />
        <span className="text-gray-300">·</span>
        <Badge
          label={FORMAT_LABELS[artefact.format]}
          variant={FORMAT_VARIANTS[artefact.format]}
        />
      </div>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <FormatIcon format={artefact.format} className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{artefact.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{artefact.description}</p>
        </div>
        <span className="ml-auto text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded-lg flex-shrink-0 self-start">
          {artefact.id}
        </span>
      </div>
    </div>
  )
}

export default function ArtefactPage() {
  const { clientId, versionId, domain, abstraction, artefactId } = useParams()
  const { selectedClientId, selectedVersionId } = useArchitecture()
  const [data, setData] = useState(undefined) // undefined = loading, null = not found
  const [schema, setSchema] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const artefact = getArtefact(artefactId)

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

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          Failed to load artefact data: {error}
        </div>
      )}

      {!loading && !error && data === null && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
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
