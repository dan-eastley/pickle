# DAT-CDM — Conceptual Data Model

**File:** [`/config/schemas/artefacts/domains/data/conceptual/DAT-CDM.json`](../../../../../../config/schemas/artefacts/domains/data/conceptual/DAT-CDM.json)
**Architecture Domain / Layer:** Data / Conceptual
**Format:** Diagram (`diagramType`: `entity-based`)

## Purpose

A visual map of the organisation's key data concepts and how they relate — the diagram counterpart of the [Data Domains & Concepts Catalogue (DAT-DAC)](DAT-DAC.md), from which it is derived.

Each data domain is rendered as a group card; its conceptual data entities are rendered as item cards within it.

## Example

```json
{
    "groups": [
        {
            "id": "DAT-DOM-CUSTOMER",
            "name": "Customer",
            "items": [
                { "id": "CON-CUSTOMER", "name": "Customer" },
                { "id": "CON-ACCOUNT", "name": "Account" }
            ]
        }
    ]
}
```

## Fields

### `groups[]` — data domains

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Data domain ID, matching DAT-DAC |
| `name` | string | yes | Data domain name, matching DAT-DAC |
| `items[]` | array | yes | Conceptual data entities (see below) |

### `groups[].items[]` — conceptual data entities

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Conceptual data entity ID, matching DAT-DAC |
| `name` | string | yes | Conceptual data entity name, matching DAT-DAC |

`meta` objects on both groups and items accept any additional properties for future display attributes — none are currently rendered.

## Status

Rendered by [`NestedGroupDiagram`](../../../../../../src/components/artefacts/diagrams/NestedGroupDiagram.jsx) via [`DiagramView`](../../../../../../src/components/artefacts/DiagramView.jsx). Diagram data is kept in sync with DAT-DAC manually for now — a future architecture-change workflow should keep the two in step automatically.
