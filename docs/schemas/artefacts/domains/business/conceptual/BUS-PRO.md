# BUS-PRO — Business Processes Catalogue

**File:** [`/config/schemas/artefacts/domains/business/conceptual/BUS-PRO.json`](../../../../../../config/schemas/artefacts/domains/business/conceptual/BUS-PRO.json)
**Architecture Domain / Layer:** Business / Conceptual
**Format:** Catalogue

## Industry alignment

- **APQC Process Classification Framework (PCF)** — `level` (1 = Category, 4 = Activity)
- **Porter's Value Chain** — `type` (`core`, `supporting`, `management`)
- **BPMN** — Concepts of `trigger`, `inputs`, `outputs` (catalogue captures the metadata; the visual flow lives in the BUS-BPM diagram)

## Example

```json
{
    "processes": [
        {
            "id": "PROC-001",
            "name": "Order to Cash",
            "type": "core",
            "level": 1,
            "owner": "Head of Commercial Operations",
            "trigger": "Customer order received",
            "outcome": "Cash collected, revenue recognised",
            "inputs": ["Customer order", "Product catalogue"],
            "outputs": ["Invoice", "Shipment"],
            "kpis": ["Order cycle time", "Days sales outstanding"]
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `PROC-001`) |
| `name` | string | yes | Process name |
| `description` | string | no | Free-text description |
| `type` | enum | yes | `core` \| `supporting` \| `management` |
| `level` | integer (1–4) | yes | APQC PCF level |
| `parent-id` | string | conditional | ID of the parent process; omit for level 1 |
| `trigger` | string | no | Event or condition that initiates the process |
| `outcome` | string | no | Business outcome produced |
| `inputs` | array of strings | no | Information / materials consumed |
| `outputs` | array of strings | no | Deliverables produced |
| `owner` | string | no | Accountable role or business unit |
| `kpis` | array of strings | no | Key performance indicators |
