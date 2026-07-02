import { useState, useEffect } from 'react'
import { getMembers, githubAction } from '../../lib/api'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'

const ROLES = [
  { value: 'owner', label: 'Owner', hint: 'Edit content + settings, manage transitions and access' },
  { value: 'contributor', label: 'Contributor', hint: 'Create decisions, discoveries and scouts' },
  { value: 'consumer', label: 'Consumer', hint: 'View only' },
]
const roleLabel = (r) => ROLES.find((o) => o.value === r)?.label ?? r

// Manage who can access an architecture and in what role ([RAS-3]). Grants apply
// immediately (independent of the Name/Status save). Rendered inside the
// architecture settings modal, only for callers who can grant access.
export default function AccessManager({ architectureId }) {
  const [members, setMembers] = useState(null) // null = loading
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('contributor')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let live = true
    getMembers(architectureId)
      .then((m) => live && setMembers(m))
      .catch((e) => live && (setError(e.message), setMembers([])))
    return () => {
      live = false
    }
  }, [architectureId])

  const grant = async () => {
    if (!email.trim()) return
    setBusy(true)
    setError(null)
    try {
      const { member } = await githubAction({
        action: 'grant-access',
        architectureId,
        email: email.trim(),
        role,
      })
      setMembers((prev) => {
        const rest = (prev ?? []).filter((m) => m.userId !== member.userId)
        return [...rest, member]
      })
      setEmail('')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const revoke = async (m) => {
    setBusy(true)
    setError(null)
    try {
      await githubAction({ action: 'revoke-access', architectureId, userId: m.userId })
      setMembers((prev) => (prev ?? []).filter((x) => x.userId !== m.userId))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Add-by-email */}
      <div className="flex flex-wrap items-end gap-2">
        <label className="block flex-1 min-w-[12rem]">
          <span className="block text-xs font-medium text-gray-500 mb-1">Add by email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="person@org.com"
            className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-gray-500 mb-1">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
          >
            {ROLES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <Button onClick={grant} disabled={busy || !email.trim()} size="sm">
          Add
        </Button>
      </div>
      <p className="text-xs text-gray-400">{ROLES.find((o) => o.value === role)?.hint}</p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
      )}

      {/* Members */}
      {members === null ? (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Spinner size="sm" /> Loading members…
        </div>
      ) : members.length === 0 ? (
        <p className="text-sm text-gray-500">
          No members yet — only admins can access this architecture.
        </p>
      ) : (
        <ul className="border border-gray-200 divide-y divide-gray-100">
          {members.map((m) => (
            <li key={m.userId} className="flex items-center justify-between gap-3 px-3 py-2">
              <div className="min-w-0">
                <span className="text-sm text-gray-900 truncate">{m.email}</span>
                {m.name && <span className="ml-2 text-xs text-gray-400">{m.name}</span>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600">
                  {roleLabel(m.role)}
                </span>
                <button
                  onClick={() => revoke(m)}
                  disabled={busy}
                  className="text-xs text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
