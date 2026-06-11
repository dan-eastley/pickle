# BUS-BCM — Business Capability Model

**File:** [`/config/schemas/artefacts/domains/business/conceptual/BUS-BCM.json`](../../../../../../config/schemas/artefacts/domains/business/conceptual/BUS-BCM.json)
**Architecture Domain / Layer:** Business / Conceptual
**Format:** Diagram (`diagramType`: `card-based`)

## Purpose

A visual map of the organisation's capabilities, arranged as a nested card diagram — the diagram counterpart of the [Business Capabilities Catalogue (BUS-CAP)](BUS-CAP.md), from which it is derived.

Each Level 1 capability is rendered as a group card; its Level 2 sub-capabilities are rendered as item cards within it. Level 3 capabilities are out of scope for this single-slide view.

## Example

```json
{
    "groups": [
        {
            "id": "CAP-001",
            "name": "Customer Management",
            "meta": { "importance": "differentiating" },
            "items": [
                { "id": "CAP-001-01", "name": "Acquire Customer" },
                { "id": "CAP-001-02", "name": "Manage Customer Profile" }
            ]
        }
    ]
}
```

## Fields

### `groups[]` — Level 1 capabilities

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Level 1 capability ID, matching BUS-CAP |
| `name` | string | yes | Level 1 capability name, matching BUS-CAP |
| `meta.importance` | enum | no | `strategic` \| `differentiating` \| `foundational`, matching BUS-CAP. Rendered as a badge on the card |
| `items[]` | array | yes | Level 2 sub-capabilities (see below) |

### `groups[].items[]` — Level 2 sub-capabilities

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Level 2 capability ID, matching BUS-CAP |
| `name` | string | yes | Level 2 capability name, matching BUS-CAP |

`meta` objects on both groups and items accept any additional properties — only `importance` is currently rendered, but the field is open-ended for future display attributes.

## Status

Rendered by [`NestedGroupDiagram`](../../../../../../src/components/artefacts/diagrams/NestedGroupDiagram.jsx) via [`DiagramView`](../../../../../../src/components/artefacts/DiagramView.jsx). Diagram data is kept in sync with BUS-CAP manually for now — a future architecture-change workflow should keep the two in step automatically.
