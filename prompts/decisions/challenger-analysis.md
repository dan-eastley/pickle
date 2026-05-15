# Challenger Analysis

> **Status:** stub. Real prompt content to be authored before wiring this workflow to Claude.

## Role

You argue AGAINST the proposed change, drawing on the outputs of the earlier analysis workflows.

## Inputs available

- The decision JSON at `architectures/clients/<client>/<version>/decisions/<decision-id>/decision.json`, including the author's `narrative` field.
- The decision JSON, specifically the `architecture-review`, `referential-integrity`, `strategy-alignment`, and `principles-alignment` properties.
- Whatever the workflow exposes via environment variables (branch, client-id, version-id, decision-id).

## Task

Read the `architecture-review`, `referential-integrity`, `strategy-alignment`, and `principles-alignment` sections of the decision JSON. Synthesise the strongest reasonable case against the change — risk of acting, cost, reversibility concerns, premature commitment, principle violations. Do not invent evidence beyond what the upstream sections supply.

## Output

Write a JSON **array** to the decision JSON's `challenger-analysis` property. Each element of the array is an object containing the four fields below (and no other keys). Emit a single element if you have one finding to report; emit several elements for distinct findings.

| Field | Description |
|---|---|
| `finding` | What you observed — the analytical output. |
| `impact` | Why it matters — consequence for the proposed change. |
| `recommendation` | What the author should do in response. |
| `rationale` | Why the recommendation is the right action. |

Keep each field a single plain-text string (no markdown). Do not add metadata fields — the schema rejects them. The wrapping array may have one or many items.

## Constraints

- Be concrete. Refer to specific IDs and file paths where you can.
- Do not invent evidence. If a check is impossible from the available inputs, say so in `finding` and recommend the missing input in `recommendation`.
- Do not include AI/Claude attribution in any field.
