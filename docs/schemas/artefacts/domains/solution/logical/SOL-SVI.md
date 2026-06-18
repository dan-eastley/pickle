# SOL-SVI — Solution Vision

**Domain:** Solution · **Layer:** Logical · **Format:** Document

High-level solution descriptions per epic or feature. Captures the problem, solution approach, involved platforms, risks, and assumptions. Multiple instances — one per epic or initiative.

## Document properties

| Property | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique instance ID (e.g. `SOL-SVI-001`) |
| `title` | string | yes | Title (e.g. "Self-Service Analytics Solution Vision") |
| `description` | string | yes | One-paragraph summary |
| `status` | enum | no | `draft` · `in-review` · `approved` · `superseded` |
| `scope` | string | no | Epic, feature, or initiative this vision covers |
| `executive-summary` | string | no | Narrative summary — rendered as prose |
| `problem-statement` | string | no | The problem being solved — rendered as prose |
| `solution-overview` | string | no | Solution description — rendered as prose |
| `key-capabilities` | array | no | BUS-CAP capability IDs supported by this solution |
| `platforms-involved` | array | no | APP-DAP platform IDs (e.g. `PLAT-BI`, `PLAT-LAKEHOUSE`) |
| `assumptions` | array | no | `id` and `description` |
| `risks` | array | no | `id`, `description`, `likelihood` (low/medium/high), `impact`, `mitigation` |
| `open-questions` | array | no | `id`, `question`, `raised-by` |
| `diagrams` | array | no | Embedded diagram references |

## Usage

Derived from Architecture Intents (`SOL-AIN`). Informs Solution Designs (`SOL-SDE`). Sits between the architectural intent and the detailed design — one per epic or business initiative.
