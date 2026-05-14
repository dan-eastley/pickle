# Strategy Catalogue Schemas (`<DOM>-STR`)

**Shared shape used by:** `BUS-STR`, `DAT-STR`, `INT-STR`, `APP-STR`, `SOL-STR` — one per architecture domain.

**Schema files:** `/schemas/artefacts/domains/<domain>/conceptual/<DOM>-STR.json`
**Architecture Domain / Layer:** Any of the five architecture domains / Conceptual
**Format:** Catalogue

## Purpose

Captures strategic intent for an architecture domain — the *what* and *why* at the highest level. Strategy is **outcome-oriented** and **time-bound**; it deliberately does not prescribe how. It answers *"where are we headed and why does it matter?"*

## Industry alignment

- **TOGAF Architecture Vision** — Drivers, target state, outcomes
- **OKR pattern** — `target-outcome` carries measurable success criteria
- **Horizon framing** — Short / medium / long term aligns with portfolio planning conventions

## Shape

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
