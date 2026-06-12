# APP-GRD — Application Architecture Guardrails Catalogue

**File:** [`/config/schemas/artefacts/domains/application/physical/APP-GRD.json`](../../../../../../config/schemas/artefacts/domains/application/physical/APP-GRD.json)
**Architecture Domain / Layer:** Application / Physical
**Format:** Catalogue

## Purpose

Non-negotiable constraints, mandatory standards, and concrete patterns for the Application architecture domain. Binary: comply or raise a formal exception. Answers *"what must always be true?"*

## Industry alignment

- **AWS Service Control Policies** / **Azure Policy** — Rule + scope + effect framing
- **Policy-as-Code** — Each guardrail expected to be enforceable, ideally automatically

## Example

```json
{
    "guardrails": [
        {
            "id": "APP-GRD-001",
            "rule": "No production deployment without a passing automated test suite covering the changed code",
            "scope": "All applications in the production estate",
            "rationale": "Reduces incidents traceable to untested change; required by SRE policy",
            "enforcement": "Deployment pipeline gate; deployments without a corresponding green CI run are blocked",
            "exception-process": "Emergency-change exception via the on-call engineering lead, valid for 24 hours"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `APP-GRD-001`) |
| `rule` | string | yes | The mandatory constraint or required pattern |
| `scope` | string | yes | What the rule applies to (systems, environments, data classifications, etc.) |
| `rationale` | string | yes | Why this is mandatory — often references a principle or compliance requirement |
| `enforcement` | string | no | How compliance is checked (automated scan, review gate, manual audit, etc.) |
| `exception-process` | string | no | How an exception can be raised (or `"No exceptions"`) |
