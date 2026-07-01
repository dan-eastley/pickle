# Transitions Index Schema

**File:** [`/schemas/transitions.json`](../../schemas/transitions.json)
**Validates:** `/architectures/<architecture>/transitions.json`

## Purpose

Authoritative list of transition IDs for an architecture. Per-transition metadata (name, status) lives in `architectures/<architecture>/<transition>/transition.json`, this index intentionally only carries the IDs.

## Example

```json
{
    "transitions": [
        { "transition-id": "baseline" }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `transitions` | array | yes | List of transition entries |
| `transitions[].transition-id` | string | yes | Unique identifier: must match the transition folder name (e.g. `"baseline"`) |

## Conventions

- When creating a new transition folder for an architecture, add a matching entry here.
- The `transition-id` value must equal the folder name under `architectures/<architecture>/`.
