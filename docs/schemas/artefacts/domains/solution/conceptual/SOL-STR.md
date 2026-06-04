# SOL-STR — Solution Strategy Catalogue

**File:** [`/config/schemas/artefacts/domains/solution/conceptual/SOL-STR.json`](../../../../../../config/schemas/artefacts/domains/solution/conceptual/SOL-STR.json)
**Architecture Domain / Layer:** Solution / Conceptual
**Format:** Catalogue

## Purpose

Captures strategic intent for the Solution architecture domain — outcome-oriented, time-bound, non-prescriptive about how. Answers *"where are we headed and why does it matter?"*

## Industry alignment

- **TOGAF Architecture Vision** — Drivers, target state, outcomes
- **OKR pattern** — `target-outcome` carries measurable success criteria
- **Horizon framing** — Short / medium / long term aligns with portfolio planning conventions

## Example

```json
{
    "strategies": [
        {
            "id": "SOL-STR-001",
            "statement": "Deliver solutions as thin, vertically integrated MVPs that prove value before scaling",
            "driver": "Big-bang programmes have consistently overshot timeline and budget while under-delivering on outcome",
            "target-outcome": "All initiatives over GBP 500k deliver a measurable customer outcome within 90 days of kick-off",
            "horizon": "medium-term",
            "owner": "Chief Architect"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `SOL-STR-001`) |
| `statement` | string | yes | Strategic statement — outcome-oriented, time-bound where appropriate |
| `driver` | string | no | Business driver or external force motivating this strategy |
| `target-outcome` | string | no | Measurable success criterion |
| `horizon` | enum | no | `short-term` \| `medium-term` \| `long-term` |
| `owner` | string | no | Accountable role or business unit |
