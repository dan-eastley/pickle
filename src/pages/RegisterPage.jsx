import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { signUp } from '../lib/authClient'
import { useAuth } from '../context/AuthContext'
import AuthCard, { Field } from '../components/auth/AuthCard'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { LockIcon } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

export default function RegisterPage() {
  usePageTitle('Create account')
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
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
    })
    setSubmitting(false)
    if (err) {
      setError(err.message ?? 'Registration failed')
      return
    }
    // autoSignIn is on, so land in the app.
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

        {error && (
          <p className="text-sm text-error-700 bg-error-50 border border-error-200 px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? (
            <Spinner size="sm" className="text-white" />
          ) : (
            <>
              <LockIcon className="w-4 h-4" />
              Create account
            </>
          )}
        </Button>
      </form>
    </AuthCard>
  )
}
