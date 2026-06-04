# Validate Structure

**File:** [`/.github/workflows/validate-structure.yml`](../../.github/workflows/validate-structure.yml)
**Script:** [`/.github/scripts/validate-structure.py`](../../.github/scripts/validate-structure.py)
**Trigger:** any push.

## Purpose

Walk the `architectures/` tree and assert that the folder/file layout stays in sync with the indexes — catches drift before it propagates.

## Invariants checked

| # | Invariant |
|---|---|
| 1 | `architectures/clients/clients.json` exists |
| 2 | Every `client-id` in `clients.json` has a matching `architectures/clients/<id>/` folder |
| 3 | Every `architectures/clients/<id>/` folder has an entry in `clients.json` (no orphans) |
| 4 | Each client folder has `client.json` and `versions.json` |
| 5 | The `client.json`'s `client-id` field equals the folder name |
| 6 | Every `version-id` in `versions.json` has a matching `<version>/` folder |
| 7 | Every `<version>/` folder has an entry in `versions.json` (no orphans) |
| 8 | Each version folder has `version.json`, `artefacts/`, `decisions/` |
| 9 | The `version.json`'s `version-id` field equals the folder name |
| 10 | Under `artefacts/domains/`, the 5 architecture-domain × 3 abstraction-layer grid is complete |
| 11 | Under `decisions/`, `decisions.json` exists |
| 12 | Every `decision-id` in `decisions.json` has a matching `<id>/decision.json` |
| 13 | Every `<id>/` folder under `decisions/` has an entry in `decisions.json` (no orphans) |

## Behaviour

The script reports every violation it finds (it does not stop at the first error) and exits non-zero if any are present. Successful runs print `Structure OK.`

## Why a workflow, not a schema?

JSON Schema validates the shape of individual files (`validate-schema` already does that). Structure validation answers a different question: *do the files exist where they should, and do the indexes agree with reality?* Those are filesystem/cross-file invariants — outside what JSON Schema can express on its own.

## How it stays maintainable

The script treats the indexes (`clients.json`, `versions.json`, `decisions.json`) as the source of truth. When you add a new client, version, or decision, you update its index — the structure check then enforces the matching folder/file exists. No separate manifest to keep in sync.
