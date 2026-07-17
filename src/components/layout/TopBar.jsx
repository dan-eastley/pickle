import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useArchitecture } from '../../context/ArchitectureContext'
import { ChevronDown } from '../ui/icons'
import useClickOutside from '../../hooks/useClickOutside'
import QuickPicker from './QuickPicker'
import UserMenu from '../auth/UserMenu'
import Logo from '../ui/Logo'

// Combined architecture + transition selector. Both live in one dropdown (an
// "Architectures" section over a "Transitions" section) so the header carries a
// single control, styled to match the search box ([UI-10]).
function ArchitectureSelector({
  clients,
  clientsMetadata,
  versions,
  selectedClientId,
  selectedVersionId,
  onSelectArchitecture,
  onSelectTransition,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  const archName = clientsMetadata[selectedClientId]?.name ?? selectedClientId ?? 'Select architecture'
  const showArchitectures = clients.length > 1

  const Row = ({ selected, onClick, children }) => (
    <button
      onClick={() => {
        onClick()
        setOpen(false)
      }}
      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
        selected ? 'bg-brand-600 text-white font-medium' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )

  const Heading = ({ children }) => (
    <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
      {children}
    </div>
  )

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 border border-transparent transition-colors"
      >
        <span className="max-w-[220px] truncate">{archName}</span>
        {selectedVersionId && (
          <>
            <span className="text-gray-300 font-normal">/</span>
            <span className="font-mono text-[12px] text-gray-500 font-normal">
              {selectedVersionId}
            </span>
          </>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-gray-300 z-50 py-1 overflow-y-auto max-h-[70vh] shadow-md">
          {showArchitectures && (
            <>
              <Heading>Architectures</Heading>
              {clients.map((c) => {
                const id = c['architecture-id']
                return (
                  <Row
                    key={id}
                    selected={id === selectedClientId}
                    onClick={() => onSelectArchitecture(id)}
                  >
                    {clientsMetadata[id]?.name ?? id}
                  </Row>
                )
              })}
              <div className="my-1 border-t border-gray-100" />
            </>
          )}

          <Heading>Transitions</Heading>
          {versions.map((v) => {
            const id = v['transition-id']
            return (
              <Row key={id} selected={id === selectedVersionId} onClick={() => onSelectTransition(id)}>
                {id}
              </Row>
            )
          })}
          {versions.length === 0 && <div className="px-3 py-2 text-sm text-gray-500">None</div>}
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

  return (
    <header className="h-16 bg-white border-b-2 border-brand-600 flex items-center px-3 sm:px-6 gap-3 sm:gap-4 sticky top-0 z-40">
      {/* Left: brand + combined architecture/transition selector */}
      <Logo align="left" size="sm" to="/" className="flex-shrink-0" />
      <div className="h-5 w-px bg-gray-200 flex-shrink-0" />
      <div className="flex-shrink-0">
        <ArchitectureSelector
          clients={clients}
          clientsMetadata={clientsMetadata}
          versions={versions}
          selectedClientId={selectedClientId}
          selectedVersionId={selectedVersionId}
          onSelectArchitecture={handleClientChange}
          onSelectTransition={handleVersionChange}
        />
      </div>

      {/* Spacer pushes search + user to the right */}
      <div className="flex-1" />

      {/* Right: search, then user */}
      <div className="flex-shrink-0">
        <QuickPicker />
      </div>
      <div className="h-5 w-px bg-gray-200 flex-shrink-0" />
      <UserMenu />
    </header>
  )
}
