# INT-DAC-IFC — Data Domains & Concepts ↔ Interface Catalogue Matrix

**File:** [`/config/schemas/artefacts/domains/integration/logical/INT-DAC-IFC.json`](../../../../../../config/schemas/artefacts/domains/integration/logical/INT-DAC-IFC.json)
**Architecture Domain / Layer:** Integration / Logical
**Format:** Matrix

## Purpose

Maps each [INT-IFC](INT-IFC.md) interface to the conceptual data entities in the [Data Domains & Concepts Catalogue (DAT-DAC)](../../data/conceptual/DAT-DAC.md) that flow across it, in a many-to-many relationship. Columns are DAT-DAC concepts, rows are INT-IFC interfaces. Answers *"which interfaces carry this data concept?"* and *"which data concepts flow across this interface?"*

This is the second matrix to link artefacts from two different architecture domains (Data and Integration) and abstraction layers (Conceptual and Logical). It lives at the more downstream of the two on both axes — Integration, Logical — alongside its `rows` source, INT-IFC. See [Matrix placement](../../../../../output-formats.md#matrix-placement) for the general rule.

## Shape

Relationships are stored as a **sparse list** — only required (checked) cells are listed. An entry's presence means the concept flows across the interface; absence means no mapping (a concept with nothing mapped has no integration coverage; an interface with nothing mapped carries no modelled data concepts).

## Example

```json
{
    "relationships": [
        {
            "column-id": "CON-CUSTOMER",
            "row-id": "INT-IFC-001"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | ID of the DAT-DAC concept (column) |
| `row-id` | string | yes | ID of the INT-IFC interface (row) |
| `rationale` | string | no | Why this relationship exists |
