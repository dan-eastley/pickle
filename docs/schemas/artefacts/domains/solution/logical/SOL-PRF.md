# SOL-PRF: Process Flows

**File:** [`/config/schemas/artefacts/domains/solution/logical/SOL-PRF.json`](../../../../../../config/schemas/artefacts/domains/solution/logical/SOL-PRF.json)
**Architecture Domain / Layer:** Solution / Logical
**Format:** Diagram (`diagramType`: `sequence`)

## Purpose

Process Flows are **UML sequence diagrams** showing how a business process executes across its supporting applications. Participating domains: **Processes & Applications**.

Each instance holds **zero or more flows**. A flow is an ordered set of **messages** exchanged between **participants** (lifelines). The level of abstraction follows the host solution document (Architecture Intent → Solution Design → LLD).

## Structure

- `flows[]` — one entry per scenario:
  - `id`, `name`, `description`
  - `participants[]` — the lifelines, left to right: `id`, `name`, optional `ref` (an entity id such as `PLAT-CRM` that links the lifeline to a catalogue entity so it can be opened), and `kind` (`actor` | `system` | `component` | `integration` | `data` | `process`).
  - `messages[]` — the ordered exchanges: `from`, `to`, `label`, optional `order`, `kind` (`sync` | `async` | `return`), and optional `data` payload.

## Instance file

```json
{
    "$schema": "urn:pickle:schemas:artefacts:domains:solution:logical:SOL-PRF",
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

Rendered by [`SequenceDiagram`](../../../../../../src/components/artefacts/diagrams/SequenceDiagram.jsx) via [`DiagramView`](../../../../../../src/components/artefacts/DiagramView.jsx). Related catalogues: `BUS-PRO`, `APP-DAP`.
