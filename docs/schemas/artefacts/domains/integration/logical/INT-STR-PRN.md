# INT-STR-PRN — Integration Architecture Strategy ↔ Principles Matrix

**File:** [`/config/schemas/artefacts/domains/integration/logical/INT-STR-PRN.json`](../../../../../../config/schemas/artefacts/domains/integration/logical/INT-STR-PRN.json)
**Architecture Domain / Layer:** Integration / Logical
**Format:** Matrix

## Purpose

Maps each [INT-STR](../conceptual/INT-STR.md) strategy statement to the [INT-PRN](INT-PRN.md) principles that operationalise it, in a many-to-many relationship. Columns are INT-STR strategies, rows are INT-PRN principles. Answers *"which principles exist to deliver this strategy?"* and *"which strategy does this principle serve?"*

## Shape

Relationships are stored as a **sparse list** — only required (checked) cells are listed. An entry's presence means the principle is required to operationalise the strategy; absence means no required relationship.

## Example

```json
{
    "relationships": [
        {
            "column-id": "INT-STR-001",
            "row-id": "INT-PRN-003",
            "rationale": "Every new exchange being a managed API depends on those APIs carrying semantic versions with a documented deprecation lifecycle."
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | ID of the INT-STR strategy (column) |
| `row-id` | string | yes | ID of the INT-PRN principle (row) |
| `rationale` | string | no | Why this relationship exists |
