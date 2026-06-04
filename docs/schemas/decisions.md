# Decisions Index Schema

**File:** [`/schemas/decisions.json`](../../schemas/decisions.json)
**Validates:** `/architectures/clients/<client>/<version>/decisions/decisions.json`

## Purpose

Authoritative list of decision IDs for a client version. Per-decision content (narrative, status, the seven analysis sections) lives in the corresponding `architectures/clients/<client>/<version>/decisions/<decision-id>/decision.json` — one folder per decision — this index intentionally only carries the IDs, mirroring the [clients](clients.md) / [versions](versions.md) pattern.

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
| `decisions[].decision-id` | string | yes | Unique identifier in the form `adr-NNN`. Must match the decision folder name under `decisions/` and the trailing segment of the decision branch name. |

## Conventions

- When raising a new decision (via a `decisions/<client>/<version>/<decision-id>` branch + matching JSON file), add a corresponding entry here in the same commit.
- The `decision-id` value must equal the decision folder name (e.g. folder `adr-001/` → `decision-id: "adr-001"`). The decision content always lives at `<decision-id>/decision.json`.
- This is the index that drives discovery — listing this file gives you the decisions for that version without scanning the folder.
