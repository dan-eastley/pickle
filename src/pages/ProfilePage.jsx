import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authClient } from '../lib/authClient'
import rolesConfig from '../../config/roles.json'
import Button from '../components/ui/Button'
import usePageTitle from '../hooks/usePageTitle'

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

// Edit your own profile ([UIE-6]): name + job role, and change password.
// (Password reset for a forgotten password needs an email provider — backlogged.)
export default function ProfilePage() {
  const { user } = useAuth()
  usePageTitle('Account settings')

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

  return (
    <div className="max-w-2xl mx-auto px-6 pt-8 pb-16 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Account settings</h1>
        <p className="mt-1 text-sm text-gray-500">{user.email}</p>
      </div>

      {/* Personal details */}
      <form onSubmit={saveProfile} className="bg-white border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Personal details</h2>
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
          <select value={jobRole} onChange={(e) => setJobRole(e.target.value)} className={inputCls}>
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

      {/* Change password */}
      <form onSubmit={changePassword} className="bg-white border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Change password</h2>
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
          <Button type="submit" size="sm" disabled={savingPw || !currentPassword || !newPassword}>
            {savingPw ? 'Changing…' : 'Change password'}
          </Button>
        </div>
      </form>
    </div>
  )
}
