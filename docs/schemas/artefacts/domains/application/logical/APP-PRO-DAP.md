# APP-PRO-DAP: Business Processes ↔ Application Domains & Platforms

**File:** [`/config/schemas/artefacts/domains/application/logical/APP-PRO-DAP.json`](../../../../../../config/schemas/artefacts/domains/application/logical/APP-PRO-DAP.json)
**Architecture Domain / Layer:** Application / Logical
**Format:** Matrix

## Purpose

Maps [BUS-PRO](../../business/conceptual/BUS-PRO.md) business processes (Level 1) to the [APP-DAP](APP-DAP.md) application platforms that support them. It answers: *which systems does each business process run on, and which processes depend on each platform?*

Together with [DAT-PRO-DAC](../../data/conceptual/DAT-PRO-DAC.md) (process ↔ data) it completes each process's "what data, what system" picture, and supports application rationalisation, resilience, and impact analysis.

## Matrix placement

Per [Matrix placement](../../../../output-formats.md#matrix-placement): the sources are BUS-PRO (business/conceptual) and APP-DAP (application/logical). APP-DAP is more downstream on both axes (Application > Business; Logical > Conceptual), so the **home** is APP-DAP, the matrix lives at **application/logical**, APP-DAP's `platforms` are the `rows`, and BUS-PRO's `processes` are the `columns`. ID = `APP-PRO-DAP`.

## Matrix axes

| Axis | Source | Array | Filter |
|---|---|---|---|
| Columns | BUS-PRO | `processes` | `level` in `[1]` |
| Rows | APP-DAP | `platforms` | — |

## Relationship fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | BUS-PRO process ID |
| `row-id` | string | yes | APP-DAP platform ID |
| `rationale` | string | no | Why this platform supports this process |

## Example

```json
{
    "$schema": "urn:pickle:schemas:artefacts:domains:application:logical:APP-PRO-DAP",
    "relationships": [
        { "column-id": "PROC-001", "row-id": "PLAT-CRM" },
        { "column-id": "PROC-006", "row-id": "PLAT-TARIFF-ENGINE" }
    ]
}
```
