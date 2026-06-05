# Documentation

Start here to understand how Pickle works, how the architecture model is structured, and what each artefact type represents.

## Architecture Model

| Topic | Description |
|---|---|
| [Architecture Domains](domains.md) | The five domains the architecture is organised into: Business, Data, Integration, Application, and Solution |
| [Abstraction Layers](abstraction-layers.md) | The three levels of detail each domain is modelled at: Conceptual, Logical, and Physical |
| [Output Formats](output-formats.md) | The three types of artefact: Catalogue, Matrix, and Diagram |
| [Artefact Types](artefacts.md) | The full list of defined artefact types and how each is classified |

## Schemas

The [schemas/](schemas/) section documents the data structure behind each artefact type — what fields it contains, what values are valid, and how they relate to industry standards.

| Schema | Documentation |
|---|---|
| Clients | [schemas/clients.md](schemas/clients.md) |
| Versions | [schemas/versions.md](schemas/versions.md) |
| Decisions | [schemas/decisions.md](schemas/decisions.md) |
| Strategy / Principles / Guardrails | see [schemas/index.md](schemas/index.md) |
| BUS-CAP | [schemas/artefacts/domains/business/conceptual/BUS-CAP.md](schemas/artefacts/domains/business/conceptual/BUS-CAP.md) |
| BUS-PRO | [schemas/artefacts/domains/business/conceptual/BUS-PRO.md](schemas/artefacts/domains/business/conceptual/BUS-PRO.md) |
| DAT-DAC | [schemas/artefacts/domains/data/conceptual/DAT-DAC.md](schemas/artefacts/domains/data/conceptual/DAT-DAC.md) |
| APP-DAP | [schemas/artefacts/domains/application/logical/APP-DAP.md](schemas/artefacts/domains/application/logical/APP-DAP.md) |

## Workflows

The automated workflows that validate, process, and publish architecture changes are documented in the [workflows/](workflows/) section. Start at the [workflows index](workflows/index.md) for the full list.
