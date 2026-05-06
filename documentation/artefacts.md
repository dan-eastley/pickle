# Artefacts

An **artefact** is a single, classified piece of architecture content. Every artefact:

- Is aligned to exactly one [domain](domains.md)
- Is aligned to exactly one [abstraction layer](abstraction-layers.md)
- Conforms to exactly one [output format](output-formats.md)
- Has a unique ID prefixed with the domain acronym (e.g. `BUS-CAP`, `APP-DAP`)

Each artefact has a folder under `architectures/<client>/<version>/artefacts/domains/<domain>/<layer>/<ID>/` containing its instance data. Catalogues are backed by a JSON Schema at the matching path under `schemas/`.

## Registry

The authoritative machine-readable registry is [`/schemas/artefacts.json`](../schemas/artefacts.json). The table below mirrors it.

| ID | Domain | Abstraction | Format | Output | Summary |
|---|---|---|---|---|---|
| BUS-CAP | Business | Conceptual | Catalogue | Business Capabilities | |
| BUS-BCM | Business | Conceptual | Diagram | Business Capability Model | Model of the Business Capabilities Catalogue (BUS-CAP) |
| BUS-PRO | Business | Conceptual | Catalogue | Business Processes | |
| BUS-BPM | Business | Conceptual | Diagram | Business Process Model | Model of the Business Processes Catalogue (BUS-PRO) |
| DAT-DAC | Data | Conceptual | Catalogue | Domains & Concepts | |
| DAT-CDM | Data | Conceptual | Diagram | Conceptual Data Model | Model of the Domains & Concepts Catalogue (DAT-DAC) |
| APP-DAP | Application | Logical | Catalogue | Domains & Platforms | |
| APP-DPM | Application | Logical | Diagram | Domains & Platforms Model | Model of the Domains & Platforms Catalogue (APP-DAP) |

## Adding a new artefact

1. Add a row to the registry in `/schemas/artefacts.json` (and the table above).
2. If it is a catalogue, define a JSON Schema at `/schemas/artefacts/domains/<domain>/<layer>/<ID>.json`.
3. Document the schema with a markdown page in `/documentation/schemas/<ID>.md`.
4. Create an empty instance folder in each affected client version: `/architectures/<client>/<version>/artefacts/domains/<domain>/<layer>/<ID>/`.
