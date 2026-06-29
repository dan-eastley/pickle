# Version Metadata Schema

**File:** [`/schemas/version.json`](../../schemas/version.json)
**Validates:** `/architectures/clients/<client>/<version>/version.json`

## Purpose

Per-version metadata file living inside each version folder. Carries human-readable information and status for an architecture version (release baseline). The plural index at `architectures/clients/<client>/versions.json` only lists IDs: names and statuses live here.

## Example

```json
{
    "version-id": "1.0.0",
    "name": "Initial Baseline",
    "status": "draft"
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `version-id` | string | yes | Unique identifier: must match the version folder name (e.g. `"1.0.0"`) |
| `name` | string | yes | Human-readable name for this architecture version (e.g. release name) |
| `status` | enum | yes | `draft` \| `published` \| `archived` |

## Conventions

- The `version-id` value must equal the parent folder name under `architectures/clients/<client>/`.
- Add a matching entry to `architectures/clients/<client>/versions.json` (the index) when creating a new version folder.
- Do not edit a version's data after it is `published` or `archived`: create a new version folder instead.
