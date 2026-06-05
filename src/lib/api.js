async function fetchJson(url) {
  const res = await fetch(url)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`API error ${res.status} for ${url}`)
  return res.json()
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
    `/api/arch/clients/${clientId}/${versionId}/domains/${domain}/${abstraction}/${artefactId}/${artefactId}.json`
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
export async function getDecision(clientId, versionId, decisionId, status) {
  const basePath = `/api/arch/clients/${clientId}/${versionId}/decisions/${decisionId}/decision.json`

  // If status is known and terminal, go straight to main
  if (status && !BRANCH_STATUSES.has(status)) {
    return fetchJson(basePath)
  }

  // Try the decisions branch first
  const branch = encodeURIComponent(`decisions/${clientId}/${versionId}/${decisionId}`)
  const res = await fetch(`${basePath}?ref=${branch}`)
  if (res.ok) return res.json()
  if (res.status === 404) return fetchJson(basePath) // fall back to main
  throw new Error(`API error ${res.status} fetching decision`)
}

export async function getClientLogo(clientId) {
  const extensions = ['svg', 'png', 'jpg', 'webp']
  for (const ext of extensions) {
    const res = await fetch(`/api/arch/clients/${clientId}/logo.${ext}`)
    if (res.ok) return `/api/arch/clients/${clientId}/logo.${ext}`
  }
  return null
}
