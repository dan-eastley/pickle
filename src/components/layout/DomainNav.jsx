import { useState, useRef, useEffect } from 'react'
import { Link, useParams, useMatch } from 'react-router-dom'
import { DOMAINS, ABSTRACTIONS, getArtefactsForDomain, DOMAIN_COLORS } from '../../lib/artefacts'
import DomainIcon from '../ui/DomainIcon'
import FormatIcon from '../ui/FormatIcon'

function ChevronDown() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  )
}

function KeyStar() {
  return (
    <svg className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 1l1.29 3.09L10.5 4.5 8.25 6.65l.54 3.1L6 8.25 3.21 9.75l.54-3.1L1.5 4.5l3.21-.41z" />
    </svg>
  )
}

const FORMAT_ORDER = ['catalogue', 'diagram', 'matrix']
const FORMAT_LABELS = { catalogue: 'Catalogues', diagram: 'Diagrams', matrix: 'Matrices' }
const ABSTRACTION_SHORT = { conceptual: 'Conceptual', logical: 'Logical', physical: 'Physical' }

// Per-domain active tab colours — border / text / bg / icon
const DOMAIN_ACTIVE = {
  business:    { border: 'border-violet-500',  text: 'text-violet-700',  bg: 'bg-violet-50',  icon: 'text-violet-600' },
  data:        { border: 'border-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50',    icon: 'text-blue-600' },
  integration: { border: 'border-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', icon: 'text-emerald-600' },
  application: { border: 'border-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',   icon: 'text-amber-600' },
  solution:    { border: 'border-rose-500',    text: 'text-rose-700',    bg: 'bg-rose-50',    icon: 'text-rose-600' },
}

function DomainDropdown({ domain, base, onClose }) {
  const allArtefacts = ABSTRACTIONS.flatMap(abs => getArtefactsForDomain(domain.id, abs.id))

  const byFormat = {}
  for (const fmt of FORMAT_ORDER) {
    const items = allArtefacts.filter(a => a.format === fmt)
    if (items.length > 0) {
      byFormat[fmt] = [...items.filter(a => a.key), ...items.filter(a => !a.key)]
    }
  }

  const colors = DOMAIN_COLORS[domain.id]
  const fmtKeys = FORMAT_ORDER.filter(f => byFormat[f])

  return (
    <div className="absolute left-0 right-0 top-full bg-white border-b-2 border-gray-200 shadow-lg z-40">
      <div className="max-w-[1400px] mx-auto px-6 py-5">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
            <span className={colors.text}>
              <DomainIcon domain={domain.id} className="w-4 h-4" />
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">{domain.name} Architecture</p>
            <p className="text-xs text-gray-400 mt-0.5">{domain.description}</p>
          </div>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${fmtKeys.length}, minmax(0, 1fr))` }}>
          {fmtKeys.map(fmt => (
            <div key={fmt}>
              <div className="flex items-center gap-1.5 mb-2">
                <FormatIcon format={fmt} className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {FORMAT_LABELS[fmt]}
                </span>
              </div>
              <div className="space-y-px">
                {byFormat[fmt].map(artefact => (
                  <Link
                    key={artefact.id}
                    to={`${base}/domains/${domain.id}/${artefact.abstraction}/${artefact.id}`}
                    onClick={onClose}
                    className={`flex items-center gap-2 px-2.5 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group ${artefact.key ? 'border-l-2 border-amber-400' : 'border-l-2 border-transparent'}`}
                  >
                    {artefact.key && <KeyStar />}
                    <span className="truncate flex-1">{artefact.name}</span>
                    <span className="text-xs text-gray-300 flex-shrink-0 font-mono">
                      {ABSTRACTION_SHORT[artefact.abstraction]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DomainNav() {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const navRef = useRef(null)
  const { clientId, versionId, domain: activeDomain } = useParams()
  const base = `/clients/${clientId}/${versionId}`

  // Detect if we're on a decisions page
  const decisionsMatch = useMatch('/clients/:clientId/:versionId/decisions/*')
  const onDecisionsPage = !!decisionsMatch

  useEffect(() => {
    function handleClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setActiveDropdown(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => { setActiveDropdown(null) }, [activeDomain])

  if (!clientId || !versionId) return null

  const activeDomainData = DOMAINS.find(d => d.id === activeDropdown)

  return (
    <div ref={navRef} className="relative bg-white border-b border-gray-200 z-30">
      <div className="max-w-[1400px] mx-auto px-5">
        <div className="flex items-stretch h-11 gap-0">
          {/* Overview */}
          <Link
            to={`${base}/domains`}
            onClick={() => setActiveDropdown(null)}
            className={`flex items-center px-4 text-sm font-medium border-b-2 transition-colors ${
              !activeDomain && !onDecisionsPage && activeDropdown === null
                ? 'border-brand-600 text-brand-700 bg-brand-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overview
          </Link>

          {/* Domain tabs */}
          {DOMAINS.map(domain => {
            const isActive = activeDomain === domain.id
            const isOpen = activeDropdown === domain.id
            const ac = DOMAIN_ACTIVE[domain.id]

            return (
              <button
                key={domain.id}
                onClick={() => setActiveDropdown(prev => prev === domain.id ? null : domain.id)}
                className={`flex items-center gap-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive || isOpen
                    ? `${ac.border} ${ac.text} ${ac.bg}`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className={`flex-shrink-0 ${isActive || isOpen ? ac.icon : DOMAIN_COLORS[domain.id].text}`}>
                  <DomainIcon domain={domain.id} className="w-3.5 h-3.5" />
                </span>
                {domain.name}
                <span className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown />
                </span>
              </button>
            )
          })}

          {/* Decisions — right-aligned */}
          <div className="flex-1" />
          <Link
            to={`${base}/decisions`}
            onClick={() => setActiveDropdown(null)}
            className={`flex items-center gap-1.5 px-4 text-sm font-medium border-b-2 transition-colors ${
              onDecisionsPage
                ? 'border-gray-400 text-gray-700 bg-gray-100'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
              <path d="M2 2h10v10H2zM2 5h10M5 5v7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
            </svg>
            Decisions
          </Link>
        </div>
      </div>

      {activeDropdown && activeDomainData && (
        <DomainDropdown
          domain={activeDomainData}
          base={base}
          onClose={() => setActiveDropdown(null)}
        />
      )}
    </div>
  )
}
