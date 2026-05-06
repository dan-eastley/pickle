# APP-DAP — Application Domains & Platforms Catalogue

**File:** [`/schemas/artefacts/domains/application/logical/APP-DAP.json`](../../schemas/artefacts/domains/application/logical/APP-DAP.json)
**Domain / Layer:** Application / Logical
**Format:** Catalogue (two-tier)

## Industry alignment

- **TOGAF Application Architecture** — Application domains as logical groupings
- **Gartner Pace Layers** / **Geoffrey Moore's CORE/CONTEXT** — `type` classification (`system-of-record`, `system-of-engagement`, `system-of-insight`, `system-of-innovation`)
- **TechRadar (ThoughtWorks)** — `lifecycle` stance (`adopt`, `trial`, `hold`, `retire`)

## Shape

```json
{
    "domains": [
        {
            "id": "APP-DOM-ENGAGE",
            "name": "Customer Engagement",
            "owner": "Head of Digital"
        }
    ],
    "platforms": [
        {
            "id": "PLAT-DXP",
            "name": "Digital Experience Platform",
            "domain-id": "APP-DOM-ENGAGE",
            "type": "system-of-engagement",
            "lifecycle": "adopt"
        }
    ]
}
```

## Fields

### `domains[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `APP-DOM-ENGAGE`) |
| `name` | string | yes | Application domain name |
| `description` | string | no | Free-text description |
| `owner` | string | no | Accountable owner |

### `platforms[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `PLAT-DXP`) |
| `name` | string | yes | Platform name |
| `description` | string | no | Free-text description |
| `domain-id` | string | yes | ID of the parent application domain |
| `type` | enum | yes | `system-of-record` \| `system-of-engagement` \| `system-of-insight` \| `system-of-innovation` |
| `lifecycle` | enum | no | `adopt` \| `trial` \| `hold` \| `retire` |
