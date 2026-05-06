# CLAUDE.md

This file gives Claude Code context about this repository. Update it as the project evolves.

---

## Project Overview

This is a **proof of concept for Architecture as Code** — a structured approach to capturing, versioning, and querying enterprise architecture using GitHub as the source of truth. GitHub Copilot and Claude are used to propose and apply changes through a governed ADR-driven workflow.

**Goal:** Store architecture models as structured data (JSON), use AI to propose changes, generate views/diagrams, and query the architecture state.

---

## Repository Structure

```
/
├── schemas/                        # JSON Schema definitions — mirrors architectures/ layout
│   ├── clients.json                # Schema for architectures/clients.json (index)
│   ├── versions.json               # Schema for architectures/<client>/versions.json (index)
│   ├── artefacts.json              # Registry of available artefact catalogue schemas
│   └── artefacts/
│       └── domains/
│           ├── business/
│           │   └── conceptual/
│           │       ├── BUS-CAP.json   # Business Capabilities catalogue schema
│           │       └── BUS-PRO.json   # Business Processes catalogue schema
│           └── data/
│               └── conceptual/
│                   └── DAT-DAC.json   # Data Domains & Concepts catalogue schema
│
├── architectures/                  # Per-client architecture state, versioned by release
│   ├── clients.json                # Index of clients (IDs only)
│   └── <client>/
│       ├── client.json             # Client metadata (id, name)
│       ├── versions.json           # Index of versions for this client (IDs only)
│       └── <version>/
│           ├── version.json        # Version metadata (id, name, status)
│           ├── artefacts/
│           │   └── domains/
│           │       ├── business/{conceptual,logical,physical}/
│           │       │   └── <ARTEFACT-ID>/    # one folder per artefact (e.g. BUS-CAP/)
│           │       ├── data/{conceptual,logical,physical}/
│           │       │   └── <ARTEFACT-ID>/
│           │       ├── integration/{conceptual,logical,physical}/
│           │       ├── application/{conceptual,logical,physical}/
│           │       └── solution/{conceptual,logical,physical}/
│           └── adrs/               # Architecture Decision Records for this release
│
```

---

## Architecture Model

### Domains

Each client version is modelled across five architecture domains.

| Domain | Folder | Description |
|---|---|---|
| **Business Architecture** | `business/` | Captures the organisation's capabilities, processes, and operating model. Defines what the business does and why, providing the context that all other domains serve. |
| **Data Architecture** | `data/` | Describes the data assets, structures, flows, and governance that support business operations. Ensures data is well-defined, trusted, and available where needed. |
| **Integration Architecture** | `integration/` | Defines how systems, services, and data flows connect and communicate. Covers APIs, event streams, messaging patterns, and the rules governing inter-system exchange. |
| **Application Architecture** | `application/` | Describes the software applications, platforms, and functions that deliver business capabilities. Covers the portfolio of applications and how they relate to each other and to business needs. |
| **Solution Architecture** | `solution/` | Cross-cutting designs that span multiple domains to address a specific business problem or initiative. Brings together business, data, integration, and application concerns into a coherent delivery blueprint. |

### Abstraction Layers

Each domain is modelled at three layers of abstraction. Every folder under a domain maps to one of these layers.

| Layer | Folder | Description |
|---|---|---|
| **Conceptual** | `conceptual/` | The *what* and *why*. Technology-agnostic models that capture intent, scope, and business context. Audience: business stakeholders and architects aligning on direction. |
| **Logical** | `logical/` | The *how*. Vendor-neutral models that define structure, relationships, and rules without committing to specific products or infrastructure. Audience: architects and senior engineers designing solutions. |
| **Physical** | `physical/` | The *where* and *with what*. Concrete, implementation-specific models tied to actual products, platforms, and environments. Audience: engineers building and operating the architecture. |

### Output Formats

All architecture artefacts must conform to one of three formats. This keeps outputs consistent, comparable, and machine-queryable.

| Format | Description | Scope |
|---|---|---|
| **Catalogue** | A list of entities of a single type (e.g. applications, capabilities, data entities). Entities may be conceptual, logical, or physical. May be hierarchical — the hierarchy is captured within the catalogue itself. | Single domain, single abstraction layer |
| **Matrix** | A grid expressing relationships between two sets of entities. Used to map links that cross abstraction layers (e.g. conceptual data model → logical data model) or that cross domains (e.g. application architecture → data architecture). | May span domains and/or abstraction layers |
| **Diagram** | A visual representation of entities and their relationships (e.g. Business Capability Model, Conceptual Data Model, System Wiring Diagram). | May span one or more domains, but must be limited to a single abstraction layer |

### Architecture Artefacts

Every artefact produced is aligned to a single domain, a single abstraction layer, and one of the three output formats above. Each artefact has a unique ID prefixed with the domain acronym:

| Domain | Acronym |
|---|---|
| Business | `BUS` |
| Data | `DAT` |
| Application | `APP` |
| Integration | `INT` |
| Solution | `SOL` |

Each artefact has a folder under `artefacts/domains/<domain>/<layer>/<ARTEFACT-ID>/` containing its instance data. Catalogues are backed by a JSON Schema in the matching path under `schemas/`; matrices and diagrams will follow their own format conventions (TBD).

| ID | Domain | Abstraction | Format | Output | Summary |
|---|---|---|---|---|---|
| BUS-CAP | Business | Conceptual | Catalogue | Business Capabilities | |
| BUS-BCM | Business | Conceptual | Diagram | Business Capability Model | Model of the Business Capabilities Catalogue (BUS-CAP) |
| BUS-PRO | Business | Conceptual | Catalogue | Business Processes | |
| BUS-BPM | Business | Conceptual | Diagram | Business Process Model | Model of the Business Processes Catalogue (BUS-PRO) |
| DAT-DAC | Data | Conceptual | Catalogue | Domains & Concepts | |
| DAT-CDM | Data | Conceptual | Diagram | Conceptual Data Model | Model of the Domains & Concepts Catalogue (DAT-DAC) |

### Change Control

All architecture changes are driven by **Architecture Decision Records (ADRs)**. An ADR is the only way to propose a change to the architecture state.

- ADR branch naming: `<client>/<release>/adr-<number>`
- Each ADR lives under `architectures/<client>/<version>/adrs/`
- The ADR branch naming convention is enforced by convention — validate manually or via a future CI workflow

---

## Tech Stack

| Layer | Technology |
|---|---|
| Storage format | JSON |
| Schema validation | JSON Schema (`$ref`-based, per domain) |
| AI tooling | Claude Code |

---

## Standards & Conventions

### File Naming
- Artefact folders: named with the artefact ID (e.g. `BUS-CAP/`, `DAT-DAC/`)
- Catalogue schemas: named with the artefact ID and `.json` suffix (e.g. `BUS-CAP.json`)
- ADR files: `adr-<number>.md` inside `adrs/`
- Branch names for ADRs: `<client>/<release>/adr-<number>`

### Indexes
- `architectures/clients.json` is the authoritative list of client IDs (no metadata — that lives in `architectures/<client>/client.json`)
- `architectures/<client>/versions.json` is the authoritative list of version IDs for a client (no metadata — that lives in `architectures/<client>/<version>/version.json`)
- `schemas/clients.json` and `schemas/versions.json` validate the index files; the singular metadata files have no schema yet
- `schemas/artefacts.json` is a registry of all available artefact catalogue schemas — add new entries here when introducing a new artefact
- When adding or removing a client/version folder, update the corresponding index file

### Schema Conventions
- The `schemas/` tree mirrors the `architectures/<client>/<version>/` tree — schema and instance for the same artefact live at the same relative path
- Catalogue schemas live at `schemas/artefacts/domains/<domain>/<layer>/<ARTEFACT-ID>.json`
- Instance data in `architectures/` must conform to the matching schema in `schemas/`

### Versioning
- Architecture state is versioned per client: `architectures/<client>/version-<semver>/`
- A new version folder represents a new release baseline
- Do not edit data in a previous version folder — create a new version instead

---

## Working with Claude

### Common Tasks
- **Add a new artefact:** Add a row to the Architecture Artefacts table, create a matching folder in each client version under `architectures/<client>/<version>/artefacts/domains/<domain>/<layer>/<ID>/`, and (for catalogues) add a schema at `schemas/artefacts/domains/<domain>/<layer>/<ID>.json`
- **Add architecture data for a client:** Create or update instance files inside the relevant artefact folder
- **Raise an ADR:** Create a branch following the naming convention, add the ADR file to the correct `adrs/` folder
- **Query the architecture:** Read the relevant JSON files in `architectures/` against the schemas in `schemas/`

### Things to Preserve
- The mirroring of `schemas/` and `architectures/<client>/<version>/` paths — this is how schemas are located for validation
- Artefact ID prefixes (`BUS-`, `DAT-`, `APP-`, `INT-`, `SOL-`) — they encode the domain
- Branch naming convention for ADRs — other tooling will depend on this pattern
- The three abstraction layers within each domain — don't flatten or skip levels

---

## Open Questions / Work in Progress

- [ ] Catalogue schemas only exist for `BUS-CAP`, `BUS-PRO`, and `DAT-DAC` — schemas for other catalogues, plus all matrix and diagram formats, are not yet defined
- [ ] No artefacts are yet defined for the Application, Integration, or Solution domains
- [ ] No artefacts are yet defined at the Logical or Physical abstraction layers
- [ ] No CI/CD workflows — JSON validation and ADR branch naming are not yet enforced automatically
- [ ] No diagram/view generation implemented yet
- [ ] Ingestion path into EA tooling (e.g. via CALM or similar) not decided
- [ ] AI-driven architecture change application (using ADRs to update architecture state) not yet implemented
