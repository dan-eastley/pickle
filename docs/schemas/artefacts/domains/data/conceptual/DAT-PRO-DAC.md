# DAT-PRO-DAC — Business Processes ↔ Data Domains & Concepts

**File:** [`/config/schemas/artefacts/domains/data/conceptual/DAT-PRO-DAC.json`](../../../../../../config/schemas/artefacts/domains/data/conceptual/DAT-PRO-DAC.json)
**Architecture Domain / Layer:** Data / Conceptual
**Format:** Matrix

## Purpose

The classic **CRUD matrix**. Maps [BUS-PRO](../../business/conceptual/BUS-PRO.md) business processes (Level 1) to [DAT-DAC](DAT-DAC.md) conceptual data entities, annotated with the **Create / Read / Update / Delete** operations each process performs. It answers: *which processes act on which data, and how?*

This is the bridge between **how the business operates** (process) and **the data it acts on** (concept), and a primary input to data-ownership, system-of-record, and impact-analysis decisions:

- The process that **C**reates an entity is a strong candidate for its **data owner**.
- Entities no process touches are **orphan data**; entities created by many processes are **ungoverned**.
- Changing a process or an entity, you can read the blast radius straight off the matrix.

## Matrix placement

Per [Matrix placement](../../../../output-formats.md#matrix-placement): the sources are BUS-PRO (business/conceptual) and DAT-DAC (data/conceptual). Data is more downstream on the domain axis (Business < Data) and the layers are equal, so the **home** is DAT-DAC — the matrix lives at **data/conceptual**, DAT-DAC's `concepts` are the `rows`, and BUS-PRO's `processes` are the `columns`. ID = `DAT-PRO-DAC`.

## Matrix axes

| Axis | Source | Array | Filter |
|---|---|---|---|
| Columns | BUS-PRO | `processes` | `level` in `[1]` |
| Rows | DAT-DAC | `concepts` | — |

## Relationship fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | BUS-PRO process ID |
| `row-id` | string | yes | DAT-DAC data concept ID |
| `operation` | string | no | CRUD operations performed — any combination of `C` `R` `U` `D` (pattern `^[CRUD]+$`), e.g. `"CRUD"`, `"R"`, `"RU"`. Rendered in the matrix cell. |
| `rationale` | string | no | Why this process acts on this entity |

## Example

```json
{
    "$schema": "urn:pickle:schemas:artefacts:domains:data:conceptual:DAT-PRO-DAC",
    "relationships": [
        {
            "column-id": "PROC-001",
            "row-id": "CON-CUSTOMER",
            "operation": "CRUD"
        },
        {
            "column-id": "PROC-006",
            "row-id": "CON-CUSTOMER",
            "operation": "R"
        }
    ]
}
```
