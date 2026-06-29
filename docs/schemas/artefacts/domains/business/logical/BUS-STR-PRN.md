# BUS-STR-PRN: Business Architecture Strategy ↔ Principles Matrix

**File:** [`/config/schemas/artefacts/domains/business/logical/BUS-STR-PRN.json`](../../../../../../config/schemas/artefacts/domains/business/logical/BUS-STR-PRN.json)
**Architecture Domain / Layer:** Business / Logical
**Format:** Matrix

## Purpose

Maps each [BUS-STR](../conceptual/BUS-STR.md) strategy statement to the [BUS-PRN](BUS-PRN.md) principles that operationalise it, in a many-to-many relationship. Columns are BUS-STR strategies, rows are BUS-PRN principles. Answers *"which principles exist to deliver this strategy?"* and *"which strategy does this principle serve?"*

## Shape

Relationships are stored as a **sparse list**: only required (checked) cells are listed. An entry's presence means the principle is required to operationalise the strategy; absence means no required relationship.

## Example

```json
{
    "relationships": [
        {
            "column-id": "BUS-STR-001",
            "row-id": "BUS-PRN-001",
            "rationale": "Capability-based organisation is the structural foundation for shifting from functional silos to customer-centric, end-to-end teams."
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | ID of the BUS-STR strategy (column) |
| `row-id` | string | yes | ID of the BUS-PRN principle (row) |
| `rationale` | string | no | Why this relationship exists |
