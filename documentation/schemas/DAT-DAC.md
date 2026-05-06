# DAT-DAC — Data Domains & Concepts Catalogue

**File:** [`/schemas/artefacts/domains/data/conceptual/DAT-DAC.json`](../../schemas/artefacts/domains/data/conceptual/DAT-DAC.json)
**Architecture Domain / Layer:** Data / Conceptual
**Format:** Catalogue (two-tier)

## Industry alignment

- **DAMA-DMBOK** — Data domains (subject areas) and stewardship
- **Conceptual Data Modelling** — Concepts represent entities, events, or reference data without committing to a logical/physical structure
- **ISO 27001** — Information classification (`public`, `internal`, `confidential`, `restricted`)

## Shape

```json
{
    "domains": [
        {
            "id": "DOM-CUSTOMER",
            "name": "Customer",
            "owner": "Chief Customer Officer"
        }
    ],
    "concepts": [
        {
            "id": "CON-CUSTOMER",
            "name": "Customer",
            "domain-id": "DOM-CUSTOMER",
            "type": "entity",
            "classification": "confidential",
            "aliases": ["Account", "Client"]
        }
    ]
}
```

## Fields

### `domains[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier for the data domain (e.g. `DOM-CUSTOMER`) |
| `name` | string | yes | Domain name |
| `description` | string | no | Free-text description |
| `owner` | string | no | Accountable data domain owner / steward |

### `concepts[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `CON-CUSTOMER`) |
| `name` | string | yes | Concept name |
| `description` | string | no | Free-text description |
| `domain-id` | string | yes | ID of the parent data domain |
| `type` | enum | no | `entity` \| `event` \| `reference` |
| `aliases` | array of strings | no | Alternative names used elsewhere in the business |
| `classification` | enum | no | `public` \| `internal` \| `confidential` \| `restricted` |
