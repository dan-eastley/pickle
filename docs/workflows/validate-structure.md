# Validate Structure

**File:** [`/.github/workflows/validate-structure.yml`](../../.github/workflows/validate-structure.yml)
**Script:** [`/.github/scripts/validate-structure.py`](../../.github/scripts/validate-structure.py)
**Trigger:** any push.

## Purpose

Walk the `architectures/` tree and assert that the folder/file layout stays in sync with the indexes: catches drift before it propagates.

## Invariants checked

| # | Invariant |
|---|---|
| 1 | `architectures/architectures.json` exists |
| 2 | Every `client-id` in `architectures.json` has a matching `architectures/<id>/` folder |
| 3 | Every `architectures/<id>/` folder has an entry in `architectures.json` (no orphans) |
| 4 | Each client folder has `architecture.json` and `transitions.json` |
| 5 | The `architecture.json`'s `client-id` field equals the folder name |
| 6 | Every `version-id` in `transitions.json` has a matching `<transition>/` folder |
| 7 | Every `<transition>/` folder has an entry in `transitions.json` (no orphans) |
| 8 | Each version folder has `transition.json`, `artefacts/`, `decisions/` |
| 9 | The `transition.json`'s `version-id` field equals the folder name |
| 10 | Under `artefacts/domains/`, the 5 architecture-domain × 3 abstraction-layer grid is complete |
| 11 | Under `decisions/`, `decisions.json` exists |
| 12 | Every `decision-id` in `decisions.json` has a matching `<id>/decision.json` |
| 13 | Every `<id>/` folder under `decisions/` has an entry in `decisions.json` (no orphans) |

## Behaviour

The script reports every violation it finds (it does not stop at the first error) and exits non-zero if any are present. Successful runs print `Structure OK.`

## Why a workflow, not a schema?

JSON Schema validates the shape of individual files (`validate-schema` already does that). Structure validation answers a different question: *do the files exist where they should, and do the indexes agree with reality?* Those are filesystem/cross-file invariants: outside what JSON Schema can express on its own.

## How it stays maintainable

The script treats the indexes (`architectures.json`, `transitions.json`, `decisions.json`) as the source of truth. When you add a new client, version, or decision, you update its index, the structure check then enforces the matching folder/file exists. No separate manifest to keep in sync.
