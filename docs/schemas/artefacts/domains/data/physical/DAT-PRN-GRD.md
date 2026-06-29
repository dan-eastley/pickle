# DAT-PRN-GRD: Data Architecture Principles ↔ Guardrails Matrix

**File:** [`/config/schemas/artefacts/domains/data/physical/DAT-PRN-GRD.json`](../../../../../../config/schemas/artefacts/domains/data/physical/DAT-PRN-GRD.json)
**Architecture Domain / Layer:** Data / Physical
**Format:** Matrix

## Purpose

Maps each [DAT-PRN](../logical/DAT-PRN.md) principle to the [DAT-GRD](DAT-GRD.md) guardrails that make it concrete and enforceable, in a many-to-many relationship. Columns are DAT-PRN principles, rows are DAT-GRD guardrails. Answers *"which guardrails exist to enforce this principle?"* and *"which principle does this guardrail enforce?"*

## Shape

Relationships are stored as a **sparse list**: only required (checked) cells are listed. An entry's presence means the guardrail is required to enforce the principle; absence means no required relationship.

DAT-GRD is currently empty for this client/version, so this matrix ships with no relationships. It will populate once guardrails are defined.

## Example

```json
{
    "relationships": [
        {
            "column-id": "DAT-PRN-001",
            "row-id": "DAT-GRD-001",
            "rationale": "..."
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | ID of the DAT-PRN principle (column) |
| `row-id` | string | yes | ID of the DAT-GRD guardrail (row) |
| `rationale` | string | no | Why this relationship exists |
