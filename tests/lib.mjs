// Shared helpers for the repo-level validation scripts (validate-schemas,
// validate-integrity). Pure fs/path utilities — no Claude, no secrets.
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Repository root (this file lives in tests/).
export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const read = (f) => JSON.parse(readFileSync(f, 'utf8'))

// Repo-relative path, for readable error messages.
export const rel = (f) => f.replace(REPO + '/', '')

// Every .json file under dir, recursively. [] when dir doesn't exist.
export function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    return e.isDirectory() ? walk(p) : p.endsWith('.json') ? [p] : []
  })
}

// Immediate subdirectory names of dir. [] when dir doesn't exist.
export const subdirs = (d) =>
  existsSync(d)
    ? readdirSync(d, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    : []
