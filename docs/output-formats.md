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
