import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { getVersions, getVersion } from '../lib/api'
import Spinner from '../components/ui/Spinner'
import usePageTitle from '../hooks/usePageTitle'

const STATUS_STYLES = {
  draft:    'bg-amber-50 text-amber-700',
  active:   'bg-success-50 text-success-700',
  retired:  'bg-gray-100 text-gray-500',
}

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
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-2">
        <Link to="/clients" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Clients
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
          <div className="px-5 py-8 text-center text-sm text-gray-400">No versions available.</div>
        )}
        {versions.map(v => {
          const vId = v['version-id']
          const meta = versionMeta[vId]
          const statusStyle = STATUS_STYLES[meta?.status] ?? 'bg-gray-100 text-gray-500'
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
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
