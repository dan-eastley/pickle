import { useState } from 'react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { signIn, emailOtp, twoFactor } from '../lib/authClient'
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
  const dest = location.state?.from ?? '/architectures'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('password') // 'password' | 'code'
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Already signed in → bounce to the intended destination.
  if (user) return <Navigate to={dest} replace />

  // Step 1 — password. Three outcomes:
  //  • twoFactorRedirect → the user is enrolled in 2FA: send a code, ask for it.
  //  • success → not yet enrolled (existing user): enrol them now so every
  //    future login requires a code, and let this login through.
  //  • error → surface it (unverified email routes to verification).
  const onSubmitPassword = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { data, error: err } = await signIn.email({ email, password })

    if (err) {
      setSubmitting(false)
      const unverified =
        err.status === 403 || /verif/i.test(err.message ?? '') || err.code === 'EMAIL_NOT_VERIFIED'
      if (unverified) {
        emailOtp.sendVerificationOtp({ email, type: 'email-verification' }).catch(() => {})
        navigate('/verify-email', { state: { email } })
        return
      }
      setError(err.message ?? 'Sign in failed')
      return
    }

    if (data?.twoFactorRedirect) {
      // Enrolled → a code was requested; move to the code step.
      await twoFactor.sendOtp().catch(() => {})
      setSubmitting(false)
      setStep('code')
      return
    }

    // Signed in without 2FA → enrol on this login (best-effort) so it's required
    // next time, then continue.
    await twoFactor.enable({ password }).catch(() => {})
    setSubmitting(false)
    navigate(dest, { replace: true })
  }

  // Step 2 — verify the emailed 6-digit code.
  const onSubmitCode = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: err } = await twoFactor.verifyOtp({ code: code.trim() })
    setSubmitting(false)
    if (err) {
      setError(err.message ?? 'That code was not accepted. Request a new one and try again.')
      return
    }
    navigate(dest, { replace: true })
  }

  const resendCode = () => {
    setError(null)
    twoFactor.sendOtp().catch(() => {})
  }

  if (step === 'code') {
    return (
      <AuthCard
        title="Enter your code"
        subtitle={`We emailed a 6-digit code to ${email}. Enter it to finish signing in.`}
      >
        <form onSubmit={onSubmitCode} className="space-y-4">
          <Field
            label="6-digit code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />

          {error && (
            <p className="text-sm text-error-700 bg-error-50 border border-error-200 px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={submitting || code.length < 6}
            className="w-full"
          >
            {submitting ? <Spinner size="sm" className="text-white" /> : 'Verify and sign in'}
          </Button>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={resendCode}
              className="text-brand-700 hover:text-brand-900"
            >
              Resend code
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('password')
                setCode('')
                setError(null)
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Use a different account
            </button>
          </div>
        </form>
      </AuthCard>
    )
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
      <form onSubmit={onSubmitPassword} className="space-y-4">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-1 text-right">
            <Link to="/forgot-password" className="text-xs text-brand-700 hover:text-brand-900">
              Forgot password?
            </Link>
          </div>
        </div>

        {location.state?.reset && !error && (
          <p className="text-sm text-success-700 bg-success-50 border border-success-200 px-3 py-2">
            Your password has been reset. Sign in with your new password.
          </p>
        )}

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
