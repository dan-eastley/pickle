# APP-PRN — Application Principles Catalogue

**File:** [`/schemas/artefacts/domains/application/logical/APP-PRN.json`](../../schemas/artefacts/domains/application/logical/APP-PRN.json)
**Architecture Domain / Layer:** Application / Logical
**Format:** Catalogue

## Purpose

Vendor-neutral guidelines that shape design decisions in the Application architecture domain. Principles are aspirational defaults that can be overridden with documented justification (typically via an ADR). Answers *"how do we approach decisions in this space?"*

## Industry alignment

- **TOGAF Architecture Principles** — Name, Statement, Rationale, Implications (the de-facto standard)

## Shape

```json
{
    "principles": [
        {
            "id": "APP-PRN-001",
            "name": "Composable over monolithic",
            "statement": "Prefer composing capabilities from independent, replaceable services over building integrated monoliths",
            "rationale": "Monoliths constrain pace and concentrate risk; composable architectures enable independent evolution",
            "implications": [
                "New applications must publish their capabilities via stable, versioned interfaces",
                "Shared business logic lives in a service, not duplicated in consuming applications",
                "Replaceability is a first-class design quality assessed at architecture review"
            ]
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `APP-PRN-001`) |
| `name` | string | yes | Short, memorable principle name |
| `statement` | string | yes | The principle, stated as a directive |
| `rationale` | string | yes | Why this principle exists — the underlying motivation |
| `implications` | array of strings | no | Consequences for design and decision-making if this principle is adopted |
