# Transition Metadata Schema

**File:** [`/schemas/transition.json`](../../schemas/transition.json)
**Validates:** `/architectures/<architecture>/<transition>/transition.json`

## Purpose

Per-transition metadata file living inside each transition folder. Carries human-readable information and status for an architecture transition state (e.g. baseline). The plural index at `architectures/<architecture>/transitions.json` only lists IDs: names and statuses live here.

## Example

```json
{
    "transition-id": "baseline",
    "name": "Baseline",
    "status": "draft"
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `transition-id` | string | yes | Unique identifier: must match the transition folder name (e.g. `"baseline"`) |
| `name` | string | yes | Human-readable name for this transition state (e.g. `"Baseline"`, `"Transition State 2026 Q2"`) |
| `status` | enum | yes | `draft` \| `published` \| `archived` |

## Conventions

- The `transition-id` value must equal the parent folder name under `architectures/<architecture>/`.
- Add a matching entry to `architectures/<architecture>/transitions.json` (the index) when creating a new transition folder.
- Do not edit a transition's data after it is `published` or `archived`: create a new transition folder instead.
