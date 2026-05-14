# SOL-PRN — Solution Principles Catalogue

**File:** [`/schemas/artefacts/domains/solution/logical/SOL-PRN.json`](../../schemas/artefacts/domains/solution/logical/SOL-PRN.json)
**Architecture Domain / Layer:** Solution / Logical
**Format:** Catalogue

## Purpose

Vendor-neutral guidelines that shape design decisions in the Solution architecture domain. Principles are aspirational defaults that can be overridden with documented justification (typically via an ADR). Answers *"how do we approach decisions in this space?"*

## Industry alignment

- **TOGAF Architecture Principles** — Name, Statement, Rationale, Implications (the de-facto standard)

## Shape

```json
{
    "principles": [
        {
            "id": "SOL-PRN-001",
            "name": "Reuse before bespoke",
            "statement": "Search the existing solution portfolio for a reusable building block before commissioning anything bespoke",
            "rationale": "Bespoke solutions multiply maintenance load and architectural drift; reuse compounds investment",
            "implications": [
                "Solution architects must document the reuse search before sign-off",
                "Architecture review will reject designs that duplicate an existing capability without justification",
                "The solution-pattern catalogue is the first port of call for any new initiative"
            ]
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `SOL-PRN-001`) |
| `name` | string | yes | Short, memorable principle name |
| `statement` | string | yes | The principle, stated as a directive |
| `rationale` | string | yes | Why this principle exists — the underlying motivation |
| `implications` | array of strings | no | Consequences for design and decision-making if this principle is adopted |
