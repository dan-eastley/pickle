/**
 * Shared GitHub REST helper for the serverless API functions (and the dev shim).
 *
 * Centralises auth, the contents read/write dance, workflow dispatch, and branch
 * operations so the route handlers don't each thread `token`/`owner`/`repo`
 * through every call. Required env: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO.
 */

import { remapSubtree, fileEntries, mergeEntries } from './gitTree.js'
import type { TreeEntry } from './gitTree.js'

const GH_API = 'https://api.github.com'

export interface GitHubConfig {
  token: string
  owner: string
  repo: string
}

/** Resolve the GitHub config from the environment, or null if not configured. */
export function getGitHubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  if (!token || !owner || !repo) return null
  return { token, owner, repo }
}

/** Which of the required env vars are missing (for a helpful 503 payload). */
export function missingGitHubEnv(): string[] {
  return [
    !process.env.GITHUB_TOKEN && 'GITHUB_TOKEN',
    !process.env.GITHUB_OWNER && 'GITHUB_OWNER',
    !process.env.GITHUB_REPO && 'GITHUB_REPO',
  ].filter(Boolean) as string[]
}

/** Error carrying an HTTP status so handlers can map it to a response code. */
export class HttpError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 500) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
  }
}

export function b64encode(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64')
}
export function b64decode(str: string): string {
  return Buffer.from(str, 'base64').toString('utf-8')
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// Minimal shapes for the GitHub contents API responses we touch.
export interface GhContentFile {
  type: 'file'
  name: string
  path: string
  sha: string
  content?: string
  encoding?: string
}
export interface GhContentDirEntry {
  type: 'file' | 'dir' | 'symlink' | 'submodule'
  name: string
}
export type GhContents = GhContentFile | GhContentDirEntry[]

export class GitHubClient {
  private readonly token: string
  readonly owner: string
  readonly repo: string

  constructor({ token, owner, repo }: GitHubConfig) {
    this.token = token
    this.owner = owner
    this.repo = repo
  }

  /** Low-level call. Returns parsed JSON; throws HttpError on a non-2xx. */
  async request<T = unknown>(method: Method, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${GH_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) {
      throw new HttpError((json.message as string) ?? `GitHub ${res.status}`, res.status)
    }
    return json as T
  }

  private repoPath(suffix: string): string {
    return `/repos/${this.owner}/${this.repo}${suffix}`
  }

  /** Raw contents (a file object, or an array of entries for a directory). */
  getContents(path: string, ref = 'main'): Promise<GhContents> {
    return this.request<GhContents>(
      'GET',
      this.repoPath(`/contents/${path}?ref=${encodeURIComponent(ref)}`)
    )
  }

  /** Read and JSON-parse a file, returning its content and blob sha. */
  async readJson<T = Record<string, unknown>>(
    path: string,
    ref = 'main'
  ): Promise<{ content: T; sha: string }> {
    const f = (await this.getContents(path, ref)) as GhContentFile
    return { content: JSON.parse(b64decode(f.content ?? '')) as T, sha: f.sha }
  }

  /** Create or update a JSON file (pretty-printed, 4-space). */
  writeJson(
    path: string,
    content: unknown,
    message: string,
    opts: { sha?: string; branch?: string } = {}
  ): Promise<unknown> {
    return this.request('PUT', this.repoPath(`/contents/${path}`), {
      message,
      ...(opts.branch ? { branch: opts.branch } : {}),
      content: b64encode(JSON.stringify(content, null, 4)),
      ...(opts.sha ? { sha: opts.sha } : {}),
    })
  }

  /** Dispatch a workflow on the default branch. */
  async dispatch(workflow: string, inputs: Record<string, string>, ref = 'main'): Promise<void> {
    await this.request('POST', this.repoPath(`/actions/workflows/${workflow}/dispatches`), {
      ref,
      inputs,
    })
  }

  /** Current head sha of a branch. */
  async getHeadSha(branch: string): Promise<string> {
    const ref = await this.request<{ object: { sha: string } }>(
      'GET',
      this.repoPath(`/git/ref/heads/${encodeURIComponent(branch)}`)
    )
    return ref.object.sha
  }

  /** Create a branch at `fromSha`; ignores an "already exists" conflict. */
  async createBranch(branch: string, fromSha: string): Promise<void> {
    try {
      await this.request('POST', this.repoPath('/git/refs'), {
        ref: `refs/heads/${branch}`,
        sha: fromSha,
      })
    } catch (e) {
      if (!(e instanceof Error) || !e.message.includes('already exists')) throw e
    }
  }

  /** Delete a branch; ignores the case where it's already gone. */
  async deleteBranch(branch: string): Promise<void> {
    await this.request(
      'DELETE',
      this.repoPath(`/git/refs/heads/${encodeURIComponent(branch)}`)
    ).catch(() => {})
  }

  /** Merge a pull request. */
  async mergePull(
    prNumber: number,
    opts: { title?: string; method?: 'merge' | 'squash' | 'rebase' } = {}
  ): Promise<void> {
    await this.request('PUT', this.repoPath(`/pulls/${prNumber}/merge`), {
      ...(opts.title ? { commit_title: opts.title } : {}),
      merge_method: opts.method ?? 'squash',
    })
  }

  // ── Git Trees: multi-file and folder-copy commits ([EDIT-2]) ──────────────
  /** The recursive tree of `branch`, with its commit and tree shas. */
  async getBranchTree(
    branch: string
  ): Promise<{ commitSha: string; treeSha: string; tree: TreeEntry[]; truncated: boolean }> {
    const commitSha = await this.getHeadSha(branch)
    const commit = await this.request<{ tree: { sha: string } }>(
      'GET',
      this.repoPath(`/git/commits/${commitSha}`)
    )
    const treeRes = await this.request<{ tree: TreeEntry[]; truncated?: boolean }>(
      'GET',
      this.repoPath(`/git/trees/${commit.tree.sha}?recursive=1`)
    )
    return { commitSha, treeSha: commit.tree.sha, tree: treeRes.tree, truncated: !!treeRes.truncated }
  }

  private async commitTree(
    branch: string,
    message: string,
    entries: TreeEntry[],
    baseTreeSha: string,
    parentSha: string
  ): Promise<void> {
    const newTree = await this.request<{ sha: string }>('POST', this.repoPath('/git/trees'), {
      base_tree: baseTreeSha,
      tree: entries,
    })
    const newCommit = await this.request<{ sha: string }>('POST', this.repoPath('/git/commits'), {
      message,
      tree: newTree.sha,
      parents: [parentSha],
    })
    await this.request('PATCH', this.repoPath(`/git/refs/heads/${branch}`), { sha: newCommit.sha })
  }

  /** Create/update several files in a single commit. */
  async commitFiles(
    branch: string,
    message: string,
    files: { path: string; content: string }[]
  ): Promise<void> {
    const { commitSha, treeSha } = await this.getBranchTree(branch)
    await this.commitTree(branch, message, fileEntries(files), treeSha, commitSha)
  }

  /**
   * Copy every blob under `from` to `to` (referencing the existing blobs — no
   * content re-upload), applying `overrides` (new/replacement files), in one
   * commit. Used to clone a transition folder.
   */
  async cloneDir(
    branch: string,
    message: string,
    from: string,
    to: string,
    overrides: { path: string; content: string }[] = []
  ): Promise<void> {
    const { commitSha, treeSha, tree, truncated } = await this.getBranchTree(branch)
    if (truncated) throw new HttpError('Repository tree too large to copy in one request', 500)
    const entries = mergeEntries(remapSubtree(tree, from, to), fileEntries(overrides))
    await this.commitTree(branch, message, entries, treeSha, commitSha)
  }
}
