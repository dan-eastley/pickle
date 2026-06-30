# Architectures Index Schema

**File:** [`/schemas/architectures.json`](../../schemas/architectures.json)
**Validates:** [`/architectures/architectures.json`](../../architectures/architectures.json)

## Purpose

Authoritative list of architecture IDs held in this repository. Per-architecture metadata (name, etc.) lives in `architectures/<architecture>/architecture.json`, this index intentionally only carries the IDs.

## Example

```json
{
    "architectures": [
        { "architecture-id": "architecture-a" }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `architectures` | array | yes | List of architecture entries |
| `architectures[].architecture-id` | string | yes | Unique identifier: must match the architecture folder name |

## Conventions

- When adding a new architecture folder, add a matching entry here.
- When removing an architecture, remove its entry here too.
- The `architecture-id` value must equal the folder name under `architectures/`.
