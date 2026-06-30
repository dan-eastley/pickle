// L2 — Referential integrity. Deterministic cross-checks over the architecture
// data and config that JSON Schema alone can't express. No Claude, no secrets.
//
//   node tests/validate-integrity.mjs
//
// Checks:
//   - architectures / transitions indexes match the folders on disk
//   - discovery index matches the discovery records (ids + status)
//   - audience / author roles exist in config/roles.json
//   - artefact instance $schema URN mirrors its file path
//   - every catalogue/document instance exposes a content array (guards the
//     metadata-array root-detection regression)
import { readFileSync, readdirSync, existsSync, statSync } from 'fs'
import { join, resolve, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(__dirname, '..')
const A = resolve(REPO, 'architectures')
const read = (f) => JSON.parse(readFileSync(f, 'utf8'))
const subdirs = (d) => existsSync(d) ? readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name) : []
const META = new Set(['audience', 'author', 'activity'])

let errors = 0
const err = (m) => { console.log(`  ✖ ${m}`); errors++ }
const same = (a, b) => a.length === b.length && a.every(x => b.includes(x))

// ── Architectures index ↔ folders ───────────────────────────────────────────
const clientIds = read(join(A, 'architectures.json')).architectures.map(c => c['architecture-id'])
const clientFolders = subdirs(A)
if (!same(clientIds, clientFolders)) err(`architectures.json [${clientIds}] ≠ folders [${clientFolders}]`)

// ── Roles registry ──────────────────────────────────────────────────────────
const roleNames = new Set(read(resolve(REPO, 'config/roles.json')).roles.map(r => r.name))

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = join(dir, e.name)
    return e.isDirectory() ? walk(p) : (p.endsWith('.json') ? [p] : [])
  })
}

for (const client of clientFolders) {
  // ── Versions index ↔ folders ──
  const vPath = join(A, client, 'transitions.json')
  if (!existsSync(vPath)) { err(`${client}: missing transitions.json`); continue }
  const versionIds = read(vPath).transitions.map(v => v['transition-id'])
  const versionFolders = subdirs(join(A, client))
  if (!same(versionIds, versionFolders)) err(`${client}: versions.json [${versionIds}] ≠ folders [${versionFolders}]`)

  for (const version of versionFolders) {
    const root = join(A, client, version)

    // ── Discovery index ↔ records ──
    const dIdx = join(root, 'discovery', 'discovery.json')
    if (existsSync(dIdx)) {
      const idx = read(dIdx).discoveries ?? []
      const recFolders = subdirs(join(root, 'discovery'))
      for (const d of idx) {
        const f = join(root, 'discovery', d['discovery-id'], 'discovery.json')
        if (!existsSync(f)) { err(`${client}/${version}: discovery ${d['discovery-id']} in index but no record`); continue }
        const rec = read(f)
        if (rec.status !== d.status) err(`${client}/${version}: ${d['discovery-id']} status index=${d.status} record=${rec.status}`)
      }
      for (const folder of recFolders) {
        if (!idx.some(d => d['discovery-id'] === folder)) err(`${client}/${version}: discovery record ${folder} not in index`)
      }
    }

    // ── Artefact instances ──
    for (const f of walk(join(root, 'domains'))) {
      const data = read(f)
      const relParts = f.slice(join(root, 'domains').length + 1).replace(/\.json$/, '').split('/') // [domain, abstraction, ID]
      // $schema URN mirrors the path
      if (typeof data.$schema === 'string' && relParts.length === 3) {
        const expected = `urn:pickle:schemas:artefacts:domains:${relParts[0]}:${relParts[1]}:${relParts[2]}`
        if (data.$schema !== expected) err(`${f.replace(REPO + '/', '')}: $schema ${data.$schema} ≠ expected ${expected}`)
      }
      // If an instance has real (non-metadata) content, it must surface a
      // content array — otherwise the catalogue/document view renders empty.
      // Pure stubs (only $schema + metadata) are allowed (unpopulated artefact).
      const nonMeta = Object.keys(data).filter(k => k !== '$schema' && !META.has(k))
      if (nonMeta.length > 0 && !nonMeta.some(k => Array.isArray(data[k]))) {
        err(`${f.replace(REPO + '/', '')}: has content but no content array — would render empty`)
      }
      // audience / author roles valid — at the artefact level, and on each
      // document instance (documents carry their own audience/author roles).
      const checkRoles = (obj, where) => {
        for (const field of ['audience', 'author']) {
          for (const role of obj[field] ?? []) {
            if (!roleNames.has(role)) err(`${f.replace(REPO + '/', '')}${where}: ${field} role "${role}" not in config/roles.json`)
          }
        }
      }
      checkRoles(data, '')
      for (const doc of data.documents ?? []) checkRoles(doc, ` document ${doc.id ?? ''}`)
    }
  }
}

if (errors) { console.log(`\n✖ ${errors} integrity error(s).`); process.exit(1) }
console.log('✓ Referential integrity OK (indexes, roles, $schema mirroring, content arrays).')
