/**
 * Vercel serverless function: /api/auth/*
 *
 * Catch-all that hands every /api/auth request to Better Auth's Node handler
 * (sign-up, sign-in, sign-out, get-session, …). Body parsing is disabled so
 * Better Auth can read the raw request stream itself.
 *
 * The auth module is imported dynamically (with an explicit .js extension, as
 * the deployed function runs as native ESM) inside a try/catch, so a missing
 * env or any load/runtime failure returns clean JSON instead of crashing the
 * function at module load (FUNCTION_INVOCATION_FAILED).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { getAuthNodeHandler, missingAuthEnv } = await import('../../lib/auth.js')
    const missing = missingAuthEnv()
    if (missing.length > 0) {
      res.status(503).json({ error: 'Authentication is not configured', missing })
      return
    }
    return await getAuthNodeHandler()(req, res)
  } catch (err) {
    const e = err as Error
    console.error('[/api/auth]', e?.stack || e?.message)
    if (!res.headersSent) {
      // Logs carry the full error; don't leak internals to clients in prod.
      const detail = process.env.VERCEL_ENV === 'production' ? undefined : e?.message
      res.status(500).json({ error: 'Authentication error', ...(detail ? { detail } : {}) })
    }
  }
}
