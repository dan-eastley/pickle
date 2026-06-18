# APP-CAT — Application Catalogue

**File:** [`/config/schemas/artefacts/domains/application/physical/APP-CAT.json`](../../../../../../config/schemas/artefacts/domains/application/physical/APP-CAT.json)
**Architecture Domain / Layer:** Application / Physical
**Format:** Catalogue

## Purpose

Catalogue of physical application products deployed across the estate — the concrete vendor products that realise the logical platforms defined in the [Application Domains & Platforms Catalogue (APP-DAP)](../logical/APP-DAP.md). Tracks each application's deployment status and its [TIME model](https://en.wikipedia.org/wiki/Application_portfolio_management) (Invest, Maintain, Tolerate, Eliminate) classification to guide investment decisions. Linked back to APP-DAP via the [Application Domains & Platforms ↔ Application Catalogue Matrix (APP-DAP-CAT)](APP-DAP-CAT.md).

## Industry alignment

- **Application Portfolio Management (APM)** — TIME model classification for investment posture
- **ITAM (IT Asset Management)** — vendor/product/alias tracking and lifecycle status

## Example

```json
{
    "applications": [
        {
            "id": "APP-CAT-016",
            "vendor": "Oracle",
            "product": "Oracle Utilities Customer Care & Billing",
            "aliases": ["Oracle CC&B", "CC&B"],
            "description": "Customer information system providing account management, meter-to-cash, and billing.",
            "status": "live",
            "lifecycle-stage": "tolerate"
        }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique identifier (e.g. `APP-CAT-001`) |
| `vendor` | string | yes | The company that supplies the product |
| `product` | string | yes | Official product name |
| `aliases` | array of strings | no | Other names this product is known by — former names, internal nicknames, or suite names |
| `description` | string | no | Free-text description |
| `status` | enum | yes | `planned` \| `in-development` \| `live` \| `deprecated` \| `retired` — current deployment status |
| `lifecycle-stage` | enum | yes | `invest` \| `maintain` \| `tolerate` \| `eliminate` — TIME model classification |
