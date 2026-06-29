# INT-STR: Integration Architecture Strategy Catalogue

**File:** [`/config/schemas/artefacts/domains/integration/conceptual/INT-STR.json`](../../../../../../config/schemas/artefacts/domains/integration/conceptual/INT-STR.json)
**Architecture Domain / Layer:** Integration / Conceptual
**Format:** Catalogue

## Purpose

Captures strategic intent for the Integration architecture domain: outcome-oriented, time-bound, non-prescriptive about how. Answers *"where are we headed and why does it matter?"*

## Industry alignment

- **TOGAF Architecture Vision**: Drivers, target state, outcomes
- **OKR pattern**: `target-outcome` carries measurable success criteria
- **Horizon framing**: Short / medium / long term aligns with portfolio planning conventions

## Example

```json
{
    "strategies": [
        {
            "id": "INT-STR-001",
            "statement": "Adopt API-first integration as the default for all new inter-system exchange",
            "driver": "Point-to-point integration debt is slowing new product delivery; ~40% of effort on new initiatives goes to integration plumbing",
            "target-outcome": "All new inter-system exchange uses managed APIs by 2026; legacy point-to-point reduced 50% by 2027",
            "horizon": "medium-term",
            "owner": "Head of Integration Architecture"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `INT-STR-001`) |
| `statement` | string | yes | Strategic statement: outcome-oriented, time-bound where appropriate |
| `driver` | string | no | Business driver or external force motivating this strategy |
| `target-outcome` | string | no | Measurable success criterion |
| `horizon` | enum | no | `short-term` \| `medium-term` \| `long-term` |
| `owner` | string | no | Accountable role or business unit |
