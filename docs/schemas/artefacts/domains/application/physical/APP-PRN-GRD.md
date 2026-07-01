# APP-PRN-GRD: Application Architecture Principles ↔ Guardrails Matrix

**File:** [`/config/schemas/artefacts/domains/application/physical/APP-PRN-GRD.json`](../../../../../../config/schemas/artefacts/domains/application/physical/APP-PRN-GRD.json)
**Architecture Domain / Layer:** Application / Physical
**Format:** Matrix

## Purpose

Maps each [APP-PRN](../logical/APP-PRN.md) principle to the [APP-GRD](APP-GRD.md) guardrails that make it concrete and enforceable, in a many-to-many relationship. Columns are APP-PRN principles, rows are APP-GRD guardrails. Answers *"which guardrails exist to enforce this principle?"* and *"which principle does this guardrail enforce?"*

## Shape

Relationships are stored as a **sparse list**: only required (checked) cells are listed. An entry's presence means the guardrail is required to enforce the principle; absence means no required relationship.

APP-GRD is currently empty for this client/version, so this matrix ships with no relationships. It will populate once guardrails are defined.

## Example

```json
{
    "relationships": [
        {
            "column-id": "APP-PRN-001",
            "row-id": "APP-GRD-001",
            "rationale": "..."
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | ID of the APP-PRN principle (column) |
| `row-id` | string | yes | ID of the APP-GRD guardrail (row) |
| `rationale` | string | no | Why this relationship exists |
