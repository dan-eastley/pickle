/**
 * Better Auth browser client.
 *
 * Talks to the same-origin /api/auth/* endpoints (the default base path), so no
 * baseURL is needed. `inferAdditionalFields` teaches the client about the extra
 * user fields so they're typed on the session and accepted by signUp.
 */
import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields, emailOTPClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        jobRole: { type: 'string', required: false },
        accessTier: { type: 'string' },
      },
    }),
    emailOTPClient(),
  ],
})

export const { signIn, signUp, signOut, useSession, getSession, emailOtp, forgetPassword, resetPassword } =
  authClient
