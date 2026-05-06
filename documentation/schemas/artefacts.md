# Artefacts Registry Schema

**File:** [`/schemas/artefacts.json`](../../schemas/artefacts.json)

## Purpose

Authoritative machine-readable registry of every artefact this repository understands. Each entry classifies an artefact by domain, abstraction layer, and format, and (for catalogues) `$ref`s the JSON Schema that defines its shape.

## Shape

```json
{
    "artefacts": [
        {
            "id": "BUS-CAP",
            "domain": "business",
            "abstraction": "conceptual",
            "format": "catalogue",
            "name": "Business Capabilities",
            "schema": { "$ref": "./artefacts/domains/business/conceptual/BUS-CAP.json" }
        },
        {
            "id": "BUS-BCM",
            "domain": "business",
            "abstraction": "conceptual",
            "format": "diagram",
            "name": "Business Capability Model",
            "summary": "Model of the Business Capabilities Catalogue (BUS-CAP)"
        }
    ]
}
```

## Fields

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Domain-prefixed unique identifier (e.g. `BUS-CAP`) |
| `domain` | yes | One of `business`, `data`, `integration`, `application`, `solution` |
| `abstraction` | yes | One of `conceptual`, `logical`, `physical` |
| `format` | yes | One of `catalogue`, `matrix`, `diagram` |
| `name` | yes | Human-readable artefact name |
| `summary` | no | Free-text summary, typically used by diagrams that model a catalogue |
| `schema` | no | `$ref` to the JSON Schema. Present for catalogues; matrices and diagrams have no schema yet. |

## Conventions

- Add a registry entry **first** when introducing a new artefact, before adding folders or schemas.
- Catalogue entries must always include a `schema` field.
- `id` prefixes encode the domain — see [domains.md](../domains.md).
