import { createContext, useContext, useState, useEffect } from 'react'
import { getClients, getClient, getVersions, isAuthError } from '../lib/api'
import { useAuth } from './AuthContext'

const ArchitectureContext = createContext(null)

// localStorage keys for the persisted client/version selection.
const CLIENT_ID_KEY = 'arch_clientId'
const VERSION_ID_KEY = 'arch_versionId'

export function ArchitectureProvider({ children }) {
  const { user, isLoading: authLoading } = useAuth()
  const [clients, setClients] = useState([])
  const [clientsMetadata, setClientsMetadata] = useState({})
  const [selectedClientId, setSelectedClientId] = useState(
    () => localStorage.getItem(CLIENT_ID_KEY) || null
  )
  const [selectedVersionId, setSelectedVersionId] = useState(
    () => localStorage.getItem(VERSION_ID_KEY) || null
  )
  const [clientMeta, setClientMeta] = useState(null)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Architecture content is session-gated server-side, so the list loads (and
  // reloads) once the auth state is known, and again when it changes — sign-in
  // picks the data up, sign-out drops it. A 401/403 is the expected anonymous
  // outcome, not an error.
  useEffect(() => {
    if (authLoading) return
    let live = true
    getClients()
      .then((list) => {
        if (!live) return
        setClients(list)
        setError(null)
        if (list.length > 0) {
          setSelectedClientId((current) => current ?? list[0]['architecture-id'])
        }
        Promise.all(
          list.map((c) =>
            getClient(c['architecture-id']).then((meta) => [c['architecture-id'], meta])
          )
        ).then((entries) => {
          if (live) setClientsMetadata(Object.fromEntries(entries.filter(([, m]) => m)))
        })
      })
      .catch((err) => {
        if (!live) return
        if (isAuthError(err)) {
          setClients([])
          setClientsMetadata({})
        } else {
          setError(err.message)
        }
      })
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [authLoading, user?.id])

  useEffect(() => {
    if (!selectedClientId || authLoading) return
    let live = true
    localStorage.setItem(CLIENT_ID_KEY, selectedClientId)
    setClientMeta(null)
    setVersions([])

    Promise.all([getClient(selectedClientId), getVersions(selectedClientId)])
      .then(([meta, vers]) => {
        if (!live) return
        setClientMeta(meta)
        setVersions(vers)
        const currentVersionValid = vers.some((v) => v['transition-id'] === selectedVersionId)
        if (!currentVersionValid && vers.length > 0) {
          // Select the latest (last) version
          setSelectedVersionId(vers[vers.length - 1]['transition-id'])
        }
      })
      .catch((err) => {
        // Anonymous visitors can hold a persisted selection they can no longer
        // read — that's expected, not an app-level failure.
        if (live && !isAuthError(err)) setError(err.message)
      })
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId, authLoading, user?.id])

  useEffect(() => {
    if (selectedVersionId) {
      localStorage.setItem(VERSION_ID_KEY, selectedVersionId)
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
