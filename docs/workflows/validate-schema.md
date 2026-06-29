# Validate Schema

**File:** [`/.github/workflows/validate-schema.yml`](../../.github/workflows/validate-schema.yml)
**Trigger:** any push.

## Purpose

For every `.json` file changed by the push, JSON-parse it (syntax check) and: where a schema applies: validate it against the matching JSON Schema using `jsonschema` (Draft 2020-12).

## Base-ref selection (what counts as a "change")

| Pushed branch | Diff base |
|---|---|
| `main` | `HEAD~1` |
| `develop`, `decisions/**` | `origin/main` |
| `features/**` | `origin/develop` |
| anything else | `origin/main` |

## Schema mapping (mirrored paths)

| Instance file | Schema |
|---|---|
| `architectures/clients/clients.json` | `schemas/clients.json` |
| `architectures/clients/<client>/versions.json` | `schemas/versions.json` |
| `architectures/clients/<client>/client.json` | `schemas/client.json` |
| `architectures/clients/<client>/<version>/version.json` | `schemas/version.json` |
| `architectures/clients/<client>/<version>/artefacts/domains/<dom>/<layer>/<ID>/<ID>.json` | `schemas/artefacts/domains/<dom>/<layer>/<ID>.json` |

Files outside these mappings (e.g. schema files themselves) get a JSON-parse check only.

## Behaviour

- All changed JSON files are checked, even after the first failure, the script reports every issue, then exits non-zero if any failed.
- Deleted files are skipped.
- Expected schema path missing → reported as an error (likely a typo in the artefact-id folder name, or a missing schema).
