import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../context/AuthContext'
import { authClient } from '../../lib/authClient'
import rolesConfig from '../../../config/roles.json'
import Button from '../ui/Button'
import useEscapeKey from '../../hooks/useEscapeKey'
import useFocusTrap from '../../hooks/useFocusTrap'
import { CloseIcon } from '../ui/icons'

// Grouped roles for the job-role select.
const ROLE_GROUPS = Object.entries(
  (rolesConfig.roles ?? []).reduce((acc, r) => {
    ;(acc[r.category] ?? (acc[r.category] = [])).push(r)
    return acc
  }, {})
)

const inputCls =
  'w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

function Status({ msg }) {
  if (!msg) return null
  const ok = msg.type === 'ok'
  return (
    <p
      className={`text-sm px-3 py-2 ${ok ? 'bg-success-50 text-success-700 border border-success-200' : 'bg-red-50 text-red-600 border border-red-200'}`}
    >
      {msg.text}
    </p>
  )
}

// Account settings in a modal (matching the edit-architecture / edit-transition
// modals). Edit personal details (Better Auth updateUser) and change password
// (Better Auth changePassword, current password required). Password reset for a
// forgotten password lives on the sign-in flow.
export default function AccountSettingsModal({ onClose }) {
  const { user } = useAuth()
  const trapRef = useFocusTrap()
  useEscapeKey(onClose)

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [jobRole, setJobRole] = useState(user?.jobRole ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)

  if (!user) return null

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg(null)
    const { error } = await authClient.updateUser({
      firstName,
      lastName,
      jobRole: jobRole || undefined,
      name: `${firstName} ${lastName}`.trim() || user.name,
    })
    setSavingProfile(false)
    setProfileMsg(
      error ? { type: 'error', text: error.message } : { type: 'ok', text: 'Profile updated.' }
    )
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' })
      return
    }
    setSavingPw(true)
    setPwMsg(null)
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    })
    setSavingPw(false)
    if (error) {
      setPwMsg({ type: 'error', text: error.message })
    } else {
      setPwMsg({ type: 'ok', text: 'Password changed. Other sessions were signed out.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
    }
  }

  return createPortal(
    <>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div className="fixed inset-0 bg-gray-900/55 z-[150]" onClick={onClose} />
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
        <div
          ref={trapRef}
          role="dialog"
          aria-modal="true"
          aria-label="Account settings"
          className="bg-white w-full max-w-lg flex flex-col shadow-xl max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-5 py-4 bg-brand-50 flex-shrink-0">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900">Account settings</h2>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-700 flex-shrink-0"
              aria-label="Close"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-5 space-y-6">
            <form onSubmit={saveProfile} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Personal details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className={labelCls}>First name</span>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Last name</span>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputCls}
                  />
                </label>
              </div>
              <label className="block">
                <span className={labelCls}>Job role</span>
                <select
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className={inputCls}
                >
                  <option value="">— None —</option>
                  {ROLE_GROUPS.map(([category, roles]) => (
                    <optgroup key={category} label={category}>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <Status msg={profileMsg} />
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={savingProfile}>
                  {savingProfile ? 'Saving…' : 'Save details'}
                </Button>
              </div>
            </form>

            <div className="border-t border-gray-100" />

            <form onSubmit={changePassword} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Change password</h3>
              <label className="block">
                <span className={labelCls}>Current password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputCls}
                />
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className={labelCls}>New password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Confirm new password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputCls}
                  />
                </label>
              </div>
              <Status msg={pwMsg} />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={savingPw || !currentPassword || !newPassword}
                >
                  {savingPw ? 'Changing…' : 'Change password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
