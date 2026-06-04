import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useArchitecture } from '../../context/ArchitectureContext'

function ChevronDown() {
  return (
    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
      >
        <span className="max-w-[120px] truncate">{value ? getLabel(options.find(o => getId(o) === value)) : label}</span>
        <ChevronDown />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-gray-200 bg-white shadow-lg z-50 py-1 overflow-hidden">
          {options.map(opt => (
            <button
              key={getId(opt)}
              onClick={() => { onSelect(getId(opt)); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                getId(opt) === value
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
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
  const { clients, selectedClientId, selectedVersionId, clientMeta, versions, setClientId, setVersionId } = useArchitecture()
  const navigate = useNavigate()
  const [logoError, setLogoError] = useState(false)

  const handleClientChange = (clientId) => {
    setClientId(clientId)
    // Navigation happens via context effect when version resolves
  }

  const handleVersionChange = (versionId) => {
    setVersionId(versionId)
    navigate(`/clients/${selectedClientId}/${versionId}/domains`)
  }

  const logoUrl = selectedClientId && !logoError
    ? `/api/arch/clients/${selectedClientId}/logo.png`
    : null

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 sticky top-0 z-40">
      {/* Logo / brand */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={clientMeta?.name ?? 'Client logo'}
            className="h-7 w-auto object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 truncate">
              {clientMeta?.name ?? 'Architecture Browser'}
            </span>
          </div>
        )}
      </div>

      {/* Selectors */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {clients.length > 1 && (
          <Dropdown
            label="Select client"
            value={selectedClientId}
            options={clients}
            onSelect={handleClientChange}
            getLabel={o => o['client-id']}
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
