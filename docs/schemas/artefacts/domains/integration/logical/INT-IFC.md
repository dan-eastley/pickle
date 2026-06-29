# INT-IFC: Interface Catalogue

**File:** [`/config/schemas/artefacts/domains/integration/logical/INT-IFC.json`](../../../../../../config/schemas/artefacts/domains/integration/logical/INT-IFC.json)
**Architecture Domain / Layer:** Integration / Logical
**Format:** Catalogue

## Purpose

Catalogue of logical point-to-point interfaces between platforms in the [Application Domains & Platforms Catalogue (APP-DAP)](../../application/logical/APP-DAP.md), describing how applications across the estate exchange data. Makes the integration landscape visible: which platforms talk to which, the direction of data flow, and (via the [Data Domains & Concepts ↔ Interface Catalogue Matrix (INT-DAC-IFC)](INT-DAC-IFC.md)) which conceptual data entities flow across each interface.

## Industry alignment

- **TOGAF Integration/Application Communication Diagrams**: point-to-point interface inventory between applications
- **C4 / System Context**: `source` / `target` framing of a connection between two systems

## Example

```json
{
    "interfaces": [
        {
            "id": "INT-IFC-001",
            "name": "Customer & Account Sync",
            "description": "New and updated customer and account records are pushed from CRM to the Customer Information System to keep billing accounts in sync with sales and service records.",
            "source": "PLAT-CRM",
            "target": "PLAT-CIS",
            "direction": "source-to-target"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `INT-IFC-001`) |
| `name` | string | yes | Short label for this interface |
| `description` | string | no | Free-text description |
| `source` | string | yes | ID of the source platform (`APP-DAP.platforms[].id`) |
| `target` | string | yes | ID of the target platform (`APP-DAP.platforms[].id`) |
| `direction` | enum | yes | `source-to-target` \| `target-to-source` \| `bi-directional`: direction of data flow between source and target |
