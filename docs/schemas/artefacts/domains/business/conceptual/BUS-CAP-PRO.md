# BUS-CAP-PRO — Business Capabilities ↔ Business Processes

**File:** [`/config/schemas/artefacts/domains/business/conceptual/BUS-CAP-PRO.json`](../../../../../../config/schemas/artefacts/domains/business/conceptual/BUS-CAP-PRO.json)
**Architecture Domain / Layer:** Business / Conceptual
**Format:** Matrix

## Purpose

Maps [BUS-CAP](BUS-CAP.md) business capabilities to [BUS-PRO](BUS-PRO.md) business processes at Level 1 (strategic) and Level 2 (operational). The matrix answers: *which processes realise each capability?*

Relationships are same-level only — Level 1 capabilities map to Level 1 processes, and Level 2 capabilities map to Level 2 processes. This preserves the intended decomposition hierarchy.

## Matrix axes

| Axis | Source | Array | Filter |
|---|---|---|---|
| Columns | BUS-CAP | `capabilities` | `level` in `[1, 2]` |
| Rows | BUS-PRO | `processes` | `level` in `[1, 2]` |

## Relationship fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | BUS-CAP capability ID |
| `row-id` | string | yes | BUS-PRO process ID |
| `rationale` | string | no | Why this capability is realised by this process |

## Example

```json
{
    "$schema": "urn:pickle:schemas:artefacts:domains:business:conceptual:BUS-CAP-PRO",
    "relationships": [
        {
            "column-id": "CAP-001",
            "row-id": "PROC-001",
            "rationale": "Customer Management capability is delivered through the Customer Lifecycle Management process group"
        },
        {
            "column-id": "CAP-001-01",
            "row-id": "PROC-001-01",
            "rationale": "Acquire Customer capability is enacted through the Acquire New Customers process"
        }
    ]
}
```
