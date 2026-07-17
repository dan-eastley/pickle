# SOL-USF: User Flows

**File:** [`/config/schemas/artefacts/domains/solution/logical/SOL-USF.json`](../../../../../../config/schemas/artefacts/domains/solution/logical/SOL-USF.json)
**Architecture Domain / Layer:** Solution / Logical
**Format:** Diagram (`diagramType`: `sequence`)

## Purpose

User Flows are **UML sequence diagrams** showing the user's journey through application components and screens. Participating domains: **Applications & Components**.

Each instance holds **zero or more flows**. A flow is an ordered set of **messages** exchanged between **participants** (lifelines). The level of abstraction follows the host solution document (Architecture Intent → Solution Design → LLD).

## Structure

- `flows[]` — one entry per scenario:
  - `id`, `name`, `description`
  - `participants[]` — the lifelines, left to right: `id`, `name`, optional `ref` (an entity id such as `PLAT-CRM` that links the lifeline to a catalogue entity so it can be opened), and `kind` (`actor` | `system` | `component` | `integration` | `data` | `process`).
  - `messages[]` — the ordered exchanges: `from`, `to`, `label`, optional `order`, `kind` (`sync` | `async` | `return`), and optional `data` payload.

## Instance file

```json
{
    "$schema": "urn:pickle:schemas:artefacts:domains:solution:logical:SOL-USF",
    "flows": [
        {
            "id": "…",
            "name": "…",
            "participants": [ { "id": "…", "name": "…", "ref": "…", "kind": "system" } ],
            "messages": [ { "order": 1, "from": "…", "to": "…", "label": "…", "kind": "sync" } ]
        }
    ]
}
```

## Status

Rendered by [`SequenceDiagram`](../../../../../../src/components/artefacts/diagrams/SequenceDiagram.jsx) via [`DiagramView`](../../../../../../src/components/artefacts/DiagramView.jsx). Related catalogues: `APP-CAT`.
