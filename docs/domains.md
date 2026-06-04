# Architecture Domains

Each client version is modelled across five architecture domains. Every artefact type is aligned to exactly one architecture domain.

```mermaid
flowchart TB
    subgraph Domain["The five architecture domains"]
        direction TB
        BUS["<b>Business</b> — BUS<br/><sub>capabilities, processes, operating model</sub>"]
        BUS --> DAT["<b>Data</b> — DAT<br/><sub>data assets, structures, governance</sub>"]
        BUS --> INT["<b>Integration</b> — INT<br/><sub>APIs, events, messaging</sub>"]
        BUS --> APP["<b>Application</b> — APP<br/><sub>apps, platforms, functions</sub>"]
    end

    SOL["<b>Solution</b> — SOL<br/><sub>cross-cutting designs spanning multiple domains</sub>"]

    SOL -. spans .-> BUS
    SOL -. spans .-> DAT
    SOL -. spans .-> INT
    SOL -. spans .-> APP

    classDef ctx fill:#e8eaf6,stroke:#3949ab,color:#000
    classDef del fill:#e0f2f1,stroke:#00897b,color:#000
    classDef cross fill:#fff3e0,stroke:#fb8c00,color:#000,stroke-dasharray:5 5

    class BUS ctx
    class DAT,INT,APP del
    class SOL cross
```

Business sets the context (what the business does); Data, Integration, and Application realise it (how it's delivered); Solution architecture is cross-cutting and pulls from multiple domains for a specific initiative.

| Architecture Domain | Folder | Acronym | Description |
|---|---|---|---|
| **Business Architecture** | `business/` | `BUS` | Captures the organisation's capabilities, processes, and operating model. Defines what the business does and why, providing the context that all other architecture domains serve. |
| **Data Architecture** | `data/` | `DAT` | Describes the data assets, structures, flows, and governance that support business operations. Ensures data is well-defined, trusted, and available where needed. |
| **Integration Architecture** | `integration/` | `INT` | Defines how systems, services, and data flows connect and communicate. Covers APIs, event streams, messaging patterns, and the rules governing inter-system exchange. |
| **Application Architecture** | `application/` | `APP` | Describes the software applications, platforms, and functions that deliver business capabilities. Covers the portfolio of applications and how they relate to each other and to business needs. |
| **Solution Architecture** | `solution/` | `SOL` | Cross-cutting designs that span multiple architecture domains to address a specific business problem or initiative. Brings together business, data, integration, and application concerns into a coherent delivery blueprint. |

Artefact type IDs are prefixed with the architecture domain acronym (e.g. `BUS-CAP`, `DAT-DAC`, `APP-DAP`).
