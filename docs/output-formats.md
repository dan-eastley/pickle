# Output Formats

Every architecture artefact type conforms to one of four formats. The format determines how the content is structured, stored, and displayed.

Valid format values (enforced as an enum in `lib/artefacts.js` and referenced in each schema's `meta.format` field):

| Format | Display order | Description | Scope |
|---|---|---|---|
| **Catalogue** | 1 | A structured list of architecture entities of a single type (e.g. capabilities, applications, data concepts). May be hierarchical — parent/child relationships are captured within the catalogue. Validated by a JSON Schema. | Single domain, single abstraction layer |
| **Diagram** | 2 | A visual representation of entities and their relationships (e.g. Business Capability Model, Conceptual Data Model, Interface Wiring Diagram). Typically derived from catalogue content; rendered by the UI from JSON data. | May span one or more domains; single abstraction layer |
| **Document** | 3 | Structured narrative content validated by JSON Schema. Supports multiple named instances (e.g. one Architecture Vision per programme). Renders with a sticky section navigator and inline diagram references. Used for architecture deliverables that contain prose, structured lists, and embedded diagrams rather than entity catalogues. | Single domain, single abstraction layer |
| **Matrix** | 4 | A grid expressing relationships between two sets of entities. Used to map connections that cross abstraction layers (e.g. conceptual → logical) or architecture domains (e.g. application → data). | May span domains and/or abstraction layers |

## Format order

Artefact types are displayed in format order: **Catalogues → Diagrams → Documents → Matrices**. Within each format group, starred (key) artefact types are shown first.

## Storage

| Format | Storage | Validation |
|---|---|---|
| **Catalogue** | JSON | JSON Schema at `config/schemas/artefacts/domains/<domain>/<layer>/<ID>.json` |
| **Diagram** | JSON | JSON Schema at `config/schemas/artefacts/domains/<domain>/<layer>/<ID>.json` — `meta.diagramType` controls the renderer |
| **Document** | JSON | JSON Schema at `config/schemas/artefacts/domains/<domain>/<layer>/<ID>.json` — root object has a `documents` array; each element is a named document instance |
| **Matrix** | JSON | JSON Schema at `config/schemas/artefacts/domains/<domain>/<layer>/<ID>.json` |

## Matrix placement

A Matrix joins two source artefacts. Each source artefact has a domain and an abstraction layer, ordered along two axes:

- **Domain order:** Business < Data < Application < Integration < Solution (see [domains.md](domains.md))
- **Abstraction order:** Conceptual < Logical < Physical (see [abstraction-layers.md](abstraction-layers.md))

**Rule:** the matrix lives at the domain/abstraction of whichever source artefact is **more downstream on both axes** — its "home" artefact. The home artefact's array becomes the matrix's `rows`; the other source's array becomes `columns`. The matrix ID is `<home-domain-acronym>-<columns-suffix>-<rows-suffix>`.

This is the pattern already used by the per-domain `<DOM>-STR-PRN` (home = `<DOM>-PRN`, Logical; STR = columns, PRN = rows) and `<DOM>-PRN-GRD` (home = `<DOM>-GRD`, Physical) matrices, generalised to pairs that cross domains and/or abstraction layers:

| Matrix | Source A | Source B | Home (more downstream on both axes) | `columns` | `rows` | ID |
|---|---|---|---|---|---|---|
| [BUS-STR-PRN](schemas/artefacts/domains/business/logical/BUS-STR-PRN.md) | BUS-STR (business/conceptual) | BUS-PRN (business/logical) | BUS-PRN (logical > conceptual) | BUS-STR.strategies | BUS-PRN.principles | `BUS-STR-PRN` |
| [APP-DAP-CAT](schemas/artefacts/domains/application/physical/APP-DAP-CAT.md) | APP-DAP (application/logical) | APP-CAT (application/physical) | APP-CAT (physical > logical) | APP-DAP.platforms | APP-CAT.applications | `APP-DAP-CAT` |
| [APP-CAP-DAP](schemas/artefacts/domains/application/logical/APP-CAP-DAP.md) | BUS-CAP (business/conceptual) | APP-DAP (application/logical) | APP-DAP (application > business, logical > conceptual) | BUS-CAP.capabilities | APP-DAP.platforms | `APP-CAP-DAP` |
| [INT-DAC-IFC](schemas/artefacts/domains/integration/logical/INT-DAC-IFC.md) | DAT-DAC (data/conceptual) | INT-IFC (integration/logical) | INT-IFC (integration > data, logical > conceptual) | DAT-DAC.concepts | INT-IFC.interfaces | `INT-DAC-IFC` |

When one source artefact is filtered before being used as `columns` or `rows` (e.g. APP-CAP-DAP only maps against Level 2 BUS-CAP capabilities), the matrix schema's `meta.matrix.columns`/`rows` carries an optional `filter: { field, equals }` block — see [APP-CAP-DAP](schemas/artefacts/domains/application/logical/APP-CAP-DAP.md#column-filter) for the worked example.

## Diagram types

Diagram artefacts carry a `meta.diagramType` field that controls which renderer the UI uses. Valid `diagramType` values (defined in `lib/artefacts.js`):

| `diagramType` | Renderer | Examples | Description |
|---|---|---|---|
| `card-based` | `NestedGroupDiagram` | BUS-BCM, APP-DPM | Hierarchical nested cards — groups containing items. Click a card to see detail in a slide panel. |
| `process-flow` | `ProcessFlowDiagram` | BUS-BPM | Overlapping SVG chevrons arranged in rows: one row per Level 1 process, chevrons left-to-right representing Level 2 execution sequence. Drill-down rows show Level 3. |
| `wiring` | `WiringDiagram` | INT-WRD | Platform-to-platform integration landscape — nodes connected by labelled flow lines. Click a connection to see its interfaces in a slide panel. |
| `entity-based` | _(planned)_ | DAT-CDM | Entity-relationship style for conceptual data models. |
| `sequence` | _(planned)_ | — | Ordered message/event flow between actors or systems. |
| `network` | _(planned)_ | — | Node-and-edge topology for infrastructure or integration landscape overviews. |
| `timeline` | _(planned)_ | — | Roadmap or change-over-time view. |

## Document sections

Document artefacts contain a `documents` array — each element is a named instance (e.g. one Architecture Vision per programme). The UI renders each document type with a type-specific set of sections:

| Artefact | Layer | Sections |
|---|---|---|
| [SOL-AVI](schemas/artefacts/domains/solution/conceptual/SOL-AVI.md) | Conceptual | Executive Summary · Vision Statement · Drivers · Strategic Objectives · Constraints · Assumptions · Related Capabilities · Diagrams |
| [SOL-AIN](schemas/artefacts/domains/solution/conceptual/SOL-AIN.md) | Conceptual | Intent Statement · Context · Drivers · Options Considered · Recommended Direction · Principles · Guardrails · Open Questions · Diagrams |
| [SOL-SVI](schemas/artefacts/domains/solution/logical/SOL-SVI.md) | Logical | Executive Summary · Problem Statement · Solution Overview · Key Capabilities · Platforms Involved · Assumptions · Risks · Open Questions · Diagrams |
| [SOL-SDE](schemas/artefacts/domains/solution/logical/SOL-SDE.md) | Logical | Overview · Solution Components · Data Flows · UML Diagrams · Interface Requirements · Non-Functional Requirements · Assumptions · Open Questions · Diagrams |
| [SOL-ISP](schemas/artefacts/domains/solution/physical/SOL-ISP.md) | Physical | Overview · Endpoints · Data Model · Error Handling · SLA · Test Scenarios · Diagrams |

`diagrams` entries in any document reference other artefacts by ID (e.g. `BUS-BCM`). The UI renders them as links to the live artefact view.
