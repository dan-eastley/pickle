/**
 * Vercel serverless function: /api/github
 *
 * Decision storage model:
 *   - decisions.json (index) lives on main — contains id/title/status/scope for all decisions
 *   - Full decision.json lives on the decisions branch while in-flight (draft/proposed/accepted/staged)
 *   - On committed: PR merge brings decision.json to main; branch is deleted
 *   - On rejected: decision.json is committed directly to main; branch is deleted
 *
 * Required env vars: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO
 */

const GH_API = 'https://api.github.com'
const BASE   = 'main'

// Statuses where the full decision.json lives on the decisions branch
const BRANCH_STATUSES = new Set(['draft', 'proposed', 'accepted', 'staged'])

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

function decisionPath(clientId, versionId, decisionId) {
  return `architectures/clients/${clientId}/${versionId}/decisions/${decisionId}/decision.json`
}
function indexPath(clientId, versionId) {
  return `architectures/clients/${clientId}/${versionId}/decisions/decisions.json`
}
function decisionBranch(clientId, versionId, decisionId) {
  return `decisions/${clientId}/${versionId}/${decisionId}`
}

async function readFile(path, ref, token, owner, repo) {
  const f = await gh('GET', `/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`, null, token)
  return { content: JSON.parse(b64decode(f.content)), sha: f.sha }
}

async function writeFile(path, content, message, sha, branch, token, owner, repo) {
  return gh('PUT', `/repos/${owner}/${repo}/contents/${path}`, {
    message, branch,
    content: b64encode(JSON.stringify(content, null, 4)),
    ...(sha ? { sha } : {}),
  }, token)
}

async function dispatch(workflow, inputs, token, owner, repo) {
  await gh('POST', `/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`, {
    ref: BASE, inputs,
  }, token)
}

async function deleteBranch(branch, token, owner, repo) {
  await gh('DELETE', `/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, null, token)
    .catch(() => {}) // ignore if already deleted
}

// ── Index sync ────────────────────────────────────────────────────────────────

async function syncIndex(clientId, versionId, decisionId, { title, status, scope }, token, owner, repo) {
  const iPath = indexPath(clientId, versionId)
  const { content: index, sha } = await readFile(iPath, BASE, token, owner, repo)

  const existingIdx = index.decisions.findIndex(d => d['decision-id'] === decisionId)
  const existingEntry = existingIdx >= 0 ? index.decisions[existingIdx] : {}

  // Preserve existing title/scope when the caller only passes a status update
  const entry = {
    'decision-id': decisionId,
    title:  title  ?? existingEntry.title  ?? '',
    status,
    ...((scope ?? existingEntry.scope) ? { scope: scope ?? existingEntry.scope } : {}),
  }

  if (existingIdx >= 0) {
    index.decisions[existingIdx] = entry
  } else {
    index.decisions.push(entry)
  }

  await writeFile(iPath, index, `Sync ${decisionId} in decisions index (${status})`, sha, BASE, token, owner, repo)
}

// ── Action: next-id ───────────────────────────────────────────────────────────

async function getNextId({ clientId, versionId }, token, owner, repo) {
  const { content } = await readFile(indexPath(clientId, versionId), BASE, token, owner, repo)
  const ids = (content.decisions ?? []).map(d => d['decision-id'])
  const max = ids.reduce((m, id) => {
    const n = parseInt(id.replace('ADR-', ''), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return { nextId: `ADR-${String(max + 1).padStart(3, '0')}` }
}

// Compose a single narrative string from the Context / Problem / Proposal
// fields. Retained for downstream workflows and prompts that still read the
// legacy `narrative` field.
function composeNarrative({ context, problem, proposal, narrative }) {
  const parts = [
    context  && `## Context\n\n${context}`,
    problem  && `## Problem\n\n${problem}`,
    proposal && `## Proposal\n\n${proposal}`,
  ].filter(Boolean)
  return parts.length ? parts.join('\n\n') : (narrative ?? '')
}

// ── Action: create-decision ───────────────────────────────────────────────────

async function createDecision({ clientId, versionId, decision }, token, owner, repo) {
  const decisionId = decision['decision-id']
  const branch     = decisionBranch(clientId, versionId, decisionId)
  const dPath      = decisionPath(clientId, versionId, decisionId)

  // 1. Create branch from main
  const baseRef = await gh('GET', `/repos/${owner}/${repo}/git/ref/heads/${BASE}`, null, token)
  await gh('POST', `/repos/${owner}/${repo}/git/refs`, {
    ref: `refs/heads/${branch}`,
    sha: baseRef.object.sha,
  }, token).catch(e => { if (!e.message.includes('already exists')) throw e })

  // 2. Commit full decision.json to branch
  await writeFile(dPath, decision, `Add ${decisionId}: ${decision.title}`, null, branch, token, owner, repo)

  // 3. Sync summary to decisions.json on main
  await syncIndex(clientId, versionId, decisionId, {
    title: decision.title,
    status: decision.status ?? 'draft',
    scope: decision.scope,
  }, token, owner, repo)

  // 4. Dispatch narrative review
  await dispatch('decisions-to-draft.yml',
    { 'client-id': clientId, 'version-id': versionId, 'decision-id': decisionId },
    token, owner, repo)

  return { ok: true, decisionId, branch }
}

// ── Action: update-decision ───────────────────────────────────────────────────

async function updateDecision({ clientId, versionId, decisionId, updates }, token, owner, repo) {
  const newStatus = updates.status
  const branch    = decisionBranch(clientId, versionId, decisionId)
  const dPath     = decisionPath(clientId, versionId, decisionId)
  const ids       = { 'client-id': clientId, 'version-id': versionId, 'decision-id': decisionId }

  if (newStatus === 'rejected') {
    // Read full decision from branch, write it to main for history, delete branch
    let current, sha
    try {
      ;({ content: current, sha } = await readFile(dPath, branch, token, owner, repo))
    } catch {
      // If branch doesn't exist, read from main
      ;({ content: current, sha } = await readFile(dPath, BASE, token, owner, repo))
    }
    const updated = { ...current, ...updates }
    await writeFile(dPath, updated, `Reject ${decisionId}`, sha, BASE, token, owner, repo)
    await deleteBranch(branch, token, owner, repo)
    await syncIndex(clientId, versionId, decisionId, { title: updated.title, status: 'rejected', scope: updated.scope }, token, owner, repo)
    return { ok: true, decisionId, status: 'rejected' }
  }

  if (newStatus === 'committed') {
    // File is already on main (put there by PR merge) — just sync the index
    await syncIndex(clientId, versionId, decisionId, updates, token, owner, repo)
    if (newStatus === 'committed') {
      try {
        const { content: current, sha } = await readFile(dPath, BASE, token, owner, repo)
        const updated = { ...current, ...updates }
        await writeFile(dPath, updated, `Commit ${decisionId}`, sha, BASE, token, owner, repo)
      } catch { /* best-effort post-merge status update */ }
    }
    return { ok: true, decisionId, status: 'committed' }
  }

  // In-flight status (draft/proposed/accepted/staged) — update on branch
  let current, sha
  try {
    ;({ content: current, sha } = await readFile(dPath, branch, token, owner, repo))
  } catch {
    ;({ content: current, sha } = await readFile(dPath, BASE, token, owner, repo))
  }
  const updated = { ...current, ...updates }
  await writeFile(dPath, updated, `Update ${decisionId}: status → ${newStatus ?? 'updated'}`, sha, branch, token, owner, repo)

  // Sync index on main
  if (newStatus) {
    await syncIndex(clientId, versionId, decisionId, { title: updated.title, status: newStatus, scope: updated.scope }, token, owner, repo)
  }

  // Dispatch workflow on status transition
  if (newStatus === 'proposed') await dispatch('decisions-to-proposed.yml', ids, token, owner, repo)
  else if (newStatus === 'accepted') await dispatch('decisions-to-accepted.yml', ids, token, owner, repo)
  else if (newStatus === 'staged')   await dispatch('decisions-apply-changes.yml', ids, token, owner, repo)

  return { ok: true, decisionId, status: newStatus }
}

// ── Action: update-finding ────────────────────────────────────────────────────

async function updateFinding({ clientId, versionId, decisionId, sectionKey, findingIndex, review }, token, owner, repo) {
  const branch = decisionBranch(clientId, versionId, decisionId)
  const dPath  = decisionPath(clientId, versionId, decisionId)

  let content, sha, ref
  try {
    ;({ content, sha } = await readFile(dPath, branch, token, owner, repo)); ref = branch
  } catch {
    ;({ content, sha } = await readFile(dPath, BASE, token, owner, repo)); ref = BASE
  }

  const section = content[sectionKey]
  if (!section?.[findingIndex]) throw new Error(`Finding ${sectionKey}[${findingIndex}] not found`)

  if (review === null || review === undefined) delete section[findingIndex].review
  else section[findingIndex].review = review

  await writeFile(dPath, content, `${review ?? 'clear'} finding ${findingIndex} in ${decisionId} ${sectionKey}`, sha, ref, token, owner, repo)
  return { ok: true }
}

// ── Action: edit-decision ─────────────────────────────────────────────────────
// Updates the editable fields of a DRAFT decision on its branch and
// re-dispatches narrative review so findings are refreshed.

async function editDecision({ clientId, versionId, decisionId, title, context, problem, proposal, requirements, scope }, token, owner, repo) {
  const branch = decisionBranch(clientId, versionId, decisionId)
  const dPath  = decisionPath(clientId, versionId, decisionId)

  let current, sha
  try {
    ;({ content: current, sha } = await readFile(dPath, branch, token, owner, repo))
  } catch {
    ;({ content: current, sha } = await readFile(dPath, BASE, token, owner, repo))
  }

  const updated = {
    ...current,
    title:        title        ?? current.title,
    context:      context      ?? current.context,
    problem:      problem      ?? current.problem,
    proposal:     proposal     ?? current.proposal,
    requirements: requirements ?? current.requirements,
  }
  // Compose a legacy narrative for downstream workflows that still read it.
  updated.narrative = composeNarrative(updated)
  // Append an activity entry for the edit.
  updated.activity = [
    ...(current.activity ?? []),
    { timestamp: new Date().toISOString(), action: 'Updated', who: 'Joe Bloggs' },
  ]
  if (scope !== undefined) {
    if (scope) updated.scope = scope
    else delete updated.scope
  }
  if (!updated.requirements?.length) delete updated.requirements

  await writeFile(dPath, updated, `Edit ${decisionId}: ${updated.title}`, sha, branch, token, owner, repo)

  // Keep index in sync if title or scope changed
  await syncIndex(clientId, versionId, decisionId, {
    title: updated.title, status: updated.status, scope: updated.scope,
  }, token, owner, repo)

  // Re-run narrative review on the updated content
  await dispatch('decisions-to-draft.yml',
    { 'client-id': clientId, 'version-id': versionId, 'decision-id': decisionId },
    token, owner, repo)

  return { ok: true, decisionId }
}

// ── Action: commit-decision ───────────────────────────────────────────────────

async function commitDecision({ clientId, versionId, decisionId, prNumber }, token, owner, repo) {
  if (prNumber) {
    await gh('PUT', `/repos/${owner}/${repo}/pulls/${prNumber}/merge`, {
      commit_title: `Commit ${decisionId}: merge architecture changes`,
      merge_method: 'squash',
    }, token)
  }
  // PR merge brings decision.json to main — update its status and sync index
  await updateDecision({ clientId, versionId, decisionId, updates: { status: 'committed' } }, token, owner, repo)
  // The PR is merged (and closed); remove the now-redundant decision branch.
  if (prNumber) {
    await deleteBranch(decisionBranch(clientId, versionId, decisionId), token, owner, repo)
      .catch(() => { /* branch may already be gone if delete-on-merge is enabled */ })
  }
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
        owner, repo,
        env:       process.env.VERCEL_ENV ?? null,
        branchUrl: process.env.VERCEL_BRANCH_URL ?? null,
      })
      return res.status(400).json({ error: `Unknown GET action: ${action}` })
    }

    if (req.method === 'POST') {
      const { action, ...params } = req.body ?? {}
      if (action === 'create-decision') return res.json(await createDecision(params, token, owner, repo))
      if (action === 'edit-decision')   return res.json(await editDecision(params, token, owner, repo))
      if (action === 'update-decision') return res.json(await updateDecision(params, token, owner, repo))
      if (action === 'update-finding')  return res.json(await updateFinding(params, token, owner, repo))
      if (action === 'commit-decision') return res.json(await commitDecision(params, token, owner, repo))
      return res.status(400).json({ error: `Unknown POST action: ${action}` })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[/api/github]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
