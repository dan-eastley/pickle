# tests/

Validation assets for the Pickle product — not unit tests, but the **use-case corpus** the product is developed and tested against.

## use-cases.json

A corpus of use cases for an enterprise-architecture management tool, in a standard user-story format:

```json
{
  "id": "UC-001",
  "title": "Browse the architecture by domain",
  "epic": "Browse & Navigate",
  "actor": "Enterprise Architect",
  "user-story": "As an Enterprise Architect, I want to …, so that ….",
  "complexity": "XS",            // t-shirt: XS · S · M · L · XL
  "priority": "Must Have",        // MoSCoW: Must / Should / Could / Won't Have
  "acceptance-criteria": ["…", "…"]
}
```

Design intent:

- **Mutually exclusive** — each underlying *function* is a distinct capability; no two use cases describe the same thing.
- **Collectively exhaustive** — the functions aim to cover the whole product surface (browse, catalogues, diagrams, matrices, documents, search, discovery, decisions/governance, versioning, audit, roles & access, reporting, quality, integration).
- **Broad coverage** — every role in [`config/roles.json`](../config/roles.json) appears as an actor, and every complexity and MoSCoW priority is represented.

## Regenerating

`use-cases.json` is generated from the curated function list in the generator:

```bash
node tests/generate-use-cases.mjs
```

Add or refine entries in `FUNCTIONS` (one per capability) and regenerate — the generator expands each function across its actor roles and reports coverage by complexity, priority, and role.
