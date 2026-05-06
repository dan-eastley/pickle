# BUS-CAP — Business Capabilities Catalogue

**File:** [`/schemas/artefacts/domains/business/conceptual/BUS-CAP.json`](../../schemas/artefacts/domains/business/conceptual/BUS-CAP.json)
**Domain / Layer:** Business / Conceptual
**Format:** Catalogue

## Industry alignment

- **TOGAF** — Capability-based planning concepts (capability ≠ process ≠ function)
- **Business Architecture Guild (BIZBOK)** — Capability map structure (levels, parent/child)
- **CMMI** — Maturity scale used for `maturity-current` / `maturity-target`
- **Strategic classification** — `strategic` / `differentiating` / `foundational` follows common practice for portfolio prioritisation

## Shape

```json
{
    "capabilities": [
        {
            "id": "CAP-001",
            "name": "Manage Customer",
            "level": 1,
            "owner": "Chief Customer Officer",
            "importance": "differentiating",
            "maturity-current": "defined",
            "maturity-target": "managed"
        },
        {
            "id": "CAP-001-01",
            "name": "Acquire Customer",
            "level": 2,
            "parent-id": "CAP-001"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `CAP-001`) |
| `name` | string | yes | Capability name |
| `description` | string | no | Free-text description |
| `level` | integer (1–3) | yes | Capability level — 1 highest, 3 most granular |
| `parent-id` | string | conditional | ID of the parent capability. Required for level 2 and 3; omit for level 1. |
| `owner` | string | no | Accountable business unit or role |
| `importance` | enum | no | `strategic` \| `differentiating` \| `foundational` |
| `maturity-current` | enum | no | `initial` \| `repeatable` \| `defined` \| `managed` \| `optimised` |
| `maturity-target` | enum | no | Same enum as `maturity-current` |
