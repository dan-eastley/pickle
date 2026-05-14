# Output Formats

All architecture artefact types must conform to one of three formats. This keeps outputs consistent, comparable, and machine-queryable.

```mermaid
flowchart TB
    A[Any artefact type]

    A --> C["<b>Catalogue</b><br/><sub>list of entities<br/>1 domain × 1 layer</sub>"]
    A --> D["<b>Diagram</b><br/><sub>visual representation<br/>≥1 domain × 1 layer</sub>"]
    A --> M["<b>Matrix</b><br/><sub>grid of relationships<br/>crosses layers or domains</sub>"]

    classDef format fill:#f3e5f5,stroke:#7b1fa2,color:#000
    class C,D,M format
```

| Format | Description | Scope |
|---|---|---|
| **Catalogue** | A list of entities of a single type (e.g. applications, capabilities, data entities). Entities may be conceptual, logical, or physical. May be hierarchical — the hierarchy is captured within the catalogue itself. | Single architecture domain, single abstraction layer |
| **Matrix** | A grid expressing relationships between two sets of entities. Used to map links that cross abstraction layers (e.g. conceptual data model → logical data model) or that cross architecture domains (e.g. application architecture → data architecture). | May span architecture domains and/or abstraction layers |
| **Diagram** | A visual representation of entities and their relationships (e.g. Business Capability Model, Conceptual Data Model, System Wiring Diagram). | May span one or more architecture domains, but must be limited to a single abstraction layer |

## Storage

- **Catalogues** are stored as JSON, validated by a JSON Schema in `/schemas/artefacts/domains/<domain>/<layer>/<ID>.json`.
- **Matrices** — format conventions TBD.
- **Diagrams** — format conventions TBD (likely an output of catalogues + matrices rather than authored directly).
