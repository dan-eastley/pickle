# BUS-PRO — Business Processes Catalogue

**File:** [`/config/schemas/artefacts/domains/business/conceptual/BUS-PRO.json`](../../../../../../config/schemas/artefacts/domains/business/conceptual/BUS-PRO.json)
**Architecture Domain / Layer:** Business / Conceptual
**Format:** Catalogue

## Industry alignment

- **APQC Process Classification Framework (PCF)** — `level` (1 = Process Group, 2 = Process Category, 3 = Process)
- **Porter's Value Chain** — `type` (`core`, `supporting`, `management`)
- **BPMN** — Concepts of `trigger`, `inputs`, `outputs` (catalogue captures the metadata; the visual hierarchy lives in BUS-BPM)

The catalogue stops at **Level 3** — the finest decomposition modelled here. Sub-process steps (PCF Level 4) are out of scope for the architecture catalogue.

## Example

```json
{
    "processes": [
        {
            "id": "PROC-001",
            "name": "Customer Lifecycle Management",
            "type": "core",
            "level": 1,
            "owner": "Chief Customer Officer",
            "trigger": "Customer enquiry or application received",
            "outcome": "Customer acquired, served, and retained"
        },
        {
            "id": "PROC-001-01",
            "name": "Acquire New Customers",
            "type": "core",
            "level": 2,
            "parent-id": "PROC-001",
            "owner": "Sales & Marketing"
        },
        {
            "id": "PROC-001-01-01",
            "name": "Generate Sales Leads",
            "type": "core",
            "level": 3,
            "parent-id": "PROC-001-01"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier — `PROC-NNN` (L1), `PROC-NNN-NN` (L2), `PROC-NNN-NN-NN` (L3) |
| `name` | string | yes | Process name |
| `description` | string | no | Free-text description |
| `type` | enum | yes | `core` \| `supporting` \| `management` |
| `level` | integer (1–3) | yes | APQC PCF level |
| `parent-id` | string | conditional | ID of the parent process; omit for level 1 |
| `trigger` | string | no | Event or condition that initiates the process |
| `outcome` | string | no | Business outcome produced |
| `inputs` | array of strings | no | Information / materials consumed |
| `outputs` | array of strings | no | Deliverables produced |
| `owner` | string | no | Accountable role or business unit |
| `kpis` | array of strings | no | Key performance indicators |
