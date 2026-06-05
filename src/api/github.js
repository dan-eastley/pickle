/**
 * Vercel serverless function: /api/github
 *
 * Handles all GitHub operations server-side so the GITHUB_TOKEN is never
 * exposed to the browser.
 *
 * Required environment variables (set in Vercel project settings):
 *   GITHUB_TOKEN  — Personal Access Token with repo read+write scope
 *   GITHUB_OWNER  — Repository owner (e.g. dan-eastley)
 *   GITHUB_REPO   — Repository name (e.g. pickle)
 *   GITHUB_BASE   — Base branch for PRs (default: develop)
 */

const GH_API = 'https://api.github.com'

async function gh(method, path, body, token) {
  const res = await fetch(`${GH_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message ?? `GitHub ${res.status}`)
  return json
}

function b64(str) {
  return Buffer.from(str, 'utf-8').toString('base64')
}

// ── Action handlers ───────────────────────────────────────────────────────────

/**
 * GET /api/github?action=next-id&clientId=fedc&versionId=1.0.0
 * Returns the next ADR ID (e.g. "ADR-018") by reading decisions.json.
 */
async function getNextId({ clientId, versionId }, token, owner, repo, base) {
  const path = `architectures/clients/${clientId}/${versionId}/decisions/decisions.json`
  const data = await gh('GET', `/repos/${owner}/${repo}/contents/${path}?ref=${base}`, null, token)
  const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'))
  const ids = (content.decisions ?? []).map(d => d['decision-id'])
  const max = ids.reduce((m, id) => {
    const n = parseInt(id.replace('ADR-', ''), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return { nextId: `ADR-${String(max + 1).padStart(3, '0')}` }
}

/**
 * POST /api/github  { action: 'create-decision', clientId, versionId, decision }
 * Creates a branch, commits the decision file, updates the decisions index, opens a PR.
 */
async function createDecision({ clientId, versionId, decision }, token, owner, repo, base) {
  const decisionId = decision['decision-id']
  const branch = `decisions/${clientId}/${versionId}/${decisionId}`
  const decisionPath = `architectures/clients/${clientId}/${versionId}/decisions/${decisionId}/decision.json`
  const indexPath = `architectures/clients/${clientId}/${versionId}/decisions/decisions.json`

  // 1. Get base branch SHA
  const baseRef = await gh('GET', `/repos/${owner}/${repo}/git/ref/heads/${base}`, null, token)
  const baseSha = baseRef.object.sha

  // 2. Create decision branch
  await gh('POST', `/repos/${owner}/${repo}/git/refs`, {
    ref: `refs/heads/${branch}`,
    sha: baseSha,
  }, token)

  // 3. Commit decision.json
  await gh('PUT', `/repos/${owner}/${repo}/contents/${decisionPath}`, {
    message: `Add ${decisionId}: ${decision.title}`,
    content: b64(JSON.stringify(decision, null, 4)),
    branch,
  }, token)

  // 4. Read current decisions.json from the new branch, add entry
  let indexSha
  let indexContent
  try {
    const indexFile = await gh('GET', `/repos/${owner}/${repo}/contents/${indexPath}?ref=${branch}`, null, token)
    indexSha = indexFile.sha
    indexContent = JSON.parse(Buffer.from(indexFile.content, 'base64').toString('utf-8'))
  } catch {
    indexContent = { decisions: [] }
  }
  const alreadyListed = indexContent.decisions.some(d => d['decision-id'] === decisionId)
  if (!alreadyListed) {
    indexContent.decisions.push({ 'decision-id': decisionId })
  }
  await gh('PUT', `/repos/${owner}/${repo}/contents/${indexPath}`, {
    message: `Register ${decisionId} in decisions index`,
    content: b64(JSON.stringify(indexContent, null, 4)),
    branch,
    ...(indexSha ? { sha: indexSha } : {}),
  }, token)

  // 5. Open PR
  const pr = await gh('POST', `/repos/${owner}/${repo}/pulls`, {
    title: `[${decisionId}] ${decision.title}`,
    head: branch,
    base,
    body: `Architecture Decision Record: **${decisionId}** — ${decision.title}\n\n> ${decision.narrative?.slice(0, 300) ?? ''}`,
  }, token)

  return { branch, prNumber: pr.number, prUrl: pr.html_url }
}

/**
 * POST /api/github  { action: 'update-decision', clientId, versionId, decisionId, updates }
 * Merges `updates` into the decision.json on its branch and pushes.
 * `updates` is a partial object (e.g. { status: 'proposed' }).
 */
async function updateDecision({ clientId, versionId, decisionId, updates }, token, owner, repo) {
  const branch = `decisions/${clientId}/${versionId}/${decisionId}`
  const filePath = `architectures/clients/${clientId}/${versionId}/decisions/${decisionId}/decision.json`

  // Get current file
  const file = await gh('GET', `/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`, null, token)
  const current = JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8'))
  const updated = { ...current, ...updates }

  await gh('PUT', `/repos/${owner}/${repo}/contents/${filePath}`, {
    message: `Update ${decisionId} status → ${updates.status ?? 'updated'}`,
    content: b64(JSON.stringify(updated, null, 4)),
    sha: file.sha,
    branch,
  }, token)

  return { ok: true, decisionId, status: updated.status }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS headers for local dev
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo  = process.env.GITHUB_REPO
  const base  = process.env.GITHUB_BASE ?? 'develop'

  if (!token || !owner || !repo) {
    return res.status(503).json({
      error: 'GitHub integration not configured',
      missing: [!token && 'GITHUB_TOKEN', !owner && 'GITHUB_OWNER', !repo && 'GITHUB_REPO'].filter(Boolean),
    })
  }

  try {
    if (req.method === 'GET') {
      const { action, ...params } = req.query
      if (action === 'next-id') return res.json(await getNextId(params, token, owner, repo, base))
      return res.status(400).json({ error: `Unknown GET action: ${action}` })
    }

    if (req.method === 'POST') {
      const { action, ...params } = req.body ?? {}
      if (action === 'create-decision') return res.json(await createDecision(params, token, owner, repo, base))
      if (action === 'update-decision') return res.json(await updateDecision(params, token, owner, repo))
      return res.status(400).json({ error: `Unknown POST action: ${action}` })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[/api/github]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
