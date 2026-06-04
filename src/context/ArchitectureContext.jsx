import { createContext, useContext, useState, useEffect } from 'react'
import { getClients, getClient, getVersions } from '../lib/api'

const ArchitectureContext = createContext(null)

export function ArchitectureProvider({ children }) {
  const [clients, setClients] = useState([])
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
      .then(list => {
        setClients(list)
        if (!selectedClientId && list.length > 0) {
          setSelectedClientId(list[0]['client-id'])
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
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
        const currentVersionValid = vers.some(v => v['version-id'] === selectedVersionId)
        if (!currentVersionValid && vers.length > 0) {
          // Select the latest (last) version
          setSelectedVersionId(vers[vers.length - 1]['version-id'])
        }
      })
      .catch(err => setError(err.message))
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

export function useArchitecture() {
  const ctx = useContext(ArchitectureContext)
  if (!ctx) throw new Error('useArchitecture must be used within ArchitectureProvider')
  return ctx
}
