import { createContext, useContext, useState, useEffect } from 'react'
import { getClients, getClient, getVersions } from '../lib/api'

const ArchitectureContext = createContext(null)

export function ArchitectureProvider({ children }) {
  const [clients, setClients] = useState([])
  const [clientsMetadata, setClientsMetadata] = useState({})
  const [selectedClientId, setSelectedClientId] = useState(
    () => localStorage.getItem('arch_clientId') || null
  )
  const [selectedVersionId, setSelectedVersionId] = useState(
    () => localStorage.getItem('arch_versionId') || null
  )
  const [clientMeta, setClientMeta] = useState(null)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getClients()
      .then((list) => {
        setClients(list)
        if (!selectedClientId && list.length > 0) {
          setSelectedClientId(list[0]['architecture-id'])
        }
        Promise.all(
          list.map((c) => getClient(c['architecture-id']).then((meta) => [c['architecture-id'], meta]))
        ).then((entries) => {
          setClientsMetadata(Object.fromEntries(entries.filter(([, m]) => m)))
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedClientId) return
    localStorage.setItem('arch_clientId', selectedClientId)
    setClientMeta(null)
    setVersions([])

    Promise.all([getClient(selectedClientId), getVersions(selectedClientId)])
      .then(([meta, vers]) => {
        setClientMeta(meta)
        setVersions(vers)
        const currentVersionValid = vers.some((v) => v['transition-id'] === selectedVersionId)
        if (!currentVersionValid && vers.length > 0) {
          // Select the latest (last) version
          setSelectedVersionId(vers[vers.length - 1]['transition-id'])
        }
      })
      .catch((err) => setError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId])

  useEffect(() => {
    if (selectedVersionId) {
      localStorage.setItem('arch_versionId', selectedVersionId)
    }
  }, [selectedVersionId])

  return (
    <ArchitectureContext.Provider
      value={{
        clients,
        clientsMetadata,
        selectedClientId,
        selectedVersionId,
        clientMeta,
        versions,
        loading,
        error,
        setClientId: setSelectedClientId,
        setVersionId: setSelectedVersionId,
      }}
    >
      {children}
    </ArchitectureContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useArchitecture() {
  const ctx = useContext(ArchitectureContext)
  if (!ctx) throw new Error('useArchitecture must be used within ArchitectureProvider')
  return ctx
}
