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
| `architectures/architectures.json` | `schemas/architectures.json` |
| `architectures/<architecture>/transitions.json` | `schemas/transitions.json` |
| `architectures/<architecture>/architecture.json` | `schemas/architecture.json` |
| `architectures/<architecture>/<transition>/transition.json` | `schemas/transition.json` |
| `architectures/<architecture>/<transition>/artefacts/domains/<dom>/<layer>/<ID>/<ID>.json` | `schemas/artefacts/domains/<dom>/<layer>/<ID>.json` |

Files outside these mappings (e.g. schema files themselves) get a JSON-parse check only.

## Behaviour

- All changed JSON files are checked, even after the first failure, the script reports every issue, then exits non-zero if any failed.
- Deleted files are skipped.
- Expected schema path missing → reported as an error (likely a typo in the artefact-id folder name, or a missing schema).
