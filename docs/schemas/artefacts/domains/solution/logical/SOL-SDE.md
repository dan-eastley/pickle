# SOL-SDE — Solution Design

**Domain:** Solution · **Layer:** Logical · **Format:** Document

Detailed logical solution designs, one instance per solution or design area. A Solution Design is organised into a fixed set of **numbered sections** that elaborate a Solution Vision into a logical design across the four delivery domains, ready to drive low-level design.

## Section structure

The section structure (titles, descriptions, and ordering) is defined in the schema under `meta.sections` and rendered with derived numbering (`1`, `1.1`, `1.2` …). Section 1 (Overview) carries the Executive Summary and Context that every document shares; the remaining sections are specific to the Solution Design.

| # | Section / Subsection | Content type | Backing property |
|---|---|---|---|
| **1** | **Overview** | | |
| 1.1 | Executive Summary | prose | `executive-summary` |
| 1.2 | Context | context-links | `context` |
| **2** | **Business Context & Functional Overview** | | |
| 2.1 | Capabilities | capability-refs | `capabilities` |
| 2.2 | Functional Requirements | requirements | `functional-requirements` |
| 2.3 | Features | features | `features` |
| **3** | **Non-Functional Requirements** | | |
| 3.1 | Business Continuity (Back-up, Recovery & Reliability) | requirements | `nfr-business-continuity` |
| 3.2 | Environment & Hosting | requirements | `nfr-environment-hosting` |
| 3.3 | Security & Control | requirements | `nfr-security-control` |
| 3.4 | Support & SLAs | requirements | `nfr-support-slas` |
| 3.5 | User Access (RBAC) | requirements | `nfr-user-access` |
| 3.6 | Data Classification & Protection | requirements | `nfr-data-classification` |
| 3.7 | Auditing, Logging & Monitoring | requirements | `nfr-audit-logging` |
| 3.8 | Accessibility & Usability | requirements | `nfr-accessibility` |
| 3.9 | Data Retention & Archiving | requirements | `nfr-data-retention` |
| 3.10 | Performance, Scalability & Response | requirements | `nfr-performance` |
| **4** | **Logical Architecture** | | |
| 4.1 | Business Architecture | domain-architecture | `arch-business` |
| 4.2 | Data Architecture | domain-architecture | `arch-data` |
| 4.3 | Integration Architecture | domain-architecture | `arch-integration` |
| 4.4 | Application Architecture | domain-architecture | `arch-application` |
| **5** | **Principles Adherence** | principle-adherence | `principles-adherence` |
| **6** | **Sequence Diagrams** | | |
| 6.1 | User Flows | flows | `flows-user` |
| 6.2 | Information Flows | flows | `flows-information` |
| 6.3 | System Flows | flows | `flows-system` |

## Document properties

| Property | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique instance ID (e.g. `SDE-001`) |
| `title` | string | yes | Title (e.g. "Analytics Portal Solution Design") |
| `description` | string | yes | One-paragraph summary |
| `status` | enum | yes | `draft` · `in-review` · `approved` · `superseded` |
| `scope` | string | no | Solution or initiative this document covers |
| `executive-summary` | string | yes | §1.1 — plain-language summary for senior/exec readers |
| `context` | array | no | §1.2 — links to related documents. Each: `relationship` (`informed-by`/`informs`/`related`), `artefact-id`, `document-id`, `title` |
| `capabilities` | array | no | §2.1 — business capability references. Each: `artefact-id` (BUS-CAP), `note` |
| `functional-requirements` | array | no | §2.2 — each: `id`, `requirement`, `rationale`, `priority` (`must`/`should`/`could`/`wont`) |
| `features` | array | no | §2.3 — each: `id`, `name`, `description` |
| `nfr-*` | array | no | §3.1–3.10 — one property per NFR subsection, each an array of `requirement` items (`id`, `requirement`, `rationale`, `priority`) |
| `arch-business` / `arch-data` / `arch-integration` / `arch-application` | object | no | §4.1–4.4 — each: `description` (prose), `references` (array of `artefact-id` + `note`), `diagrams` (diagram refs) |
| `principles-adherence` | array | no | §5 — each: `principle-id`, `adherence` (`adheres`/`partial`/`deviation`), `statement` |
| `flows-user` / `flows-information` / `flows-system` | array | no | §6.1–6.3 — each `flow`: `title`, `description`, and a diagram (`format` + `content`) and/or ordered `steps` |

## Usage

Derived from Solution Visions (`SOL-SVI`) and informs Interface Specifications (`SOL-ISP`) — these relationships are captured per instance in the §1.2 Context links. Section 4 calls out the relevant architecture from each delivery domain (`BUS`, `DAT`, `INT`, `APP`); section 5 records how the design adheres to the relevant principles (`SOL-PRN` and domain principles). Flow diagrams are stored as source text (Mermaid or PlantUML) and rendered in the UI; step-based flows are rendered as ordered lists.
