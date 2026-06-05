# Architecture Domains

The architecture is organised into five domains. Every artefact type belongs to exactly one domain.

```mermaid
flowchart TB
    subgraph Domain["The five architecture domains"]
        direction TB
        BUS["<b>Business</b> — BUS<br/><sub>capabilities, processes, operating model</sub>"]
        BUS --> DAT["<b>Data</b> — DAT<br/><sub>data assets, structures, governance</sub>"]
        BUS --> INT["<b>Integration</b> — INT<br/><sub>APIs, events, messaging</sub>"]
        BUS --> APP["<b>Application</b> — APP<br/><sub>apps, platforms, functions</sub>"]
    end

    SOL["<b>Solution</b> — SOL<br/><sub>joined-up designs spanning multiple domains</sub>"]

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

Business sets the context — what the business does and why. Data, Integration, and Application deliver it. Solution architecture cuts across all of them for a specific initiative.

| Architecture Domain | Acronym | Description |
|---|---|---|
| **Business Architecture** | `BUS` | The organisation's capabilities, processes, and operating model — what the business does and why. This domain sets the context that all others serve. |
| **Data Architecture** | `DAT` | The data assets, structures, and governance that support business operations — ensuring data is well-defined, trusted, and available where it is needed. |
| **Integration Architecture** | `INT` | How systems and services connect and communicate — covering APIs, events, messaging, and the rules that govern how information flows between them. |
| **Application Architecture** | `APP` | The software applications and platforms that deliver business capabilities — what exists, how it is organised, and how it relates to business needs. |
| **Solution Architecture** | `SOL` | Joined-up designs that span multiple domains to address a specific business need or initiative — bringing together business, data, integration, and application concerns. |

Artefact IDs are prefixed with the domain acronym (e.g. `BUS-CAP`, `DAT-DAC`, `APP-DAP`).
