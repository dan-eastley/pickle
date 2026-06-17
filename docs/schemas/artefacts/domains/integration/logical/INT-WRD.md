# INT-WRD — Integration Wiring Diagram

**File:** [`/config/schemas/artefacts/domains/integration/logical/INT-WRD.json`](../../../../../../config/schemas/artefacts/domains/integration/logical/INT-WRD.json)
**Architecture Domain / Layer:** Integration / Logical
**Format:** Diagram (`diagramType`: `wiring`)

## Purpose

A visual map of the integration landscape — the diagram counterpart of the [Interface Catalogue (INT-IFC)](INT-IFC.md), from which it is derived together with the [Application Domains & Platforms Catalogue (APP-DAP)](../../application/logical/APP-DAP.md).

The diagram has two views:

- **Landscape view** — all platforms shown as nodes grouped by application domain, with labelled edges between any two platforms that share at least one interface. Edge labels show the number of flows (interfaces) between that platform pair.
- **Per-pair view** — drill down into a specific source / target pair to see every individual interface, labelled with its ID and name, and annotated with its direction (`→`, `←`, or `↔`).

## Instance file

The instance file contains only the `$schema` reference. The diagram is fully derived at render time from INT-IFC and APP-DAP; no authored data is required.

```json
{
    "$schema": "urn:pickle:schemas:artefacts:domains:integration:logical:INT-WRD"
}
```

## Status

Rendered by [`WiringDiagram`](../../../../../../src/components/artefacts/diagrams/WiringDiagram.jsx) via [`DiagramView`](../../../../../../src/components/artefacts/DiagramView.jsx). Data is fetched live from INT-IFC and APP-DAP at render time — no separate data file to keep in sync.
