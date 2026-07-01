# SOL-SVI: Solution Intent

**Domain:** Solution · **Layer:** Logical · **Format:** Document

A logical-level Solution Intent, one instance per epic, feature, or initiative. Aligns to the SAFe Solution Intent, the single source of truth for what is being built and why, distinguishing fixed intent (committed) from variable intent (under exploration). Organised into **numbered sections** that elaborate an Architecture Intent into a solution outline before detailed design.

## Section structure

The section structure (titles, descriptions, ordering) lives in the schema under `meta.sections` and renders with derived numbering (`1`, `1.1` …). Section 1 (Overview) carries the Executive Summary and Context that every document shares.

| # | Section / Subsection | Content type | Backing property |
|---|---|---|---|
| **1** | **Overview** | | |
| 1.1 | Executive Summary | exec-summary | `executive-summary` |
| 1.2 | Context | context-links | `context` |
| **2** | **Problem & Solution** | | |
| 2.1 | Problem Statement | prose | `problem-statement` |
| 2.2 | Solution Overview | prose | `solution-overview` |
| **3** | **Scope & Capabilities** | | |
| 3.1 | Key Capabilities | entity-refs | `key-capabilities` |
| 3.2 | Platforms Involved | entity-refs | `platforms-involved` |
| **4** | **Risks & Assumptions** | | |
| 4.1 | Assumptions | assumptions | `assumptions` |
| 4.2 | Risks | risks | `risks` |
| **5** | **Open Questions** | open-questions | `open-questions` |

## Document properties

| Property | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique instance ID (e.g. `SVI-001`) |
| `title` | string | yes | Title (e.g. "Self-Service Analytics Solution Vision") |
| `description` | string | yes | One-paragraph summary |
| `status` | enum | yes | `draft` · `in-review` · `approved` · `superseded` |
| `scope` | string | no | Epic, feature, or initiative this vision covers |
| `executive-summary` | object | yes | §1.1: `summary` (opening paragraph) + `points` (bullets) |
| `context` | array | no | §1.2: links to related documents. Each: `relationship` (`informed-by`/`informs`/`related`), `artefact-id`, `document-id`, `title` |
| `problem-statement` | string | no | §2.1, the problem being solved |
| `solution-overview` | string | no | §2.2, the proposed approach |
| `key-capabilities` | array | no | §3.1: capability references. Each: `artefact-id` (BUS-CAP), `note` |
| `platforms-involved` | array | no | §3.2: platform references. Each: `artefact-id` (APP-DAP), `note` |
| `assumptions` | array | no | §4.1: `id`, `description` |
| `risks` | array | no | §4.2: `id`, `description`, `likelihood`, `impact`, `mitigation` |
| `open-questions` | array | no | §5: `id`, `question`, `raised-by` |

## Usage

Derived from Architecture Intents (`SOL-AIN`) and informs Solution Designs (`SOL-SDE`): captured per instance in the §1.2 Context links. Reference lists (capabilities, platforms) render as a compact list plus a small card-diagram of the referenced entities.
