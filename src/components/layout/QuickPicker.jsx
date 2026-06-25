import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getArtefactsForDomain, ARTEFACTS, getDomain, DOMAIN_COLORS } from '../../lib/artefacts'
import DomainIcon from '../ui/DomainIcon'

// Header quick-jump. A wide always-visible search box, scoped to the current
// client + version, and to the current domain when one is active (otherwise the
// whole client). The results dropdown only appears once you start typing, and
// matches the input width. Enter/click navigates to the artefact.
export default function QuickPicker() {
  const { clientId, versionId, domain } = useParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(0)
  const ref = useRef(null)
  const inputRef = useRef(null)

  const items = useMemo(() => (domain ? getArtefactsForDomain(domain) : ARTEFACTS), [domain])
  const q = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!q) return []
    return items
      .filter((a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
      .slice(0, 50)
  }, [items, q])

  // The dropdown shows only while focused and the user has typed something.
  const open = focused && q.length > 0

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setFocused(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Command-palette convention: "/" focuses the jump-to box from anywhere,
  // unless the user is already typing in a field.
  useEffect(() => {
    function onKey(e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      if (typing) return
      e.preventDefault()
      inputRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    setActive(0)
  }, [query])

  if (!clientId || !versionId) return null

  const go = (a) => {
    setFocused(false)
    setQuery('')
    navigate(`/clients/${clientId}/${versionId}/domains/${a.domain}/${a.abstraction}/${a.id}`)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[active]) {
      e.preventDefault()
      go(filtered[active])
    } else if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.blur()
    }
  }

  const scopeLabel = domain ? `${getDomain(domain)?.name ?? domain} artefacts` : 'all artefacts'

  return (
    <div ref={ref} className="relative w-48 sm:w-80 lg:w-96">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          placeholder={`Jump to ${scopeLabel}…`}
          title={`Jump to an artefact (${scopeLabel}) — press / to focus`}
          className="w-full pl-9 pr-8 py-1.5 bg-gray-100 hover:bg-gray-200 focus:bg-white text-sm font-medium text-gray-700 placeholder:text-gray-400 placeholder:font-normal border border-transparent focus:border-gray-300 focus:outline-none transition-colors"
        />
        {!query && (
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:block text-[11px] font-mono text-gray-400 border border-gray-300 px-1 leading-tight">
            /
          </kbd>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 shadow-lg z-50 flex flex-col max-h-96 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-3 py-3 text-xs text-gray-400">No matches</div>
          )}
          {filtered.map((a, i) => {
            const c = DOMAIN_COLORS[a.domain]
            return (
              <button
                key={a.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(a)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 transition-colors ${i === active ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
              >
                <span className={`flex-shrink-0 ${c?.text ?? 'text-gray-400'}`}>
                  <DomainIcon domain={a.domain} className="w-3.5 h-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{a.name}</span>
                <span className="font-mono text-xs text-gray-400 flex-shrink-0">{a.id}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
