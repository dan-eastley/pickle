// Pure helpers for building GitHub Git-tree updates ([EDIT-2]). Kept free of I/O
// so the tree-shaping logic — which drives create-architecture and the
// clone-a-transition copy — is unit-tested deterministically. GitHubClient wraps
// these with the actual Trees API calls.

export interface TreeEntry {
  path: string
  mode: string
  type: string
  sha?: string
  content?: string
}

const withTrailingSlash = (p: string) => p.replace(/\/+$/, '') + '/'

// Re-point every blob under `fromPrefix` to sit under `toPrefix`, keeping each
// blob's mode and sha (so no content is re-uploaded — the copy references the
// existing blobs). Non-blobs and paths outside the prefix are dropped.
export function remapSubtree(tree: TreeEntry[], fromPrefix: string, toPrefix: string): TreeEntry[] {
  const from = withTrailingSlash(fromPrefix)
  const to = withTrailingSlash(toPrefix)
  return tree
    .filter((e) => e.type === 'blob' && e.sha && e.path.startsWith(from))
    .map((e) => ({ path: to + e.path.slice(from.length), mode: e.mode, type: 'blob', sha: e.sha }))
}

// True if any blob exists under `prefix` (used to detect an already-taken path).
export function subtreeExists(tree: TreeEntry[], prefix: string): boolean {
  const p = withTrailingSlash(prefix)
  return tree.some((e) => e.path === prefix || e.path.startsWith(p))
}

// New-file tree entries with inline content (GitHub creates the blobs).
export function fileEntries(files: { path: string; content: string }[]): TreeEntry[] {
  return files.map((f) => ({ path: f.path, mode: '100644', type: 'blob', content: f.content }))
}

// Merge base entries with overrides, where an override replaces any base entry at
// the same path (used so a cloned transition.json is overwritten with the new id).
export function mergeEntries(base: TreeEntry[], overrides: TreeEntry[]): TreeEntry[] {
  const overridePaths = new Set(overrides.map((o) => o.path))
  return [...base.filter((e) => !overridePaths.has(e.path)), ...overrides]
}
