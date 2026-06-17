# BUS-BPM — Business Process Model

**File:** [`/config/schemas/artefacts/domains/business/conceptual/BUS-BPM.json`](../../../../../../config/schemas/artefacts/domains/business/conceptual/BUS-BPM.json)
**Architecture Domain / Layer:** Business / Conceptual
**Format:** Diagram (`diagramType`: `card-based`)

## Purpose

A visual nested-card diagram of the organisation's key processes — the diagram counterpart of the [Business Processes Catalogue (BUS-PRO)](BUS-PRO.md), from which it is derived.

The diagram has two views:

- **Overview** — all 9 Level 1 process groups as cards, each containing their Level 2 processes. Rendered as a single grid of group cards.
- **Per-Level-1 drill-down** — one diagram per Level 1 process, showing its Level 2 processes as group cards, each containing their Level 3 steps.

## Instance file

Instance data is authored in the `groups` / `items` / `items` (subitems) format that mirrors the BUS-PRO hierarchy:

```json
{
    "$schema": "urn:pickle:schemas:artefacts:domains:business:conceptual:BUS-BPM",
    "groups": [
        {
            "id": "PROC-001",
            "name": "Customer Lifecycle Management",
            "items": [
                {
                    "id": "PROC-001-01",
                    "name": "Acquire New Customers",
                    "items": [
                        { "id": "PROC-001-01-01", "name": "Generate Sales Leads" },
                        { "id": "PROC-001-01-02", "name": "Process Customer Applications" }
                    ]
                }
            ]
        }
    ]
}
```

## Rendering

Rendered by [`NestedGroupDiagram`](../../../../../../src/components/artefacts/diagrams/NestedGroupDiagram.jsx) via [`DiagramView`](../../../../../../src/components/artefacts/DiagramView.jsx). The overview and per-Level-1 drill-downs share the same component and layout algorithm as BUS-BCM.
