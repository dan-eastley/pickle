// Read client errors that the app reported to /api/log (see api/log.ts), which
// writes them to Vercel's Runtime Logs as lines tagged `[client-error]`.
//
// Requires the Vercel CLI to be authenticated for this project — provide a
// token via VERCEL_TOKEN (a project/read scope is enough), or run `vercel login`
// once. Then:
//
//   node tools/logs.mjs                       # tail prod, client errors only
//   node tools/logs.mjs <deployment-url>      # a specific deployment
//   node tools/logs.mjs --all                 # don't filter to client errors
//
// The runtime-logs stream is followed until interrupted (Ctrl-C).
import { spawn } from 'node:child_process'

const args = process.argv.slice(2)
const all = args.includes('--all')
const url = args.find((a) => a.startsWith('http')) || 'https://pickle-psi-neon.vercel.app'
const token = process.env.VERCEL_TOKEN

if (!token) {
  console.error(
    'VERCEL_TOKEN not set. Provide a Vercel token (project read scope) so logs can be read,\n' +
      'or run `vercel login` first. See tools/logs.mjs.'
  )
}

const cli = ['vercel', 'logs', url, ...(token ? ['--token', token] : [])]
const proc = spawn('npx', cli, { stdio: ['ignore', 'pipe', 'inherit'] })

let buf = ''
proc.stdout.on('data', (chunk) => {
  buf += chunk.toString()
  const lines = buf.split('\n')
  buf = lines.pop() ?? ''
  for (const line of lines) {
    if (all || line.includes('[client-error]')) console.log(line)
  }
})
proc.on('exit', (code) => process.exit(code ?? 0))
