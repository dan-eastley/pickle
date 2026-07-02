import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useArchitecture } from '../context/ArchitectureContext'
import { usePermissions } from '../context/PermissionsContext'
import { ACTIONS } from '../lib/permissions'
import { loadClientRollup } from '../lib/metrics'
import { githubAction } from '../lib/api'
import MetricBars from '../components/common/MetricBars'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import ClientLogo from '../components/ui/ClientLogo'
import EditSettingsModal from '../components/settings/EditSettingsModal'
import CreateEntityModal from '../components/settings/CreateEntityModal'
import { ChevronRight, EditIcon } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

const ARCH_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
]

function ClientCard({ clientId, name, metrics: m, canEdit, onEdit }) {
  return (
    <Link
      to={`/architectures/${clientId}/transitions`}
      className="group block bg-white border border-gray-200 hover:border-gray-400 transition-colors"
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 bg-gray-50 border-b border-gray-200">
        <ClientLogo clientId={clientId} name={name} className="w-11 h-11 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500">Architecture</p>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-700 transition-colors truncate">
            {name}
          </h3>
        </div>
        {canEdit && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEdit()
            }}
            className="p-1.5 text-gray-400 hover:text-brand-700 hover:bg-gray-100 transition-colors flex-shrink-0"
            title="Edit architecture"
            aria-label={`Edit ${name}`}
          >
            <EditIcon className="w-4 h-4" />
          </button>
        )}
        <span className="text-sm font-mono text-gray-400 flex-shrink-0">{clientId}</span>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
      </div>

      {/* Metrics */}
      <div className="p-4">
        {m === undefined ? (
          <div className="flex items-center gap-2 py-2 text-xs text-gray-500">
            <Spinner size="sm" /> Loading metrics…
          </div>
        ) : m === null ? (
          <p className="py-2 text-xs text-gray-500">No architecture content yet.</p>
        ) : (
          <MetricBars
            perDomain={m.perDomain}
            governance={{ decisions: m.decisions, discoveries: m.discoveries }}
            empty={<p className="text-xs text-gray-500">No architecture content yet.</p>}
          />
        )}
      </div>
    </Link>
  )
}

export default function ClientsPage() {
  const { clients, clientsMetadata, loading } = useArchitecture()
  const { can } = usePermissions()
  const navigate = useNavigate()
  usePageTitle('Architectures')

  const [metrics, setMetrics] = useState({})
  // Optimistic name/status overrides after an edit (context isn't re-fetched).
  const [overrides, setOverrides] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [creating, setCreating] = useState(false)
  const canCreate = can(ACTIONS.ARCHITECTURE_CREATE)

  useEffect(() => {
    let live = true
    for (const c of clients) {
      const id = c['architecture-id']
      loadClientRollup(id)
        .then((m) => live && setMetrics((prev) => ({ ...prev, [id]: m })))
        .catch(() => live && setMetrics((prev) => ({ ...prev, [id]: null })))
    }
    return () => {
      live = false
    }
  }, [clients])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  const nameFor = (id) => overrides[id]?.name ?? clientsMetadata[id]?.name ?? id
  const editing = editingId
    ? { id: editingId, name: nameFor(editingId), status: overrides[editingId]?.status ?? clientsMetadata[editingId]?.status ?? 'active' }
    : null

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-8 pb-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Architectures</h1>
          <p className="mt-1 text-sm text-gray-500">
            Select an architecture to view its transition states. The bars compare how populated
            each architecture is.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreating(true)} size="sm" className="flex-shrink-0">
            New Architecture
          </Button>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-semibold text-gray-700">No architectures yet</p>
          <p className="mt-1 text-sm text-gray-500 max-w-sm">
            Each architecture lives in its own folder. Add one under{' '}
            <code className="font-mono text-xs bg-gray-100 px-1">architectures/</code> to get
            started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {clients.map((client) => {
            const id = client['architecture-id']
            return (
              <ClientCard
                key={id}
                clientId={id}
                name={nameFor(id)}
                metrics={metrics[id]}
                canEdit={can(ACTIONS.ARCHITECTURE_EDIT, { architectureId: id })}
                onEdit={() => setEditingId(id)}
              />
            )
          })}
        </div>
      )}

      {editing && (
        <EditSettingsModal
          title="Edit architecture"
          subtitle={`Settings for ${editing.name}`}
          initialName={editing.name}
          initialStatus={editing.status}
          statusOptions={ARCH_STATUS_OPTIONS}
          onSubmit={(fields) => githubAction({ action: 'update-architecture', architectureId: editing.id, ...fields })}
          onSaved={(fields) =>
            setOverrides((prev) => ({ ...prev, [editing.id]: { ...prev[editing.id], ...fields } }))
          }
          onClose={() => setEditingId(null)}
        />
      )}

      {creating && (
        <CreateEntityModal
          title="New architecture"
          subtitle="Create an empty architecture with a baseline transition. You become its owner."
          idLabel="Architecture ID"
          idHint="Lowercase letters, numbers and dashes — becomes the folder name and URL."
          onSubmit={(fields) =>
            githubAction({ action: 'create-architecture', architectureId: fields.id, name: fields.name })
          }
          onCreated={(fields) => navigate(`/architectures/${fields.id}/transitions`)}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  )
}
