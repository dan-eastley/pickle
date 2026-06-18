# INT-PRN-GRD — Integration Architecture Principles ↔ Guardrails Matrix

**File:** [`/config/schemas/artefacts/domains/integration/physical/INT-PRN-GRD.json`](../../../../../../config/schemas/artefacts/domains/integration/physical/INT-PRN-GRD.json)
**Architecture Domain / Layer:** Integration / Physical
**Format:** Matrix

## Purpose

Maps each [INT-PRN](../logical/INT-PRN.md) principle to the [INT-GRD](INT-GRD.md) guardrails that make it concrete and enforceable, in a many-to-many relationship. Columns are INT-PRN principles, rows are INT-GRD guardrails. Answers *"which guardrails exist to enforce this principle?"* and *"which principle does this guardrail enforce?"*

## Shape

Relationships are stored as a **sparse list** — only required (checked) cells are listed. An entry's presence means the guardrail is required to enforce the principle; absence means no required relationship.

INT-GRD is currently empty for this client/version, so this matrix ships with no relationships. It will populate once guardrails are defined.

## Example

```json
{
    "relationships": [
        {
            "column-id": "INT-PRN-001",
            "row-id": "INT-GRD-001",
            "rationale": "..."
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | ID of the INT-PRN principle (column) |
| `row-id` | string | yes | ID of the INT-GRD guardrail (row) |
| `rationale` | string | no | Why this relationship exists |
