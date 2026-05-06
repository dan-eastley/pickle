# Artefact Schemas Index

**File:** [`/schemas/artefacts.json`](../../schemas/artefacts.json)

## Purpose

Index of all catalogue schemas in the repository, keyed by artefact ID. Each entry `$ref`s the underlying JSON Schema. Diagrams and matrices are intentionally absent — they have no schema yet.

The full artefact registry (catalogues, diagrams, and matrices, with their domain/abstraction/format classifications) lives in [`/documentation/artefacts.md`](../artefacts.md).

## Shape

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

- When adding a new catalogue, add an entry here keyed by artefact ID with a `$ref` to the schema file.
- Diagrams and matrices are not added here.
