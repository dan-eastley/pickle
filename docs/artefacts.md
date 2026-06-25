# Artefact Types

An **artefact type** is a single, classified piece of architecture content. Every artefact type:

- Is aligned to exactly one [architecture domain](domains.md)
- Is aligned to exactly one [abstraction layer](abstraction-layers.md)
- Conforms to exactly one [output format](output-formats.md)
- Has a unique ID prefixed with the architecture domain acronym (e.g. `BUS-CAP`, `APP-DAP`)

Each artefact type has a folder under `architectures/clients/<client>/<version>/artefacts/domains/<domain>/<layer>/<ID>/` containing its instance data. Catalogues are backed by a JSON Schema at the matching path under `config/schemas/`.

## Cross-domain baseline (Strategy / Principles / Guardrails)

Every architecture domain carries three artefact types that capture the abstraction-layer semantics directly:

```mermaid
flowchart LR
    STR["<b>&lt;DOM&gt;-STR</b><br/>Conceptual<br/><sub>strategic intent<br/>(what & why)</sub>"]
    PRN["<b>&lt;DOM&gt;-PRN</b><br/>Logical<br/><sub>design principles<br/>(how)</sub>"]
    GRD["<b>&lt;DOM&gt;-GRD</b><br/>Physical<br/><sub>non-negotiable guardrails<br/>(where & with what)</sub>"]

    STR -- "refined into" --> PRN
    PRN -- "made concrete by" --> GRD

    classDef c fill:#e3f2fd,stroke:#1976d2,color:#000
    classDef l fill:#fff3e0,stroke:#f57c00,color:#000
    classDef p fill:#fce4ec,stroke:#c2185b,color:#000

    class STR c
    class PRN l
    class GRD p
```

- **`<DOM>-STR`** (Conceptual) — strategic intent; the *what* and *why*
- **`<DOM>-PRN`** (Logical) — design principles; the *how*
- **`<DOM>-GRD`** (Physical) — non-negotiable guardrails; the *where* and *with what*

The shapes are shared across all five architecture domains (so all five `<DOM>-STR` schemas have the same fields, just domain-specific examples), but each domain has its own schema doc page with a domain-specific example. See the matrix in [schemas/index.md](schemas/index.md).

## Registry

This table is the authoritative registry of every defined artefact type. Every row has a corresponding schema entry in [`/config/schemas/artefacts.json`](../config/schemas/artefacts.json), regardless of format.

| ID | Architecture Domain | Abstraction | Format | Name | Description |
|---|---|---|---|---|---|
| BUS-STR | Business | Conceptual | Catalogue | Business Architecture Strategy | Outcome-oriented strategic statements for the Business domain — the what and why at the highest level |
| BUS-CAP | Business | Conceptual | Catalogue | Business Capabilities | Hierarchical catalogue of what the business does, independent of how it does it |
| BUS-BCM | Business | Conceptual | Diagram | Business Capability Model | Visual map of the Business Capabilities Catalogue (BUS-CAP) |
| BUS-PRO | Business | Conceptual | Catalogue | Business Processes | Hierarchical catalogue of sequences of activities that deliver business value (Levels 1–3) |
| BUS-BPM | Business | Conceptual | Diagram | Business Process Model | Nested card diagram of the Business Processes Catalogue (BUS-PRO) — Level 1 overview with per-Level-1 drill-downs |
| BUS-CAP-PRO | Business | Conceptual | Matrix | Business Capabilities ↔ Business Processes | Many-to-many mapping between BUS-CAP capabilities and BUS-PRO processes at L1 and L2 |
| BUS-PRN | Business | Logical | Catalogue | Business Architecture Principles | Vendor-neutral guidelines that shape design decisions in the Business domain |
| BUS-STR-PRN | Business | Logical | Matrix | Business Architecture Strategy ↔ Principles | Many-to-many mapping between BUS-STR strategies and BUS-PRN principles |
| BUS-GRD | Business | Physical | Catalogue | Business Architecture Guardrails | Non-negotiable constraints and mandatory standards for the Business domain |
| BUS-PRN-GRD | Business | Physical | Matrix | Business Architecture Principles ↔ Guardrails | Many-to-many mapping between BUS-PRN principles and BUS-GRD guardrails |
| DAT-STR | Data | Conceptual | Catalogue | Data Architecture Strategy | Outcome-oriented strategic statements for the Data domain |
| DAT-DAC | Data | Conceptual | Catalogue | Data Domains & Concepts | Two-tier catalogue of data subject areas and the conceptual data entities they contain |
| DAT-CDM | Data | Conceptual | Diagram | Conceptual Data Model | Visual model of the Data Domains & Concepts Catalogue (DAT-DAC) |
| DAT-PRO-DAC | Data | Conceptual | Matrix | Business Processes ↔ Data Domains & Concepts | CRUD matrix mapping which BUS-PRO processes create/read/update/delete which DAT-DAC data entities |
| DAT-PRN | Data | Logical | Catalogue | Data Architecture Principles | Vendor-neutral guidelines that shape design decisions in the Data domain |
| DAT-STR-PRN | Data | Logical | Matrix | Data Architecture Strategy ↔ Principles | Many-to-many mapping between DAT-STR strategies and DAT-PRN principles |
| DAT-GRD | Data | Physical | Catalogue | Data Architecture Guardrails | Non-negotiable constraints and mandatory standards for the Data domain |
| DAT-PRN-GRD | Data | Physical | Matrix | Data Architecture Principles ↔ Guardrails | Many-to-many mapping between DAT-PRN principles and DAT-GRD guardrails |
| INT-STR | Integration | Conceptual | Catalogue | Integration Architecture Strategy | Outcome-oriented strategic statements for the Integration domain |
| INT-IFC | Integration | Logical | Catalogue | Interface Catalogue | The logical interfaces that connect platforms across the application landscape, and the direction of data flow between them |
| INT-WRD | Integration | Logical | Diagram | Interface Wiring Diagram | Visual map of the integration landscape — platform-to-platform connections derived from the Interface Catalogue (INT-IFC), with per-pair interface drill-down |
| INT-DAC-IFC | Integration | Logical | Matrix | Data Domains & Concepts ↔ Interface Catalogue | Maps each interface in the Interface Catalogue to the conceptual data entities that flow across it |
| INT-PRN | Integration | Logical | Catalogue | Integration Architecture Principles | Vendor-neutral guidelines that shape design decisions in the Integration domain |
| INT-STR-PRN | Integration | Logical | Matrix | Integration Architecture Strategy ↔ Principles | Many-to-many mapping between INT-STR strategies and INT-PRN principles |
| INT-GRD | Integration | Physical | Catalogue | Integration Architecture Guardrails | Non-negotiable constraints and mandatory standards for the Integration domain |
| INT-PRN-GRD | Integration | Physical | Matrix | Integration Architecture Principles ↔ Guardrails | Many-to-many mapping between INT-PRN principles and INT-GRD guardrails |
| APP-STR | Application | Conceptual | Catalogue | Application Architecture Strategy | Outcome-oriented strategic statements for the Application domain |
| APP-DAP | Application | Logical | Catalogue | Application Domains & Platforms | Two-tier catalogue of application groupings and the platforms that sit within them |
| APP-DPM | Application | Logical | Diagram | Domains & Platforms Model | Visual map of the Application Domains & Platforms Catalogue (APP-DAP) |
| APP-CAP-DAP | Application | Logical | Matrix | Business Capabilities ↔ Application Domains & Platforms | Maps each APP-DAP platform to the Level 2 business capabilities it supports |
| APP-PRN | Application | Logical | Catalogue | Application Architecture Principles | Vendor-neutral guidelines that shape design decisions in the Application domain |
| APP-STR-PRN | Application | Logical | Matrix | Application Architecture Strategy ↔ Principles | Many-to-many mapping between APP-STR strategies and APP-PRN principles |
| APP-GRD | Application | Physical | Catalogue | Application Architecture Guardrails | Non-negotiable constraints and mandatory standards for the Application domain |
| APP-PRN-GRD | Application | Physical | Matrix | Application Architecture Principles ↔ Guardrails | Many-to-many mapping between APP-PRN principles and APP-GRD guardrails |
| APP-CAT | Application | Physical | Catalogue | Application Catalogue | The physical applications (vendor products) deployed across the organisation, with their lifecycle status and TIME classification |
| APP-DAP-CAT | Application | Physical | Matrix | Application Domains & Platforms ↔ Application Catalogue | Maps each APP-DAP platform to the physical application(s) in APP-CAT that implement it |
| SOL-STR | Solution | Conceptual | Catalogue | Solution Architecture Strategy | Outcome-oriented strategic statements for the Solution domain |
| SOL-PRN | Solution | Logical | Catalogue | Solution Architecture Principles | Vendor-neutral guidelines that shape design decisions in the Solution domain |
| SOL-STR-PRN | Solution | Logical | Matrix | Solution Architecture Strategy ↔ Principles | Many-to-many mapping between SOL-STR strategies and SOL-PRN principles |
| SOL-GRD | Solution | Physical | Catalogue | Solution Architecture Guardrails | Non-negotiable constraints and mandatory standards for the Solution domain |
| SOL-PRN-GRD | Solution | Physical | Matrix | Solution Architecture Principles ↔ Guardrails | Many-to-many mapping between SOL-PRN principles and SOL-GRD guardrails |

## Matrix coverage (AMC-5)

Matrices are the **edges of the architecture graph** — they're what makes the model navigable and what impact analysis reasons over. Beyond the per-domain Strategy↔Principles and Principles↔Guardrails boilerplate, the *content* matrices that connect different concept types are the high-value ones. This is a coverage review of which cross-concept mappings exist and which are still missing.

**Concept types:** Capability (BUS-CAP) · Process (BUS-PRO) · Data (DAT-DAC) · Application/Platform (APP-DAP) · Interface (INT-IFC) · Strategy/Principle (per-domain).

| From ↓ \ To → | Capability | Process | Data | Application | Interface |
|---|---|---|---|---|---|
| **Capability** | — | ✅ BUS-CAP-PRO | ⬜ gap | ✅ APP-CAP-DAP | ⬜ |
| **Process** | (above) | — | ✅ **DAT-PRO-DAC** (new) | ⬜ gap | ⬜ |
| **Data** | (Cap↔Data gap) | (above) | — | ⬜ gap | ✅ INT-DAC-IFC |
| **Application** | (above) | (Proc↔App gap) | (Data↔App gap) | — | ⬜ |
| **Interface** | | | (above) | | — |

**Existing content matrices:** BUS-CAP-PRO (capability↔process), APP-CAP-DAP (capability↔platform), APP-DAP-CAT (platform↔physical app), INT-DAC-IFC (data↔interface), and now **DAT-PRO-DAC** (process↔data, CRUD).

**Prioritised gaps** (next candidates, in rough order of value):

1. **Process ↔ Application** — which application supports which process (step). Pairs with DAT-PRO-DAC to complete the process's "what data, what system" picture.
2. **Capability ↔ Data** — the data a capability owns/uses; supports data-ownership by capability.
3. **Application ↔ Data** — systems of record; which application masters which entity.
4. **Capability ↔ Strategy / Principle** — traceability from motivation to capability.
5. **Capability ↔ Org / Role** — ownership (feeds DEC-6 governance); needs an Org artefact first.

Each new matrix follows the [Adding a new artefact type](#adding-a-new-artefact-type) procedure and [Matrix placement](output-formats.md#matrix-placement) rules. DAT-PRO-DAC is the worked example.

## Adding a new artefact type

1. Add a row to the registry table above.
2. Define a JSON Schema at `/config/schemas/artefacts/domains/<domain>/<layer>/<ID>.json`. Include a `meta` object with `domain`, `abstraction`, and `format` fields, and a top-level `description` that describes the artefact type.
   - For catalogues, define the full `properties` shape for the instance data.
   - For diagrams and matrices whose storage format isn't finalised yet, a minimal schema is enough — `meta` plus `"type": "object", "additionalProperties": true`. Flesh it out once the format is decided.
   - For a matrix joining two artefacts, see [Matrix placement](output-formats.md#matrix-placement) to determine which domain/layer the new artefact type belongs to and which source becomes `columns` vs `rows`.
3. Add an entry for the new artefact-type ID to `/config/schemas/artefacts.json` (the schema index).
4. Document the schema with a markdown page in `/docs/schemas/artefacts/domains/<domain>/<layer>/<ID>.md`.
5. Create the instance file in each affected client version: `/architectures/clients/<client>/<version>/domains/<domain>/<layer>/<ID>.json`.
