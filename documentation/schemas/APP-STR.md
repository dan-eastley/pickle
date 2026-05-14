# APP-STR — Application Strategy Catalogue

**File:** [`/schemas/artefacts/domains/application/conceptual/APP-STR.json`](../../schemas/artefacts/domains/application/conceptual/APP-STR.json)
**Architecture Domain / Layer:** Application / Conceptual
**Format:** Catalogue

## Purpose

Captures strategic intent for the Application architecture domain — outcome-oriented, time-bound, non-prescriptive about how. Answers *"where are we headed and why does it matter?"*

## Industry alignment

- **TOGAF Architecture Vision** — Drivers, target state, outcomes
- **OKR pattern** — `target-outcome` carries measurable success criteria
- **Horizon framing** — Short / medium / long term aligns with portfolio planning conventions

## Shape

```json
{
    "strategies": [
        {
            "id": "APP-STR-001",
            "statement": "Buy or assemble before build for commodity capabilities",
            "driver": "Custom-built systems consume disproportionate maintenance budget vs. the differentiation they provide",
            "target-outcome": "Custom-built share of total application portfolio reduced from 65% to under 40% by 2027",
            "horizon": "medium-term",
            "owner": "Head of Application Architecture"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `APP-STR-001`) |
| `statement` | string | yes | Strategic statement — outcome-oriented, time-bound where appropriate |
| `driver` | string | no | Business driver or external force motivating this strategy |
| `target-outcome` | string | no | Measurable success criterion |
| `horizon` | enum | no | `short-term` \| `medium-term` \| `long-term` |
| `owner` | string | no | Accountable role or business unit |
