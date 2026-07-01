# INT-PRN: Integration Architecture Principles Catalogue

**File:** [`/config/schemas/artefacts/domains/integration/logical/INT-PRN.json`](../../../../../../config/schemas/artefacts/domains/integration/logical/INT-PRN.json)
**Architecture Domain / Layer:** Integration / Logical
**Format:** Catalogue

## Purpose

Vendor-neutral guidelines that shape design decisions in the Integration architecture domain. Principles are aspirational defaults that can be overridden with documented justification (typically via an ADR). Answers *"how do we approach decisions in this space?"*

## Industry alignment

- **TOGAF Architecture Principles**: Name, Statement, Rationale, Implications (the de-facto standard)

## Example

```json
{
    "principles": [
        {
            "id": "INT-PRN-001",
            "name": "Asynchronous by default for non-critical paths",
            "statement": "Use asynchronous messaging for any integration that is not on the critical request path",
            "rationale": "Synchronous coupling is the primary cause of cascading failure in our estate; async messaging decouples failure domains",
            "implications": [
                "New integrations default to event-driven; synchronous calls require justification",
                "Producers must publish to a managed broker rather than calling consumers directly",
                "Consumers must be idempotent"
            ]
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `INT-PRN-001`) |
| `name` | string | yes | Short, memorable principle name |
| `statement` | string | yes | The principle, stated as a directive |
| `rationale` | string | yes | Why this principle exists, the underlying motivation |
| `implications` | array of strings | no | Consequences for design and decision-making if this principle is adopted |
