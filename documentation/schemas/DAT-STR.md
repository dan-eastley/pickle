# DAT-STR — Data Strategy Catalogue

**File:** [`/schemas/artefacts/domains/data/conceptual/DAT-STR.json`](../../schemas/artefacts/domains/data/conceptual/DAT-STR.json)
**Architecture Domain / Layer:** Data / Conceptual
**Format:** Catalogue

## Purpose

Captures strategic intent for the Data architecture domain — outcome-oriented, time-bound, non-prescriptive about how. Answers *"where are we headed and why does it matter?"*

## Industry alignment

- **TOGAF Architecture Vision** — Drivers, target state, outcomes
- **OKR pattern** — `target-outcome` carries measurable success criteria
- **Horizon framing** — Short / medium / long term aligns with portfolio planning conventions

## Example

```json
{
    "strategies": [
        {
            "id": "DAT-STR-001",
            "statement": "Treat data as a managed asset across the enterprise",
            "driver": "Inconsistent customer view across channels is creating service quality issues and missed cross-sell",
            "target-outcome": "Single trusted view of customer accessible to all channels by end of 2027",
            "horizon": "long-term",
            "owner": "Chief Data Officer"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `DAT-STR-001`) |
| `statement` | string | yes | Strategic statement — outcome-oriented, time-bound where appropriate |
| `driver` | string | no | Business driver or external force motivating this strategy |
| `target-outcome` | string | no | Measurable success criterion |
| `horizon` | enum | no | `short-term` \| `medium-term` \| `long-term` |
| `owner` | string | no | Accountable role or business unit |
