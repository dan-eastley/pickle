# APP-DAP-DAC: Application Domains & Platforms ↔ Data Concepts

**File:** [`/config/schemas/artefacts/domains/application/logical/APP-DAP-DAC.json`](../../../../../../config/schemas/artefacts/domains/application/logical/APP-DAP-DAC.json)
**Architecture Domain / Layer:** Application / Logical
**Format:** Matrix

## Purpose

Maps [APP-DAP](APP-DAP.md) application platforms to the [DAT-DAC](../../data/conceptual/DAT-DAC.md) data concepts they hold or use. It answers: *which platform is the system of record for each data concept, which platforms merely consume it, and which systems are affected if a concept or platform changes?*

Together with [DAT-PRO-DAC](../../data/conceptual/DAT-PRO-DAC.md) (process ↔ data) it completes each concept's "who uses it, where it lives" picture, and exposes data ownership, duplication, and integration needs.

## Matrix placement

Per [Matrix placement](../../../../output-formats.md#matrix-placement): the sources are DAT-DAC (data/conceptual) and APP-DAP (application/logical). APP-DAP is more downstream on both axes (Application > Data domain here; Logical > Conceptual), so the **home** is APP-DAP, the matrix lives at **application/logical**, APP-DAP's `platforms` are the `rows`, and DAT-DAC's `concepts` are the `columns`. ID = `APP-DAP-DAC`.

## Matrix axes

| Axis | Source | Array | Filter |
|---|---|---|---|
| Columns | DAT-DAC | `concepts` | — |
| Rows | APP-DAP | `platforms` | — |

## Relationship fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | DAT-DAC data concept ID |
| `row-id` | string | yes | APP-DAP platform ID |
| `role` | enum | no | `system-of-record` \| `consumer` \| `reference` — how the platform relates to the concept |
| `rationale` | string | no | Why this platform holds or uses this concept |
