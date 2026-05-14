# BUS-GRD — Business Guardrails Catalogue

**File:** [`/schemas/artefacts/domains/business/physical/BUS-GRD.json`](../../schemas/artefacts/domains/business/physical/BUS-GRD.json)
**Architecture Domain / Layer:** Business / Physical
**Format:** Catalogue

## Purpose

Non-negotiable constraints, mandatory standards, and concrete patterns for the Business architecture domain. Binary: comply or raise a formal exception. Answers *"what must always be true?"*

## Industry alignment

- **AWS Service Control Policies** / **Azure Policy** — Rule + scope + effect framing
- **Policy-as-Code** — Each guardrail expected to be enforceable, ideally automatically

## Shape

```json
{
    "guardrails": [
        {
            "id": "BUS-GRD-001",
            "rule": "Customer-impacting business processes require documented Service Owner sign-off before go-live",
            "scope": "All processes in BUS-PRO classified as 'core' (customer-facing)",
            "rationale": "Aligns to principle BUS-PRN-002 'Service Ownership'; prevents undocumented customer-impacting changes",
            "enforcement": "Process release checklist gate; quarterly audit of BUS-PRO entries against approvals",
            "exception-process": "Exception only via the Customer Experience Council with 30-day expiry"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `BUS-GRD-001`) |
| `rule` | string | yes | The mandatory constraint or required pattern |
| `scope` | string | yes | What the rule applies to (systems, environments, data classifications, etc.) |
| `rationale` | string | yes | Why this is mandatory — often references a principle or compliance requirement |
| `enforcement` | string | no | How compliance is checked (automated scan, review gate, manual audit, etc.) |
| `exception-process` | string | no | How an exception can be raised (or `"No exceptions"`) |
