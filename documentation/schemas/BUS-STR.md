# BUS-STR — Business Strategy Catalogue

**File:** [`/schemas/artefacts/domains/business/conceptual/BUS-STR.json`](../../schemas/artefacts/domains/business/conceptual/BUS-STR.json)
**Architecture Domain / Layer:** Business / Conceptual
**Format:** Catalogue

## Purpose

Captures strategic intent for the Business architecture domain — outcome-oriented, time-bound, non-prescriptive about how. Answers *"where are we headed and why does it matter?"*

## Industry alignment

- **TOGAF Architecture Vision** — Drivers, target state, outcomes
- **OKR pattern** — `target-outcome` carries measurable success criteria
- **Horizon framing** — Short / medium / long term aligns with portfolio planning conventions

## Example

```json
{
    "strategies": [
        {
            "id": "BUS-STR-001",
            "statement": "Shift the operating model to a customer-centric organisation by 2027",
            "driver": "Net Promoter Score has declined 12 points over three years; customers cite fragmented service",
            "target-outcome": "NPS recovered to top-quartile in sector by end of 2027; 80% of frontline staff working in cross-functional customer teams",
            "horizon": "long-term",
            "owner": "Chief Customer Officer"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `BUS-STR-001`) |
| `statement` | string | yes | Strategic statement — outcome-oriented, time-bound where appropriate |
| `driver` | string | no | Business driver or external force motivating this strategy |
| `target-outcome` | string | no | Measurable success criterion |
| `horizon` | enum | no | `short-term` \| `medium-term` \| `long-term` |
| `owner` | string | no | Accountable role or business unit |
