/**
 * Vercel serverless function: /api/github
 *
 * All GitHub operations run server-side — GITHUB_TOKEN never reaches the browser.
 *
 * Design: Decision records live on main from creation. The decisions branch carries
 * only the actual architecture artefact changes (at STAGED). This means every
 * decision is always visible in the deployed app without waiting for a PR merge.
 *
 * Required Vercel environment variables:
 *   GITHUB_TOKEN  — PAT with repo read/write scope and actions:write scope
 *   GITHUB_OWNER  — Repository owner (e.g. dan-eastley)
 *   GITHUB_REPO   — Repository name (e.g. pickle)
 */

const GH_API = 'https://api.github.com'
const BASE = 'main'

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

function b64encode(str) { return Buffer.from(str, 'utf-8').toString('base64') }
function b64decode(str) { return Buffer.from(str, 'base64').toString('utf-8') }

// ── Helpers ───────────────────────────────────────────────────────────────────

function decisionPath(clientId, versionId, decisionId) {
  return `architectures/clients/${clientId}/${versionId}/decisions/${decisionId}/decision.json`
}

function indexPath(clientId, versionId) {
  return `architectures/clients/${clientId}/${versionId}/decisions/decisions.json`
}

async function readFileOnMain(path, token, owner, repo) {
  const f = await gh('GET', `/repos/${owner}/${repo}/contents/${path}?ref=${BASE}`, null, token)
  return { content: JSON.parse(b64decode(f.content)), sha: f.sha }
}

async function writeFileOnMain(path, content, message, sha, token, owner, repo) {
  return gh('PUT', `/repos/${owner}/${repo}/contents/${path}`, {
    message,
    content: b64encode(JSON.stringify(content, null, 4)),
    sha,
    branch: BASE,
  }, token)
}

async function dispatch(workflow, inputs, token, owner, repo) {
  await gh('POST', `/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`, {
    ref: BASE,
    inputs,
  }, token)
}

// ── Action: next-id ───────────────────────────────────────────────────────────

async function getNextId({ clientId, versionId }, token, owner, repo) {
  const { content } = await readFileOnMain(indexPath(clientId, versionId), token, owner, repo)
  const ids = (content.decisions ?? []).map(d => d['decision-id'])
  const max = ids.reduce((m, id) => {
    const n = parseInt(id.replace('ADR-', ''), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return { nextId: `ADR-${String(max + 1).padStart(3, '0')}` }
}

// ── Action: create-decision ───────────────────────────────────────────────────
// 1. Commit decision.json to main
// 2. Update decisions index on main
// 3. Create empty decisions branch from main (for future artefact changes)
// 4. Dispatch narrative-review workflow

async function createDecision({ clientId, versionId, decision }, token, owner, repo) {
  const decisionId = decision['decision-id']
  const branch     = `decisions/${clientId}/${versionId}/${decisionId}`
  const dPath      = decisionPath(clientId, versionId, decisionId)
  const iPath      = indexPath(clientId, versionId)

  // 1. Commit decision.json to main
  await gh('PUT', `/repos/${owner}/${repo}/contents/${dPath}`, {
    message: `Add ${decisionId}: ${decision.title}`,
    content: b64encode(JSON.stringify(decision, null, 4)),
    branch: BASE,
  }, token)

  // 2. Update decisions index on main
  const { content: index, sha: indexSha } = await readFileOnMain(iPath, token, owner, repo)
  if (!index.decisions.some(d => d['decision-id'] === decisionId)) {
    index.decisions.push({ 'decision-id': decisionId })
    await writeFileOnMain(iPath, index, `Register ${decisionId} in decisions index`, indexSha, token, owner, repo)
  }

  // 3. Create empty branch from main
  const baseRef = await gh('GET', `/repos/${owner}/${repo}/git/ref/heads/${BASE}`, null, token)
  await gh('POST', `/repos/${owner}/${repo}/git/refs`, {
    ref: `refs/heads/${branch}`,
    sha: baseRef.object.sha,
  }, token).catch(e => {
    if (!e.message.includes('already exists')) throw e
  })

  // 4. Dispatch narrative review
  await dispatch('decisions-narrative-review.yml',
    { 'client-id': clientId, 'version-id': versionId, 'decision-id': decisionId },
    token, owner, repo)

  return { ok: true, decisionId, branch }
}

// ── Action: update-decision ───────────────────────────────────────────────────
// Updates decision.json on main and dispatches the next workflow if status changed.

async function updateDecision({ clientId, versionId, decisionId, updates }, token, owner, repo) {
  const dPath = decisionPath(clientId, versionId, decisionId)
  const { content: current, sha } = await readFileOnMain(dPath, token, owner, repo)
  const updated = { ...current, ...updates }
  const newStatus = updates.status

  await writeFileOnMain(dPath, updated,
    `Update ${decisionId}: ${newStatus ? `status → ${newStatus}` : 'updated'}`,
    sha, token, owner, repo)

  const ids = { 'client-id': clientId, 'version-id': versionId, 'decision-id': decisionId }

  // Dispatch appropriate workflow on status transition
  if (newStatus === 'proposed') {
    await dispatch('decisions-pipeline.yml', ids, token, owner, repo)
  } else if (newStatus === 'accepted') {
    await dispatch('decisions-architecture-changes.yml', ids, token, owner, repo)
  } else if (newStatus === 'staged') {
    await dispatch('decisions-apply-changes.yml', ids, token, owner, repo)
  }

  return { ok: true, decisionId, status: newStatus }
}

// ── Action: update-finding ────────────────────────────────────────────────────
// Persists an accept/decline review on a specific finding in decision.json on main.

async function updateFinding({ clientId, versionId, decisionId, sectionKey, findingIndex, review }, token, owner, repo) {
  const dPath = decisionPath(clientId, versionId, decisionId)
  const { content, sha } = await readFileOnMain(dPath, token, owner, repo)

  const section = content[sectionKey]
  if (!section?.[findingIndex]) throw new Error(`Finding ${sectionKey}[${findingIndex}] not found`)

  if (review === null || review === undefined) {
    delete section[findingIndex].review
  } else {
    section[findingIndex].review = review
  }

  await writeFileOnMain(dPath, content,
    `${review ?? 'clear'} finding ${findingIndex} in ${decisionId} ${sectionKey}`,
    sha, token, owner, repo)

  return { ok: true }
}

// ── Action: commit-decision ───────────────────────────────────────────────────
// Merges the decisions branch PR and updates status to committed on main.

async function commitDecision({ clientId, versionId, decisionId, prNumber }, token, owner, repo) {
  // Merge the PR
  if (prNumber) {
    await gh('PUT', `/repos/${owner}/${repo}/pulls/${prNumber}/merge`, {
      commit_title: `Commit ${decisionId}: merge architecture changes`,
      merge_method: 'squash',
    }, token)
  }

  // Update decision status to committed on main
  await updateDecision({ clientId, versionId, decisionId, updates: { status: 'committed' } }, token, owner, repo)

  return { ok: true, decisionId, status: 'committed' }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo  = process.env.GITHUB_REPO

  if (!token || !owner || !repo) {
    return res.status(503).json({
      error: 'GitHub integration not configured',
      missing: [!token && 'GITHUB_TOKEN', !owner && 'GITHUB_OWNER', !repo && 'GITHUB_REPO'].filter(Boolean),
    })
  }

  try {
    if (req.method === 'GET') {
      const { action, ...params } = req.query
      if (action === 'next-id') return res.json(await getNextId(params, token, owner, repo))
      if (action === 'config')  return res.json({
        owner,
        repo,
        env:       process.env.VERCEL_ENV ?? null,
        branchUrl: process.env.VERCEL_BRANCH_URL ?? null,
      })
      return res.status(400).json({ error: `Unknown GET action: ${action}` })
    }

    if (req.method === 'POST') {
      const { action, ...params } = req.body ?? {}
      if (action === 'create-decision')  return res.json(await createDecision(params, token, owner, repo))
      if (action === 'update-decision')  return res.json(await updateDecision(params, token, owner, repo))
      if (action === 'update-finding')   return res.json(await updateFinding(params, token, owner, repo))
      if (action === 'commit-decision')  return res.json(await commitDecision(params, token, owner, repo))
      return res.status(400).json({ error: `Unknown POST action: ${action}` })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[/api/github]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
