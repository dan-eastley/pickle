# BUS-BCM — Business Capability Model

**File:** [`/config/schemas/artefacts/domains/business/conceptual/BUS-BCM.json`](../../../../../../config/schemas/artefacts/domains/business/conceptual/BUS-BCM.json)
**Architecture Domain / Layer:** Business / Conceptual
**Format:** Diagram (`diagramType`: `card-based`)

## Purpose

A visual map of the organisation's capabilities, arranged as a nested card diagram — the diagram counterpart of the [Business Capabilities Catalogue (BUS-CAP)](BUS-CAP.md), from which it is derived.

The diagram renders in two parts:

1. **Overview** — each Level 1 capability as a group card, its Level 2 sub-capabilities as item cards within it. A single-slide view of the whole landscape.
2. **Drill-downs** — when Level 3 data is present, one diagram per Level 1 capability follows: its Level 2 sub-capabilities become the group cards, each containing its Level 3 capabilities.

The same two-part rendering applies to any nested-card diagram whose data carries three levels of hierarchy; with two levels, only the overview is shown.

## Example

```json
{
    "groups": [
        {
            "id": "CAP-001",
            "name": "Customer Management",
            "meta": { "importance": "differentiating" },
            "items": [
                {
                    "id": "CAP-001-01",
                    "name": "Acquire Customer",
                    "items": [
                        { "id": "CAP-001-01-01", "name": "Generate Leads" }
                    ]
                },
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
| `items[]` | array | no | Level 3 capabilities (see below). Omit when there are none |

### `groups[].items[].items[]` — Level 3 capabilities

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Level 3 capability ID, matching BUS-CAP |
| `name` | string | yes | Level 3 capability name, matching BUS-CAP |

`meta` objects at every level accept any additional properties — only `importance` is currently rendered, but the field is open-ended for future display attributes.

## Status

Rendered by [`NestedGroupDiagram`](../../../../../../src/components/artefacts/diagrams/NestedGroupDiagram.jsx) via [`DiagramView`](../../../../../../src/components/artefacts/DiagramView.jsx). Diagram data is kept in sync with BUS-CAP manually for now — a future architecture-change workflow should keep the two in step automatically.
