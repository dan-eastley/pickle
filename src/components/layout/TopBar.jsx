import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useArchitecture } from '../../context/ArchitectureContext'
import { ChevronDown } from '../ui/icons'
import useClickOutside from '../../hooks/useClickOutside'
import QuickPicker from './QuickPicker'
import UserMenu from '../auth/UserMenu'
import Logo from '../ui/Logo'

function Dropdown({ label, value, options, onSelect, getLabel, getId }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useClickOutside(ref, () => setOpen(false))

  const currentOpt = value ? options.find((o) => getId(o) === value) : null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors border-0"
      >
        <span className="max-w-[200px] truncate">{currentOpt ? getLabel(currentOpt) : label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-0 w-72 bg-white border border-gray-300 z-50 py-1 overflow-hidden shadow-md">
          {options.map((opt) => (
            <button
              key={getId(opt)}
              onClick={() => {
                onSelect(getId(opt))
                setOpen(false)
              }}
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
            <div className="px-3 py-2 text-sm text-gray-500">No options</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TopBar() {
  const {
    clients,
    clientsMetadata,
    selectedClientId,
    selectedVersionId,
    clientMeta,
    versions,
    setClientId,
    setVersionId,
  } = useArchitecture()
  const navigate = useNavigate()

  const handleClientChange = (newClientId) => {
    setClientId(newClientId)
    navigate(`/architectures/${newClientId}/${selectedVersionId ?? 'baseline'}/domains`)
  }

  const handleVersionChange = (versionId) => {
    setVersionId(versionId)
    navigate(`/architectures/${selectedClientId}/${versionId}/domains`)
  }

  const getClientLabel = (opt) => {
    if (!opt) return ''
    const id = opt['architecture-id']
    return clientsMetadata[id]?.name ?? id
  }

  return (
    <header className="h-16 bg-white border-b-2 border-brand-600 flex items-center px-3 sm:px-6 gap-3 sm:gap-6 sticky top-0 z-40">
      {/* Pickle brand: links to root */}
      <Logo align="left" size="sm" to="/" className="flex-shrink-0" />

      {/* Divider */}
      <div className="h-5 w-px bg-gray-200 flex-shrink-0" />

      {/* Client name */}
      <div className="min-w-0 flex-1 text-lg font-medium text-gray-600 truncate">
        {clientMeta?.name ?? ''}
      </div>

      {/* Quick jump: scoped to the current client + domain */}
      <div className="flex-shrink-0">
        <QuickPicker />
      </div>

      {/* Selectors */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {clients.length > 1 && (
          <Dropdown
            label="Select architecture"
            value={selectedClientId}
            options={clients}
            onSelect={handleClientChange}
            getLabel={getClientLabel}
            getId={(o) => o['architecture-id']}
          />
        )}
        <Dropdown
          label="Select transition"
          value={selectedVersionId}
          options={versions}
          onSelect={handleVersionChange}
          getLabel={(o) => o['transition-id']}
          getId={(o) => o['transition-id']}
        />
      </div>

      <div className="h-5 w-px bg-gray-200 flex-shrink-0" />
      <UserMenu />
    </header>
  )
}
