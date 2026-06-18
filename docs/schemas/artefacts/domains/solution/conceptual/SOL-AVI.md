# SOL-AVI — Architecture Vision

**Domain:** Solution · **Layer:** Conceptual · **Format:** Document

A collection of named architecture vision documents. Each vision captures the strategic intent, objectives, and constraints for a specific programme or domain. Multiple instances are supported — one per initiative or scope area.

## Document properties

| Property | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique instance ID (e.g. `SOL-AVI-001`) |
| `title` | string | yes | Descriptive title identifying this vision (e.g. "Data & Analytics Vision") |
| `description` | string | yes | One-paragraph description of what this vision covers |
| `status` | enum | no | `draft` · `in-review` · `approved` · `superseded` |
| `scope` | string | no | Programme, domain, or initiative this vision covers |
| `executive-summary` | string | no | Narrative summary — rendered as prose |
| `vision-statement` | string | no | Single concise statement of the vision — rendered highlighted |
| `drivers` | array | no | Business/technology/regulatory/market drivers. Each: `id`, `description`, `type` |
| `strategic-objectives` | array | no | Objectives with `id`, `objective`, and optional `linked-capabilities` (BUS-CAP IDs) |
| `constraints` | array | no | Constraints with `id`, `description`, and `type` |
| `assumptions` | array | no | Assumptions with `id` and `description` |
| `related-capabilities` | array | no | BUS-CAP capability IDs this vision is linked to |
| `related-domains` | array | no | Architecture domain names (business, data, integration, etc.) |
| `diagrams` | array | no | Embedded diagram references: `artefact-id`, optional `title` and `caption` |

## Usage

Sits in the Solution domain at the Conceptual layer. Informs Architecture Intents (`SOL-AIN`) and is aligned with Business Capabilities (`BUS-CAP`). Typically one Architecture Vision per programme or major initiative.
