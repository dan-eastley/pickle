/**
 * Vercel serverless function: /api/auth/*
 *
 * Catch-all that hands every /api/auth request to Better Auth's Node handler
 * (sign-up, sign-in, sign-out, get-session, …). Body parsing is disabled so
 * Better Auth can read the raw request stream itself.
 *
 * Env is checked first so a missing DATABASE_URL / BETTER_AUTH_SECRET returns a
 * clear 503 instead of crashing the function, and Better Auth init / runtime
 * errors are caught and returned as JSON rather than FUNCTION_INVOCATION_FAILED.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAuthNodeHandler, missingAuthEnv } from '../../lib/auth'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const missing = missingAuthEnv()
  if (missing.length > 0) {
    res.status(503).json({ error: 'Authentication is not configured', missing })
    return
  }
  try {
    return await getAuthNodeHandler()(req, res)
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[/api/auth]', detail)
    // If Better Auth already started the response, don't try to write again.
    if (!res.headersSent) res.status(500).json({ error: 'Authentication error', detail })
  }
}
