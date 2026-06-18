# SOL-PRN-GRD — Solution Architecture Principles ↔ Guardrails Matrix

**File:** [`/config/schemas/artefacts/domains/solution/physical/SOL-PRN-GRD.json`](../../../../../../config/schemas/artefacts/domains/solution/physical/SOL-PRN-GRD.json)
**Architecture Domain / Layer:** Solution / Physical
**Format:** Matrix

## Purpose

Maps each [SOL-PRN](../logical/SOL-PRN.md) principle to the [SOL-GRD](SOL-GRD.md) guardrails that make it concrete and enforceable, in a many-to-many relationship. Columns are SOL-PRN principles, rows are SOL-GRD guardrails. Answers *"which guardrails exist to enforce this principle?"* and *"which principle does this guardrail enforce?"*

## Shape

Relationships are stored as a **sparse list** — only required (checked) cells are listed. An entry's presence means the guardrail is required to enforce the principle; absence means no required relationship.

SOL-GRD is currently empty for this client/version, so this matrix ships with no relationships. It will populate once guardrails are defined.

## Example

```json
{
    "relationships": [
        {
            "column-id": "SOL-PRN-001",
            "row-id": "SOL-GRD-001",
            "rationale": "..."
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | ID of the SOL-PRN principle (column) |
| `row-id` | string | yes | ID of the SOL-GRD guardrail (row) |
| `rationale` | string | no | Why this relationship exists |
