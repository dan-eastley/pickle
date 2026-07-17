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
 * SECURITY: this endpoint performs repository writes with the server token, so
 * every POST (write) is gated on a valid Better Auth session when auth is
 * configured, and activity is attributed to the signed-in user. Read-only GET
 * actions (next-id, config) are open. When auth is not configured (e.g. local
 * dev without a database), writes are allowed and attributed to 'System'.
 */
import { randomUUID } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { eq, and } from 'drizzle-orm'
import { GitHubClient, HttpError, getGitHubConfig, missingGitHubEnv } from '../lib/github.js'
import { getSessionUser, missingAuthEnv } from '../lib/auth.js'
import { sendInviteEmail } from '../lib/email.js'
import { db } from '../db/index.js'
import { architectureMembership, user } from '../db/schema.js'
import { can, ACTIONS, buildContext, ARCHITECTURE_ROLES } from '../lib/permissions.js'

const BASE = 'main'

// Fallback activity attribution when auth isn't configured (e.g. local dev
// without a database). When a session exists, the signed-in user is used.
const SYSTEM_ACTOR = 'System'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any>

interface Scope {
  domain?: string
  abstraction?: string
  artefact?: string
}

// ── Path + branch helpers ───────────────────────────────────────────────────────

function decisionPath(clientId: string, versionId: string, decisionId: string): string {
  return `architectures/${clientId}/${versionId}/decisions/${decisionId}/decision.json`
}
function indexPath(clientId: string, versionId: string): string {
  return `architectures/${clientId}/${versionId}/decisions/decisions.json`
}
function decisionBranch(clientId: string, versionId: string, decisionId: string): string {
  return `decisions/${clientId}/${versionId}/${decisionId}`
}
// Discovery records live on main (no per-record branch), unlike decisions.
function discoveryPath(clientId: string, versionId: string, discoveryId: string): string {
  return `architectures/${clientId}/${versionId}/discovery/${discoveryId}/discovery.json`
}
function discoveriesIndexPath(clientId: string, versionId: string): string {
  return `architectures/${clientId}/${versionId}/discovery/discovery.json`
}

function nowEntry(action: string, actor: string, notes?: string): Doc {
  return { timestamp: new Date().toISOString(), action, who: actor, ...(notes ? { notes } : {}) }
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
  { clientId, versionId, decisionId, updates }: Doc,
  actor: string = SYSTEM_ACTOR
): Promise<Doc> {
  const newStatus: string | undefined = updates.status
  const branch = decisionBranch(clientId, versionId, decisionId)
  const dPath = decisionPath(clientId, versionId, decisionId)
  const ids = { 'client-id': clientId, 'version-id': versionId, 'decision-id': decisionId }
  // Stamp a status transition into the activity log so it records who advanced it.
  const stamp = (doc: Doc): Doc => ({
    ...doc,
    activity: [
      ...((doc.activity as Doc[]) ?? []),
      nowEntry('Updated', actor, newStatus ? `Status → ${newStatus}` : 'Updated'),
    ],
  })

  if (newStatus === 'rejected') {
    // Read full decision (branch, else main), write to main for history, drop branch.
    const { content: current, sha } = await readDecisionDoc(gh, dPath, branch)
    const updated = stamp({ ...current, ...updates })
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
      const updated = stamp({ ...current, ...updates })
      await gh.writeJson(dPath, updated, `Commit ${decisionId}`, { sha, branch: BASE })
    } catch {
      /* best-effort post-merge status update */
    }
    return { ok: true, decisionId, status: 'committed' }
  }

  // In-flight status (draft/proposed/accepted/staged) — update on the branch.
  const { content: current, sha } = await readDecisionDoc(gh, dPath, branch)
  const updated = stamp({ ...current, ...updates })
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
  { clientId, versionId, decisionId, title, context, problem, proposal, requirements, scope }: Doc,
  actor: string
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
  updated.activity = [...(current.activity ?? []), nowEntry('Updated', actor)]
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
  { clientId, versionId, decisionId, prNumber }: Doc,
  actor: string = SYSTEM_ACTOR
): Promise<Doc> {
  const pr = toPrNumber(prNumber)
  if (pr) {
    await gh.mergePull(pr, {
      title: `Commit ${decisionId}: merge architecture changes`,
      method: 'squash',
    })
  }
  // PR merge brings decision.json to main — update its status and sync index,
  // recording the committer in the activity log.
  await updateDecision(gh, { clientId, versionId, decisionId, updates: { status: 'committed' } }, actor)
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
  { clientId, versionId, discovery }: Doc,
  actor: string
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
    activity: [nowEntry('Created', actor)],
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
  { clientId, versionId, discoveryId, updates }: Doc,
  actor: string
): Promise<Doc> {
  const dPath = discoveryPath(clientId, versionId, discoveryId)
  const { content: current, sha } = await gh.readJson<Doc>(dPath, BASE)
  const updated = { ...current, ...updates }
  updated.activity = [
    ...(current.activity ?? []),
    nowEntry(updates.status === 'archived' ? 'Archived' : 'Updated', actor),
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
  { clientId, versionId, discoveryId }: Doc,
  actor: string
): Promise<Doc> {
  const dPath = discoveryPath(clientId, versionId, discoveryId)
  const { content: current, sha } = await gh.readJson<Doc>(dPath, BASE)
  const updated: Doc = {
    ...current,
    status: 'active',
    activity: [...(current.activity ?? []), nowEntry('Updated', actor, 'Refresh requested')],
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
// (architectures/<clientId>/<versionId>/…). Reject anything that isn't a
// plain id — and specifically any `..` — so a crafted value can't traverse out of
// the architectures tree. (Dots are allowed in ids.)
const SAFE_ID = /^[A-Za-z0-9._-]+$/
function assertSafeIds(params: Record<string, unknown>): void {
  for (const k of ['clientId', 'versionId', 'decisionId', 'discoveryId', 'architectureId', 'transitionId']) {
    const v = params[k]
    if (v == null) continue
    const s = String(v)
    if (!SAFE_ID.test(s) || s.includes('..') || s === '.') {
      throw new HttpError(`Invalid ${k}`, 400)
    }
  }
}

// ── Handler ─────────────────────────────────────────────────────────────────────

type Action = (gh: GitHubClient, params: Doc, actor: string) => Promise<Doc>

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
  'update-architecture': updateArchitecture,
  'update-transition': updateTransition,
  'create-architecture': createArchitecture,
  'create-transition': createTransition,
  'grant-access': grantAccess,
  'revoke-access': revokeAccess,
}

// ── Architecture / transition metadata writes ───────────────────────────────────

// Edit an architecture's metadata (architectures/<id>/architecture.json). Only
// name / description / status / industry are editable; the id is immutable.
async function updateArchitecture(gh: GitHubClient, params: Doc, actor: string): Promise<Doc> {
  const { architectureId, ...updates } = params
  const path = `architectures/${architectureId}/architecture.json`
  const { content, sha } = await gh.readJson<Doc>(path, BASE)
  const next = { ...content }
  for (const k of ['name', 'description', 'status', 'industry']) {
    if (updates[k] !== undefined) next[k] = updates[k]
  }
  await gh.writeJson(path, next, `Update architecture ${architectureId} (${actor})`, { sha, branch: BASE })
  return { ok: true, architectureId }
}

// Edit a transition's metadata (architectures/<id>/<transition>/transition.json).
async function updateTransition(gh: GitHubClient, params: Doc, actor: string): Promise<Doc> {
  const { architectureId, transitionId, ...updates } = params
  const path = `architectures/${architectureId}/${transitionId}/transition.json`
  const { content, sha } = await gh.readJson<Doc>(path, BASE)
  const next = { ...content }
  for (const k of ['name', 'description', 'status', 'release-date']) {
    if (updates[k] !== undefined) next[k] = updates[k]
  }
  await gh.writeJson(path, next, `Update transition ${architectureId}/${transitionId} (${actor})`, {
    sha,
    branch: BASE,
  })
  return { ok: true, architectureId, transitionId }
}

// ── Create architecture / transition ([EDIT-2]) ─────────────────────────────────

const j = (o: unknown): string => JSON.stringify(o, null, 4)

// Seed a new, empty architecture in one commit: metadata + a single `baseline`
// transition (empty decisions/discovery indexes) + the architectures index.
async function createArchitecture(gh: GitHubClient, params: Doc, actor: string): Promise<Doc> {
  const { architectureId, name } = params
  if (!name || typeof name !== 'string') throw new HttpError('Name is required', 400)
  const idxPath = 'architectures/architectures.json'
  const { content: idx } = await gh.readJson<{ architectures?: Array<Record<string, string>> }>(
    idxPath,
    BASE
  )
  const list = idx.architectures ?? []
  if (list.some((a) => a['architecture-id'] === architectureId)) {
    throw new HttpError(`Architecture "${architectureId}" already exists`, 409)
  }
  const base = `architectures/${architectureId}`
  await gh.commitFiles(BASE, `Create architecture ${architectureId} (${actor})`, [
    { path: `${base}/architecture.json`, content: j({ 'architecture-id': architectureId, name, status: 'active' }) },
    { path: `${base}/transitions.json`, content: j({ transitions: [{ 'transition-id': 'baseline' }] }) },
    { path: `${base}/baseline/transition.json`, content: j({ 'transition-id': 'baseline', name: 'Baseline', status: 'draft' }) },
    { path: `${base}/baseline/decisions/decisions.json`, content: j({ decisions: [] }) },
    { path: `${base}/baseline/discovery/discovery.json`, content: j({ discoveries: [] }) },
    { path: idxPath, content: j({ architectures: [...list, { 'architecture-id': architectureId }] }) },
  ])
  return { ok: true, architectureId }
}

// Create a new transition by cloning an existing one (default `baseline`) in a
// single Git Trees commit, then overriding its metadata + the transitions index.
async function createTransition(gh: GitHubClient, params: Doc, actor: string): Promise<Doc> {
  const { architectureId, transitionId, name, fromTransitionId } = params
  if (!name || typeof name !== 'string') throw new HttpError('Name is required', 400)
  const from = (typeof fromTransitionId === 'string' && fromTransitionId) || 'baseline'
  const idxPath = `architectures/${architectureId}/transitions.json`
  const { content: idx } = await gh.readJson<{ transitions?: Array<Record<string, string>> }>(
    idxPath,
    BASE
  )
  const list = idx.transitions ?? []
  if (list.some((t) => t['transition-id'] === transitionId)) {
    throw new HttpError(`Transition "${transitionId}" already exists`, 409)
  }
  await gh.cloneDir(
    BASE,
    `Create transition ${architectureId}/${transitionId} from ${from} (${actor})`,
    `architectures/${architectureId}/${from}`,
    `architectures/${architectureId}/${transitionId}`,
    [
      {
        path: `architectures/${architectureId}/${transitionId}/transition.json`,
        content: j({ 'transition-id': transitionId, name, status: 'draft' }),
      },
      { path: idxPath, content: j({ transitions: [...list, { 'transition-id': transitionId }] }) },
    ]
  )
  return { ok: true, architectureId, transitionId }
}

// ── Access management ([RAS-3]) ─────────────────────────────────────────────────

// Members of an architecture: their role + identity (for the Access UI).
async function listMembers(architectureId: string) {
  return db
    .select({
      userId: architectureMembership.userId,
      role: architectureMembership.role,
      email: user.email,
      name: user.name,
    })
    .from(architectureMembership)
    .innerJoin(user, eq(architectureMembership.userId, user.id))
    .where(eq(architectureMembership.architectureId, architectureId))
}

// Grant (or change) a user's role on an architecture, looked up by email.
async function grantAccess(
  gh: GitHubClient,
  params: Doc,
  actor: string = SYSTEM_ACTOR
): Promise<Doc> {
  const { architectureId, email, role } = params
  type Role = (typeof ARCHITECTURE_ROLES)[number]
  if (typeof role !== 'string' || !ARCHITECTURE_ROLES.includes(role as Role)) {
    throw new HttpError('Invalid role', 400)
  }
  const validRole = role as Role
  const em = String(email ?? '').trim().toLowerCase()
  if (!em) throw new HttpError('Email is required', 400)
  const [u] = await db.select().from(user).where(eq(user.email, em)).limit(1)
  if (!u) throw new HttpError(`No user found with email ${em}`, 404)
  await db
    .insert(architectureMembership)
    .values({ id: randomUUID(), userId: u.id, architectureId: String(architectureId), role: validRole })
    .onConflictDoUpdate({
      target: [architectureMembership.userId, architectureMembership.architectureId],
      set: { role: validRole, updatedAt: new Date() },
    })

  // Invite email (fire-and-forget). Resolve the architecture's display name;
  // fall back to its id if the metadata can't be read.
  let architectureName = String(architectureId)
  try {
    const meta = await gh.readJson<{ name?: string }>(
      `architectures/${architectureId}/architecture.json`
    )
    if (meta?.content?.name) architectureName = String(meta.content.name)
  } catch {
    /* fall back to id */
  }
  sendInviteEmail(u.email, {
    architectureName,
    architectureId: String(architectureId),
    role: validRole,
    inviterName: actor && actor !== SYSTEM_ACTOR ? actor : undefined,
  }).catch(() => {})

  return { ok: true, member: { userId: u.id, email: u.email, name: u.name, role: validRole } }
}

// Remove a user's membership from an architecture.
async function revokeAccess(_gh: GitHubClient, params: Doc): Promise<Doc> {
  const { architectureId, userId } = params
  await db
    .delete(architectureMembership)
    .where(
      and(
        eq(architectureMembership.userId, String(userId)),
        eq(architectureMembership.architectureId, String(architectureId))
      )
    )
  return { ok: true }
}

// ── Authorization ([RAS-3]) ─────────────────────────────────────────────────────

interface PermissionState {
  authenticated: boolean
  isAdmin: boolean
  memberships: Record<string, string>
  actor: string
  userId: string | null
}

function inAdminAllowlist(email?: string): boolean {
  const list = (process.env.PICKLE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return !!email && list.includes(email.toLowerCase())
}

// Resolve the caller's authorization state: authenticated?, global admin?, and
// their per-architecture memberships. Mirrors resolveActor's local-permissive
// behaviour (auth unconfigured or local dev → treated as admin), and is
// fail-soft on the membership query so an un-migrated DB can't 500 a write.
async function resolvePermissions(req: VercelRequest): Promise<PermissionState> {
  if (missingAuthEnv().length > 0) {
    return { authenticated: true, isAdmin: true, memberships: {}, actor: SYSTEM_ACTOR, userId: null }
  }
  const user = await getSessionUser(req.headers as Record<string, string | string[] | undefined>)
  if (!user) {
    if (process.env.VERCEL) {
      return { authenticated: false, isAdmin: false, memberships: {}, actor: SYSTEM_ACTOR, userId: null }
    }
    return { authenticated: true, isAdmin: true, memberships: {}, actor: SYSTEM_ACTOR, userId: null }
  }
  const isAdmin = user.accessTier === 'admin' || inAdminAllowlist(user.email)
  let memberships: Record<string, string> = {}
  try {
    const rows = await db
      .select()
      .from(architectureMembership)
      .where(eq(architectureMembership.userId, user.id))
    memberships = Object.fromEntries(rows.map((r) => [r.architectureId, r.role]))
  } catch {
    memberships = {} // table not migrated yet → no per-architecture rights
  }
  const actor =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.name || user.email
  return { authenticated: true, isAdmin, memberships, actor, userId: user.id }
}

// Per-action permission rule: which permission it needs and which param carries
// the architecture id. Actions absent here require only authentication. Decision
// and discovery writes are GOVERNANCE_WRITE (Owner/Contributor/Admin), so
// Consumers and non-members are view-only; the decision/discovery params carry
// the architecture id as `clientId`.
const ACTION_PERMS: Record<string, { perm: string; archKey: string }> = {
  'update-architecture': { perm: ACTIONS.ARCHITECTURE_EDIT, archKey: 'architectureId' },
  'update-transition': { perm: ACTIONS.TRANSITION_EDIT, archKey: 'architectureId' },
  'create-architecture': { perm: ACTIONS.ARCHITECTURE_CREATE, archKey: 'architectureId' },
  'create-transition': { perm: ACTIONS.TRANSITION_CREATE, archKey: 'architectureId' },
  'grant-access': { perm: ACTIONS.ACCESS_GRANT, archKey: 'architectureId' },
  'revoke-access': { perm: ACTIONS.ACCESS_GRANT, archKey: 'architectureId' },
  'create-decision': { perm: ACTIONS.GOVERNANCE_WRITE, archKey: 'clientId' },
  'edit-decision': { perm: ACTIONS.GOVERNANCE_WRITE, archKey: 'clientId' },
  'update-decision': { perm: ACTIONS.GOVERNANCE_WRITE, archKey: 'clientId' },
  'update-finding': { perm: ACTIONS.GOVERNANCE_WRITE, archKey: 'clientId' },
  'commit-decision': { perm: ACTIONS.GOVERNANCE_WRITE, archKey: 'clientId' },
  'create-discovery': { perm: ACTIONS.GOVERNANCE_WRITE, archKey: 'clientId' },
  'update-discovery': { perm: ACTIONS.GOVERNANCE_WRITE, archKey: 'clientId' },
  'refresh-discovery': { perm: ACTIONS.GOVERNANCE_WRITE, archKey: 'clientId' },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS: this endpoint performs repository writes with the server token, so it
  // must not be callable cross-origin by arbitrary sites. Same-origin requests
  // (the SPA itself) need no ACAO header; only allow-listed origins
  // (API_ALLOWED_ORIGINS, comma-separated) are reflected. CORS is a browser-only
  // control; the POST writes are additionally gated on a valid session below.
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
      // Current caller's authorization state, for the client to gate controls.
      if (action === 'permissions') {
        const { authenticated, isAdmin, memberships } = await resolvePermissions(req)
        return res.json({ authenticated, isAdmin, memberships })
      }
      // Members of an architecture — gated on the access-grant permission.
      if (action === 'members') {
        const perm = await resolvePermissions(req)
        const architectureId = params.architectureId as string | undefined
        if (!can(buildContext(perm), ACTIONS.ACCESS_GRANT, { architectureId })) {
          return res.status(403).json({ error: 'You do not have permission to do that' })
        }
        return res.json({ members: await listMembers(String(architectureId)) })
      }
      // GET actions (next-id, config) are read-only — no session required.
      const fn = GET_ACTIONS[action as string]
      if (!fn) return res.status(400).json({ error: `Unknown GET action: ${action}` })
      return res.json(await fn(gh, params, SYSTEM_ACTOR))
    }

    if (req.method === 'POST') {
      const { action, ...params } = (req.body ?? {}) as Doc
      assertSafeIds(params)
      const fn = POST_ACTIONS[action as string]
      if (!fn) return res.status(400).json({ error: `Unknown POST action: ${action}` })
      // Writes require a valid session (when auth is configured).
      const perm = await resolvePermissions(req)
      if (!perm.authenticated) {
        return res.status(401).json({ error: 'Authentication required' })
      }
      // Actions that declare a permission rule are additionally RBAC-gated ([RAS-3]).
      const rule = ACTION_PERMS[action as string]
      if (rule) {
        const architectureId = params[rule.archKey] as string | undefined
        if (!can(buildContext(perm), rule.perm, { architectureId })) {
          return res.status(403).json({ error: 'You do not have permission to do that' })
        }
      }
      const result = await fn(gh, params, perm.actor)
      // Creating an architecture grants the creator Owner ([RAS-3]/[EDIT-2]).
      if (action === 'create-architecture' && perm.userId && result?.architectureId) {
        try {
          await db.insert(architectureMembership).values({
            id: randomUUID(),
            userId: perm.userId,
            architectureId: String(result.architectureId),
            role: 'owner',
            grantedBy: perm.userId,
          })
        } catch {
          // Fail-soft: DB not migrated, or a duplicate membership — the write itself
          // succeeded; the grant can be reconciled later.
        }
      }
      return res.json(result)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    const e = err as HttpError
    console.error('[/api/github]', e.message)
    return res.status(e.statusCode ?? 500).json({ error: e.message })
  }
}
