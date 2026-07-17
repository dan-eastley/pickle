import { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { emailOtp } from '../lib/authClient'
import { useAuth } from '../context/AuthContext'
import AuthCard, { Field } from '../components/auth/AuthCard'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import usePageTitle from '../hooks/usePageTitle'

// Enter the 6-digit code emailed on sign-up / at sign-in to verify the address.
export default function VerifyEmailPage() {
  usePageTitle('Verify your email')
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const params = new URLSearchParams(location.search)
  const email = location.state?.email ?? params.get('email') ?? ''

  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [resent, setResent] = useState(false)

  // No email in context → nothing to verify; send them to sign in.
  useEffect(() => {
    if (!email) navigate('/login', { replace: true })
  }, [email, navigate])

  if (user) return <Navigate to="/architectures" replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: err } = await emailOtp.verifyEmail({ email, otp: code.trim() })
    setSubmitting(false)
    if (err) {
      setError(err.message ?? 'That code was not valid. Please try again.')
      return
    }
    // Verified — a session is established; land in the app.
    navigate('/architectures', { replace: true })
  }

  const resend = async () => {
    setError(null)
    setResent(false)
    const { error: err } = await emailOtp.sendVerificationOtp({ email, type: 'email-verification' })
    if (err) setError(err.message ?? 'Could not resend the code.')
    else setResent(true)
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle={`Enter the 6-digit code we sent to ${email}.`}
      footer={
        <>
          Wrong address?{' '}
          <Link to="/register" className="font-medium text-brand-700 hover:text-brand-900">
            Start over
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="6-digit code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className="tracking-[0.4em] text-center font-mono text-lg"
        />

        {error && (
          <p className="text-sm text-error-700 bg-error-50 border border-error-200 px-3 py-2">
            {error}
          </p>
        )}
        {resent && !error && (
          <p className="text-sm text-success-700 bg-success-50 border border-success-200 px-3 py-2">
            A new code is on its way.
          </p>
        )}

        <Button type="submit" size="lg" disabled={submitting || code.length < 6} className="w-full">
          {submitting ? <Spinner size="sm" className="text-white" /> : 'Verify email'}
        </Button>
        <button
          type="button"
          onClick={resend}
          className="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Didn't get it? Resend code
        </button>
      </form>
    </AuthCard>
  )
}
