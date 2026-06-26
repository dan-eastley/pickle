/**
 * Vercel serverless function: /api/auth/*
 *
 * Catch-all that hands every /api/auth request to Better Auth's Node handler
 * (sign-up, sign-in, sign-out, get-session, …). Body parsing is disabled so
 * Better Auth can read the raw request stream itself.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authNodeHandler } from '../../lib/auth'
import { isDbConfigured } from '../../db'

export const config = {
  api: { bodyParser: false },
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Fail fast and clearly when the database isn't configured yet, rather than
  // letting pg attempt a default/localhost connection on every session check.
  if (!isDbConfigured) {
    res.status(503).json({ error: 'Authentication is not configured (DATABASE_URL is unset)' })
    return
  }
  return authNodeHandler(req, res)
}
