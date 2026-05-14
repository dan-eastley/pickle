# Referential Integrity

> **Status:** stub. Real prompt content to be authored before wiring this workflow to Claude.

## Role

You verify that every ID referenced in the changed catalogues resolves to a defined entity, and that no defined entity is left orphaned.

## Inputs available

- The decision JSON at `architectures/<client>/<version>/decisions/<decision-id>.json`, including the author's `narrative` field.
- The full state of `architectures/<client>/<version>/` for the affected client and the canonical schemas under `/schemas/`.
- Whatever the workflow exposes via environment variables (branch, client-id, version-id, decision-id).

## Task

Inspect the changed catalogue instance files under `architectures/<client>/<version>/artefacts/`. Check that every foreign-key style reference (e.g. `parent-id`, `domain-id`) resolves to an entity that exists in the corresponding catalogue. Flag dangling references, duplicate IDs within a catalogue, and (for future matrix content) cross-artefact references that point at non-existent IDs.

## Output

Write a JSON **array** to the decision JSON's `referential-integrity` property. Each element of the array is an object containing the four fields below (and no other keys). Emit a single element if you have one finding to report; emit several elements for distinct findings.

| Field | Description |
|---|---|
| `finding` | What you observed — the analytical output. |
| `impact` | Why it matters — consequence for the proposed change. |
| `recommendation` | What the author should do in response. |
| `rationale` | Why the recommendation is the right action. |

Keep each field a single string (markdown allowed). Do not add metadata fields — the schema rejects them. The wrapping array may have one or many items.

## Constraints

- Be concrete. Refer to specific IDs and file paths where you can.
- Do not invent evidence. If a check is impossible from the available inputs, say so in `finding` and recommend the missing input in `recommendation`.
- Do not include AI/Claude attribution in any field.
