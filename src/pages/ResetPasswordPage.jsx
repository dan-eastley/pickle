import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../lib/authClient'
import AuthCard, { Field } from '../components/auth/AuthCard'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import usePageTitle from '../hooks/usePageTitle'

// Set a new password using the token from the reset-link URL.
export default function ResetPasswordPage() {
  usePageTitle('Set a new password')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Better Auth appends ?error=INVALID_TOKEN when the link is bad/expired.
  const linkError = params.get('error')
  if (!token || linkError) {
    return (
      <AuthCard title="Link expired" subtitle="This reset link is invalid or has expired.">
        <Link
          to="/forgot-password"
          className="block w-full text-center bg-brand-700 text-white text-sm font-medium px-4 py-2.5 hover:bg-brand-800"
        >
          Request a new link
        </Link>
      </AuthCard>
    )
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    const { error: err } = await resetPassword({ newPassword: password, token })
    setSubmitting(false)
    if (err) {
      setError(err.message ?? 'Could not reset your password.')
      return
    }
    navigate('/login', { replace: true, state: { reset: true } })
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a new password for your Pickle account."
      footer={
        <Link to="/login" className="font-medium text-brand-700 hover:text-brand-900">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error && (
          <p className="text-sm text-error-700 bg-error-50 border border-error-200 px-3 py-2">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? <Spinner size="sm" className="text-white" /> : 'Set new password'}
        </Button>
      </form>
    </AuthCard>
  )
}
