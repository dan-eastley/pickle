# SOL-GRD — Solution Architecture Guardrails Catalogue

**File:** [`/config/schemas/artefacts/domains/solution/physical/SOL-GRD.json`](../../../../../../config/schemas/artefacts/domains/solution/physical/SOL-GRD.json)
**Architecture Domain / Layer:** Solution / Physical
**Format:** Catalogue

## Purpose

Non-negotiable constraints, mandatory standards, and concrete patterns for the Solution architecture domain. Binary: comply or raise a formal exception. Answers *"what must always be true?"*

## Industry alignment

- **AWS Service Control Policies** / **Azure Policy** — Rule + scope + effect framing
- **Policy-as-Code** — Each guardrail expected to be enforceable, ideally automatically

## Example

```json
{
    "guardrails": [
        {
            "id": "SOL-GRD-001",
            "rule": "Solution designs spanning more than one architecture domain require Architecture Council sign-off before commitment",
            "scope": "Any initiative whose solution design touches at least two of: Business, Data, Integration, Application",
            "rationale": "Cross-domain solutions create cross-cutting risk that is invisible to single-domain reviewers",
            "enforcement": "Commitment gate in the PMO checklist; council sign-off is a required artefact",
            "exception-process": "No exceptions"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `SOL-GRD-001`) |
| `rule` | string | yes | The mandatory constraint or required pattern |
| `scope` | string | yes | What the rule applies to (systems, environments, data classifications, etc.) |
| `rationale` | string | yes | Why this is mandatory — often references a principle or compliance requirement |
| `enforcement` | string | no | How compliance is checked (automated scan, review gate, manual audit, etc.) |
| `exception-process` | string | no | How an exception can be raised (or `"No exceptions"`) |
