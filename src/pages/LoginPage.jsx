import { useState } from 'react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { signIn } from '../lib/authClient'
import { useAuth } from '../context/AuthContext'
import AuthCard, { Field } from '../components/auth/AuthCard'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { LockIcon } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

export default function LoginPage() {
  usePageTitle('Sign in')
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const dest = location.state?.from ?? '/clients'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Already signed in → bounce to the intended destination.
  if (user) return <Navigate to={dest} replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: err } = await signIn.email({ email, password })
    setSubmitting(false)
    if (err) {
      setError(err.message ?? 'Sign in failed')
      return
    }
    navigate(dest, { replace: true })
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back. Sign in to your Pickle workspace."
      footer={
        <>
          No account?{' '}
          <Link to="/register" className="font-medium text-brand-700 hover:text-brand-900">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

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
              Sign in
            </>
          )}
        </Button>
      </form>
    </AuthCard>
  )
}
