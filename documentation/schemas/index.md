# Schemas

Each schema in [`/schemas/`](../../schemas/) is documented here. Click through for the structure, what industry standard it draws from, and an example shape.

## Index files

| Schema | Documents | Purpose |
|---|---|---|
| [clients.md](clients.md) | `architectures/clients.json` | Authoritative list of client IDs |
| [versions.md](versions.md) | `architectures/<client>/versions.json` | Authoritative list of version IDs for a client |
| [artefacts.md](artefacts.md) | `schemas/artefacts.json` | Registry of all defined artefacts |

## Catalogue schemas

| Schema | Artefact | Domain / Layer | Aligned to |
|---|---|---|---|
| [BUS-CAP.md](BUS-CAP.md) | Business Capabilities | Business / Conceptual | TOGAF, Business Architecture Guild, CMMI |
| [BUS-PRO.md](BUS-PRO.md) | Business Processes | Business / Conceptual | APQC PCF, Porter value chain |
| [DAT-DAC.md](DAT-DAC.md) | Data Domains & Concepts | Data / Conceptual | DAMA-DMBOK, ISO 27001 |
| [APP-DAP.md](APP-DAP.md) | Application Domains & Platforms | Application / Logical | TOGAF Application Architecture, Gartner Pace Layers |
