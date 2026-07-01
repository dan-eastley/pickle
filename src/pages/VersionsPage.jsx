import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { getVersions, getVersion } from '../lib/api'
import { loadVersionMetrics } from '../lib/metrics'
import { versionStatusBadge } from '../lib/theme'
import MetricBars from '../components/common/MetricBars'
import Spinner from '../components/ui/Spinner'
import ClientLogo from '../components/ui/ClientLogo'
import { ChevronRight } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

export default function VersionsPage() {
  const { clientId } = useParams()
  const { clientsMetadata } = useArchitecture()
  const [versions, setVersions] = useState([])
  const [versionMeta, setVersionMeta] = useState({})
  const [versionMetrics, setVersionMetrics] = useState({})
  const [loading, setLoading] = useState(true)

  const clientName = clientsMetadata[clientId]?.name ?? clientId
  usePageTitle(`${clientName} · Transitions`)

  useEffect(() => {
    let live = true
    getVersions(clientId).then(async (list) => {
      if (!live) return
      setVersions(list)
      const metas = await Promise.all(
        list.map((v) => getVersion(clientId, v['transition-id']).then((m) => [v['transition-id'], m]))
      )
      if (!live) return
      setVersionMeta(Object.fromEntries(metas.filter(([, m]) => m)))
      setLoading(false)
      // Content metrics fill in per version as they resolve.
      for (const v of list) {
        const vId = v['transition-id']
        loadVersionMetrics(clientId, vId)
          .then((m) => live && setVersionMetrics((prev) => ({ ...prev, [vId]: m })))
          .catch(() => live && setVersionMetrics((prev) => ({ ...prev, [vId]: null })))
      }
    })
    return () => {
      live = false
    }
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
        <Link to="/architectures" className="text-sm text-gray-500 hover:text-gray-600 transition-colors">
          ← All architectures
        </Link>
      </div>
      <div className="mb-8 flex items-center gap-4 min-w-0">
        <ClientLogo clientId={clientId} name={clientName} className="w-12 h-12" />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-900">{clientName}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Select a transition state to browse its architecture.
          </p>
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-semibold text-gray-700">No transition states yet</p>
          <p className="mt-1 text-sm text-gray-500 max-w-sm">
            Each transition state lives in its own folder under this architecture.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => {
            const vId = v['transition-id']
            const meta = versionMeta[vId]
            const statusStyle = versionStatusBadge(meta?.status)
            const m = versionMetrics[vId]
            const base = `/architectures/${clientId}/${vId}`
            return (
              <div key={vId} className="border border-gray-200 bg-white">
                <Link
                  to={`${base}/domains`}
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
                        <p className="text-xs text-gray-500 mt-0.5">{meta.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-mono text-gray-500">{vId}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>
                <div className="px-5 pb-4 pt-1 border-t border-gray-100">
                  {m === undefined ? (
                    <div className="flex items-center gap-2 py-1 text-xs text-gray-500">
                      <Spinner size="sm" /> Loading content…
                    </div>
                  ) : (
                    <MetricBars
                      perDomain={m?.perDomain}
                      governance={{ decisions: m?.decisions, discoveries: m?.discoveries }}
                      empty={
                        <p className="py-1 text-xs text-gray-500">
                          No content in this transition yet.
                        </p>
                      }
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
