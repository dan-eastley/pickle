# Decision Record Schema

**File:** [`/schemas/decision.json`](../../schemas/decision.json)
**Validates:** `/architectures/<client>/<version>/decisions/<decision-id>.json`

## Purpose

Machine-readable Architecture Decision Record. Replaces the prior `adr-<number>.md` convention with a structured JSON file that captures both the author's narrative and the outputs of the seven decision-pipeline workflows. Each workflow fills in its own section progressively as the chain runs.

## Lifecycle

1. **Author** creates `architectures/<client>/<version>/decisions/<decision-id>.json` at branch start, populating `decision-id`, `title`, `status: "draft"`, and `narrative`. This is the only file the author hand-writes for the decision.
2. **Push** to a `decisions/<client-id>/<version-id>/<decision-id>` branch fires the seven workflows in sequence (see `.github/workflows/decisions-*.yml`):
   1. Scope Validation
   2. Decision Change Discovery
   3. Referential Integrity
   4. Strategy Alignment
   5. Principles Alignment
   6. Decision Change Proponent
   7. Decision Change Challenger
3. Each workflow checks out the branch, reads the decision JSON, fills in its own section, commits back with the GITHUB_TOKEN identity, and pushes. The next workflow in the chain (`workflow_run` trigger) then runs.

## Shape

```json
{
    "decision-id": "adr-001",
    "title": "Adopt API-first integration",
    "status": "draft",
    "narrative": "We propose moving all new inter-system traffic to managed APIs. Today...",

    "scope": { /* filled by Scope Validation */ },
    "discovery": { /* filled by Decision Discovery */ },
    "referential-integrity": { /* filled by Referential Integrity */ },
    "strategy-alignment": { /* filled by Strategy Alignment */ },
    "principles-alignment": { /* filled by Principles Alignment */ },
    "proponent": { /* filled by Decision Proponent */ },
    "challenger": { /* filled by Decision Challenger */ }
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `decision-id` | string | yes | Unique identifier; must match the JSON file name and the trailing branch segment |
| `title` | string | yes | Short human-readable title |
| `status` | enum | yes | `draft` \| `proposed` \| `accepted` \| `rejected` \| `superseded` |
| `narrative` | string | yes | Author's narrative of the proposed change |
| `scope` | object | no | Output of Scope Validation |
| `discovery` | object | no | Output of Decision Discovery |
| `referential-integrity` | object | no | Output of Referential Integrity |
| `strategy-alignment` | object | no | Output of Strategy Alignment |
| `principles-alignment` | object | no | Output of Principles Alignment |
| `proponent` | object | no | Output of Decision Proponent |
| `challenger` | object | no | Output of Decision Challenger |

The per-section shapes are intentionally permissive while the workflows iterate. Tighten as the workflows stabilise.
