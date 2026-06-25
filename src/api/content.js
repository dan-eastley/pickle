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
 * Required environment variables:
 *   GITHUB_TOKEN  — PAT with repo read scope
 *   GITHUB_OWNER  — Repository owner
 *   GITHUB_REPO   — Repository name
 */

const GH_API = 'https://api.github.com'

export default async function handler(req, res) {
  const { prefix, path: filePath, ref: REF = 'main', nocache } = req.query

  if (!prefix || !filePath) {
    return res.status(400).json({ error: 'Missing prefix or path' })
  }

  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO

  if (!token || !owner || !repo) {
    return res.status(503).json({ error: 'GitHub not configured' })
  }

  const fullPath = `${prefix}/${filePath}`
  const url = `${GH_API}/repos/${owner}/${repo}/contents/${fullPath}?ref=${REF}`

  const ghRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (ghRes.status === 404) return res.status(404).json({ error: 'Not found' })
  if (!ghRes.ok) return res.status(ghRes.status).json({ error: `GitHub API error ${ghRes.status}` })

  const data = await ghRes.json()

  // Directory → return entries list (same shape as original Vite middleware)
  if (Array.isArray(data)) {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')
    return res.json({
      entries: data.map((f) => ({ name: f.name, isDir: f.type === 'dir' })),
    })
  }

  // File → decode base64 content
  const content = Buffer.from(data.content, 'base64').toString('utf-8')
  const isMarkdown = filePath.endsWith('.md')

  res.setHeader('Content-Type', isMarkdown ? 'text/markdown; charset=utf-8' : 'application/json')
  // nocache=1 means the client just wrote this resource — skip CDN caching
  res.setHeader('Cache-Control', nocache ? 'no-store' : 's-maxage=30, stale-while-revalidate=60')
  return res.send(content)
}
