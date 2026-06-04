# Artefact-Type Schemas Index

**File:** [`/config/schemas/artefacts.json`](../../config/schemas/artefacts.json)

## Purpose

Index of all catalogue schemas in the repository, keyed by artefact-type ID. Each entry `$ref`s the underlying JSON Schema. Diagrams and matrices are intentionally absent — they have no schema yet.

The full artefact-type registry (catalogues, diagrams, and matrices, with their architecture domain / abstraction / format classifications) lives in [`/docs/artefacts.md`](../artefacts.md).

## Example

```json
{
    "schemas": {
        "BUS-CAP": { "$ref": "./artefacts/domains/business/conceptual/BUS-CAP.json" },
        "BUS-PRO": { "$ref": "./artefacts/domains/business/conceptual/BUS-PRO.json" },
        "DAT-DAC": { "$ref": "./artefacts/domains/data/conceptual/DAT-DAC.json" },
        "APP-DAP": { "$ref": "./artefacts/domains/application/logical/APP-DAP.json" }
    }
}
```

## Conventions

- When adding a new catalogue, add an entry here keyed by artefact-type ID with a `$ref` to the schema file.
- Diagrams and matrices are not added here.
