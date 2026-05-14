# Decisions Index Schema

**File:** [`/schemas/decisions.json`](../../schemas/decisions.json)
**Validates:** `/architectures/<client>/<version>/decisions/decisions.json`

## Purpose

Authoritative list of decision IDs for a client version. Per-decision content (narrative, status, the seven analysis sections) lives in the corresponding `architectures/<client>/<version>/decisions/<decision-id>.json` — this index intentionally only carries the IDs, mirroring the [clients](clients.md) / [versions](versions.md) pattern.

## Example

```json
{
    "decisions": [
        { "decision-id": "adr-001" },
        { "decision-id": "adr-002" }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `decisions` | array | yes | List of decision entries |
| `decisions[].decision-id` | string | yes | Unique identifier — must match the decision JSON file name (without `.json`) and the trailing segment of the decision branch name |

## Conventions

- When raising a new decision (via a `decisions/<client>/<version>/<decision-id>` branch + matching JSON file), add a corresponding entry here in the same commit.
- The `decision-id` value must equal the JSON file name (e.g. `adr-001.json` → `decision-id: "adr-001"`).
- This is the index that drives discovery — listing this file gives you the decisions for that version without scanning the folder.
