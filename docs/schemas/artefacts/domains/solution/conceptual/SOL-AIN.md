# SOL-AIN — Architecture Intent

**Domain:** Solution · **Layer:** Conceptual · **Format:** Document

A conceptual-level architecture intent, one instance per programme or decision area. Organised into **numbered sections** that record the chosen architecture direction — the options weighed and the reasoning — before solution-level design.

## Section structure

Defined in the schema under `meta.sections` and rendered with derived numbering. Section 1 (Overview) carries the Executive Summary and Context shared by every document.

| # | Section / Subsection | Content type | Backing property |
|---|---|---|---|
| **1** | **Overview** | | |
| 1.1 | Executive Summary | exec-summary | `executive-summary` |
| 1.2 | Context | context-links | `context` |
| **2** | **Intent & Drivers** | | |
| 2.1 | Intent Statement | highlight | `intent-statement` |
| 2.2 | Background | prose | `background` |
| 2.3 | Drivers | drivers | `drivers` |
| **3** | **Options & Direction** | | |
| 3.1 | Options Considered | options | `options-considered` |
| 3.2 | Recommended Direction | prose | `recommended-direction` |
| **4** | **Principles & Guardrails** | | |
| 4.1 | Architecture Principles | tags | `architecture-principles` |
| 4.2 | Guardrails | tags | `guardrails` |
| **5** | **Open Questions** | open-questions | `open-questions` |

## Document properties

| Property | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique instance ID (e.g. `AIN-001`) |
| `title` | string | yes | Title (e.g. "Analytical Platform Architecture Intent") |
| `description` | string | yes | One-paragraph summary |
| `status` | enum | yes | `draft` · `in-review` · `approved` · `superseded` |
| `scope` | string | no | Programme, initiative, or domain this intent covers |
| `executive-summary` | object | yes | §1.1 — `summary` (opening paragraph) + `points` (bullets) |
| `context` | array | no | §1.2 — links to related documents (`informed-by` the Vision, `informs` the Solution Vision) |
| `intent-statement` | string | yes | §2.1 — the chosen direction in one paragraph |
| `background` | string | no | §2.2 — the current situation and the need |
| `drivers` | array | no | §2.3 — `id`, `description`, `type` (business/technology/regulatory/market) |
| `options-considered` | array | no | §3.1 — `id`, `name`, `description`, `pros`, `cons` |
| `recommended-direction` | string | no | §3.2 — the recommended option and rationale |
| `architecture-principles` | array | no | §4.1 — principle IDs that underpin this intent |
| `guardrails` | array | no | §4.2 — guardrail IDs that apply |
| `open-questions` | array | no | §5 — `id`, `question`, `raised-by` |

## Usage

Derived from Architecture Visions (`SOL-AVI`) and informs Solution Visions (`SOL-SVI`) — captured per instance in the §1.2 Context links.
