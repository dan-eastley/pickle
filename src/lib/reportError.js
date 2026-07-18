import release from '../version.json'

// Ships a client-side error to /api/log, which writes it to Vercel's Runtime
// Logs (see api/log.ts). Fire-and-forget and defensively wrapped — the reporter
// must never itself throw or block. Production only: in dev, errors already
// surface in the console and there's no /api/log handler.
//
// `keepalive` lets the POST finish even as the page unloads or the app crashes.

let sent = 0
const MAX_PER_SESSION = 25 // avoid flooding on a render loop

export function reportError(error, { kind = 'window', componentStack, userId } = {}) {
  try {
    if (!import.meta.env.PROD) return
    if (sent >= MAX_PER_SESSION) return
    sent++

    const body = JSON.stringify({
      level: 'error',
      message: error?.message ?? String(error),
      stack: error?.stack,
      componentStack,
      context: {
        route: `${location.pathname}${location.search}`,
        version: release?.version,
        userId,
        kind,
      },
    })

    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* the reporter must never throw */
  }
}

// Registers window-level handlers for errors React's boundaries don't catch
// (event handlers, async, promise rejections). Call once at app start.
export function installGlobalErrorReporting() {
  if (typeof window === 'undefined') return
  window.addEventListener('error', (e) => {
    reportError(e.error ?? new Error(e.message), { kind: 'window' })
  })
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason instanceof Error ? e.reason : new Error(String(e.reason))
    reportError(reason, { kind: 'unhandledrejection' })
  })
}
