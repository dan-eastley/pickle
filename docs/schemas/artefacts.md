# Artefact-Type Schemas Index

**File:** [`/config/schemas/artefacts.json`](../../config/schemas/artefacts.json)

## Purpose

Index of every defined artefact-type schema in the repository, keyed by artefact-type ID. Each entry `$ref`s the underlying JSON Schema — including diagram and matrix artefacts, even where the storage format is still provisional (their schema is just a `meta` block plus an open `additionalProperties: true` body until the format is finalised).

The full artefact-type registry (with architecture domain / abstraction / format classifications) lives in [`/docs/artefacts.md`](../artefacts.md).

## Example

```json
{
    "schemas": {
        "BUS-CAP": { "$ref": "./artefacts/domains/business/conceptual/BUS-CAP.json" },
        "BUS-BCM": { "$ref": "./artefacts/domains/business/conceptual/BUS-BCM.json" },
        "BUS-PRO": { "$ref": "./artefacts/domains/business/conceptual/BUS-PRO.json" },
        "DAT-DAC": { "$ref": "./artefacts/domains/data/conceptual/DAT-DAC.json" },
        "APP-DAP": { "$ref": "./artefacts/domains/application/logical/APP-DAP.json" }
    }
}
```

## Conventions

- Every artefact type listed in [`/docs/artefacts.md`](../artefacts.md) has an entry here, regardless of format (catalogue, diagram, or matrix).
- When adding a new artefact type, add an entry here keyed by artefact-type ID with a `$ref` to the schema file.
