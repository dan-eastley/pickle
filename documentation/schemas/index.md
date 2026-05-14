# Schemas

Each schema in [`/schemas/`](../../schemas/) is documented here. Click through for the structure, what industry standard it draws from, and a domain-specific example.

## Schema / instance mirroring

The `schemas/` tree mirrors the `architectures/` tree — every instance file has a schema at the matching relative path.

```mermaid
flowchart LR
    subgraph schemas["schemas/ — definitions"]
        direction TB
        S1[clients.json]
        S2[client.json]
        S3[versions.json]
        S4[version.json]
        S5[decisions.json]
        S6[decision.json]
        S7["artefacts/domains/<br/>&lt;dom&gt;/&lt;layer&gt;/&lt;ID&gt;.json"]
    end

    subgraph arch["architectures/ — instances"]
        direction TB
        I1[clients.json]
        I2["&lt;client&gt;/<br/>client.json"]
        I3["&lt;client&gt;/<br/>versions.json"]
        I4["&lt;client&gt;/&lt;version&gt;/<br/>version.json"]
        I5["&lt;client&gt;/&lt;version&gt;/decisions/<br/>decisions.json"]
        I6["&lt;client&gt;/&lt;version&gt;/decisions/<br/>&lt;decision-id&gt;.json"]
        I7["&lt;client&gt;/&lt;version&gt;/artefacts/domains/<br/>&lt;dom&gt;/&lt;layer&gt;/&lt;ID&gt;/&lt;ID&gt;.json"]
    end

    S1 -. validates .-> I1
    S2 -. validates .-> I2
    S3 -. validates .-> I3
    S4 -. validates .-> I4
    S5 -. validates .-> I5
    S6 -. validates .-> I6
    S7 -. validates .-> I7

    classDef def fill:#e3f2fd,stroke:#1976d2,color:#000
    classDef inst fill:#e0f2f1,stroke:#00897b,color:#000

    class S1,S2,S3,S4,S5,S6,S7 def
    class I1,I2,I3,I4,I5,I6,I7 inst
```

Each pair below is one row of that mapping. Index files (plural) carry IDs only; the singular metadata files alongside them carry the actual content.

## Index files

| Schema | Documents | Purpose |
|---|---|---|
| [clients.md](clients.md) | `architectures/clients.json` | Authoritative list of client IDs |
| [versions.md](versions.md) | `architectures/<client>/versions.json` | Authoritative list of version IDs for a client |
| [decisions.md](decisions.md) | `architectures/<client>/<version>/decisions/decisions.json` | Authoritative list of decision IDs for a version |
| [artefacts.md](artefacts.md) | `schemas/artefacts.json` | Index of all defined catalogue schemas |

## Singular metadata

| Schema | Documents | Purpose |
|---|---|---|
| [client.md](client.md) | `architectures/<client>/client.json` | Per-client metadata (name, etc.) |
| [version.md](version.md) | `architectures/<client>/<version>/version.json` | Per-version metadata (name, status) |
| [decision.md](decision.md) | `architectures/<client>/<version>/decisions/<decision-id>.json` | Architecture Decision Record (machine-readable) |

## Strategy / Principles / Guardrails (one per architecture domain)

Each architecture domain carries a Strategy (Conceptual), Principles (Logical), and Guardrails (Physical) catalogue. The schemas share their shape across domains; each documentation page below carries a domain-specific example.

| Architecture Domain | Strategy | Principles | Guardrails |
|---|---|---|---|
| Business | [BUS-STR.md](BUS-STR.md) | [BUS-PRN.md](BUS-PRN.md) | [BUS-GRD.md](BUS-GRD.md) |
| Data | [DAT-STR.md](DAT-STR.md) | [DAT-PRN.md](DAT-PRN.md) | [DAT-GRD.md](DAT-GRD.md) |
| Integration | [INT-STR.md](INT-STR.md) | [INT-PRN.md](INT-PRN.md) | [INT-GRD.md](INT-GRD.md) |
| Application | [APP-STR.md](APP-STR.md) | [APP-PRN.md](APP-PRN.md) | [APP-GRD.md](APP-GRD.md) |
| Solution | [SOL-STR.md](SOL-STR.md) | [SOL-PRN.md](SOL-PRN.md) | [SOL-GRD.md](SOL-GRD.md) |

## Domain-specific catalogue schemas

| Schema | Artefact Type | Architecture Domain / Layer | Aligned to |
|---|---|---|---|
| [BUS-CAP.md](BUS-CAP.md) | Business Capabilities | Business / Conceptual | TOGAF, Business Architecture Guild, CMMI |
| [BUS-PRO.md](BUS-PRO.md) | Business Processes | Business / Conceptual | APQC PCF, Porter value chain |
| [DAT-DAC.md](DAT-DAC.md) | Data Domains & Concepts | Data / Conceptual | DAMA-DMBOK, ISO 27001 |
| [APP-DAP.md](APP-DAP.md) | Application Domains & Platforms | Application / Logical | TOGAF Application Architecture, Gartner Pace Layers |
