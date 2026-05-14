# Versions Index Schema

**File:** [`/schemas/versions.json`](../../schemas/versions.json)
**Validates:** `/architectures/<client>/versions.json`

## Purpose

Authoritative list of version IDs for a client. Per-version metadata (name, status) lives in `architectures/<client>/<version>/version.json` — this index intentionally only carries the IDs.

## Example

```json
{
    "versions": [
        { "version-id": "1.0.0" }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `versions` | array | yes | List of version entries |
| `versions[].version-id` | string | yes | Unique identifier — must match the version folder name (e.g. `"1.0.0"`) |

## Conventions

- When creating a new version folder for a client, add a matching entry here.
- The `version-id` value must equal the folder name under `architectures/<client>/`.
