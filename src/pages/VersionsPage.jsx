import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { getVersions, getVersion } from '../lib/api'
import { versionStatusBadge } from '../lib/theme'
import Spinner from '../components/ui/Spinner'
import { ChevronRight } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

export default function VersionsPage() {
  const { clientId } = useParams()
  const { clientsMetadata } = useArchitecture()
  const [versions, setVersions] = useState([])
  const [versionMeta, setVersionMeta] = useState({})
  const [loading, setLoading] = useState(true)

  const clientName = clientsMetadata[clientId]?.name ?? clientId
  usePageTitle(`${clientName} — Versions`)

  useEffect(() => {
    getVersions(clientId).then(async list => {
      setVersions(list)
      const metas = await Promise.all(
        list.map(v => getVersion(clientId, v['version-id']).then(m => [v['version-id'], m]))
      )
      setVersionMeta(Object.fromEntries(metas.filter(([, m]) => m)))
      setLoading(false)
    })
  }, [clientId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-8 pb-12">
      <div className="mb-4">
        <Link to="/clients" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← All clients
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{clientName}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select a version to browse its architecture.
        </p>
      </div>

      <div className="border border-gray-200 bg-white divide-y divide-gray-100">
        {versions.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-gray-400">No versions yet for this client.</div>
        )}
        {versions.map(v => {
          const vId = v['version-id']
          const meta = versionMeta[vId]
          const statusStyle = versionStatusBadge(meta?.status)
          return (
            <Link
              key={vId}
              to={`/clients/${clientId}/${vId}/domains`}
              className="group flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                      {meta?.name ?? vId}
                    </span>
                    {meta?.status && (
                      <span className={`text-xs font-medium px-2 py-0.5 ${statusStyle}`}>
                        {meta.status}
                      </span>
                    )}
                  </div>
                  {meta?.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{meta.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs font-mono text-gray-400">{vId}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
