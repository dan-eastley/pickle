import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getArtefact, resolveRefArtefactId } from '../../lib/artefacts'
import { getArtefactData } from '../../lib/api'
import { nameWithId } from '../../lib/format'
import SlidePanel from '../ui/SlidePanel'
import Spinner from '../ui/Spinner'

// Find an entity by id across every array-valued property of a catalogue
// (handles flat, hierarchical, and grouped two-array catalogues alike).
function findEntity(data, entityId) {
  if (!data) return null
  for (const value of Object.values(data)) {
    if (Array.isArray(value)) {
      const hit = value.find(item => item && item.id === entityId)
      if (hit) return hit
    }
  }
  return null
}

const HIDDEN_FIELDS = new Set(['id', 'name', 'description'])
const humanize = (key) => key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

function FieldValue({ value }) {
  if (value == null || value === '') return <span className="text-gray-300">—</span>
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-300">—</span>
    return (
      <ul className="space-y-0.5">
        {value.map((v, i) => (
          <li key={i} className="text-sm text-gray-700">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</li>
        ))}
      </ul>
    )
  }
  if (typeof value === 'object') {
    return <pre className="text-xs text-gray-600 whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
  }
  return <span className="text-sm text-gray-700">{String(value)}</span>
}

export default function EntityPanel({ entityId, clientId, versionId, onOpenEntity, onClose }) {
  const [state, setState] = useState({ status: 'idle' })

  const targetArtefactId = resolveRefArtefactId(entityId)
  const artefact = targetArtefactId ? getArtefact(targetArtefactId) : null

  useEffect(() => {
    if (!entityId) return
    if (!artefact) { setState({ status: 'unresolved' }); return }
    let cancelled = false
    setState({ status: 'loading' })
    getArtefactData(clientId, versionId, artefact.domain, artefact.abstraction, artefact.id)
      .then(data => {
        if (cancelled) return
        const entity = findEntity(data, entityId)
        setState(entity ? { status: 'ready', entity } : { status: 'not-found' })
      })
      .catch(err => { if (!cancelled) setState({ status: 'error', message: err.message }) })
    return () => { cancelled = true }
  }, [entityId, clientId, versionId, artefact])

  const entity = state.status === 'ready' ? state.entity : null
  const fields = entity
    ? Object.entries(entity).filter(([k, v]) => !HIDDEN_FIELDS.has(k) && v != null && v !== '')
    : []

  // Fields that point at another entity we can open in this same panel.
  const RELATION_FIELDS = new Set(['parent-id', 'domain-id'])

  return (
    <SlidePanel
      open={!!entityId}
      onClose={onClose}
      title={entity ? nameWithId(entity.name, entity.id) : entityId}
      subtitle={artefact ? nameWithId(artefact.name, artefact.id) : undefined}
    >
      <div className="px-4 py-4">
        {state.status === 'loading' && (
          <div className="flex justify-center py-8"><Spinner /></div>
        )}
        {state.status === 'unresolved' && (
          <p className="text-sm text-gray-500">No catalogue is registered for <span className="font-mono">{entityId}</span>.</p>
        )}
        {state.status === 'not-found' && (
          <p className="text-sm text-gray-500"><span className="font-mono">{entityId}</span> was not found in {nameWithId(artefact?.name, artefact?.id)} for this version.</p>
        )}
        {state.status === 'error' && (
          <p className="text-sm text-error-600">Failed to load: {state.message}</p>
        )}

        {entity && (
          <div className="space-y-4">
            {entity.description && (
              <p className="text-sm text-gray-700 leading-relaxed">{entity.description}</p>
            )}

            <dl className="divide-y divide-gray-100 border-t border-gray-100">
              {fields.map(([key, value]) => (
                <div key={key} className="py-2.5 grid grid-cols-3 gap-3">
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">{humanize(key)}</dt>
                  <dd className="col-span-2">
                    {RELATION_FIELDS.has(key) && typeof value === 'string' ? (
                      <button
                        onClick={() => onOpenEntity?.(value)}
                        className="text-sm font-mono text-rose-600 hover:text-rose-700 hover:underline"
                      >
                        {value}
                      </button>
                    ) : (
                      <FieldValue value={value} />
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            {artefact && (
              <Link
                to={`/clients/${clientId}/${versionId}/domains/${artefact.domain}/${artefact.abstraction}/${artefact.id}`}
                onClick={onClose}
                className="inline-block text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                View in {nameWithId(artefact.name, artefact.id)} →
              </Link>
            )}
          </div>
        )}
      </div>
    </SlidePanel>
  )
}
