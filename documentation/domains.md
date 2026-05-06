# Architecture Domains

Each client version is modelled across five architecture domains. Every artefact type is aligned to exactly one architecture domain.

| Architecture Domain | Folder | Acronym | Description |
|---|---|---|---|
| **Business Architecture** | `business/` | `BUS` | Captures the organisation's capabilities, processes, and operating model. Defines what the business does and why, providing the context that all other architecture domains serve. |
| **Data Architecture** | `data/` | `DAT` | Describes the data assets, structures, flows, and governance that support business operations. Ensures data is well-defined, trusted, and available where needed. |
| **Integration Architecture** | `integration/` | `INT` | Defines how systems, services, and data flows connect and communicate. Covers APIs, event streams, messaging patterns, and the rules governing inter-system exchange. |
| **Application Architecture** | `application/` | `APP` | Describes the software applications, platforms, and functions that deliver business capabilities. Covers the portfolio of applications and how they relate to each other and to business needs. |
| **Solution Architecture** | `solution/` | `SOL` | Cross-cutting designs that span multiple architecture domains to address a specific business problem or initiative. Brings together business, data, integration, and application concerns into a coherent delivery blueprint. |

Artefact type IDs are prefixed with the architecture domain acronym (e.g. `BUS-CAP`, `DAT-DAC`, `APP-DAP`).
