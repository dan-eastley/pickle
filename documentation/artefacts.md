# Artefact Types

An **artefact type** is a single, classified piece of architecture content. Every artefact type:

- Is aligned to exactly one [architecture domain](domains.md)
- Is aligned to exactly one [abstraction layer](abstraction-layers.md)
- Conforms to exactly one [output format](output-formats.md)
- Has a unique ID prefixed with the architecture domain acronym (e.g. `BUS-CAP`, `APP-DAP`)

Each artefact type has a folder under `architectures/<client>/<version>/artefacts/domains/<domain>/<layer>/<ID>/` containing its instance data. Catalogues are backed by a JSON Schema at the matching path under `schemas/`.

## Cross-domain baseline (Strategy / Principles / Guardrails)

Every architecture domain carries three artefact types that capture the abstraction-layer semantics directly:

- **`<DOM>-STR`** (Conceptual) — strategic intent; the *what* and *why*
- **`<DOM>-PRN`** (Logical) — design principles; the *how*
- **`<DOM>-GRD`** (Physical) — non-negotiable guardrails; the *where* and *with what*

The shapes are shared across all five architecture domains, but each domain has its own schema doc page with a domain-specific example. See the matrix in [schemas/index.md](schemas/index.md).

## Registry

This table is the authoritative registry of every defined artefact type. The schema-only index at [`/schemas/artefacts.json`](../schemas/artefacts.json) covers just the catalogues.

| ID | Architecture Domain | Abstraction | Format | Output | Summary |
|---|---|---|---|---|---|
| BUS-STR | Business | Conceptual | Catalogue | Business Strategy | |
| BUS-CAP | Business | Conceptual | Catalogue | Business Capabilities | |
| BUS-BCM | Business | Conceptual | Diagram | Business Capability Model | Model of the Business Capabilities Catalogue (BUS-CAP) |
| BUS-PRO | Business | Conceptual | Catalogue | Business Processes | |
| BUS-BPM | Business | Conceptual | Diagram | Business Process Model | Model of the Business Processes Catalogue (BUS-PRO) |
| BUS-PRN | Business | Logical | Catalogue | Business Principles | |
| BUS-GRD | Business | Physical | Catalogue | Business Guardrails | |
| DAT-STR | Data | Conceptual | Catalogue | Data Strategy | |
| DAT-DAC | Data | Conceptual | Catalogue | Domains & Concepts | |
| DAT-CDM | Data | Conceptual | Diagram | Conceptual Data Model | Model of the Domains & Concepts Catalogue (DAT-DAC) |
| DAT-PRN | Data | Logical | Catalogue | Data Principles | |
| DAT-GRD | Data | Physical | Catalogue | Data Guardrails | |
| INT-STR | Integration | Conceptual | Catalogue | Integration Strategy | |
| INT-PRN | Integration | Logical | Catalogue | Integration Principles | |
| INT-GRD | Integration | Physical | Catalogue | Integration Guardrails | |
| APP-STR | Application | Conceptual | Catalogue | Application Strategy | |
| APP-DAP | Application | Logical | Catalogue | Domains & Platforms | |
| APP-DPM | Application | Logical | Diagram | Domains & Platforms Model | Model of the Domains & Platforms Catalogue (APP-DAP) |
| APP-PRN | Application | Logical | Catalogue | Application Principles | |
| APP-GRD | Application | Physical | Catalogue | Application Guardrails | |
| SOL-STR | Solution | Conceptual | Catalogue | Solution Strategy | |
| SOL-PRN | Solution | Logical | Catalogue | Solution Principles | |
| SOL-GRD | Solution | Physical | Catalogue | Solution Guardrails | |

## Adding a new artefact type

1. Add a row to the registry table above.
2. If it is a catalogue:
   - Define a JSON Schema at `/schemas/artefacts/domains/<domain>/<layer>/<ID>.json`.
   - Add an entry for the new artefact-type ID to `/schemas/artefacts.json` (the schema index).
   - Document the schema with a markdown page in `/documentation/schemas/<ID>.md` (or, for shared shapes, link to an existing shape page).
3. Create an empty instance folder in each affected client version: `/architectures/<client>/<version>/artefacts/domains/<domain>/<layer>/<ID>/`.
