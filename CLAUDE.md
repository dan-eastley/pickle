# CLAUDE.md

This file gives Claude Code context about this repository. Update it as the project evolves.

---

## Project Overview

This is a **proof of concept for Architecture as Code** — a structured approach to capturing, versioning, and querying enterprise architecture using GitHub as the source of truth. GitHub Copilot and Claude are used to propose and apply changes through a governed ADR-driven workflow.

**Goal:** Store architecture models as structured data (JSON), use AI to propose changes, generate views/diagrams, and query the architecture state.

---

## Documentation

For full context on the architecture model — architecture domains, abstraction layers, output formats, artefact-type registry, and per-schema documentation — read [`/documentation/`](documentation/). Start at [`/documentation/index.md`](documentation/index.md), which signposts every other page.

**Before doing anything non-trivial in this repository, read at minimum:**
- [`/documentation/domains.md`](documentation/domains.md) — the five architecture domains and their acronyms
- [`/documentation/abstraction-layers.md`](documentation/abstraction-layers.md) — Conceptual / Logical / Physical
- [`/documentation/output-formats.md`](documentation/output-formats.md) — Catalogue / Matrix / Diagram
- [`/documentation/artefacts.md`](documentation/artefacts.md) — registry of every defined artefact type
- The relevant schema page under [`/documentation/schemas/`](documentation/schemas/) when working with a specific catalogue

---

## Repository Structure

```
/
├── .github/
│   ├── scripts/                    # Shared helper scripts used by workflows
│   └── workflows/                  # GitHub Actions — see /documentation/workflows/
│
├── documentation/                  # Markdown documentation, navigable in GitHub
│   ├── index.md                    # Top-level documentation index
│   ├── domains.md                  # The five architecture domains
│   ├── abstraction-layers.md       # Conceptual / Logical / Physical
│   ├── output-formats.md           # Catalogue / Matrix / Diagram
│   ├── artefacts.md                # Artefact-type registry
│   ├── schemas/                    # One markdown page per JSON Schema
│   │   ├── index.md
│   │   ├── clients.md, client.md, versions.md, version.md
│   │   ├── artefacts.md            # The schema-index file
│   │   ├── decision.md             # Machine-readable ADR
│   │   ├── BUS-CAP.md, BUS-PRO.md, DAT-DAC.md, APP-DAP.md
│   │   └── <DOM>-STR.md, <DOM>-PRN.md, <DOM>-GRD.md   # Five domains x three layers
│   └── workflows/                  # One markdown page per GitHub Actions workflow
│       ├── index.md
│       ├── validate-{branch,merge,schema}.md
│       ├── create-{pull-request,release}.md
│       └── decisions-pipeline.md   # Covers all seven decisions-* workflows
│
├── schemas/                        # JSON Schema definitions — mirrors architectures/ layout
│   ├── clients.json, client.json
│   ├── versions.json, version.json
│   ├── decision.json               # ADR schema (used by decisions/<id>.json)
│   ├── artefacts.json              # Schema index — artefact-type ID -> catalogue schema $ref
│   └── artefacts/
│       └── domains/
│           ├── business/{conceptual,logical,physical}/
│           │   └── <ARTEFACT-ID>.json   # e.g. BUS-CAP.json (catalogues only)
│           ├── data/{conceptual,logical,physical}/
│           ├── integration/{conceptual,logical,physical}/
│           ├── application/{conceptual,logical,physical}/
│           └── solution/{conceptual,logical,physical}/
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
│           │       │   └── <ARTEFACT-ID>/    # one folder per artefact type (e.g. BUS-CAP/)
│           │       ├── data/{conceptual,logical,physical}/
│           │       │   └── <ARTEFACT-ID>/
│           │       ├── integration/{conceptual,logical,physical}/
│           │       ├── application/{conceptual,logical,physical}/
│           │       │   └── <ARTEFACT-ID>/
│           │       └── solution/{conceptual,logical,physical}/
│           └── decisions/          # Architecture Decision Records (ADRs) for this release
│
└── CLAUDE.md                       # This file
```

The `schemas/` and `architectures/<client>/<version>/` trees deliberately mirror each other — schema and instance for the same artefact type share a relative path.

---

## Change Control

All architecture changes are driven by **Architecture Decision Records (ADRs)**. An ADR is the only way to propose a change to the architecture state.

- ADR branch naming: `decisions/<client-id>/<version-id>/<decision-id>`
- Each ADR lives under `architectures/<client>/<version>/decisions/`
- Branch naming for all branches is enforced by `.github/workflows/validate-branch.yml` (see Branch Naming below)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Storage format | JSON |
| Schema validation | JSON Schema (`$ref`-based) |
| Documentation | Markdown (GitHub-rendered) |
| AI tooling | Claude Code |

---

## Standards & Conventions

### File Naming
- Artefact-type folders: named with the artefact-type ID (e.g. `BUS-CAP/`, `DAT-DAC/`, `APP-DAP/`)
- Catalogue schemas: named with the artefact-type ID and `.json` suffix (e.g. `BUS-CAP.json`)
- Catalogue instance files: named with the artefact-type ID inside the artefact-type folder (e.g. `BUS-CAP/BUS-CAP.json`)
- ADR files: `adr-<number>.md` inside `decisions/`

### Branch Naming
The only branch names accepted by the remote are:

| Pattern | Purpose |
|---|---|
| `main` | Default branch |
| `develop` | Integration branch |
| `features/<feature-id>` | Codebase changes (anything not driven by an ADR) |
| `decisions/<client-id>/<version-id>/<decision-id>` | Architecture changes driven by an ADR |

Enforced by [`.github/workflows/validate-branch.yml`](.github/workflows/validate-branch.yml), which runs on the GitHub `create` event whenever a new branch ref lands on the remote (including renames). The workflow fails — and the branch creation is flagged — if the name doesn't match one of the patterns above. Existing branches at the time the workflow was introduced are grandfathered in.

### Indexes
- `architectures/clients.json` is the authoritative list of client IDs (no metadata — that lives in `architectures/<client>/client.json`)
- `architectures/<client>/versions.json` is the authoritative list of version IDs for a client (no metadata — that lives in `architectures/<client>/<version>/version.json`)
- `schemas/clients.json` and `schemas/versions.json` validate the index files; `schemas/client.json` and `schemas/version.json` validate the singular metadata files
- `schemas/artefacts.json` is a **schema index** — a flat map of artefact-type ID → catalogue schema `$ref`. The full artefact-type registry (catalogues, diagrams, matrices) lives in `documentation/artefacts.md`.
- When adding or removing a client/version folder, update the corresponding index file

### Schema Conventions
- The `schemas/` tree mirrors the `architectures/<client>/<version>/` tree — schema and instance for the same artefact type live at the same relative path
- Catalogue schemas live at `schemas/artefacts/domains/<domain>/<layer>/<ARTEFACT-ID>.json`
- Each catalogue schema has a corresponding markdown page in `documentation/schemas/<ARTEFACT-ID>.md`
- Instance data in `architectures/` must conform to the matching schema in `schemas/`

### Versioning
- Architecture state is versioned per client: `architectures/<client>/version-<semver>/`
- A new version folder represents a new release baseline
- Do not edit data in a previous version folder — create a new version instead

---

## Working with Claude

### Common Tasks
- **Add a new artefact type:** See the procedure documented in [`/documentation/artefacts.md`](documentation/artefacts.md) — add registry entry, schema (if catalogue), schema doc page, and per-version folders
- **Add architecture data for a client:** Create or update instance files inside the relevant artefact-type folder
- **Raise an ADR:** Create a `decisions/<client-id>/<version-id>/<decision-id>` branch, add the ADR file to the matching `architectures/<client>/<version>/decisions/` folder
- **Query the architecture:** Read the relevant JSON files in `architectures/` against the schemas in `schemas/`

### Things to Preserve
- The mirroring of `schemas/`, `architectures/<client>/<version>/artefacts/`, and `documentation/schemas/` paths — this is how schemas, instances, and docs are kept in lockstep
- Artefact-type ID prefixes (`BUS-`, `DAT-`, `APP-`, `INT-`, `SOL-`) — they encode the architecture domain
- Branch naming patterns (`main`, `develop`, `features/...`, `decisions/...`) — enforced by `validate-branch.yml`; other tooling will depend on these
- The three abstraction layers within each architecture domain — don't flatten or skip levels

---

## Open Questions / Work in Progress

- [ ] Every architecture domain × abstraction layer slot now has a baseline `<DOM>-STR` / `<DOM>-PRN` / `<DOM>-GRD` catalogue. Domain-specific catalogues exist for `BUS-CAP`, `BUS-PRO`, `DAT-DAC`, and `APP-DAP` — others (e.g. integration patterns, solution blueprints) are not yet defined.
- [ ] Matrix and diagram formats not yet defined (only catalogues are schema-backed)
- [ ] Branch naming is enforced by CI (`validate-branch.yml`); no other CI/CD workflows yet — JSON validation and ADR folder/file consistency are not yet enforced automatically
- [ ] No diagram/view generation implemented yet
- [ ] Ingestion path into EA tooling (e.g. via CALM or similar) not decided
- [ ] AI-driven architecture change application (using ADRs to update architecture state) not yet implemented
