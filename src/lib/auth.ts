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
import { toNodeHandler } from 'better-auth/node'
import { db } from '../db'
import { schema } from '../db/schema'

// The full role taxonomy lives in config/roles.json (outside this serverless
// root). The registration form constrains jobRole to that list; here we only
// sanity-check the shape so the function bundle stays self-contained.
function sanitiseJobRole(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim()
  return v && v.length <= 64 ? v : null
}

const trustedOrigins = [process.env.BETTER_AUTH_URL, 'http://localhost:3000'].filter(
  Boolean
) as string[]

export const auth = betterAuth({
  appName: 'Pickle',
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: {
    enabled: true,
    // No email provider wired up yet — don't block sign-in on verification.
    requireEmailVerification: false,
    autoSignIn: true,
    minPasswordLength: 8,
  },
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
        // Backstop: normalise jobRole to a clean string (or null) before insert.
        before: async (userData) => {
          const data = userData as typeof userData & { jobRole?: string | null }
          data.jobRole = sanitiseJobRole(data.jobRole)
          return { data }
        },
      },
    },
  },
})

// Node (req, res) handler used by the Vercel function and the dev-server shim.
export const authNodeHandler = toNodeHandler(auth)
