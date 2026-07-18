// Detects errors caused by a session running a stale build — a browser holding
// chunks from a previous deploy after a new one has shipped. Two shapes:
//
// 1. Failed dynamic import (a purged/missing chunk):
//      Chrome  "Failed to fetch dynamically imported module: …"
//      Firefox "error loading dynamically imported module"
//      Safari  "Importing a module script failed."
//    plus the MIME error seen when a missing chunk request is answered with HTML.
//
// 2. Module init-order / temporal-dead-zone error — a cached entry chunk wired
//    to a differently-ordered vendor chunk from another build evaluates a
//    binding before it is initialised. Surfaces (minified) as e.g.
//    "Cannot access 'v' before initialization":
//      Chrome  "Cannot access 'X' before initialization"
//      Firefox "can't access lexical declaration 'X' before initialization"
//      Safari  "Cannot access uninitialized variable."
//
// Both are recoverable by reloading onto the current build (see
// RouteErrorBoundary). Detection is deliberately narrow: a bare "Failed to
// fetch" (a plain TypeError from any failed fetch/API call) is NOT treated as a
// stale deploy — otherwise a genuine data/network error would be masked behind
// the "reload should fix it" message and reload would never help. Chunk-load
// failures always carry the "dynamically imported module" / "module script"
// context, so they're still matched.
const STALE_DEPLOY_RE =
  /dynamically imported module|importing a module|module script|before initialization|uninitialized variable/i

export function isStaleDeployError(error) {
  return STALE_DEPLOY_RE.test(error?.message ?? '')
}
