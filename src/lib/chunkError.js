// Detects a failed dynamic import (a stale chunk after a deploy, or a network
// blip) from the error message. Message shapes across browsers:
//   Chrome  "Failed to fetch dynamically imported module: …"
//   Firefox "error loading dynamically imported module"
//   Safari  "Importing a module script failed."
// plus the generic fetch failure and the MIME error seen when a missing chunk
// request is answered with HTML.
const CHUNK_ERROR_RE =
  /dynamically imported module|importing a module|module script|Failed to fetch/i

export function isChunkLoadError(error) {
  return CHUNK_ERROR_RE.test(error?.message ?? '')
}
