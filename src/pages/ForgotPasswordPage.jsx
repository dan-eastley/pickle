import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgetPassword } from '../lib/authClient'
import AuthCard, { Field } from '../components/auth/AuthCard'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import usePageTitle from '../hooks/usePageTitle'

// Request a password-reset link by email.
export default function ForgotPasswordPage() {
  usePageTitle('Reset password')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: err } = await forgetPassword({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSubmitting(false)
    // Always show success (don't reveal whether an account exists).
    if (err && err.status !== 200) setSent(true)
    else setSent(true)
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to set a new password."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:text-brand-900">
            Sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <p className="text-sm text-success-700 bg-success-50 border border-success-200 px-3 py-3">
          If an account exists for <span className="font-medium">{email}</span>, a reset link is on
          its way. Check your inbox.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && (
            <p className="text-sm text-error-700 bg-error-50 border border-error-200 px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" disabled={submitting} className="w-full">
            {submitting ? <Spinner size="sm" className="text-white" /> : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
