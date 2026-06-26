/**
 * Vercel serverless function: /api/github
 *
 * Decision storage model:
 *   - decisions.json (index) lives on main — id/title/status/scope for all decisions
 *   - Full decision.json lives on the decisions branch while in-flight
 *     (draft/proposed/accepted/staged)
 *   - On committed: PR merge brings decision.json to main; branch is deleted
 *   - On rejected: decision.json is committed directly to main; branch is deleted
 *
 * Required env: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO.
 *
 * SECURITY: this endpoint performs repository writes with the server token.
 * It is NOT yet authenticated (tracked as RAS-2 / the auth epic) — once Better
 * Auth sessions land, gate every write here behind a valid session and attribute
 * activity to the signed-in user (replacing the ACTOR placeholder).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GitHubClient, HttpError, getGitHubConfig, missingGitHubEnv } from '../lib/github'

const BASE = 'main'

// Placeholder activity attribution until sessions are wired in (RAS-2).
const ACTOR = 'Joe B'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any>

interface Scope {
  domain?: string
  abstraction?: string
  artefact?: string
}

// ── Path + branch helpers ───────────────────────────────────────────────────────

function decisionPath(clientId: string, versionId: string, decisionId: string): string {
  return `architectures/clients/${clientId}/${versionId}/decisions/${decisionId}/decision.json`
}
function indexPath(clientId: string, versionId: string): string {
  return `architectures/clients/${clientId}/${versionId}/decisions/decisions.json`
}
function decisionBranch(clientId: string, versionId: string, decisionId: string): string {
  return `decisions/${clientId}/${versionId}/${decisionId}`
}
// Discovery records live on main (no per-record branch), unlike decisions.
function discoveryPath(clientId: string, versionId: string, discoveryId: string): string {
  return `architectures/clients/${clientId}/${versionId}/discovery/${discoveryId}/discovery.json`
}
function discoveriesIndexPath(clientId: string, versionId: string): string {
  return `architectures/clients/${clientId}/${versionId}/discovery/discovery.json`
}

function nowEntry(action: string, notes?: string): Doc {
  return { timestamp: new Date().toISOString(), action, who: ACTOR, ...(notes ? { notes } : {}) }
}

// Read a decision doc from its branch, falling back to main if the branch is
// gone. Returns the content, blob sha, and which ref it came from.
async function readDecisionDoc(
  gh: GitHubClient,
  dPath: string,
  branch: string
): Promise<{ content: Doc; sha: string; ref: string }> {
  try {
    const { content, sha } = await gh.readJson<Doc>(dPath, branch)
    return { content, sha, ref: branch }
  } catch {
    const { content, sha } = await gh.readJson<Doc>(dPath, BASE)
    return { content, sha, ref: BASE }
  }
}

// ── Index sync ────────────────────────────────────────────────────────────────

async function syncIndex(
  gh: GitHubClient,
  clientId: string,
  versionId: string,
  decisionId: string,
  { title, status, scope }: { title?: string; status: string; scope?: Scope }
): Promise<void> {
  const iPath = indexPath(clientId, versionId)
  const { content: index, sha } = await gh.readJson<Doc>(iPath, BASE)

  const existingIdx = index.decisions.findIndex((d: Doc) => d['decision-id'] === decisionId)
  const existingEntry: Doc = existingIdx >= 0 ? index.decisions[existingIdx] : {}

  // Preserve existing title/scope when the caller only passes a status update.
  const entry: Doc = {
    'decision-id': decisionId,
    title: title ?? existingEntry.title ?? '',
    status,
    ...((scope ?? existingEntry.scope) ? { scope: scope ?? existingEntry.scope } : {}),
  }

  if (existingIdx >= 0) index.decisions[existingIdx] = entry
  else index.decisions.push(entry)

  await gh.writeJson(iPath, index, `Sync ${decisionId} in decisions index (${status})`, {
    sha,
    branch: BASE,
  })
}

// Compose a single narrative string from the Context / Problem / Proposal fields.
// Retained for downstream workflows/prompts that still read the legacy field.
function composeNarrative({ context, problem, proposal, narrative }: Doc): string {
  const parts = [
    context && `## Context\n\n${context}`,
    problem && `## Problem\n\n${problem}`,
    proposal && `## Proposal\n\n${proposal}`,
  ].filter(Boolean)
  return parts.length ? parts.join('\n\n') : (narrative ?? '')
}

// ── Decision actions ────────────────────────────────────────────────────────────

async function getNextId(gh: GitHubClient, { clientId, versionId }: Doc): Promise<Doc> {
  const { content } = await gh.readJson<Doc>(indexPath(clientId, versionId), BASE)
  const ids: string[] = (content.decisions ?? []).map((d: Doc) => d['decision-id'])
  const max = ids.reduce((m, id) => {
    const n = parseInt(String(id).replace('ADR-', ''), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return { nextId: `ADR-${String(max + 1).padStart(3, '0')}` }
}

async function createDecision(
  gh: GitHubClient,
  { clientId, versionId, decision }: Doc
): Promise<Doc> {
  const decisionId = decision['decision-id']
  const branch = decisionBranch(clientId, versionId, decisionId)
  const dPath = decisionPath(clientId, versionId, decisionId)

  // 1. Branch from main, 2. commit decision.json to it.
  const baseSha = await gh.getHeadSha(BASE)
  await gh.createBranch(branch, baseSha)
  await gh.writeJson(dPath, decision, `Add ${decisionId}: ${decision.title}`, { branch })

  // 3. Sync summary to decisions.json on main.
  await syncIndex(gh, clientId, versionId, decisionId, {
    title: decision.title,
    status: decision.status ?? 'draft',
    scope: decision.scope,
  })

  // 4. Dispatch narrative review.
  await gh.dispatch('decisions-to-draft.yml', {
    'client-id': clientId,
    'version-id': versionId,
    'decision-id': decisionId,
  })

  return { ok: true, decisionId, branch }
}

async function updateDecision(
  gh: GitHubClient,
  { clientId, versionId, decisionId, updates }: Doc
): Promise<Doc> {
  const newStatus: string | undefined = updates.status
  const branch = decisionBranch(clientId, versionId, decisionId)
  const dPath = decisionPath(clientId, versionId, decisionId)
  const ids = { 'client-id': clientId, 'version-id': versionId, 'decision-id': decisionId }

  if (newStatus === 'rejected') {
    // Read full decision (branch, else main), write to main for history, drop branch.
    const { content: current, sha } = await readDecisionDoc(gh, dPath, branch)
    const updated = { ...current, ...updates }
    await gh.writeJson(dPath, updated, `Reject ${decisionId}`, { sha, branch: BASE })
    await gh.deleteBranch(branch)
    await syncIndex(gh, clientId, versionId, decisionId, {
      title: updated.title,
      status: 'rejected',
      scope: updated.scope,
    })
    return { ok: true, decisionId, status: 'rejected' }
  }

  if (newStatus === 'committed') {
    // File is already on main (put there by the PR merge) — sync index, then
    // best-effort stamp the committed status onto the doc.
    await syncIndex(gh, clientId, versionId, decisionId, updates)
    try {
      const { content: current, sha } = await gh.readJson<Doc>(dPath, BASE)
      const updated = { ...current, ...updates }
      await gh.writeJson(dPath, updated, `Commit ${decisionId}`, { sha, branch: BASE })
    } catch {
      /* best-effort post-merge status update */
    }
    return { ok: true, decisionId, status: 'committed' }
  }

  // In-flight status (draft/proposed/accepted/staged) — update on the branch.
  const { content: current, sha } = await readDecisionDoc(gh, dPath, branch)
  const updated = { ...current, ...updates }
  await gh.writeJson(dPath, updated, `Update ${decisionId}: status → ${newStatus ?? 'updated'}`, {
    sha,
    branch,
  })

  if (newStatus) {
    await syncIndex(gh, clientId, versionId, decisionId, {
      title: updated.title,
      status: newStatus,
      scope: updated.scope,
    })
  }

  // Dispatch the matching workflow on a status transition.
  if (newStatus === 'proposed') await gh.dispatch('decisions-to-proposed.yml', ids)
  else if (newStatus === 'accepted') await gh.dispatch('decisions-to-accepted.yml', ids)
  else if (newStatus === 'staged') await gh.dispatch('decisions-apply-changes.yml', ids)

  return { ok: true, decisionId, status: newStatus }
}

// Keys that must never be used to index into a parsed document (prototype
// pollution guard for the attacker-influenced sectionKey).
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

async function updateFinding(
  gh: GitHubClient,
  { clientId, versionId, decisionId, sectionKey, findingIndex, review }: Doc
): Promise<Doc> {
  if (typeof sectionKey !== 'string' || FORBIDDEN_KEYS.has(sectionKey)) {
    throw new HttpError('Invalid sectionKey', 400)
  }
  const idx = Number(findingIndex)
  if (!Number.isInteger(idx) || idx < 0) throw new HttpError('Invalid findingIndex', 400)

  const branch = decisionBranch(clientId, versionId, decisionId)
  const dPath = decisionPath(clientId, versionId, decisionId)
  const { content, sha, ref } = await readDecisionDoc(gh, dPath, branch)

  const section = content[sectionKey]
  if (!section?.[idx]) throw new HttpError(`Finding ${sectionKey}[${idx}] not found`, 404)

  if (review === null || review === undefined) delete section[idx].review
  else section[idx].review = review

  await gh.writeJson(
    dPath,
    content,
    `${review ?? 'clear'} finding ${idx} in ${decisionId} ${sectionKey}`,
    { sha, branch: ref }
  )
  return { ok: true }
}

// Updates the editable fields of a DRAFT decision on its branch and re-dispatches
// narrative review so findings are refreshed.
async function editDecision(
  gh: GitHubClient,
  { clientId, versionId, decisionId, title, context, problem, proposal, requirements, scope }: Doc
): Promise<Doc> {
  const branch = decisionBranch(clientId, versionId, decisionId)
  const dPath = decisionPath(clientId, versionId, decisionId)
  const { content: current, sha } = await readDecisionDoc(gh, dPath, branch)

  const updated: Doc = {
    ...current,
    title: title ?? current.title,
    context: context ?? current.context,
    problem: problem ?? current.problem,
    proposal: proposal ?? current.proposal,
    requirements: requirements ?? current.requirements,
  }
  updated.narrative = composeNarrative(updated)
  updated.activity = [...(current.activity ?? []), nowEntry('Updated')]
  if (scope !== undefined) {
    if (scope) updated.scope = scope
    else delete updated.scope
  }
  if (!updated.requirements?.length) delete updated.requirements

  await gh.writeJson(dPath, updated, `Edit ${decisionId}: ${updated.title}`, { sha, branch })
  await syncIndex(gh, clientId, versionId, decisionId, {
    title: updated.title,
    status: updated.status,
    scope: updated.scope,
  })
  await gh.dispatch('decisions-to-draft.yml', {
    'client-id': clientId,
    'version-id': versionId,
    'decision-id': decisionId,
  })

  return { ok: true, decisionId }
}

function toPrNumber(v: unknown): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  if (!Number.isInteger(n) || n <= 0) throw new HttpError('Invalid prNumber', 400)
  return n
}

async function commitDecision(
  gh: GitHubClient,
  { clientId, versionId, decisionId, prNumber }: Doc
): Promise<Doc> {
  const pr = toPrNumber(prNumber)
  if (pr) {
    await gh.mergePull(pr, {
      title: `Commit ${decisionId}: merge architecture changes`,
      method: 'squash',
    })
  }
  // PR merge brings decision.json to main — update its status and sync index.
  await updateDecision(gh, { clientId, versionId, decisionId, updates: { status: 'committed' } })
  // The PR is merged (and closed); remove the now-redundant decision branch.
  if (pr) await gh.deleteBranch(decisionBranch(clientId, versionId, decisionId))
  return { ok: true, decisionId, status: 'committed' }
}

// ── Discovery actions ───────────────────────────────────────────────────────────
// Discovery records live on main (no branch).

async function readDiscoveriesIndex(
  gh: GitHubClient,
  clientId: string,
  versionId: string
): Promise<{ content: Doc; sha?: string }> {
  try {
    return await gh.readJson<Doc>(discoveriesIndexPath(clientId, versionId), BASE)
  } catch {
    return { content: { discoveries: [] }, sha: undefined }
  }
}

async function syncDiscoveryIndex(
  gh: GitHubClient,
  clientId: string,
  versionId: string,
  discoveryId: string,
  { title, status, scope }: { title?: string; status?: string; scope?: Scope }
): Promise<void> {
  const iPath = discoveriesIndexPath(clientId, versionId)
  const { content: index, sha } = await readDiscoveriesIndex(gh, clientId, versionId)
  const list: Doc[] = index.discoveries ?? (index.discoveries = [])
  const i = list.findIndex((d) => d['discovery-id'] === discoveryId)
  const existing: Doc = i >= 0 ? list[i] : {}
  const entry: Doc = {
    'discovery-id': discoveryId,
    title: title ?? existing.title ?? '',
    status: status ?? existing.status ?? 'active',
    ...((scope ?? existing.scope) ? { scope: scope ?? existing.scope } : {}),
  }
  if (i >= 0) list[i] = entry
  else list.push(entry)
  await gh.writeJson(iPath, index, `Sync ${discoveryId} in discovery index (${entry.status})`, {
    sha,
    branch: BASE,
  })
}

async function nextDiscoveryId(
  gh: GitHubClient,
  clientId: string,
  versionId: string
): Promise<string> {
  const { content } = await readDiscoveriesIndex(gh, clientId, versionId)
  const max = (content.discoveries ?? []).reduce((m: number, d: Doc) => {
    const n = parseInt(String(d['discovery-id']).replace('DSC-', ''), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `DSC-${String(max + 1).padStart(3, '0')}`
}

async function createDiscovery(
  gh: GitHubClient,
  { clientId, versionId, discovery }: Doc
): Promise<Doc> {
  const discoveryId = await nextDiscoveryId(gh, clientId, versionId)
  const record: Doc = {
    $schema: 'urn:pickle:schemas:discovery',
    'discovery-id': discoveryId,
    title: discovery.title,
    status: 'active',
    context: discovery.context,
    request: discovery.request,
    ...(discovery.scope ? { scope: discovery.scope } : {}),
    activity: [nowEntry('Created')],
  }
  await gh.writeJson(
    discoveryPath(clientId, versionId, discoveryId),
    record,
    `Add ${discoveryId}: ${record.title}`,
    { branch: BASE }
  )
  await syncDiscoveryIndex(gh, clientId, versionId, discoveryId, record)
  await gh.dispatch('discovery-to-active.yml', {
    'client-id': clientId,
    'version-id': versionId,
    'discovery-id': discoveryId,
  })
  return { ok: true, discoveryId }
}

async function updateDiscovery(
  gh: GitHubClient,
  { clientId, versionId, discoveryId, updates }: Doc
): Promise<Doc> {
  const dPath = discoveryPath(clientId, versionId, discoveryId)
  const { content: current, sha } = await gh.readJson<Doc>(dPath, BASE)
  const updated = { ...current, ...updates }
  updated.activity = [
    ...(current.activity ?? []),
    nowEntry(updates.status === 'archived' ? 'Archived' : 'Updated'),
  ]
  await gh.writeJson(
    dPath,
    updated,
    `Update ${discoveryId}${updates.status ? `: status → ${updates.status}` : ''}`,
    { sha, branch: BASE }
  )
  await syncDiscoveryIndex(gh, clientId, versionId, discoveryId, {
    title: updated.title,
    status: updated.status,
    scope: updated.scope,
  })
  // Editing the question (title/context/request) regenerates the point-in-time
  // view: re-dispatch the Virtual Architect Agent against the revised request.
  const contentEdited = ['title', 'context', 'request'].some((k) => k in updates)
  if (contentEdited && updated.status === 'active') {
    await gh.dispatch('discovery-to-active.yml', {
      'client-id': clientId,
      'version-id': versionId,
      'discovery-id': discoveryId,
    })
  }
  return { ok: true, discoveryId, status: updated.status, regenerating: contentEdited }
}

// Re-runs the Virtual Architect Agent against the current architecture to
// regenerate the point-in-time findings, and re-activates the record.
async function refreshDiscovery(
  gh: GitHubClient,
  { clientId, versionId, discoveryId }: Doc
): Promise<Doc> {
  const dPath = discoveryPath(clientId, versionId, discoveryId)
  const { content: current, sha } = await gh.readJson<Doc>(dPath, BASE)
  const updated: Doc = {
    ...current,
    status: 'active',
    activity: [...(current.activity ?? []), nowEntry('Updated', 'Refresh requested')],
  }
  await gh.writeJson(dPath, updated, `Refresh ${discoveryId}: regenerate findings`, {
    sha,
    branch: BASE,
  })
  await syncDiscoveryIndex(gh, clientId, versionId, discoveryId, {
    title: updated.title,
    status: updated.status,
    scope: updated.scope,
  })
  await gh.dispatch('discovery-to-active.yml', {
    'client-id': clientId,
    'version-id': versionId,
    'discovery-id': discoveryId,
  })
  return { ok: true, discoveryId }
}

// ── Identifier safety ───────────────────────────────────────────────────────────
// Path-segment identifiers from the request flow into repository paths
// (architectures/clients/<clientId>/<versionId>/…). Reject anything that isn't a
// plain id — and specifically any `..` — so a crafted value can't traverse out of
// the architectures tree. (Dots are allowed for versions like `1.0.0`.)
const SAFE_ID = /^[A-Za-z0-9._-]+$/
function assertSafeIds(params: Record<string, unknown>): void {
  for (const k of ['clientId', 'versionId', 'decisionId', 'discoveryId']) {
    const v = params[k]
    if (v == null) continue
    const s = String(v)
    if (!SAFE_ID.test(s) || s.includes('..') || s === '.') {
      throw new HttpError(`Invalid ${k}`, 400)
    }
  }
}

// ── Handler ─────────────────────────────────────────────────────────────────────

type Action = (gh: GitHubClient, params: Doc) => Promise<Doc>

const GET_ACTIONS: Record<string, Action> = {
  'next-id': getNextId,
}
const POST_ACTIONS: Record<string, Action> = {
  'create-decision': createDecision,
  'edit-decision': editDecision,
  'update-decision': updateDecision,
  'update-finding': updateFinding,
  'commit-decision': commitDecision,
  'create-discovery': createDiscovery,
  'update-discovery': updateDiscovery,
  'refresh-discovery': refreshDiscovery,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS: this endpoint performs repository writes with the server token, so it
  // must not be callable cross-origin by arbitrary sites. Same-origin requests
  // (the SPA itself) need no ACAO header; only allow-listed origins
  // (API_ALLOWED_ORIGINS, comma-separated) are reflected. NB: CORS is a browser
  // control only — real auth is tracked under RAS-2.
  const origin = req.headers?.origin
  const allowOrigins = (process.env.API_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (origin && allowOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const cfg = getGitHubConfig()
  if (!cfg) {
    return res.status(503).json({
      error: 'GitHub integration not configured',
      missing: missingGitHubEnv(),
    })
  }
  const gh = new GitHubClient(cfg)

  try {
    if (req.method === 'GET') {
      const { action, ...params } = req.query as Doc
      assertSafeIds(params)
      if (action === 'config') {
        return res.json({
          owner: gh.owner,
          repo: gh.repo,
          env: process.env.VERCEL_ENV ?? null,
          branchUrl: process.env.VERCEL_BRANCH_URL ?? null,
        })
      }
      const fn = GET_ACTIONS[action as string]
      if (!fn) return res.status(400).json({ error: `Unknown GET action: ${action}` })
      return res.json(await fn(gh, params))
    }

    if (req.method === 'POST') {
      const { action, ...params } = (req.body ?? {}) as Doc
      assertSafeIds(params)
      const fn = POST_ACTIONS[action as string]
      if (!fn) return res.status(400).json({ error: `Unknown POST action: ${action}` })
      return res.json(await fn(gh, params))
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    const e = err as HttpError
    console.error('[/api/github]', e.message)
    return res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}
