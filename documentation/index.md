# Documentation

This is the navigable documentation for the Architecture as Code proof of concept. Start here when looking for how the architecture model works, what artefacts exist, or how schemas are structured.

## Architecture Model

| Topic | Description |
|---|---|
| [Domains](domains.md) | The five architecture domains (Business, Data, Integration, Application, Solution) |
| [Abstraction Layers](abstraction-layers.md) | The three layers each domain is modelled at (Conceptual, Logical, Physical) |
| [Output Formats](output-formats.md) | The three permitted artefact formats (Catalogue, Matrix, Diagram) |
| [Artefacts](artefacts.md) | Registry of all defined artefacts and their classification |

## Schemas

The [schemas/](schemas/) folder contains a markdown page for each JSON Schema, explaining its structure, the standards it draws from, and how to use it.

| Schema | Documentation |
|---|---|
| Clients index | [schemas/clients.md](schemas/clients.md) |
| Versions index | [schemas/versions.md](schemas/versions.md) |
| Artefacts registry | [schemas/artefacts.md](schemas/artefacts.md) |
| BUS-CAP | [schemas/BUS-CAP.md](schemas/BUS-CAP.md) |
| BUS-PRO | [schemas/BUS-PRO.md](schemas/BUS-PRO.md) |
| DAT-DAC | [schemas/DAT-DAC.md](schemas/DAT-DAC.md) |
| APP-DAP | [schemas/APP-DAP.md](schemas/APP-DAP.md) |

## Where else to look

- The repository structure, conventions, and AI working notes live in [`/CLAUDE.md`](../CLAUDE.md) at the repo root.
- The actual schemas live under [`/schemas/`](../schemas/).
- The actual architecture data lives under [`/architectures/`](../architectures/).
