# APP-STR-PRN: Application Architecture Strategy ↔ Principles Matrix

**File:** [`/config/schemas/artefacts/domains/application/logical/APP-STR-PRN.json`](../../../../../../config/schemas/artefacts/domains/application/logical/APP-STR-PRN.json)
**Architecture Domain / Layer:** Application / Logical
**Format:** Matrix

## Purpose

Maps each [APP-STR](../conceptual/APP-STR.md) strategy statement to the [APP-PRN](APP-PRN.md) principles that operationalise it, in a many-to-many relationship. Columns are APP-STR strategies, rows are APP-PRN principles. Answers *"which principles exist to deliver this strategy?"* and *"which strategy does this principle serve?"*

## Shape

Relationships are stored as a **sparse list**: only required (checked) cells are listed. An entry's presence means the principle is required to operationalise the strategy; absence means no required relationship.

## Example

```json
{
    "relationships": [
        {
            "column-id": "APP-STR-001",
            "row-id": "APP-PRN-001",
            "rationale": "Twelve-factor patterns are the concrete baseline that makes an application cloud-native by design."
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | ID of the APP-STR strategy (column) |
| `row-id` | string | yes | ID of the APP-PRN principle (row) |
| `rationale` | string | no | Why this relationship exists |
