# APP-DPM: Domains & Platforms Model

**File:** [`/config/schemas/artefacts/domains/application/logical/APP-DPM.json`](../../../../../../config/schemas/artefacts/domains/application/logical/APP-DPM.json)
**Architecture Domain / Layer:** Application / Logical
**Format:** Diagram (`diagramType`: `card-based`)

## Purpose

A visual map of the organisation's application landscape, the diagram counterpart of the [Application Domains & Platforms Catalogue (APP-DAP)](APP-DAP.md), from which it is derived.

Each application domain is rendered as a group card; its platforms are rendered as item cards within it.

## Example

```json
{
    "groups": [
        {
            "id": "APP-DOM-CUSTOMER",
            "name": "Customer Engagement",
            "items": [
                { "id": "PLAT-CRM", "name": "CRM" },
                { "id": "PLAT-DXP", "name": "Digital Experience Platform" }
            ]
        }
    ]
}
```

## Fields

### `groups[]`: application domains

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Application domain ID, matching APP-DAP |
| `name` | string | yes | Application domain name, matching APP-DAP |
| `items[]` | array | yes | Platforms (see below) |

### `groups[].items[]`: platforms

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Platform ID, matching APP-DAP |
| `name` | string | yes | Platform name, matching APP-DAP |

`meta` objects on both groups and items accept any additional properties for future display attributes: none are currently rendered.

## Status

Rendered by [`NestedGroupDiagram`](../../../../../../src/components/artefacts/diagrams/NestedGroupDiagram.jsx) via [`DiagramView`](../../../../../../src/components/artefacts/DiagramView.jsx). Diagram data is kept in sync with APP-DAP manually for now, a future architecture-change workflow should keep the two in step automatically.
