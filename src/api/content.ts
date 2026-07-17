/**
 * Vercel serverless function: /api/content
 *
 * Serves architecture data, schemas, and docs by reading directly from the
 * GitHub repository on every request — no deployment required when data changes.
 *
 * Routed via vercel.json rewrites:
 *   /api/arch/**     → /api/content?prefix=architectures&path=...
 *   /api/schemas/**  → /api/content?prefix=config/schemas&path=...
 *   /api/docs/**     → /api/content?prefix=docs&path=...
 *
 * Read-only. Docs and schemas are public content; architecture data
 * (prefix=architectures) is tenant data and requires a session — and is never
 * shared-cached, so an authenticated response can't be served from the CDN to
 * an anonymous caller. Required env: GITHUB_TOKEN/OWNER/REPO.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  GitHubClient,
  HttpError,
  b64decode,
  getGitHubConfig,
  type GhContentFile,
} from '../lib/github.js'
import { getSessionUser, missingAuthEnv } from '../lib/auth.js'

// `prefix` is set by the vercel.json rewrites, but the function is also directly
// reachable, so it (and `path`) must be validated: only the three known content
// roots are served, and no path may traverse out of them.
const ALLOWED_PREFIXES = new Set(['architectures', 'config/schemas', 'docs'])

const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prefix = first(req.query.prefix)
  const filePath = first(req.query.path)
  const ref = first(req.query.ref) ?? 'main'
  const nocache = req.query.nocache != null

  if (!prefix || !filePath) {
    return res.status(400).json({ error: 'Missing prefix or path' })
  }
  if (!ALLOWED_PREFIXES.has(prefix)) {
    return res.status(400).json({ error: 'Invalid prefix' })
  }
  if (filePath.startsWith('/') || /(^|\/)\.\.(\/|$)/.test(filePath)) {
    return res.status(400).json({ error: 'Invalid path' })
  }

  // Architecture data is tenant content — session-gated. Fail-closed on
  // deployments when auth isn't configured; permissive only in local dev
  // (mirrors /api/github). Docs and schemas remain public.
  const isTenantData = prefix === 'architectures'
  if (isTenantData) {
    if (missingAuthEnv().length > 0) {
      if (process.env.VERCEL) {
        console.warn('[/api/content] denied: auth not configured on deployment')
        return res.status(503).json({ error: 'Authentication is not configured' })
      }
    } else {
      const user = await getSessionUser(
        req.headers as Record<string, string | string[] | undefined>
      )
      if (!user) {
        console.warn(`[/api/content] denied path=${prefix}/${filePath} authenticated=false`)
        return res.status(401).json({ error: 'Authentication required' })
      }
    }
  }

  const cfg = getGitHubConfig()
  if (!cfg) return res.status(503).json({ error: 'GitHub not configured' })
  const client = new GitHubClient(cfg)

  try {
    const data = await client.getContents(`${prefix}/${filePath}`, ref)

    // Directory → return entries list (same shape as the original middleware).
    if (Array.isArray(data)) {
      res.setHeader('Cache-Control', 'no-store')
      return res.json({ entries: data.map((f) => ({ name: f.name, isDir: f.type === 'dir' })) })
    }

    // File → decode base64 content.
    const file = data as GhContentFile
    const content = b64decode(file.content ?? '')
    const isMarkdown = filePath.endsWith('.md')
    res.setHeader('Content-Type', isMarkdown ? 'text/markdown; charset=utf-8' : 'application/json')
    // Session-gated tenant data must never enter the shared (CDN) cache — a
    // cached authenticated response would be served to anonymous callers.
    // Public docs/schemas keep the short CDN cache; nocache=1 means the client
    // just wrote this resource — skip caching entirely.
    const cache = nocache
      ? 'no-store'
      : isTenantData
        ? 'private, max-age=0, must-revalidate'
        : 's-maxage=30, stale-while-revalidate=60'
    res.setHeader('Cache-Control', cache)
    return res.send(content)
  } catch (err) {
    if (err instanceof HttpError) {
      if (err.statusCode === 404) return res.status(404).json({ error: 'Not found' })
      return res.status(err.statusCode).json({ error: `GitHub API error ${err.statusCode}` })
    }
    return res.status(500).json({ error: 'Failed to read content' })
  }
}
