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
 * Read-only; no auth (public content). Required env: GITHUB_TOKEN/OWNER/REPO.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  GitHubClient,
  HttpError,
  b64decode,
  getGitHubConfig,
  type GhContentFile,
} from '../lib/github'

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
    // nocache=1 means the client just wrote this resource — skip CDN caching.
    res.setHeader('Cache-Control', nocache ? 'no-store' : 's-maxage=30, stale-while-revalidate=60')
    return res.send(content)
  } catch (err) {
    if (err instanceof HttpError) {
      if (err.statusCode === 404) return res.status(404).json({ error: 'Not found' })
      return res.status(err.statusCode).json({ error: `GitHub API error ${err.statusCode}` })
    }
    return res.status(500).json({ error: 'Failed to read content' })
  }
}
