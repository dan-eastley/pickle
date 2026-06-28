import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync, existsSync, statSync, readdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const GH_API = 'https://api.github.com'

function architectureApiPlugin() {
  return {
    name: 'architecture-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        handleApiRequest(req, res, next, server).catch((err) => {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        })
      })
    },
  }
}

async function handleApiRequest(req, res, next, server) {
  if (!req.url.startsWith('/api/')) {
    return next()
  }

  const url = new URL(req.url, 'http://localhost')

  // /api/auth/** → Better Auth Node handler (sign-up/in/out, session).
  if (url.pathname.startsWith('/api/auth/')) {
    const { getAuthNodeHandler } = await server.ssrLoadModule('/lib/auth.ts')
    return getAuthNodeHandler()(req, res)
  }

  // /api/arch/** → always fetch live from GitHub
  if (url.pathname.startsWith('/api/arch/')) {
    const relPath = decodeURIComponent(url.pathname.slice('/api/arch/'.length))
    const ref = url.searchParams.get('ref') || 'main'
    const nocache = url.searchParams.has('nocache')

    const token = process.env.GITHUB_TOKEN
    const owner = process.env.GITHUB_OWNER
    const repo = process.env.GITHUB_REPO

    if (!token || !owner || !repo) {
      res.statusCode = 503
      return res.end(
        JSON.stringify({
          error: 'GitHub not configured — set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO',
        })
      )
    }

    const ghUrl = `${GH_API}/repos/${owner}/${repo}/contents/architectures/${relPath}?ref=${encodeURIComponent(ref)}`
    const ghRes = await fetch(ghUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })

    if (ghRes.status === 404) {
      res.statusCode = 404
      return res.end(JSON.stringify({ error: 'Not found' }))
    }
    if (!ghRes.ok) {
      res.statusCode = ghRes.status
      return res.end(JSON.stringify({ error: `GitHub API error ${ghRes.status}` }))
    }

    const data = await ghRes.json()

    if (Array.isArray(data)) {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'no-store')
      return res.end(
        JSON.stringify({
          entries: data.map((f) => ({ name: f.name, isDir: f.type === 'dir' })),
        })
      )
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', nocache ? 'no-store' : 'no-cache')
    return res.end(content)
  }

  // /api/github → run the serverless handler in-process so the decisions and
  // discovery pipelines can be exercised in local dev (needs GITHUB_* env).
  if (url.pathname === '/api/github') {
    let body = {}
    if (req.method === 'POST') {
      const chunks = []
      for await (const c of req) chunks.push(c)
      const raw = Buffer.concat(chunks).toString('utf8')
      body = raw ? JSON.parse(raw) : {}
    }
    const { default: handler } = await server.ssrLoadModule('/api/github.ts')
    const shimReq = {
      method: req.method,
      query: Object.fromEntries(url.searchParams),
      body,
      // Pass headers through so the session gate can read the auth cookie.
      headers: req.headers,
    }
    const shimRes = {
      statusCode: 200,
      setHeader: (k, v) => res.setHeader(k, v),
      status(code) {
        this.statusCode = code
        res.statusCode = code
        return this
      },
      json(obj) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = this.statusCode
        res.end(JSON.stringify(obj))
      },
      end() {
        res.statusCode = this.statusCode
        res.end()
      },
    }
    return handler(shimReq, shimRes)
  }

  // /api/schemas/** and /api/docs/** → read from local disk (codebase-managed, no live updates needed)
  let basePath,
    relPath,
    isMarkdown = false

  if (url.pathname.startsWith('/api/schemas/')) {
    basePath = resolve(REPO_ROOT, 'config/schemas')
    relPath = decodeURIComponent(url.pathname.slice('/api/schemas/'.length))
  } else if (url.pathname.startsWith('/api/docs/')) {
    basePath = resolve(REPO_ROOT, 'docs')
    relPath = decodeURIComponent(url.pathname.slice('/api/docs/'.length))
    isMarkdown = true
  } else {
    return next()
  }

  const filePath = resolve(basePath, relPath)

  if (!filePath.startsWith(basePath)) {
    res.statusCode = 403
    return res.end('{"error":"Forbidden"}')
  }

  res.setHeader('Content-Type', isMarkdown ? 'text/markdown; charset=utf-8' : 'application/json')
  res.setHeader('Cache-Control', 'no-cache')

  if (!existsSync(filePath)) {
    res.statusCode = 404
    return res.end('{"error":"Not found"}')
  }

  const stat = statSync(filePath)
  if (stat.isDirectory()) {
    const entries = readdirSync(filePath).map((name) => ({
      name,
      isDir: statSync(resolve(filePath, name)).isDirectory(),
    }))
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ entries }))
  }

  return res.end(readFileSync(filePath, 'utf-8'))
}

export default defineConfig(({ mode }) => {
  // Load .env (no prefix filter) so the /api/arch GitHub proxy can read
  // GITHUB_* from a local .env. Real shell env vars take precedence.
  const env = loadEnv(mode, __dirname, '')
  for (const key of [
    'GITHUB_TOKEN',
    'GITHUB_OWNER',
    'GITHUB_REPO',
    'API_ALLOWED_ORIGINS',
    // Auth (Better Auth + Postgres) — needed by the /api/auth dev shim.
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
  ]) {
    if (!process.env[key] && env[key]) process.env[key] = env[key]
  }

  return {
    plugins: [
      react(),
      architectureApiPlugin(),
      // Data is now served by the /api/content Vercel function (reads from GitHub).
      // Static copy removed — no build needed when architecture data changes.
    ],
    // Allow importing localisation + shared config JSON from the repo's config/
    // directory, which sits one level above the Vite root (src/).
    server: { port: 3000, fs: { allow: [REPO_ROOT] } },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Stable, cacheable vendor chunk shared by every route.
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Markdown stack — only pulled in with the docs route.
            'markdown-vendor': ['react-markdown', 'remark-gfm'],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./vitest.setup.js'],
      include: ['**/*.test.{js,jsx}'],
      exclude: ['node_modules/**', 'dist/**', '.vite/**', 'tests/e2e/**'],
    },
  }
})
