# SOL-AIN — Architecture Intent

**Domain:** Solution · **Layer:** Conceptual · **Format:** Document

Structured records of architecture direction before formal ADRs are raised. Captures context, options considered, and the recommended direction. Multiple instances — one per domain or capability area.

## Document properties

| Property | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique instance ID (e.g. `SOL-AIN-001`) |
| `title` | string | yes | Title identifying this intent (e.g. "Analytical Platform Architecture Intent") |
| `description` | string | yes | One-paragraph summary |
| `status` | enum | no | `draft` · `in-review` · `approved` · `superseded` |
| `scope` | string | no | Domain, capability, or initiative this intent covers |
| `intent-statement` | string | no | Core intent — one clear paragraph. Rendered highlighted. |
| `context` | string | no | Background context — rendered as prose |
| `drivers` | array | no | Drivers as in SOL-AVI — `id`, `description`, `type` |
| `options-considered` | array | no | Each option: `id`, `name`, `description`, `pros` (string[]), `cons` (string[]) |
| `recommended-direction` | string | no | Recommended approach — rendered as prose |
| `architecture-principles` | array | no | Principle IDs from SOL-PRN, BUS-PRN, etc. |
| `guardrails` | array | no | Guardrail IDs from SOL-GRD, BUS-GRD, etc. |
| `open-questions` | array | no | `id`, `question`, `raised-by` |
| `diagrams` | array | no | Embedded diagram references |

## Usage

Informs Solution Visions (`SOL-SVI`) and Architecture Decision Records. Derived from Architecture Visions (`SOL-AVI`). Typically one intent per domain or major capability area.
