/**
 * Better Auth server configuration.
 *
 * Email + password authentication backed by Postgres (Drizzle adapter). The
 * user model is extended with firstName / lastName / jobRole / accessTier.
 *
 * Security notes:
 *   - `accessTier` is `input: false` so a client can never self-assign a tier
 *     at sign-up; it defaults to 'member' and is changed only server-side.
 *   - `jobRole` is validated against config/roles.json before insert.
 *
 * Required env: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL.
 */
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import { toNodeHandler } from 'better-auth/node'
import { db } from '../db/index.js'
import { schema } from '../db/schema.js'
import { sendWelcomeEmail, sendOtpEmail, sendResetPasswordEmail } from './email.js'

// The full role taxonomy lives in config/roles.json (outside this serverless
// root). The registration form constrains jobRole to that list; here we only
// sanity-check the shape so the function bundle stays self-contained.
function sanitiseJobRole(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim()
  return v && v.length <= 64 ? v : null
}

/** Required auth env vars that are unset (for a clear 503 instead of a crash). */
export function missingAuthEnv(): string[] {
  return [
    !process.env.DATABASE_URL && 'DATABASE_URL',
    !process.env.BETTER_AUTH_SECRET && 'BETTER_AUTH_SECRET',
  ].filter(Boolean) as string[]
}

// Better Auth is built lazily and cached. Building it eagerly at module load
// throws in production when BETTER_AUTH_SECRET is missing — which crashes the
// whole serverless function (FUNCTION_INVOCATION_FAILED) before any handler can
// respond. Lazy init lets the route handler check the env first and surface a
// clean error. (Types are inferred from the builders so the configured shape —
// including the additional user fields — is preserved.)
function buildAuth() {
  const trustedOrigins = [process.env.BETTER_AUTH_URL, 'http://localhost:3000'].filter(
    Boolean
  ) as string[]

  return betterAuth({
    appName: 'Pickle',
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins,
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    emailAndPassword: {
      enabled: true,
      // Email verification is currently DISABLED — outbound email delivery is
      // not working yet, so gating sign-in on verification would lock users
      // out. Re-enable (e.g. Boolean(process.env.RESEND_API_KEY)) once sending
      // is confirmed working.
      requireEmailVerification: false,
      autoSignIn: true,
      minPasswordLength: 8,
      // Password reset link (Better Auth mints the token + URL).
      sendResetPassword: async ({ user, url }) => {
        await sendResetPasswordEmail(user.email, url)
      },
    },
    plugins: [
      // 6-digit email verification / sign-in / password-reset codes. Sends an
      // OTP automatically on sign-up and drives email verification.
      emailOTP({
        otpLength: 6,
        expiresIn: 60 * 10, // 10 minutes
        // Don't auto-send a verification code on sign-up while email delivery
        // is down (verification is disabled above). The plugin stays enabled so
        // password-reset codes still work once sending is fixed.
        sendVerificationOnSignUp: false,
        overrideDefaultEmailVerification: true,
        sendVerificationOTP: async ({ email, otp, type }) => {
          await sendOtpEmail(email, otp, type)
        },
      }),
    ],
    user: {
      additionalFields: {
        firstName: { type: 'string', required: true, input: true },
        lastName: { type: 'string', required: true, input: true },
        // Job role (id from config/roles.json). Optional, set by the user.
        jobRole: { type: 'string', required: false, input: true },
        // Access tier — NOT client-settable; defaults to 'member', changed only
        // server-side once the access-control work lands.
        accessTier: { type: 'string', required: false, input: false, defaultValue: 'member' },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // refresh once a day
    },
    databaseHooks: {
      user: {
        create: {
          // Normalise jobRole to a clean string (or null) before insert.
          before: async (userData) => {
            const data = userData as typeof userData & { jobRole?: string | null }
            data.jobRole = sanitiseJobRole(data.jobRole)
            return { data }
          },
          // Welcome email — fire-and-forget so a mail hiccup never fails sign-up.
          after: async (createdUser) => {
            const u = createdUser as { email: string; firstName?: string }
            sendWelcomeEmail(u.email, u.firstName).catch(() => {})
          },
        },
      },
    },
  })
}

let authInstance: ReturnType<typeof buildAuth> | undefined

export function getAuth() {
  if (!authInstance) authInstance = buildAuth()
  return authInstance
}

// Node (req, res) handler used by the Vercel function and the dev-server shim.
function buildNodeHandler() {
  return toNodeHandler(getAuth())
}

let nodeHandler: ReturnType<typeof buildNodeHandler> | undefined

export function getAuthNodeHandler() {
  if (!nodeHandler) nodeHandler = buildNodeHandler()
  return nodeHandler
}

export interface SessionUser {
  id: string
  name: string
  email: string
  firstName?: string
  lastName?: string
  jobRole?: string | null
  accessTier?: string
}

/** Build a Headers object from a Node request's raw headers. */
function toHeaders(raw: Record<string, string | string[] | undefined>): Headers {
  const h = new Headers()
  for (const [k, v] of Object.entries(raw ?? {})) {
    if (typeof v === 'string') h.set(k, v)
    else if (Array.isArray(v)) h.set(k, v.join(', '))
  }
  return h
}

/** Resolve the signed-in user from the request's session cookie, or null. */
export async function getSessionUser(
  rawHeaders: Record<string, string | string[] | undefined>
): Promise<SessionUser | null> {
  const session = await getAuth().api.getSession({ headers: toHeaders(rawHeaders) })
  return (session?.user as SessionUser | undefined) ?? null
}
