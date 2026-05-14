# Schemas

Each schema in [`/schemas/`](../../schemas/) is documented here. Click through for the structure, what industry standard it draws from, and an example shape.

## Index files

| Schema | Documents | Purpose |
|---|---|---|
| [clients.md](clients.md) | `architectures/clients.json` | Authoritative list of client IDs |
| [versions.md](versions.md) | `architectures/<client>/versions.json` | Authoritative list of version IDs for a client |
| [artefacts.md](artefacts.md) | `schemas/artefacts.json` | Index of all defined catalogue schemas |

## Cross-domain shape catalogues

These three shapes are reused across every architecture domain. Each architecture domain has its own `<DOM>-STR` / `<DOM>-PRN` / `<DOM>-GRD` schema, but all five `<DOM>-STR` schemas share the Strategy shape (and likewise for Principles and Guardrails).

| Shape | Used by | Layer |
|---|---|---|
| [strategy.md](strategy.md) | `BUS-STR`, `DAT-STR`, `INT-STR`, `APP-STR`, `SOL-STR` | Conceptual |
| [principles.md](principles.md) | `BUS-PRN`, `DAT-PRN`, `INT-PRN`, `APP-PRN`, `SOL-PRN` | Logical |
| [guardrails.md](guardrails.md) | `BUS-GRD`, `DAT-GRD`, `INT-GRD`, `APP-GRD`, `SOL-GRD` | Physical |

## Domain-specific catalogue schemas

| Schema | Artefact Type | Architecture Domain / Layer | Aligned to |
|---|---|---|---|
| [BUS-CAP.md](BUS-CAP.md) | Business Capabilities | Business / Conceptual | TOGAF, Business Architecture Guild, CMMI |
| [BUS-PRO.md](BUS-PRO.md) | Business Processes | Business / Conceptual | APQC PCF, Porter value chain |
| [DAT-DAC.md](DAT-DAC.md) | Data Domains & Concepts | Data / Conceptual | DAMA-DMBOK, ISO 27001 |
| [APP-DAP.md](APP-DAP.md) | Application Domains & Platforms | Application / Logical | TOGAF Application Architecture, Gartner Pace Layers |
