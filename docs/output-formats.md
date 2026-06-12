# Output Formats

Every architecture artefact type conforms to one of four formats. The format determines how the content is structured, stored, and displayed.

Valid format values (enforced as an enum in `lib/artefacts.js` and referenced in each schema's `meta.format` field):

| Format | Display order | Description | Scope |
|---|---|---|---|
| **Catalogue** | 1 | A structured list of architecture entities of a single type (e.g. capabilities, applications, data concepts). May be hierarchical — parent/child relationships are captured within the catalogue. Validated by a JSON Schema. | Single domain, single abstraction layer |
| **Matrix** | 2 | A grid expressing relationships between two sets of entities. Used to map connections that cross abstraction layers (e.g. conceptual → logical) or architecture domains (e.g. application → data). | May span domains and/or abstraction layers |
| **Diagram** | 3 | A visual representation of entities and their relationships (e.g. Business Capability Model, Conceptual Data Model, System Context Diagram). Authored separately; typically generated from catalogue and matrix content. | May span one or more domains; single abstraction layer |
| **Document** | 4 | Free-form narrative content authored in Markdown. Used for contextual, explanatory, or reference artefacts that do not fit a structured schema. | Single domain, single abstraction layer |

## Format order

Artefact types are displayed in format order: **Catalogues → Matrices → Diagrams → Documents**. Within each format group, starred (key) artefact types are shown first.

## Storage

| Format | Storage | Validation |
|---|---|---|
| **Catalogue** | JSON | JSON Schema at `config/schemas/artefacts/domains/<domain>/<layer>/<ID>.json` |
| **Matrix** | TBD | TBD |
| **Diagram** | TBD | Typically derived from catalogue/matrix content rather than authored directly |
| **Document** | Markdown | No schema — free-form |

## Matrix placement

A Matrix joins two source artefacts. Each source artefact has a domain and an abstraction layer, ordered along two axes:

- **Domain order:** Business < Data < Integration < Application < Solution (see [domains.md](domains.md))
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
