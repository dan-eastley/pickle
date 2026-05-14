# Documentation

This is the navigable documentation for the Architecture as Code proof of concept. Start here when looking for how the architecture model works, what artefact types exist, or how schemas are structured.

## Architecture Model

| Topic | Description |
|---|---|
| [Architecture Domains](domains.md) | The five architecture domains (Business, Data, Integration, Application, Solution) |
| [Abstraction Layers](abstraction-layers.md) | The three layers each architecture domain is modelled at (Conceptual, Logical, Physical) |
| [Output Formats](output-formats.md) | The three permitted artefact-type formats (Catalogue, Matrix, Diagram) |
| [Artefact Types](artefacts.md) | Registry of all defined artefact types and their classification |

## Schemas

The [schemas/](schemas/) folder contains a markdown page for each JSON Schema, explaining its structure, the standards it draws from, and how to use it.

| Schema | Documentation |
|---|---|
| Clients index | [schemas/clients.md](schemas/clients.md) |
| Versions index | [schemas/versions.md](schemas/versions.md) |
| Artefact-type schema index | [schemas/artefacts.md](schemas/artefacts.md) |
| Strategy / Principles / Guardrails (one schema doc per architecture domain) | see [schemas/index.md](schemas/index.md) |
| BUS-CAP | [schemas/BUS-CAP.md](schemas/BUS-CAP.md) |
| BUS-PRO | [schemas/BUS-PRO.md](schemas/BUS-PRO.md) |
| DAT-DAC | [schemas/DAT-DAC.md](schemas/DAT-DAC.md) |
| APP-DAP | [schemas/APP-DAP.md](schemas/APP-DAP.md) |

## Workflows

GitHub Actions workflows live at [`/.github/workflows/`](../.github/workflows/). Each is documented in [`workflows/`](workflows/) — start at the [workflows index](workflows/index.md) for the full list.

## Where else to look

- The repository structure, conventions, and AI working notes live in [`/CLAUDE.md`](../CLAUDE.md) at the repo root.
- The actual schemas live under [`/schemas/`](../schemas/).
- The actual architecture data lives under [`/architectures/`](../architectures/).
