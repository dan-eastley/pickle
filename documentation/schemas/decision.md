# Decision Record Schema

**File:** [`/schemas/decision.json`](../../schemas/decision.json)
**Validates:** `/architectures/<client>/<version>/decisions/<decision-id>.json`

## Purpose

Machine-readable Architecture Decision Record. Replaces the prior `adr-<number>.md` convention with a structured JSON file that captures both the author's narrative and the outputs of the seven decision-pipeline workflows. Each workflow fills in its own section progressively as the chain runs.

## Lifecycle

1. **Author** creates `architectures/<client>/<version>/decisions/<decision-id>.json` at branch start, populating `decision-id`, `title`, `status: "draft"`, and `narrative`. This is the only file the author hand-writes for the decision.
2. **Push** to a `decisions/<client-id>/<version-id>/<decision-id>` branch fires the seven workflows in sequence (see `.github/workflows/decisions-*.yml`):
   1. Scope Validation
   2. Architecture Review
   3. Referential Integrity
   4. Strategy Alignment
   5. Principles Alignment
   6. Proponent Analysis
   7. Challenger Analysis
3. Each workflow checks out the branch, reads the decision JSON, fills in its own section, commits back with the GITHUB_TOKEN identity, and pushes. The next workflow in the chain (`workflow_run` trigger) then runs.

## Section property names match workflow names

Each workflow writes to a property whose name is the kebab-cased workflow name:

| Workflow | Schema property |
|---|---|
| Scope Validation | `scope-validation` |
| Architecture Review | `architecture-review` |
| Referential Integrity | `referential-integrity` |
| Strategy Alignment | `strategy-alignment` |
| Principles Alignment | `principles-alignment` |
| Proponent Analysis | `proponent-analysis` |
| Challenger Analysis | `challenger-analysis` |

## Section shape (six workflows)

Six of the seven workflows — Architecture Review, Referential Integrity, Strategy Alignment, Principles Alignment, Proponent Analysis, and Challenger Analysis — write to a section with a common shape, defined once at `$defs/section` in the schema:

| Field | Type | Required | Description |
|---|---|---|---|
| `finding` | string | yes | What the workflow observed — the analytical output |
| `impact` | string | yes | Why the finding matters — consequence for the proposed change |
| `recommendation` | string | yes | What the author should do in response to the finding |
| `rationale` | string | yes | Why the recommendation is the right course of action |

`additionalProperties: false` — these sections carry only the four strings.

Scope Validation is structurally different (deterministic outcome + violation list) and uses its own permissive shape.

## Example

```json
{
    "decision-id": "adr-001",
    "title": "Adopt API-first integration",
    "status": "draft",
    "narrative": "We propose moving all new inter-system traffic to managed APIs. Today...",

    "scope-validation": {
        "outcome": "pass",
        "violations": []
    },
    "architecture-review": {
        "finding": "The proposal will require new artefacts in INT (conceptual and logical) and updates to APP-DAP to capture the API gateway as a platform.",
        "impact": "Without the new INT artefacts, downstream alignment checks cannot reason about the integration shift.",
        "recommendation": "Add INT-STR-001 to the integration strategy and an INT-PRN-NEW principle for API-first.",
        "rationale": "Strategy and principles must be in place before guardrails and physical patterns can be evaluated against them."
    },
    "referential-integrity": {
        "finding": "Two platform IDs in APP-DAP reference application-domains that do not exist.",
        "impact": "Cross-domain matrices targeting those platforms will be incomplete.",
        "recommendation": "Add the missing application domains or correct the platform domain-id references.",
        "rationale": "Orphaned references silently break catalogue-to-catalogue traceability."
    },
    "strategy-alignment":   { "finding": "...", "impact": "...", "recommendation": "...", "rationale": "..." },
    "principles-alignment": { "finding": "...", "impact": "...", "recommendation": "...", "rationale": "..." },
    "proponent-analysis":   { "finding": "...", "impact": "...", "recommendation": "...", "rationale": "..." },
    "challenger-analysis":  { "finding": "...", "impact": "...", "recommendation": "...", "rationale": "..." }
}
```

## Top-level fields

| Field | Type | Required | Description |
|---|---|---|---|
| `decision-id` | string | yes | Unique identifier; must match the JSON file name and the trailing branch segment |
| `title` | string | yes | Short human-readable title |
| `status` | enum | yes | `draft` \| `proposed` \| `accepted` \| `rejected` \| `superseded` |
| `narrative` | string | yes | Author's narrative of the proposed change |
| `scope-validation` | object | no | Output of Scope Validation (permissive object) |
| `architecture-review` | section | no | Output of Architecture Review |
| `referential-integrity` | section | no | Output of Referential Integrity |
| `strategy-alignment` | section | no | Output of Strategy Alignment |
| `principles-alignment` | section | no | Output of Principles Alignment |
| `proponent-analysis` | section | no | Output of Proponent Analysis |
| `challenger-analysis` | section | no | Output of Challenger Analysis |
