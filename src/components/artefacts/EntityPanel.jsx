import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getArtefact, resolveRefArtefactId } from '../../lib/artefacts'
import { getArtefactData } from '../../lib/api'
import { loadEntityRelationships } from '../../lib/relationships'
import { nameWithId } from '../../lib/format'
import SlidePanel from '../ui/SlidePanel'
import Spinner from '../ui/Spinner'

// Find an entity by id across every array-valued property of a catalogue
// (handles flat, hierarchical, and grouped two-array catalogues alike).
function findEntity(data, entityId) {
  if (!data) return null
  for (const value of Object.values(data)) {
    if (Array.isArray(value)) {
      const hit = value.find((item) => item && item.id === entityId)
      if (hit) return hit
    }
  }
  return null
}

const humanize = (key) => key.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

// A short scalar goes in the attributes table; long strings, arrays and objects
// get their own headed section (so the table stays tidily aligned).
const isLongText = (v) => typeof v === 'string' && (v.length > 80 || v.includes('\n'))
const isTableValue = (key, v) =>
  key !== 'description' &&
  (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') &&
  !isLongText(v)

// Body for a headed (non-table) section.
function SectionBody({ value }) {
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-0.5">
        {value.map((v, i) => (
          <li key={i} className="text-sm text-gray-700">
            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
          </li>
        ))}
      </ul>
    )
  }
  if (value && typeof value === 'object') {
    return (
      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
        {JSON.stringify(value, null, 2)}
      </pre>
    )
  }
  return (
    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{String(value)}</p>
  )
}

export default function EntityPanel({ entityId, clientId, versionId, onClose }) {
  const [state, setState] = useState({ status: 'idle' })
  const [rels, setRels] = useState(null) // UI-9 matrix relationships (null = loading)
  // Internal breadcrumb navigation stack, seeded from the entityId prop. Clicking
  // a related entity pushes onto it so you can traverse the graph and step back
  // (UI-9) without the parent having to track history.
  const [stack, setStack] = useState(() => (entityId ? [entityId] : []))
  useEffect(() => {
    setStack(entityId ? [entityId] : [])
  }, [entityId])

  const currentId = stack[stack.length - 1] ?? null
  const pushEntity = (id) => id && setStack((s) => [...s, id])
  const goToLevel = (i) => setStack((s) => s.slice(0, i + 1))

  const targetArtefactId = resolveRefArtefactId(currentId)
  const artefact = targetArtefactId ? getArtefact(targetArtefactId) : null

  // UI-9 — load the entity's relationships across all matrices so you can step
  // from here to related capabilities / processes / data / platforms.
  useEffect(() => {
    if (!currentId) return
    let cancelled = false
    setRels(null)
    loadEntityRelationships(currentId, clientId, versionId)
      .then((r) => !cancelled && setRels(r))
      .catch(() => !cancelled && setRels([]))
    return () => {
      cancelled = true
    }
  }, [currentId, clientId, versionId])

  useEffect(() => {
    if (!currentId) return
    if (!artefact) {
      setState({ status: 'unresolved' })
      return
    }
    let cancelled = false
    setState({ status: 'loading' })
    getArtefactData(clientId, versionId, artefact.domain, artefact.abstraction, artefact.id)
      .then((data) => {
        if (cancelled) return
        const entity = findEntity(data, currentId)
        setState(entity ? { status: 'ready', entity } : { status: 'not-found' })
      })
      .catch((err) => {
        if (!cancelled) setState({ status: 'error', message: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [currentId, clientId, versionId, artefact])

  const entity = state.status === 'ready' ? state.entity : null
  const entries = entity
    ? Object.entries(entity).filter(([k, v]) => k !== 'id' && k !== 'name' && v != null && v !== '')
    : []
  const tableFields = entries.filter(([k, v]) => isTableValue(k, v))
  // Long-text / array / object fields get their own heading — description first.
  const sectionFields = entries
    .filter(([k, v]) => !isTableValue(k, v))
    .sort(([a], [b]) => (a === 'description' ? -1 : b === 'description' ? 1 : 0))

  // Fields that point at another entity we can open in this same panel.
  const RELATION_FIELDS = new Set(['parent-id', 'domain-id'])

  return (
    <SlidePanel
      open={!!entityId}
      onClose={onClose}
      title={entity ? nameWithId(entity.name, entity.id) : currentId}
      subtitle={artefact ? nameWithId(artefact.name, artefact.id) : undefined}
    >
      <div className="px-4 py-4">
        {/* Breadcrumb trail, the navigation stack (UI-9). Back steps up one
            level; clicking an earlier crumb jumps to it. */}
        {stack.length > 1 && (
          <nav
            className="mb-3 flex items-center gap-1 text-xs text-gray-500 flex-wrap"
            aria-label="Trail"
          >
            <button
              onClick={() => goToLevel(stack.length - 2)}
              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium"
            >
              ← Back
            </button>
            <span className="mx-1 text-gray-300">·</span>
            {stack.map((id, i) => (
              <span key={`${id}-${i}`} className="inline-flex items-center">
                {i > 0 && <span className="mx-1 text-gray-300">›</span>}
                {i === stack.length - 1 ? (
                  <span className="font-mono text-gray-700">{id}</span>
                ) : (
                  <button
                    onClick={() => goToLevel(i)}
                    className="font-mono text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    {id}
                  </button>
                )}
              </span>
            ))}
          </nav>
        )}

        {state.status === 'loading' && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}
        {state.status === 'unresolved' && (
          <p className="text-sm text-gray-500">
            No catalogue is registered for <span className="font-mono">{currentId}</span>.
          </p>
        )}
        {state.status === 'not-found' && (
          <p className="text-sm text-gray-500">
            <span className="font-mono">{currentId}</span> was not found in{' '}
            {nameWithId(artefact?.name, artefact?.id)} for this version.
          </p>
        )}
        {state.status === 'error' && (
          <p className="text-sm text-error-600">Failed to load: {state.message}</p>
        )}

        {entity && (
          <div className="space-y-5">
            {/* Attributes table: short scalars, label → value forced into a
                two-column table so everything lines up. */}
            {tableFields.length > 0 && (
              <table className="w-full text-sm">
                <tbody>
                  {tableFields.map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-100 last:border-0 align-top">
                      <th className="py-2 pr-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap align-top">
                        {humanize(key)}
                      </th>
                      <td className="py-2 text-sm text-gray-700">
                        {RELATION_FIELDS.has(key) ? (
                          <button
                            onClick={() => pushEntity(value)}
                            className="font-mono text-brand-600 hover:text-brand-700 hover:underline"
                          >
                            {value}
                          </button>
                        ) : (
                          String(value)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Long-text / array / object fields: each under its own heading. */}
            {sectionFields.map(([key, value]) => (
              <div key={key}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {humanize(key)}
                </p>
                <SectionBody value={value} />
              </div>
            ))}

            {/* UI-9: related entities, resolved from the matrices. Click to
                navigate to that entity in this same panel. */}
            {rels === null ? (
              <p className="text-xs text-gray-500">Finding relationships…</p>
            ) : rels.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Related
                </p>
                {rels.map((group) => (
                  <div key={group.artefact?.id ?? 'x'}>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {group.artefact?.name ?? 'Related'}
                    </p>
                    <div className="border border-gray-200 divide-y divide-gray-100">
                      {group.entities.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => pushEntity(e.id)}
                          title={`via ${e.via.join(', ')}`}
                          className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-mono text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-500 flex-shrink-0">
                            {e.id}
                          </span>
                          <span className="text-sm text-gray-700 min-w-0 truncate">{e.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

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
