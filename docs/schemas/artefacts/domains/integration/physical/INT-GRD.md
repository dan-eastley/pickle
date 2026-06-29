# INT-GRD: Integration Architecture Guardrails Catalogue

**File:** [`/config/schemas/artefacts/domains/integration/physical/INT-GRD.json`](../../../../../../config/schemas/artefacts/domains/integration/physical/INT-GRD.json)
**Architecture Domain / Layer:** Integration / Physical
**Format:** Catalogue

## Purpose

Non-negotiable constraints, mandatory standards, and concrete patterns for the Integration architecture domain. Binary: comply or raise a formal exception. Answers *"what must always be true?"*

## Industry alignment

- **AWS Service Control Policies** / **Azure Policy**: Rule + scope + effect framing
- **Policy-as-Code**: Each guardrail expected to be enforceable, ideally automatically

## Example

```json
{
    "guardrails": [
        {
            "id": "INT-GRD-001",
            "rule": "All inter-system traffic crossing a trust boundary must pass through the managed API Gateway",
            "scope": "Any HTTP/HTTPS or messaging traffic between systems in different security zones",
            "rationale": "Centralises authentication, rate limiting, and audit; required by ISO 27001 A.13.1",
            "enforcement": "Network policy denies direct inter-zone traffic; CI checks for hard-coded service URLs",
            "exception-process": "Exception via the Network Security board with formal compensating controls"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `INT-GRD-001`) |
| `rule` | string | yes | The mandatory constraint or required pattern |
| `scope` | string | yes | What the rule applies to (systems, environments, data classifications, etc.) |
| `rationale` | string | yes | Why this is mandatory: often references a principle or compliance requirement |
| `enforcement` | string | no | How compliance is checked (automated scan, review gate, manual audit, etc.) |
| `exception-process` | string | no | How an exception can be raised (or `"No exceptions"`) |
