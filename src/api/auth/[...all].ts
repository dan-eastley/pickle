/**
 * Vercel serverless function: /api/auth/*
 *
 * Catch-all that hands every /api/auth request to Better Auth's Node handler
 * (sign-up, sign-in, sign-out, get-session, …). Body parsing is disabled so
 * Better Auth can read the raw request stream itself.
 */
import { authNodeHandler } from '../../lib/auth'

export const config = {
  api: { bodyParser: false },
}

export default authNodeHandler
