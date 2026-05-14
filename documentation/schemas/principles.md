# Principles Catalogue Schemas (`<DOM>-PRN`)

**Shared shape used by:** `BUS-PRN`, `DAT-PRN`, `INT-PRN`, `APP-PRN`, `SOL-PRN` — one per architecture domain.

**Schema files:** `/schemas/artefacts/domains/<domain>/logical/<DOM>-PRN.json`
**Architecture Domain / Layer:** Any of the five architecture domains / Logical
**Format:** Catalogue

## Purpose

Captures the *how* — vendor-neutral guidelines that shape design decisions within an architecture domain. Principles are **aspirational defaults** that can be overridden with documented justification (typically via an ADR). They answer *"how do we approach decisions in this space?"*

## Industry alignment

- **TOGAF Architecture Principles** — Name, Statement, Rationale, Implications (the de-facto standard)

## Shape

```json
{
    "principles": [
        {
            "id": "DAT-PRN-001",
            "name": "Data has an owner",
            "statement": "Every data domain has a single accountable steward",
            "rationale": "Unowned data drifts in quality and meaning; ownership creates accountability for definition, quality and lifecycle",
            "implications": [
                "Data domains documented in DAT-DAC must have an owner field",
                "New data sources must be assigned to a domain before go-live",
                "Disputes over data definitions are resolved by the steward"
            ]
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `DAT-PRN-001`) |
| `name` | string | yes | Short, memorable principle name |
| `statement` | string | yes | The principle, stated as a directive |
| `rationale` | string | yes | Why this principle exists — the underlying motivation |
| `implications` | array of strings | no | Consequences for design and decision-making if this principle is adopted |
