// L1 — Schema validation. Loads every JSON Schema under config/schemas/ into
// Ajv (keyed by $id so cross-file URN $refs like urn:pickle:schemas:roles and
// urn:pickle:schemas:scope resolve), then validates every architecture instance
// that declares a `$schema` URN against it.
//
//   node tests/validate-schemas.mjs
//
// Exits non-zero on any invalid schema or instance. No Claude, no secrets.
import { resolve } from 'path'
import { createRequire } from 'module'
import { REPO, read, rel, walk } from './lib.mjs'

const require = createRequire(resolve(REPO, 'src/package.json'))
const Ajv2020 = require('ajv/dist/2020').default
const addFormats = require('ajv-formats')

const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)

let errors = 0
const err = (msg) => { console.log(`  ✖ ${msg}`); errors++ }

// 1. Load all schemas by $id.
const schemaFiles = walk(resolve(REPO, 'config/schemas'))
const byId = {}
for (const f of schemaFiles) {
  let s
  try { s = read(f) } catch (e) { err(`${rel(f)}: invalid JSON — ${e.message}`); continue }
  if (!s.$id) { err(`${rel(f)}: schema has no $id`); continue }
  if (byId[s.$id]) { err(`${rel(f)}: duplicate $id ${s.$id} (also ${rel(byId[s.$id].file)})`); continue }
  byId[s.$id] = { schema: s, file: f }
  try { ajv.addSchema(s, s.$id) } catch (e) { err(`${rel(f)}: addSchema failed — ${e.message}`) }
}
console.log(`Loaded ${Object.keys(byId).length} schemas.`)

// 2. Compile each schema (catches invalid schemas + unresolved $refs).
let compiled = 0
for (const { schema, file } of Object.values(byId)) {
  try { ajv.getSchema(schema.$id) || ajv.compile(schema); compiled++ }
  catch (e) { err(`${rel(file)}: does not compile — ${e.message}`) }
}
console.log(`Compiled ${compiled}/${Object.keys(byId).length} schemas.`)

// 3. Validate every instance that declares a $schema URN.
const instances = walk(resolve(REPO, 'architectures'))
let validated = 0, skipped = 0
for (const f of instances) {
  let data
  try { data = read(f) } catch (e) { err(`${rel(f)}: invalid JSON — ${e.message}`); continue }
  const urn = typeof data.$schema === 'string' && data.$schema.startsWith('urn:pickle:') ? data.$schema : null
  if (!urn) { skipped++; continue }
  const validate = ajv.getSchema(urn)
  if (!validate) { err(`${rel(f)}: no schema found for ${urn}`); continue }
  if (!validate(data)) {
    err(`${rel(f)}: invalid vs ${urn}`)
    for (const e of (validate.errors ?? []).slice(0, 6)) console.log(`      ${e.instancePath || '/'} ${e.message}`)
  } else validated++
}
console.log(`Validated ${validated} instances (${skipped} without a $schema URN).`)

if (errors) { console.log(`\n✖ ${errors} schema/validation error(s).`); process.exit(1) }
console.log('\n✓ All schemas compile and all instances are valid.')
