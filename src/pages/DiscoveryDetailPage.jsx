import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import ScopeChip from '../components/decisions/ScopeChip'
import Markdown from '../components/ui/Markdown'
import Spinner from '../components/ui/Spinner'
import JsonPreview from '../components/ui/JsonPreview'
import ActivityHistory from '../components/common/ActivityHistory'
import Button from '../components/ui/Button'
import ActionBar from '../components/ui/ActionBar'
import { RobotIcon } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

const STATUS_BADGE = {
  active: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-gray-100 text-gray-500',
}

export default function DiscoveryDetailPage() {
  const { clientId, versionId, discoveryId } = useParams()
  const { clientsMetadata } = useArchitecture()
  const [discovery, setDiscovery] = useState(undefined)
  const [archiving, setArchiving] = useState(false)
  const clientName = clientsMetadata[clientId]?.name ?? clientId

  usePageTitle(discovery?.title ? `${discovery.title} — Discovery` : 'Discovery')

  useEffect(() => {
    fetch(`/api/arch/clients/${clientId}/${versionId}/discovery/${discoveryId}/discovery.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setDiscovery)
      .catch(() => setDiscovery(null))
  }, [clientId, versionId, discoveryId])

  async function setStatus(status) {
    setArchiving(true)
    setDiscovery((prev) => (prev ? { ...prev, status } : prev)) // optimistic
    try {
      await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-discovery',
          clientId,
          versionId,
          discoveryId,
          updates: { status },
        }),
      })
    } catch {
      /* optimistic */
    } finally {
      setArchiving(false)
    }
  }

  if (discovery === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }
  if (discovery === null) {
    return <Navigate to={`/clients/${clientId}/${versionId}/discovery`} replace />
  }

  const Section = ({ title, children }) => (
    <section className="mt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  )

  return (
    <div>
      <ActionBar
        className="mb-5"
        secondary={
          <Button
            variant="secondary"
            onClick={() => setStatus(discovery.status === 'archived' ? 'active' : 'archived')}
            disabled={archiving}
          >
            {archiving ? '…' : discovery.status === 'archived' ? 'Reactivate' : 'Archive'}
          </Button>
        }
      />

      <article className="bg-white shadow-xl px-8 py-7">
        <div className="mb-6 pb-5 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center flex-shrink-0">
              <RobotIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900">{discovery.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {clientName} · v{versionId}
              </p>
              {discovery.scope && (
                <div className="mt-2">
                  <ScopeChip scope={discovery.scope} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-start">
              <span
                className={`text-xs font-medium px-2 py-1 capitalize ${STATUS_BADGE[discovery.status] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {discovery.status}
              </span>
              <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1">
                {discovery['discovery-id']}
              </span>
            </div>
          </div>
        </div>

        <Section title="Context">
          <Markdown className="text-sm text-gray-700 leading-relaxed">{discovery.context}</Markdown>
        </Section>

        <Section title="Request">
          <Markdown className="text-sm text-gray-700 leading-relaxed">{discovery.request}</Markdown>
        </Section>

        <Section title="Findings">
          {discovery.findings ? (
            <Markdown className="text-sm text-gray-700 leading-relaxed">
              {discovery.findings}
            </Markdown>
          ) : (
            <div className="border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
              No findings yet. The Virtual Architect Agent is interrogating the architecture to
              produce a point-in-time view — this takes a couple of minutes. Refresh to check.
            </div>
          )}
        </Section>
      </article>

      {/* Activity sits outside the document surface (no white box / shadow) */}
      <ActivityHistory activity={discovery.activity} />

      <JsonPreview data={discovery} label={`${discovery['discovery-id']}.json`} />
    </div>
  )
}
