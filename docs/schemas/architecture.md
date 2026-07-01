# Architecture Metadata Schema

**File:** [`/schemas/architecture.json`](../../schemas/architecture.json)
**Validates:** `/architectures/<architecture>/architecture.json`

## Purpose

Per-architecture metadata file living inside each architecture's folder. Carries human-readable information about the architecture. The plural index at [`architectures/architectures.json`](../../architectures/architectures.json) only lists IDs: names and other metadata live here.

## Example

```json
{
    "architecture-id": "architecture-a",
    "name": "Architecture A Name"
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `architecture-id` | string | yes | Unique identifier: must match the architecture folder name |
| `name` | string | yes | Human-readable architecture name |
| `status` | enum | no | `active` \| `archived` — lifecycle status |

## Conventions

- The `architecture-id` value must equal the parent folder name under `architectures/`.
- Add a matching entry to [`schemas/architectures.json`](../../architectures/architectures.json) (the index) when creating a new architecture folder.
