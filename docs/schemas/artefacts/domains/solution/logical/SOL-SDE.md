# SOL-SDE — Solution Design

**Domain:** Solution · **Layer:** Logical · **Format:** Document

Detailed logical solution designs per feature or design area. Contains solution components, data flows, UML diagrams, interface requirements, and NFRs. Multiple instances — one per feature or design area.

## Document properties

| Property | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique instance ID (e.g. `SOL-SDE-001`) |
| `title` | string | yes | Title (e.g. "Analytics Portal Solution Design") |
| `description` | string | yes | One-paragraph summary |
| `status` | enum | no | `draft` · `in-review` · `approved` · `superseded` |
| `scope` | string | no | Feature or design area this document covers |
| `overview` | string | no | Design overview — rendered as prose |
| `solution-components` | array | no | Each: `platform-id` (APP-DAP), `role` (string), `notes` (optional) |
| `data-flows` | array | no | Each: `id`, `name`, `description`, `steps` (ordered string array) |
| `uml-diagrams` | array | no | Each: `type` (sequence/component/class/state/activity), `title`, `description`, `format` (mermaid/plantuml/url), `content` (string) |
| `interface-requirements` | array | no | Each: `interface-id`, `direction`, `data-format`, `notes` |
| `non-functional-requirements` | array | no | Each: `category`, `requirement`, `rationale` |
| `assumptions` | array | no | `id` and `description` |
| `open-questions` | array | no | `id`, `question`, `raised-by` |
| `diagrams` | array | no | Embedded diagram references |

## Usage

Derived from Solution Visions (`SOL-SVI`). Informs Interface Specifications (`SOL-ISP`) and is input to the interface catalogue (`INT-IFC`). UML diagrams are stored as source text (Mermaid or PlantUML) — rendered as code blocks in the UI.
