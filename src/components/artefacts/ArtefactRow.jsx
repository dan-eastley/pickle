import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getArtefactData, getSchema } from '../../lib/api'
import { getRootArrayKey } from '../../lib/collections'
import FormatIcon from '../ui/FormatIcon'
import { KeyStar, ChevronRight } from '../ui/icons'

// Fetch fires when the row scrolls into view — avoids simultaneous API calls.
// Loads both artefact data and schema to get schema-driven count labels.
function useArtefactCount(clientId, versionId, artefact, rowRef) {
  const [count, setCount] = useState(undefined)

  useEffect(() => {
    if (artefact.format !== 'catalogue' && artefact.format !== 'document') {
      setCount(null)
      return
    }

    const el = rowRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        Promise.all([
          getArtefactData(clientId, versionId, artefact.domain, artefact.abstraction, artefact.id),
          getSchema(artefact.domain, artefact.abstraction, artefact.id),
        ])
          .then(([data, schema]) => {
            if (!data) {
              setCount(null)
              return
            }
            // Document artefacts hold multiple named instances — count those.
            if (artefact.format === 'document') {
              const n = Array.isArray(data.documents) ? data.documents.length : 0
              setCount({ type: 'document', total: n })
              return
            }
            const meta = schema?.meta
            const labels = meta?.countLabels

            if (meta?.renderAs === 'grouped' && meta?.grouping) {
              const { parentArray, childArray } = meta.grouping
              const pCount = data[parentArray]?.length ?? 0
              const cCount = data[childArray]?.length ?? 0
              setCount({ type: 'grouped', pCount, cCount, labels })
              return
            }

            const rootKey = getRootArrayKey(data)
            if (!rootKey) {
              setCount(null)
              return
            }
            const items = data[rootKey]
            if (!items.length) {
              setCount(null)
              return
            }
            const isHierarchical = items.some((item) => item['parent-id'])
            if (isHierarchical) {
              const level1 = items.filter((i) => !i['parent-id']).length
              setCount({ type: 'hierarchical', level1, total: items.length, labels })
            } else {
              setCount({ type: 'flat', total: items.length, labels })
            }
          })
          .catch(() => setCount(null))
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, versionId, artefact.id])

  return count
}

function EntryCount({ count }) {
  if (!count) return null
  const { type, level1, total, pCount, cCount, labels } = count

  if (type === 'document') {
    return (
      <span className="text-xs text-gray-500 flex-shrink-0">
        {total} {total === 1 ? 'document' : 'documents'}
      </span>
    )
  }

  if (type === 'grouped') {
    const pl =
      pCount === 1 ? (labels?.parent ?? 'group') : labels?.parent ? labels.parent + 's' : 'groups'
    const cl =
      cCount === 1 ? (labels?.child ?? 'item') : labels?.child ? labels.child + 's' : 'items'
    return (
      <span className="text-xs text-gray-500 flex-shrink-0">
        {pCount} {pl} · {cCount} {cl}
      </span>
    )
  }

  if (type === 'hierarchical') {
    const l1label = labels?.level1 ?? 'Level 1'
    const l2label = labels?.level2 ?? 'Level 2'
    return (
      <span className="text-xs text-gray-500 flex-shrink-0">
        {level1} {l1label} · {total - level1} {l2label}
      </span>
    )
  }

  const sing = labels?.singular ?? 'entry'
  const plur = labels?.plural ?? 'entries'
  return (
    <span className="text-xs text-gray-500 flex-shrink-0">
      {total} {total === 1 ? sing : plur}
    </span>
  )
}

export default function ArtefactRow({ artefact, to, clientId, versionId, divider = false }) {
  const rowRef = useRef(null)
  const count = useArtefactCount(clientId, versionId, artefact, rowRef)

  return (
    <Link
      ref={rowRef}
      to={to}
      className={`group flex items-center gap-4 px-5 py-4 transition-colors border-l-4 ${
        artefact.key
          ? 'border-amber-400 bg-amber-50 hover:bg-amber-100'
          : 'border-transparent hover:bg-gray-50'
      } ${divider ? 'border-t border-gray-100' : ''}`}
    >
      <div className="w-8 h-8 bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
        <span className="text-gray-500">
          <FormatIcon format={artefact.format} className="w-4 h-4" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {artefact.key && <KeyStar />}
          <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
            {artefact.name}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5 min-w-0">
          <p className="text-xs text-gray-500 truncate">{artefact.description}</p>
          {count !== undefined && count !== null && (
            <>
              <span className="text-gray-200 flex-shrink-0">·</span>
              <EntryCount count={count} />
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-mono text-gray-500" title={artefact.name}>
          {artefact.id}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </Link>
  )
}
