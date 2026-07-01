import { createContext, useContext } from 'react'
import { useSession, signOut as clientSignOut } from '../lib/authClient'

// Single source of truth for the signed-in user across the app. Wraps Better
// Auth's reactive useSession so components read a stable { user, isLoading }.
const AuthContext = createContext({ user: null, session: null, isLoading: true, signOut: () => {} })

export function AuthProvider({ children }) {
  const { data, isPending } = useSession()

  const value = {
    user: data?.user ?? null,
    session: data?.session ?? null,
    isLoading: isPending,
    signOut: () => clientSignOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
