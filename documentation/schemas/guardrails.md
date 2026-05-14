# Guardrails Catalogue Schemas (`<DOM>-GRD`)

**Shared shape used by:** `BUS-GRD`, `DAT-GRD`, `INT-GRD`, `APP-GRD`, `SOL-GRD` — one per architecture domain.

**Schema files:** `/schemas/artefacts/domains/<domain>/physical/<DOM>-GRD.json`
**Architecture Domain / Layer:** Any of the five architecture domains / Physical
**Format:** Catalogue

## Purpose

Captures the *where* and *with what* — non-negotiable constraints, mandatory standards, and concrete patterns. Guardrails are **binary**: comply, or raise a formal exception. They answer *"what must always be true?"*

## Industry alignment

- **AWS Service Control Policies** / **Azure Policy** — Rule + scope + effect framing
- **Policy-as-Code** — Each guardrail expected to be enforceable, ideally automatically

## Shape

```json
{
    "guardrails": [
        {
            "id": "DAT-GRD-001",
            "rule": "Personally Identifiable Information (PII) must be encrypted at rest using AES-256 or stronger",
            "scope": "All persistent data stores in production environments",
            "rationale": "GDPR Article 32 and ISO 27001 A.10.1; supports principle DAT-PRN-005 'Secure by Default'",
            "enforcement": "Quarterly automated scan of storage configurations; new systems require security review sign-off",
            "exception-process": "No exceptions"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `DAT-GRD-001`) |
| `rule` | string | yes | The mandatory constraint or required pattern |
| `scope` | string | yes | What the rule applies to (systems, environments, data classifications, etc.) |
| `rationale` | string | yes | Why this is mandatory — often references a principle or compliance requirement |
| `enforcement` | string | no | How compliance is checked (automated scan, review gate, manual audit, etc.) |
| `exception-process` | string | no | How an exception can be raised (or `"No exceptions"`) |
