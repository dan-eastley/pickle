# SOL-STR-PRN — Solution Architecture Strategy ↔ Principles Matrix

**File:** [`/config/schemas/artefacts/domains/solution/logical/SOL-STR-PRN.json`](../../../../../../config/schemas/artefacts/domains/solution/logical/SOL-STR-PRN.json)
**Architecture Domain / Layer:** Solution / Logical
**Format:** Matrix

## Purpose

Maps each [SOL-STR](../conceptual/SOL-STR.md) strategy statement to the [SOL-PRN](SOL-PRN.md) principles that operationalise it, in a many-to-many relationship. Columns are SOL-STR strategies, rows are SOL-PRN principles. Answers *"which principles exist to deliver this strategy?"* and *"which strategy does this principle serve?"*

## Shape

Relationships are stored as a **sparse list** — only required (checked) cells are listed. An entry's presence means the principle is required to operationalise the strategy; absence means no required relationship.

## Example

```json
{
    "relationships": [
        {
            "column-id": "SOL-STR-001",
            "row-id": "SOL-PRN-001",
            "rationale": "Proving value end-to-end within 90 days depends on a single team owning the solution from design through operation, without handovers."
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | ID of the SOL-STR strategy (column) |
| `row-id` | string | yes | ID of the SOL-PRN principle (row) |
| `rationale` | string | no | Why this relationship exists |
