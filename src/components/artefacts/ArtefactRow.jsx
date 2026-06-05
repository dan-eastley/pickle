import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getArtefactData } from '../../lib/api'
import FormatIcon from '../ui/FormatIcon'
import Badge from '../ui/Badge'

const FORMAT_LABELS = { catalogue: 'Catalogue', matrix: 'Matrix', diagram: 'Diagram' }
const FORMAT_VARIANTS = { catalogue: 'blue', matrix: 'violet', diagram: 'amber' }

function KeyStar() {
  return (
    <svg className="w-3 h-3 text-amber-500 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 1l1.29 3.09L10.5 4.5 8.25 6.65l.54 3.1L6 8.25 3.21 9.75l.54-3.1L1.5 4.5l3.21-.41z" />
    </svg>
  )
}

function useArtefactCount(clientId, versionId, artefact) {
  const [count, setCount] = useState(undefined)

  useEffect(() => {
    // Diagrams have no structured data to count
    if (artefact.format !== 'catalogue') { setCount(null); return }

    getArtefactData(clientId, versionId, artefact.domain, artefact.abstraction, artefact.id)
      .then(data => {
        if (!data) { setCount(null); return }
        const rootKey = Object.keys(data).find(k => Array.isArray(data[k]))
        if (!rootKey) { setCount(null); return }
        const items = data[rootKey]
        if (!items.length) { setCount(null); return }
        const isHierarchical = items.some(item => item['parent-id'])
        if (isHierarchical) {
          const level1 = items.filter(i => !i['parent-id']).length
          setCount({ hierarchical: true, level1, total: items.length, key: rootKey })
        } else {
          setCount({ hierarchical: false, total: items.length, key: rootKey })
        }
      })
      .catch(() => setCount(null))
  }, [clientId, versionId, artefact.id])

  return count
}

function EntryCount({ count }) {
  if (!count) return null
  if (count.hierarchical) {
    return (
      <span className="text-xs text-gray-400 flex-shrink-0">
        {count.level1} top-level · {count.total} total
      </span>
    )
  }
  return (
    <span className="text-xs text-gray-400 flex-shrink-0">
      {count.total} {count.total === 1 ? 'entry' : 'entries'}
    </span>
  )
}

export default function ArtefactRow({ artefact, to, clientId, versionId, divider = false }) {
  const count = useArtefactCount(clientId, versionId, artefact)

  return (
    <Link
      to={to}
      className={`group flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-l-4 ${
        artefact.key ? 'border-amber-400' : 'border-transparent'
      } ${divider ? 'border-t border-gray-100' : ''}`}
    >
      {/* Format icon box */}
      <div className="w-8 h-8 bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
        <span className="text-gray-500">
          <FormatIcon format={artefact.format} className="w-4 h-4" />
        </span>
      </div>

      {/* Name + description + count */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {artefact.key && <KeyStar />}
          <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
            {artefact.name}
          </p>
          <Badge label={FORMAT_LABELS[artefact.format]} variant={FORMAT_VARIANTS[artefact.format]} size="xs" />
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

      {/* ID + chevron */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-mono text-gray-300">{artefact.id}</span>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </div>
    </Link>
  )
}
