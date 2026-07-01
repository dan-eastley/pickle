import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { buildContext, can as canDo } from '../lib/permissions'

// Client mirror of the server's authorization ([RAS-3]). Fetches the caller's
// rights (`/api/github?action=permissions`) once per session and exposes a
// `can(action, scope)` used to hide/disable controls. The server remains the
// gate of record — this is only for UI. Fail-soft: on error, deny (server
// still enforces, so worst case is a hidden control the API would allow).
const PermissionsContext = createContext(null)

const EMPTY = { authenticated: false, isAdmin: false, memberships: {} }

export function PermissionsProvider({ children }) {
  const { user } = useAuth()
  const [state, setState] = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let live = true
    setLoading(true)
    fetch('/api/github?action=permissions')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!live) return
        setState(
          data
            ? {
                authenticated: !!data.authenticated,
                isAdmin: !!data.isAdmin,
                memberships: data.memberships ?? {},
              }
            : EMPTY
        )
      })
      .catch(() => live && setState(EMPTY))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [user?.id])

  const can = useCallback((action, scope) => canDo(buildContext(state), action, scope), [state])

  return (
    <PermissionsContext.Provider
      value={{ can, isAdmin: state.isAdmin, authenticated: state.authenticated, loading }}
    >
      {children}
    </PermissionsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePermissions() {
  return (
    useContext(PermissionsContext) ?? {
      can: () => false,
      isAdmin: false,
      authenticated: false,
      loading: true,
    }
  )
}
