async function fetchJson(url) {
  const res = await fetch(url)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`API error ${res.status} for ${url}`)
  return res.json()
}

// POST a mutating action to /api/github. Throws on a non-2xx with the API's
// error message so callers can surface it and roll back optimistic UI. Shared
// by every page that mutates architecture state (decisions, discoveries).
export async function githubAction(body) {
  const res = await fetch('/api/github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`)
  return data
}

// The next available decision ID (e.g. "ADR-016") for a client/version.
export async function getNextDecisionId(clientId, versionId) {
  const q = `clientId=${encodeURIComponent(clientId)}&versionId=${encodeURIComponent(versionId)}`
  const res = await fetch(`/api/github?action=next-id&${q}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) throw new Error(data.error ?? `Request failed (${res.status})`)
  return data.nextId
}

export async function getClients() {
  const data = await fetchJson('/api/arch/clients/clients.json')
  return data?.clients ?? []
}

export async function getClient(clientId) {
  return fetchJson(`/api/arch/clients/${clientId}/client.json`)
}

export async function getVersions(clientId) {
  const data = await fetchJson(`/api/arch/clients/${clientId}/versions.json`)
  return data?.versions ?? []
}

export async function getVersion(clientId, versionId) {
  return fetchJson(`/api/arch/clients/${clientId}/${versionId}/version.json`)
}

export async function getArtefactData(clientId, versionId, domain, abstraction, artefactId) {
  return fetchJson(
    `/api/arch/clients/${clientId}/${versionId}/domains/${domain}/${abstraction}/${artefactId}.json`
  )
}

export async function getSchema(domain, abstraction, artefactId) {
  return fetchJson(`/api/schemas/artefacts/domains/${domain}/${abstraction}/${artefactId}.json`)
}

// Statuses where the full decision.json lives on the decisions branch
const BRANCH_STATUSES = new Set(['draft', 'proposed', 'accepted', 'staged'])

/**
 * Fetches a full decision record. Tries the decisions branch first
 * (for in-flight decisions), then falls back to main (for committed/rejected).
 */
export async function getDecision(clientId, versionId, decisionId, status, { bust = false } = {}) {
  const basePath = `/api/arch/clients/${clientId}/${versionId}/decisions/${decisionId}/decision.json`
  const nc = bust ? '&nocache=1' : ''

  // If status is known and terminal, go straight to main
  if (status && !BRANCH_STATUSES.has(status)) {
    return fetchJson(`${basePath}${bust ? '?nocache=1' : ''}`)
  }

  // Try the decisions branch first
  const branch = encodeURIComponent(`decisions/${clientId}/${versionId}/${decisionId}`)
  const res = await fetch(`${basePath}?ref=${branch}${nc}`)
  if (res.ok) return res.json()
  if (res.status === 404) return fetchJson(`${basePath}${bust ? '?nocache=1' : ''}`)
  throw new Error(`API error ${res.status} fetching decision`)
}
