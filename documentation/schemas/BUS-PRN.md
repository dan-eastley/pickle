# BUS-PRN — Business Principles Catalogue

**File:** [`/schemas/artefacts/domains/business/logical/BUS-PRN.json`](../../schemas/artefacts/domains/business/logical/BUS-PRN.json)
**Architecture Domain / Layer:** Business / Logical
**Format:** Catalogue

## Purpose

Vendor-neutral guidelines that shape design decisions in the Business architecture domain. Principles are aspirational defaults that can be overridden with documented justification (typically via an ADR). Answers *"how do we approach decisions in this space?"*

## Industry alignment

- **TOGAF Architecture Principles** — Name, Statement, Rationale, Implications (the de-facto standard)

## Shape

```json
{
    "principles": [
        {
            "id": "BUS-PRN-001",
            "name": "Customer outcome over operational process",
            "statement": "When operational efficiency and customer outcome conflict, design for customer outcome first",
            "rationale": "Internal process optimisation has historically eroded the customer experience; sustained NPS recovery requires reversing that bias",
            "implications": [
                "Process changes that worsen the customer journey must be escalated to the COO",
                "Internal SLAs are derived from customer-promised outcomes, not vice versa",
                "Customer-facing KPIs take precedence in design trade-offs"
            ]
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `BUS-PRN-001`) |
| `name` | string | yes | Short, memorable principle name |
| `statement` | string | yes | The principle, stated as a directive |
| `rationale` | string | yes | Why this principle exists — the underlying motivation |
| `implications` | array of strings | no | Consequences for design and decision-making if this principle is adopted |
