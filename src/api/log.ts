/**
 * Vercel serverless function: /api/log
 *
 * A sink for client-side errors. The browser (error boundary + global
 * error/unhandledrejection handlers) POSTs an error here, and it is written to
 * stdout/stderr as a single structured JSON line tagged `[client-error]`, so it
 * lands in Vercel's Runtime Logs where it can be tailed via the Vercel CLI/API
 * (see tools/logs.mjs). This turns "a user hit an error" into a query.
 *
 * Open (errors happen for anonymous users too), but every field is length-capped
 * and the whole record is size-bounded so it can't be used to flood the logs.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

const MAX = { message: 1000, stack: 8000, url: 1000, ua: 500, field: 500 }
const cap = (v: unknown, n: number): string | undefined =>
  typeof v === 'string' && v ? v.slice(0, n) : undefined

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Same-origin only (this is the SPA reporting its own errors). CORS is a
  // browser control; there's no sensitive data here, just don't invite abuse.
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = (req.body ?? {}) as Record<string, unknown>
    const ctx = (body.context ?? {}) as Record<string, unknown>

    const record = {
      level: body.level === 'warn' ? 'warn' : 'error',
      message: cap(body.message, MAX.message) ?? '(no message)',
      stack: cap(body.stack, MAX.stack),
      componentStack: cap(body.componentStack, MAX.stack),
      route: cap(ctx.route, MAX.url),
      version: cap(ctx.version, MAX.field),
      userId: cap(ctx.userId, MAX.field),
      kind: cap(ctx.kind, MAX.field), // 'boundary' | 'window' | 'unhandledrejection'
      ua: cap(req.headers['user-agent'], MAX.ua),
      referer: cap(req.headers['referer'], MAX.url),
      at: new Date().toISOString(),
    }

    // One structured line → Vercel Runtime Logs. Prefixed so it's greppable.
    const line = `[client-error] ${JSON.stringify(record)}`
    if (record.level === 'warn') console.warn(line)
    else console.error(line)

    return res.status(204).end()
  } catch {
    // Never let the logging endpoint itself throw a visible error.
    return res.status(204).end()
  }
}
