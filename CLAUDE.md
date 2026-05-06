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
├── schemas/                        # JSON Schema definitions for all node types
│   ├── node-types.json             # Registry of node types with $refs to domain schemas
│   ├── client.json                 # Schema for architectures/<client>/client.json
│   ├── version.json                # Schema for architectures/<client>/<version>/version.json
│   └── domains/
│       └── application/             # Schema files per node type (platform, application, function)
│
├── architectures/                       # Per-client architecture state, versioned by release
│   └── <client>/
│       ├── client.json             # Client metadata (id, name)
│       └── <version>/
│           ├── version.json        # Version metadata (status)
│           ├── domains/
│           │   ├── business/
│           │   │   ├── conceptual/
│           │   │   ├── logical/
│           │   │   └── physical/
│           │   ├── data/
│           │   │   ├── conceptual/
│           │   │   ├── logical/
│           │   │   └── physical/
│           │   ├── integration/
│           │   │   ├── conceptual/
│           │   │   ├── logical/
│           │   │   └── physical/
│           │   ├── application/
│           │   │   ├── conceptual/
│           │   │   ├── logical/
│           │   │   └── physical/
│           │   └── solution/
│           │       ├── conceptual/
│           │       ├── logical/
│           │       └── physical/
│           └── adrs/               # Architecture Decision Records for this release
│
```

---

## Architecture Model

### Hierarchy

| Level | Name | Description |
|---|---|---|
| 1 | **Strategy** | Vision — high-level, conceptual ("should have") |
| 2 | **Principles** | Guidelines — medium-level, logical ("could have") |
| 3 | **Guardrails** | Non-negotiables — physical patterns and constraints ("must have") |

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
- Node instance files: plural noun matching the node type (e.g., `platforms.json`, `applications.json`)
- ADR files: `adr-<number>.md` inside `adrs/`
- Branch names for ADRs: `<client>/<release>/adr-<number>`

### Schema Conventions
- All node type schemas live under `schemas/domains/<domain>/`
- `schemas/node-types.json` is the registry — add new node types here with a `$ref` to their schema
- Instance data in `architectures/` must conform to the corresponding schema in `schemas/`

### Versioning
- Architecture state is versioned per client: `architectures/<client>/version-<semver>/`
- A new version folder represents a new release baseline
- Do not edit data in a previous version folder — create a new version instead

---

## Working with Claude

### Common Tasks
- **Add a new node type:** Add a JSON Schema to `schemas/domains/<domain>/`, register it in `schemas/node-types.json`
- **Add architecture data for a client:** Create or update files under `architectures/<client>/<version>/domains/`
- **Raise an ADR:** Create a branch following the naming convention, add the ADR file to the correct `adrs/` folder
- **Query the architecture:** Read the relevant JSON files in `architectures/` against the schemas in `schemas/`

### Things to Preserve
- JSON Schema `$ref` references — these are load-bearing for validation
- Branch naming convention for ADRs — other tooling will depend on this pattern
- The three-level hierarchy within each domain — don't flatten or skip levels

---

## Open Questions / Work in Progress

- [ ] Schemas only exist for the Application domain node types — Business, Data, Integration, and Solution domain schemas are not yet defined
- [ ] No CI/CD workflows — JSON validation and ADR branch naming are not yet enforced automatically
- [ ] No diagram/view generation implemented yet
- [ ] Ingestion path into EA tooling (e.g. via CALM or similar) not decided
- [ ] AI-driven architecture change application (using ADRs to update architecture state) not yet implemented
