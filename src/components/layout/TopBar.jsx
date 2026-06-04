import { useState, useRef, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useArchitecture } from '../../context/ArchitectureContext'

function ChevronDown() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 14 14" fill="none">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  )
}

function Dropdown({ label, value, options, onSelect, getLabel, getId }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentOpt = value ? options.find(o => getId(o) === value) : null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors border-0"
      >
        <span className="max-w-[200px] truncate">{currentOpt ? getLabel(currentOpt) : label}</span>
        <ChevronDown />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-0 w-72 bg-white border border-gray-300 z-50 py-1 overflow-hidden shadow-md">
          {options.map(opt => (
            <button
              key={getId(opt)}
              onClick={() => { onSelect(getId(opt)); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                getId(opt) === value
                  ? 'bg-brand-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {getLabel(opt)}
            </button>
          ))}
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">No options</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TopBar() {
  const { clients, clientsMetadata, selectedClientId, selectedVersionId, clientMeta, versions, setClientId, setVersionId } = useArchitecture()
  const navigate = useNavigate()

  const handleClientChange = (clientId) => {
    setClientId(clientId)
  }

  const handleVersionChange = (versionId) => {
    setVersionId(versionId)
    navigate(`/clients/${selectedClientId}/${versionId}/domains`)
  }

  const getClientLabel = (opt) => {
    if (!opt) return ''
    const id = opt['client-id']
    return clientsMetadata[id]?.name ?? id
  }

  return (
    <header className="h-14 bg-white border-b-2 border-brand-600 flex items-center px-6 gap-6 sticky top-0 z-40">
      {/* Pickle brand */}
      <div className="flex items-baseline gap-3 flex-shrink-0">
        <span className="text-lg font-bold tracking-tight text-gray-900 uppercase">Pickle</span>
        <span className="text-xs text-gray-400 hidden sm:block">Agentic Architecture as a Service</span>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-gray-200 flex-shrink-0" />

      {/* Client name */}
      <div className="min-w-0 flex-1 text-sm font-medium text-gray-600 truncate">
        {clientMeta?.name ?? ''}
      </div>

      {/* Docs link */}
      <NavLink
        to="/docs"
        className={({ isActive }) =>
          `text-sm font-medium px-3 py-1.5 transition-colors flex-shrink-0 ${
            isActive ? 'text-brand-700 bg-brand-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`
        }
      >
        Docs
      </NavLink>

      {/* Selectors */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {clients.length > 1 && (
          <Dropdown
            label="Select client"
            value={selectedClientId}
            options={clients}
            onSelect={handleClientChange}
            getLabel={getClientLabel}
            getId={o => o['client-id']}
          />
        )}
        <Dropdown
          label="Select version"
          value={selectedVersionId}
          options={versions}
          onSelect={handleVersionChange}
          getLabel={o => o['version-id']}
          getId={o => o['version-id']}
        />
      </div>
    </header>
  )
}
