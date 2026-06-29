import { useState, useMemo } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { signUp } from '../lib/authClient'
import { useAuth } from '../context/AuthContext'
import AuthCard, { Field } from '../components/auth/AuthCard'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import usePageTitle from '../hooks/usePageTitle'
import rolesConfig from '../../config/roles.json'

// Group the role taxonomy by category for the <select> optgroups.
function useRoleGroups() {
  return useMemo(() => {
    const groups = {}
    for (const r of rolesConfig.roles ?? []) {
      ;(groups[r.category] ??= []).push(r)
    }
    return Object.entries(groups)
  }, [])
}

const label = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default function RegisterPage() {
  usePageTitle('Create account')
  const navigate = useNavigate()
  const { user } = useAuth()
  const roleGroups = useRoleGroups()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    jobRole: '',
  })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/clients" replace />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: err } = await signUp.email({
      email: form.email,
      password: form.password,
      name: `${form.firstName} ${form.lastName}`.trim(),
      firstName: form.firstName,
      lastName: form.lastName,
      jobRole: form.jobRole || undefined,
    })
    setSubmitting(false)
    if (err) {
      setError(err.message ?? 'Registration failed')
      return
    }
    // autoSignIn is on — land in the app.
    navigate('/clients', { replace: true })
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Register to access the Pickle architecture workspace."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:text-brand-900">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="First name"
            autoComplete="given-name"
            required
            value={form.firstName}
            onChange={set('firstName')}
          />
          <Field
            label="Last name"
            autoComplete="family-name"
            required
            value={form.lastName}
            onChange={set('lastName')}
          />
        </div>

        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={set('email')}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={form.password}
          onChange={set('password')}
        />
        <p className="-mt-2 text-xs text-gray-500">At least 8 characters.</p>

        <label className="block">
          <span className="block text-xs font-medium text-gray-500 mb-1">Role</span>
          <select
            value={form.jobRole}
            onChange={set('jobRole')}
            className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
          >
            <option value="">Select your role…</option>
            {roleGroups.map(([category, roles]) => (
              <optgroup key={category} label={label(category)}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        {error && (
          <p className="text-sm text-error-700 bg-error-50 border border-error-200 px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? <Spinner size="sm" className="text-white" /> : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
