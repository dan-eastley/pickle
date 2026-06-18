# APP-CAP-DAP — Business Capabilities ↔ Application Domains & Platforms Matrix

**File:** [`/config/schemas/artefacts/domains/application/logical/APP-CAP-DAP.json`](../../../../../../config/schemas/artefacts/domains/application/logical/APP-CAP-DAP.json)
**Architecture Domain / Layer:** Application / Logical
**Format:** Matrix

## Purpose

Maps each [APP-DAP](APP-DAP.md) platform to the Level 2 [Business Capabilities (BUS-CAP)](../../business/conceptual/BUS-CAP.md) it supports, in a many-to-many relationship. Columns are BUS-CAP Level 2 capabilities, rows are APP-DAP platforms. Answers *"which platforms support this capability?"* and *"which capabilities does this platform support?"*

This is the first matrix to link artefacts from two different architecture domains (Business and Application) and abstraction layers (Conceptual and Logical). It lives at the more downstream of the two on both axes — Application, Logical — alongside its `rows` source, APP-DAP. See [Matrix placement](../../../../../output-formats.md#matrix-placement) for the general rule.

## Shape

Relationships are stored as a **sparse list** — only required (checked) cells are listed. An entry's presence means the platform supports the capability; absence means no mapping (a capability with nothing mapped has no supporting platform; a platform with nothing mapped supports no capability).

### Column filter

BUS-CAP is a three-level hierarchical catalogue (Level 1 strategic themes, Level 2 capabilities, Level 3 sub-capabilities). This matrix only maps against the 39 **Level 2** capabilities — Level 1 is too coarse to be useful for platform mapping, and Level 3 is more detail than this matrix needs.

To express this, `meta.matrix.columns` carries an optional `filter` block:

```json
"columns": {
    "artefact": "BUS-CAP",
    "array": "capabilities",
    "idField": "id",
    "labelField": "name",
    "tooltipField": "description",
    "filter": { "field": "level", "equals": 2 }
}
```

When present, the rendering layer filters the source array to only those items where `item[filter.field] === filter.equals` before building the matrix columns — here, `capabilities.filter(c => c.level === 2)`. `filter` is optional and omitted by other matrices, which continue to use the full source array unfiltered.

## Example

```json
{
    "relationships": [
        {
            "column-id": "CAP-006-03",
            "row-id": "PLAT-CIS"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | ID of the BUS-CAP Level 2 capability (column) |
| `row-id` | string | yes | ID of the APP-DAP platform (row) |
| `rationale` | string | no | Why this relationship exists |
