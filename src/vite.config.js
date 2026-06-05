import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync, existsSync, statSync, readdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

function architectureApiPlugin() {
  return {
    name: 'architecture-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url.startsWith('/api/')) {
          next()
          return
        }

        let basePath, relPath, isMarkdown = false

        if (req.url.startsWith('/api/arch/')) {
          basePath = resolve(REPO_ROOT, 'architectures')
          relPath = decodeURIComponent(req.url.slice('/api/arch/'.length).split('?')[0])
        } else if (req.url.startsWith('/api/schemas/')) {
          basePath = resolve(REPO_ROOT, 'config/schemas')
          relPath = decodeURIComponent(req.url.slice('/api/schemas/'.length).split('?')[0])
        } else if (req.url.startsWith('/api/docs/')) {
          basePath = resolve(REPO_ROOT, 'docs')
          relPath = decodeURIComponent(req.url.slice('/api/docs/'.length).split('?')[0])
          isMarkdown = true
        } else {
          next()
          return
        }

        const filePath = resolve(basePath, relPath)

        // Prevent path traversal
        if (!filePath.startsWith(basePath)) {
          res.statusCode = 403
          res.end('{"error":"Forbidden"}')
          return
        }

        res.setHeader('Content-Type', isMarkdown ? 'text/markdown; charset=utf-8' : 'application/json')
        res.setHeader('Cache-Control', 'no-cache')

        try {
          if (!existsSync(filePath)) {
            res.statusCode = 404
            res.end('{"error":"Not found"}')
            return
          }

          const stat = statSync(filePath)
          if (stat.isDirectory()) {
            const entries = readdirSync(filePath).map(name => ({
              name,
              isDir: statSync(resolve(filePath, name)).isDirectory(),
            }))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ entries }))
          } else {
            res.end(readFileSync(filePath, 'utf-8'))
          }
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: e.message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    architectureApiPlugin(),
    // Data is now served by the /api/content Vercel function (reads from GitHub).
    // Static copy removed — no build needed when architecture data changes.
    // viteStaticCopy kept as dependency in case it's needed for other assets.
  ],
  server: { port: 3000 },
})
