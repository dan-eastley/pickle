import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getArtefactsForDomain, ARTEFACTS, getDomain, DOMAIN_COLORS } from '../../lib/artefacts'
import DomainIcon from '../ui/DomainIcon'

// Header quick-jump. Scoped to the current client + version, and to the current
// domain when one is active (otherwise the whole client). Type to filter by
// name or id; Enter/click navigates to the artefact.
export default function QuickPicker() {
  const { clientId, versionId, domain } = useParams()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const ref = useRef(null)
  const inputRef = useRef(null)

  const items = useMemo(() => (domain ? getArtefactsForDomain(domain) : ARTEFACTS), [domain])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? items.filter(a => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
      : items
    return list.slice(0, 50)
  }, [items, query])

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => { if (open) inputRef.current?.focus(); setActive(0) }, [open, query])

  if (!clientId || !versionId) return null

  const go = (a) => {
    setOpen(false); setQuery('')
    navigate(`/clients/${clientId}/${versionId}/domains/${a.domain}/${a.abstraction}/${a.id}`)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && filtered[active]) { e.preventDefault(); go(filtered[active]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  const scopeLabel = domain ? `${getDomain(domain)?.name ?? domain} artefacts` : 'all artefacts'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-600 transition-colors"
        title={`Jump to an artefact (${scopeLabel})`}
      >
        <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">Jump to…</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-300 shadow-lg z-50 flex flex-col max-h-96">
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Filter ${scopeLabel}…`}
            className="px-3 py-2 text-sm border-b border-gray-200 focus:outline-none"
          />
          <div className="overflow-y-auto">
            {filtered.length === 0 && <div className="px-3 py-3 text-xs text-gray-400">No matches</div>}
            {filtered.map((a, i) => {
              const c = DOMAIN_COLORS[a.domain]
              return (
                <button
                  key={a.id}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(a)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 transition-colors ${i === active ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
                >
                  <span className={`flex-shrink-0 ${c?.text ?? 'text-gray-400'}`}><DomainIcon domain={a.domain} className="w-3.5 h-3.5" /></span>
                  <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{a.name}</span>
                  <span className="font-mono text-xs text-gray-400 flex-shrink-0">{a.id}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
