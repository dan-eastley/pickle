import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useClickOutside from '../../hooks/useClickOutside'
import rolesConfig from '../../../config/roles.json'

const ROLE_NAME = Object.fromEntries((rolesConfig.roles ?? []).map((r) => [r.id, r.name]))

// Header auth control: signed-out shows Sign in / Register; signed-in shows an
// initials avatar with a dropdown (name, email, role, sign out).
export default function UserMenu() {
  const { user, isLoading, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useClickOutside(ref, () => setOpen(false))

  if (isLoading) return <div className="w-8 h-8" aria-hidden />

  if (!user) {
    return (
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Link
          to="/login"
          className="text-sm font-medium px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          Sign in
        </Link>
        <Link
          to="/register"
          className="text-sm font-medium px-3 py-1.5 text-white bg-brand-600 hover:bg-brand-700 transition-colors"
        >
          Register
        </Link>
      </div>
    )
  }

  const initials =
    `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() ||
    (user.email?.[0] ?? '?').toUpperCase()

  const onSignOut = async () => {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center justify-center transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
        title={user.name}
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-60 bg-white border border-gray-200 shadow-lg z-50"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            {user.jobRole && (
              <p className="mt-1 text-xs text-gray-500">
                {ROLE_NAME[user.jobRole] ?? user.jobRole}
              </p>
            )}
          </div>
          <button
            role="menuitem"
            onClick={onSignOut}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
