# SOL-AVI: Architecture Vision

**Domain:** Solution · **Layer:** Conceptual · **Format:** Document

A conceptual-level architecture vision for a programme or initiative, written for **executive and leadership** audiences. The most conceptual link in the chain: it sets strategic direction and sketches the target architecture at a high (L1/L2) level across the four delivery domains.

## Section structure

Defined in the schema under `meta.sections` and rendered with derived numbering. Section 1 (Overview) carries the Executive Summary and Context shared by every document.

| # | Section / Subsection | Content type | Backing property |
|---|---|---|---|
| **1** | **Overview** | | |
| 1.1 | Executive Summary | exec-summary | `executive-summary` |
| 1.2 | Context | context-links | `context` |
| **2** | **Vision & Drivers** | | |
| 2.1 | Vision Statement | highlight | `vision-statement` |
| 2.2 | Strategic Drivers | drivers | `drivers` |
| 2.3 | Strategic Objectives | objectives | `strategic-objectives` |
| **3** | **Target Architecture** | | |
| 3.1 | Business Capabilities | entity-refs | `business-capabilities` |
| 3.2 | Business Processes | entity-refs | `business-processes` |
| 3.3 | Application Domains & Platforms | entity-refs | `application-landscape` |
| 3.4 | Cross-Domain Strategies | entity-refs | `cross-domain-strategies` |
| **4** | **Principles & Constraints** | | |
| 4.1 | Guiding Principles | tags | `guiding-principles` |
| 4.2 | Constraints | constraints | `constraints` |
| 4.3 | Assumptions | assumptions | `assumptions` |
| **5** | **Roadmap & Impact** | | |
| 5.1 | Transformation Themes | features | `transformation-themes` |
| 5.2 | Expected Benefits | bullets | `expected-benefits` |

## Document properties

| Property | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique instance ID (e.g. `AVI-001`) |
| `title` | string | yes | Title (e.g. "Data & Analytics Vision") |
| `description` | string | yes | One-paragraph summary |
| `status` | enum | yes | `draft` · `in-review` · `approved` · `superseded` |
| `scope` | string | no | Programme or initiative this vision covers |
| `executive-summary` | object | yes | §1.1: `summary` (opening paragraph) + `points` (bullets) |
| `context` | array | no | §1.2: links to related documents (`informs` the Architecture Intents) |
| `vision-statement` | string | yes | §2.1, the aspirational end-state in one sentence |
| `drivers` | array | no | §2.2: `id`, `description`, `type` |
| `strategic-objectives` | array | no | §2.3: `id`, `objective`, `linked-capabilities` (BUS-CAP IDs) |
| `business-capabilities` | array | no | §3.1: `artefact-id` (BUS-CAP), `note` |
| `business-processes` | array | no | §3.2: `artefact-id` (BUS-PRO), `note` |
| `application-landscape` | array | no | §3.3: `artefact-id` (APP-DAP domain/platform), `note` |
| `cross-domain-strategies` | array | no | §3.4: `artefact-id` (BUS/DAT/INT/APP/SOL-STR), `note` |
| `guiding-principles` | array | no | §4.1: principle IDs that shape this vision |
| `constraints` | array | no | §4.2: `id`, `description`, `type` |
| `assumptions` | array | no | §4.3: `id`, `description` |
| `transformation-themes` | array | no | §5.1: `id`, `name`, `description` |
| `expected-benefits` | array | no | §5.2: list of benefit statements |

## Usage

The head of the solution document chain. Informs the Architecture Intents (`SOL-AIN`): captured per instance in the §1.2 Context links. Section 3 references high-level entities across the four delivery domains, which render as a compact list plus a small card-diagram and open the entity detail panel on click.
