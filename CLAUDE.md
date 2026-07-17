# CLAUDE.md

This file gives Claude Code context about this repository. Update it as the project evolves.

---

## Project Overview

**Pickle** is an **Architecture as Code** platform — a structured approach to capturing, versioning, and querying enterprise architecture using GitHub as the source of truth. Claude Code (via GitHub Actions) proposes and applies changes through a governed, ADR-driven workflow.

It has two halves:
- **The architecture model** — architecture state stored as structured JSON under `architectures/`, validated by JSON Schema under `config/schemas/`.
- **The Pickle web app** (`src/`) — a React/Vite SPA + Vercel serverless API that renders the model (catalogues, diagrams, matrices, documents), drives the decision/discovery governance workflows, and manages auth and per-architecture access.

**Goal:** store architecture models as structured data, use AI to propose and apply changes through governed decisions, render views/diagrams, and let teams query the architecture state.

> Pickle is moving from proof-of-concept toward production — hold production-quality standards (auth, validation, error handling, tests) for changes under `src/`.

---

## Documentation

For full context on the architecture model — architecture domains, abstraction layers, output formats, artefact-type registry, and per-schema documentation — read [`/docs/`](docs/). Start at [`/docs/index.md`](docs/index.md), which signposts every other page.

**Before doing anything non-trivial in this repository, read at minimum:**
- [`/docs/domains.md`](docs/domains.md) — the five architecture domains and their acronyms
- [`/docs/abstraction-layers.md`](docs/abstraction-layers.md) — Conceptual / Logical / Physical
- [`/docs/output-formats.md`](docs/output-formats.md) — Catalogue / Matrix / Diagram
- [`/docs/artefacts.md`](docs/artefacts.md) — registry of every defined artefact type
- The relevant schema page under [`/docs/schemas/`](docs/schemas/) when working with a specific catalogue

---

## Repository Structure

```
/
├── .github/
│   └── workflows/                  # GitHub Actions — see /docs/workflows/
│
├── config/
│   ├── prompts/                    # Prompts loaded by Claude-driven workflows (personas + i18n; see prompts/README.md)
│   │   ├── decisions/              # One markdown prompt per decision-analysis + apply workflow
│   │   └── discovery/              # Prompt for the Virtual Architect (discovery) workflow
│   ├── i18n/                       # Localised UI strings (en.json), overlaid on the artefact registry
│   ├── roles.json                  # Role taxonomy (artefact audience/author, sign-up job roles)
│   ├── artefact-relationships.json # Generated artefact relationship map
│   └── schemas/                    # JSON Schema definitions — mirrors architectures/ layout
│       ├── architectures.json, architecture.json
│       ├── transitions.json, transition.json
│       ├── decisions.json, decision.json   # Decisions index + per-decision ADR schema
│       ├── artefacts.json          # Schema index — artefact-type ID -> catalogue schema $ref
│       └── artefacts/
│           └── domains/
│               ├── business/{conceptual,logical,physical}/
│               │   └── <ARTEFACT-ID>.json   # e.g. BUS-CAP.json (catalogues only)
│               ├── data/{conceptual,logical,physical}/
│               ├── integration/{conceptual,logical,physical}/
│               ├── application/{conceptual,logical,physical}/
│               └── solution/{conceptual,logical,physical}/
│
├── docs/                           # Markdown documentation, navigable in GitHub
│   ├── index.md                    # Top-level documentation index
│   ├── domains.md                  # The five architecture domains
│   ├── abstraction-layers.md       # Conceptual / Logical / Physical
│   ├── output-formats.md           # Catalogue / Matrix / Diagram
│   ├── artefacts.md                # Artefact-type registry
│   ├── schemas/                    # One markdown page per JSON Schema
│   │   ├── index.md
│   │   ├── architectures.md, architecture.md, transitions.md, transition.md
│   │   ├── artefacts.md            # The schema-index file
│   │   ├── decision.md             # Machine-readable ADR
│   │   └── artefacts/
│   │       └── domains/            # Mirrors config/schemas/artefacts/domains/ structure
│   │           ├── business/{conceptual,logical,physical}/
│   │           │   └── <ARTEFACT-ID>.md
│   │           ├── data/{conceptual,logical,physical}/
│   │           ├── integration/{conceptual,logical,physical}/
│   │           ├── application/{conceptual,logical,physical}/
│   │           └── solution/{conceptual,logical,physical}/
│   └── workflows/                  # One markdown page per GitHub Actions workflow
│       ├── index.md
│       ├── validate-{branch,merge,schema}.md
│       ├── create-{pull-request,release}.md
│       └── decisions-analysis.md   # Covers all decisions-* workflows
│
├── architectures/                  # Architecture state
│   ├── architectures.json          # Index of architectures (IDs only)
│   └── <architecture>/             # Per-architecture state, organised by transition
│       ├── architecture.json       # Architecture metadata (id, name, description)
│       ├── transitions.json        # Index of transitions for this architecture (IDs only)
│       └── <transition>/           # e.g. baseline, 2026-q2
│           ├── transition.json     # Transition metadata (id, name, status, description)
│           ├── domains/
│           │   ├── business/{conceptual,logical,physical}/
│           │   │   └── <ARTEFACT-ID>.json   # one file per artefact type (e.g. BUS-CAP.json)
│           │   ├── data/{conceptual,logical,physical}/
│           │   │   └── <ARTEFACT-ID>.json
│           │   ├── integration/{conceptual,logical,physical}/
│           │   ├── application/{conceptual,logical,physical}/
│           │   │   └── <ARTEFACT-ID>.json
│           │   └── solution/{conceptual,logical,physical}/
│           ├── decisions/
│           │   ├── decisions.json          # Index of decision IDs for this transition
│           │   └── <decision-id>/          # One folder per ADR (id form: ADR-NNN)
│           │       └── decision.json       # The ADR content
│           └── discovery/
│               ├── discovery.json          # Index of discovery IDs for this transition
│               └── <discovery-id>/         # One folder per discovery (id form: DSC-NNN)
│                   └── discovery.json      # The discovery record
│
├── src/                            # The Pickle web app (React + Vite SPA, Vercel serverless API)
│   ├── api/                        # Vercel functions: /api/content, /api/github, /api/auth/*
│   ├── lib/                        # Shared logic (artefact registry, permissions, GitHub client, …)
│   ├── components/ pages/ hooks/   # React UI
│   ├── context/                    # React providers (auth, permissions, architecture selection)
│   ├── db/                         # Drizzle ORM schema + migrations (Postgres, auth/memberships)
│   └── tests/e2e/                  # Playwright browser tests (smoke + auth setup)
│
├── tests/                          # Repo-level DATA validation (node): validate-schemas.mjs, validate-integrity.mjs, use-case runner
├── BACKLOG.md                      # Product backlog (Epic → Feature, stable IDs)
└── CLAUDE.md                       # This file
```

The `config/schemas/artefacts/domains/` tree mirrors `architectures/<architecture>/<transition>/domains/` — schema and instance for the same artefact type share a relative path under those roots (e.g. `config/schemas/artefacts/domains/business/conceptual/BUS-CAP.json` ↔ `architectures/<architecture>/<transition>/domains/business/conceptual/BUS-CAP.json`).

---

## Change Control

All architecture changes are driven by **Architecture Decision Records (ADRs)**. An ADR is the only way to propose a change to the architecture state.

- ADR branch naming: `decisions/<architecture-id>/<transition-id>/<decision-id>`
- Each ADR lives under `architectures/<architecture>/<transition>/decisions/`
- Branch naming for all branches is enforced by `.github/workflows/validate-branch.yml` (see Branch Naming below)

---

## Web Application (`src/`)

The app is a Vite SPA plus Vercel serverless functions. Work from `src/` (its own `package.json`).

- **Commands** (run in `src/`): `npm run dev` (dev server + local `/api` shim), `npm run build`, `npm test` (Vitest), `npm run test:e2e` (Playwright), `npm run lint`, `npm run typecheck`, `npm run format`.
- **Serverless API** — `src/api/*` run as **native ESM** on Vercel: use explicit `.js` import specifiers (even from `.ts`), and keep the `src/vercel.json` SPA rewrite excluding `/api` and `/assets`. Redeploy after env changes.
- **Auth is always enforced** — there is no auth-off mode. `RequireAuth` gates the client; the API (`/api/github`, `/api/content` for `architectures/`) requires a Better Auth session and **fails closed** (deny) when auth env is missing or no session — in every environment. Only local dev without a database is permissive. Writes are RBAC-checked (owner/contributor/consumer + global admin) in `lib/permissions.ts`.
- **Public vs gated content** — `/api/content` serves docs and schemas publicly but session-gates `architectures/` data (and never shared-caches it). Docs/schemas stay public.
- **Security headers** (CSP, HSTS, nosniff, frame-options, referrer/permissions policy) are set in `src/vercel.json`.
- **Email** (Resend) is gated on `RESEND_API_KEY`: with it set, sign-up sends a verification code and sign-in requires a verified address; without it, verification is skipped so local dev isn't locked out.
- **Error boundary** — `RouteErrorBoundary` auto-recovers a stale-deploy session (missing chunks or init-order/TDZ errors) with a one-shot reload.

### Testing layers

Two intentionally separate suites (kept split by design):

- **App tests — `src/`** — colocated unit tests (`src/**/*.test.{js,jsx}`, Vitest) and Playwright e2e (`src/tests/e2e/`). Run from `src/` via `npm test` / `npm run test:e2e`.
- **Repo-data validators — `tests/`** (repo root) — Node scripts that validate the architecture data + schemas at repo root (`node tests/validate-schemas.mjs`, `validate-integrity.mjs`) plus the browser use-case runner. Run from the repo root by CI. These live at root because they validate root data — do not move them into `src/`.

## Tech Stack

| Layer | Technology |
|---|---|
| Storage format | JSON |
| Schema validation | JSON Schema (`$ref`-based) |
| Documentation | Markdown (GitHub-rendered) |
| AI tooling | Claude Code |
| Web app (`src/`) | React 18 + Vite SPA, Tailwind CSS |
| API (`src/api/`) | Vercel serverless functions (TypeScript, native ESM) |
| Auth & memberships | Better Auth + Postgres (Drizzle ORM) |
| Transactional email | Resend (verification, password reset, invites) |
| App testing | Vitest + Testing Library; Playwright (e2e) |

---

## Standards & Conventions

### File Naming
- Catalogue schemas: named with the artefact-type ID and `.json` suffix (e.g. `BUS-CAP.json`)
- Catalogue instance files: named with the artefact-type ID and `.json` suffix, at `domains/<domain>/<abstraction>/<ARTEFACT-ID>.json` — mirrors the schema path (e.g. `BUS-CAP.json`)
- ADR files: `decision.json` inside a folder named after the decision ID (e.g. `ADR-001/decision.json`)

### Branch Naming
The only branch names accepted by the remote are:

| Pattern | Purpose |
|---|---|
| `main` | Default branch |
| `develop` | Integration branch |
| `features/<feature-id>` | Codebase changes (anything not driven by an ADR) |
| `decisions/<architecture-id>/<transition-id>/<decision-id>` | Architecture changes driven by an ADR |

Enforced by [`.github/workflows/validate-branch.yml`](.github/workflows/validate-branch.yml), which runs on the GitHub `create` event whenever a new branch ref lands on the remote (including renames). The workflow fails — and the branch creation is flagged — if the name doesn't match one of the patterns above. Existing branches at the time the workflow was introduced are grandfathered in.

### Indexes
- `architectures/architectures.json` is the authoritative list of architecture IDs (no metadata — that lives in `architectures/<architecture>/architecture.json`)
- `architectures/<architecture>/transitions.json` is the authoritative list of transition IDs for an architecture (no metadata — that lives in `architectures/<architecture>/<transition>/transition.json`)
- `architectures/<architecture>/<transition>/decisions/decisions.json` is the authoritative list of decision IDs for a transition (no metadata — that lives in `<decision-id>/decision.json` inside a folder named after the decision ID)
- `config/schemas/architectures.json` / `config/schemas/transitions.json` / `config/schemas/decisions.json` validate the index files; `config/schemas/architecture.json` / `config/schemas/transition.json` / `config/schemas/decision.json` validate the corresponding singular metadata / content files
- `config/schemas/artefacts.json` is a **schema index** — a flat map of artefact-type ID → catalogue schema `$ref`. The full artefact-type registry (catalogues, diagrams, matrices) lives in `docs/artefacts.md`.
- When adding or removing an architecture/transition folder, update the corresponding index file

### Schema Conventions
- The `config/schemas/artefacts/domains/` tree mirrors `architectures/<architecture>/<transition>/domains/` — schema and instance for the same artefact type live at the same relative path
- Catalogue schemas live at `config/schemas/artefacts/domains/<domain>/<layer>/<ARTEFACT-ID>.json`
- Each catalogue schema has a corresponding markdown page in `docs/schemas/artefacts/domains/<domain>/<layer>/<ARTEFACT-ID>.md`
- Each catalogue schema includes a `meta` object with `domain`, `abstraction`, and `format` fields
- Instance data in `architectures/` must conform to the matching schema in `config/schemas/`, and references it via a top-level `$schema` field (e.g. `"$schema": "urn:pickle:schemas:artefacts:domains:business:conceptual:BUS-CAP"`)

### Artefact Formats
- Artefact types conform to one of three formats: **Catalogue**, **Diagram**, or **Matrix** (see [`/docs/output-formats.md`](docs/output-formats.md))
- Use the term **Format** (not "Type") when referring to Catalogue / Diagram / Matrix

### Transition States
- Architecture state is organised per architecture by transition: `architectures/<architecture>/<transition>/` (folder name is the transition id, e.g. `baseline`, `2026-q2`)
- A new transition folder represents a new transition state (e.g. a target state for a planning horizon)
- Do not edit data in a previous transition folder once it is `published` or `archived` — create a new transition instead

---

## Working with Claude

### Common Tasks
- **Add a new artefact type:** See the procedure documented in [`/docs/artefacts.md`](docs/artefacts.md) — add registry entry, schema (if catalogue), schema doc page, and per-transition folders
- **Add architecture data for an architecture:** Create or update the `<ARTEFACT-ID>.json` instance file under `domains/<domain>/<abstraction>/`
- **Raise an ADR:** Create a `decisions/<architecture-id>/<transition-id>/<decision-id>` branch, add the ADR file to the matching `architectures/<architecture>/<transition>/decisions/` folder
- **Query the architecture:** Read the relevant JSON files in `architectures/` against the schemas in `config/schemas/`

### Things to Preserve
- The mirroring of `config/schemas/artefacts/`, `architectures/<architecture>/<transition>/domains/`, and `docs/schemas/artefacts/` paths — this is how schemas, instances, and docs are kept in lockstep
- Artefact-type ID prefixes (`BUS-`, `DAT-`, `APP-`, `INT-`, `SOL-`) — they encode the architecture domain
- Branch naming patterns (`main`, `develop`, `features/...`, `decisions/...`) — enforced by `validate-branch.yml`; other tooling will depend on these
- The three abstraction layers within each architecture domain — don't flatten or skip levels

---

## Open Questions / Work in Progress

- [ ] Every architecture domain × abstraction layer slot now has a baseline `<DOM>-STR` / `<DOM>-PRN` / `<DOM>-GRD` catalogue. Domain-specific catalogues exist for `BUS-CAP`, `BUS-PRO`, `DAT-DAC`, and `APP-DAP` — others (e.g. integration patterns, solution blueprints) are not yet defined.
- [x] The web app renders catalogues, diagrams (BCM, process-flow, wiring, sequence), matrices, and documents. Not every artefact type is schema-backed yet (catalogues are; diagrams/matrices are rendered from catalogue data).
- [x] CI validates the data: `validate-branch.yml` (branch names), `validate-schema.yml` / `ci.yml` (JSON Schema + referential integrity via `tests/`), plus the decision/discovery analysis workflows.
- [x] The AI-driven decision pipeline is implemented: decisions run analysis (7 streams), then `architecture-changes` → `apply-changes` translate an accepted decision into artefact edits opened as a PR.
- [ ] Ingestion path into EA tooling (e.g. via CALM or similar) not decided
- [ ] Matrix/diagram artefact **schemas** (as opposed to rendering) are not yet defined
