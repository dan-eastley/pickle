import { useState, useRef, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DOMAINS, ABSTRACTIONS, getArtefactsForDomain, DOMAIN_COLORS } from '../../lib/artefacts'
import FormatIcon from '../ui/FormatIcon'

function ChevronDown() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DomainDropdown({ domain, base, onClose }) {
  return (
    <div className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-lg z-40">
      <div className="max-w-5xl mx-auto px-6 py-5">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {domain.name} Architecture
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{domain.description}</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {ABSTRACTIONS.map(abstraction => {
            const artefacts = getArtefactsForDomain(domain.id, abstraction.id)
            return (
              <div key={abstraction.id}>
                <div className="mb-2">
                  <span className="text-xs font-semibold text-gray-700">{abstraction.name}</span>
                  <span className="ml-1.5 text-xs text-gray-400">{abstraction.label}</span>
                </div>
                <div className="space-y-0.5">
                  {artefacts.map(artefact => (
                    <Link
                      key={artefact.id}
                      to={`${base}/domains/${domain.id}/${abstraction.id}/${artefact.id}`}
                      onClick={onClose}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                    >
                      <span className="text-gray-400 group-hover:text-gray-500 flex-shrink-0">
                        <FormatIcon format={artefact.format} className="w-3.5 h-3.5" />
                      </span>
                      <span className="truncate">{artefact.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
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

  useEffect(() => {
    function handleClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close dropdown on route change
  useEffect(() => { setActiveDropdown(null) }, [activeDomain])

  if (!clientId || !versionId) return null

  const activeDomainData = DOMAINS.find(d => d.id === activeDropdown)

  return (
    <div ref={navRef} className="relative bg-white border-b border-gray-200 z-30">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-stretch h-11 gap-0.5">
          {/* Domains link */}
          <Link
            to={`${base}/domains`}
            onClick={() => setActiveDropdown(null)}
            className={`flex items-center px-3 text-sm font-medium border-b-2 transition-colors ${
              !activeDomain && activeDropdown === null
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </Link>

          {/* Domain tabs */}
          {DOMAINS.map(domain => {
            const colors = DOMAIN_COLORS[domain.id]
            const isActive = activeDomain === domain.id
            const isOpen = activeDropdown === domain.id

            return (
              <button
                key={domain.id}
                onClick={() => setActiveDropdown(prev => prev === domain.id ? null : domain.id)}
                className={`flex items-center gap-1.5 px-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive || isOpen
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`}
                />
                {domain.name}
                <span className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown />
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mega-menu dropdown */}
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
