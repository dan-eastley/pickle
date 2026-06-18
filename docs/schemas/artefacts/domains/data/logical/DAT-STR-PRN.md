# DAT-STR-PRN — Data Architecture Strategy ↔ Principles Matrix

**File:** [`/config/schemas/artefacts/domains/data/logical/DAT-STR-PRN.json`](../../../../../../config/schemas/artefacts/domains/data/logical/DAT-STR-PRN.json)
**Architecture Domain / Layer:** Data / Logical
**Format:** Matrix

## Purpose

Maps each [DAT-STR](../conceptual/DAT-STR.md) strategy statement to the [DAT-PRN](DAT-PRN.md) principles that operationalise it, in a many-to-many relationship. Columns are DAT-STR strategies, rows are DAT-PRN principles. Answers *"which principles exist to deliver this strategy?"* and *"which strategy does this principle serve?"*

## Shape

Relationships are stored as a **sparse list** — only required (checked) cells are listed. An entry's presence means the principle is required to operationalise the strategy; absence means no required relationship.

## Example

```json
{
    "relationships": [
        {
            "column-id": "DAT-STR-001",
            "row-id": "DAT-PRN-001",
            "rationale": "Publishing data assets as products requires each domain to have a single accountable owner responsible for the product."
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | ID of the DAT-STR strategy (column) |
| `row-id` | string | yes | ID of the DAT-PRN principle (row) |
| `rationale` | string | no | Why this relationship exists |
