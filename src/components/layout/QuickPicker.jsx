import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getArtefactsForDomain, ARTEFACTS, getDomain, DOMAIN_COLORS } from '../../lib/artefacts'
import useClickOutside from '../../hooks/useClickOutside'
import DomainIcon from '../ui/DomainIcon'
import FormatIcon from '../ui/FormatIcon'
import { DecisionIcon, RobotIcon } from '../ui/icons'

// Document-format artefacts hold individual document instances we can deep-link
// to (e.g. a specific interface specification).
const DOCUMENT_ARTEFACTS = ARTEFACTS.filter((a) => a.format === 'document')

// Header quick-jump / command palette. A wide always-visible search box, scoped
// to the current client + version (and current domain for artefacts). It indexes
// artefact types plus the client's decisions and discoveries (loaded lazily on
// first focus). Type to filter by name/id; ↑/↓/Enter navigates; "/" focuses it.
export default function QuickPicker() {
  const { clientId, versionId, domain } = useParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(0)
  const [extra, setExtra] = useState(null) // { decisions, discoveries } once loaded
  const ref = useRef(null)
  const inputRef = useRef(null)

  const base = `/clients/${clientId}/${versionId}`

  // Lazily load decisions + discoveries the first time the box is focused.
  useEffect(() => {
    if (!focused || extra || !clientId || !versionId) return
    let live = true
    const get = (p) =>
      fetch(`/api/arch/clients/${clientId}/${versionId}/${p}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    Promise.all([
      get('decisions/decisions.json'),
      get('discovery/discovery.json'),
      ...DOCUMENT_ARTEFACTS.map((a) =>
        get(`domains/${a.domain}/${a.abstraction}/${a.id}.json`).then((d) => ({
          artefact: a,
          docs: Array.isArray(d?.documents) ? d.documents : [],
        }))
      ),
    ]).then(([dec, dsc, ...docResults]) => {
      if (!live) return
      const documents = docResults.flatMap(({ artefact, docs }) =>
        docs.map((doc) => ({ artefact, doc }))
      )
      setExtra({
        decisions: dec?.decisions ?? [],
        discoveries: dsc?.discoveries ?? [],
        documents,
      })
    })
    return () => {
      live = false
    }
  }, [focused, extra, clientId, versionId])

  // Reset the loaded index when the client/version changes.
  useEffect(() => {
    setExtra(null)
  }, [clientId, versionId])

  const items = useMemo(() => {
    const artefacts = (domain ? getArtefactsForDomain(domain) : ARTEFACTS).map((a) => ({
      key: `art:${a.id}`,
      kind: 'artefact',
      label: a.name,
      id: a.id,
      domain: a.domain,
      to: `${base}/domains/${a.domain}/${a.abstraction}/${a.id}`,
    }))
    const documents = (extra?.documents ?? []).map(({ artefact: a, doc: d }) => ({
      key: `doc:${a.id}:${d.id}`,
      kind: 'document',
      label: d.title ?? d.id,
      id: d.id,
      domain: a.domain,
      to: `${base}/domains/${a.domain}/${a.abstraction}/${a.id}?doc=${encodeURIComponent(d.id)}`,
    }))
    const decisions = (extra?.decisions ?? []).map((d) => ({
      key: `dec:${d['decision-id']}`,
      kind: 'decision',
      label: d.title ?? d['decision-id'],
      id: d['decision-id'],
      to: `${base}/decisions/${d['decision-id']}`,
    }))
    const discoveries = (extra?.discoveries ?? []).map((d) => ({
      key: `dsc:${d['discovery-id']}`,
      kind: 'discovery',
      label: d.title ?? d['discovery-id'],
      id: d['discovery-id'],
      to: `${base}/discovery/${d['discovery-id']}`,
    }))
    return [...artefacts, ...documents, ...decisions, ...discoveries]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, extra, clientId, versionId])

  const q = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!q) return []
    return items
      .filter((a) => a.label.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
      .slice(0, 50)
  }, [items, q])

  const open = focused && q.length > 0

  useClickOutside(ref, () => setFocused(false))

  // "/" focuses the box from anywhere, unless already typing in a field.
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

  const go = (item) => {
    setFocused(false)
    setQuery('')
    navigate(item.to)
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

  // Leading icon per item kind.
  const ItemIcon = ({ item }) => {
    if (item.kind === 'decision')
      return <DecisionIcon className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
    if (item.kind === 'discovery')
      return <RobotIcon className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
    if (item.kind === 'document')
      return <FormatIcon format="document" className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
    const c = DOMAIN_COLORS[item.domain]
    return (
      <span className={`flex-shrink-0 ${c?.text ?? 'text-gray-500'}`}>
        <DomainIcon domain={item.domain} className="w-3.5 h-3.5" />
      </span>
    )
  }

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-200 ${
        focused ? 'w-64 sm:w-[28rem] lg:w-[34rem]' : 'w-48 sm:w-80 lg:w-96'
      }`}
    >
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500"
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
          placeholder="Jump to… artefact, decision, discovery"
          title={`Jump to ${scopeLabel}, decisions or discoveries — press / to focus`}
          className="w-full pl-9 pr-8 py-1.5 bg-gray-100 hover:bg-gray-200 focus:bg-white text-sm font-medium text-gray-700 placeholder:text-gray-500 placeholder:font-normal border border-transparent focus:border-gray-300 focus:outline-none transition-colors"
        />
        {!query && (
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:block text-[11px] font-mono text-gray-500 border border-gray-300 px-1 leading-tight">
            /
          </kbd>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 shadow-lg z-50 flex flex-col max-h-96 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-3 py-3 text-xs text-gray-500">No matches</div>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.key}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item)}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 transition-colors ${i === active ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
            >
              <ItemIcon item={item} />
              <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{item.label}</span>
              <span className="font-mono text-xs text-gray-500 flex-shrink-0">{item.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
