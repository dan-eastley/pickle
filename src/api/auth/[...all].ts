/**
 * Vercel serverless function: /api/auth/*
 *
 * Catch-all that hands every /api/auth request to Better Auth's Node handler
 * (sign-up, sign-in, sign-out, get-session, …). Body parsing is disabled so
 * Better Auth can read the raw request stream itself.
 *
 * The auth module is imported dynamically *inside* the handler so that any
 * load-time failure (a heavy dependency failing to initialise, a bad env, …)
 * is caught and returned as JSON, rather than crashing the function at module
 * load (FUNCTION_INVOCATION_FAILED) where it can't be diagnosed.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { getAuthNodeHandler, missingAuthEnv } = await import('../../lib/auth')
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
      res.status(500).json({
        error: 'Authentication error',
        detail: e?.message ?? String(err),
        // Temporary: first frames of the stack to diagnose the load failure.
        stack: (e?.stack ?? '').split('\n').slice(0, 5),
      })
    }
  }
}
