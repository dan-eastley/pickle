# APP-DAP-CAT — Application Domains & Platforms ↔ Application Catalogue Matrix

**File:** [`/config/schemas/artefacts/domains/application/physical/APP-DAP-CAT.json`](../../../../../../config/schemas/artefacts/domains/application/physical/APP-DAP-CAT.json)
**Architecture Domain / Layer:** Application / Physical
**Format:** Matrix

## Purpose

Maps each [APP-DAP](../logical/APP-DAP.md) platform to the physical application(s) in the [Application Catalogue (APP-CAT)](APP-CAT.md) that implement it, in a many-to-many relationship. Columns are APP-DAP platforms, rows are APP-CAT applications. Answers *"which product implements this platform?"* and *"which platform does this product implement?"*

This is the first matrix to link artefacts from two different abstraction layers (APP-DAP is Logical, APP-CAT is Physical) within the same domain. It lives at the more downstream of the two — Physical — alongside its `rows` source, APP-CAT. See [Matrix placement](../../../../../output-formats.md#matrix-placement) for the general rule.

## Shape

Relationships are stored as a **sparse list** — only required (checked) cells are listed. An entry's presence means the application implements the platform; absence means no mapping (a platform with nothing mapped has no deployed product; a product with nothing mapped implements no current platform).

## Example

```json
{
    "relationships": [
        {
            "column-id": "PLAT-CIS",
            "row-id": "APP-CAT-016",
            "rationale": "Oracle Utilities Customer Care & Billing holds the customer, account, and contract master plus billing engine."
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `column-id` | string | yes | ID of the APP-DAP platform (column) |
| `row-id` | string | yes | ID of the APP-CAT application (row) |
| `rationale` | string | no | Why this relationship exists |
