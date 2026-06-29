# Clients Index Schema

**File:** [`/schemas/clients.json`](../../schemas/clients.json)
**Validates:** [`/architectures/clients/clients.json`](../../architectures/clients/clients.json)

## Purpose

Authoritative list of client IDs that have an architecture in this repository. Per-client metadata (name, etc.) lives in `architectures/clients/<client>/client.json`, this index intentionally only carries the IDs.

## Example

```json
{
    "clients": [
        { "client-id": "client-a" }
    ]
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `clients` | array | yes | List of client entries |
| `clients[].client-id` | string | yes | Unique identifier: must match the client folder name |

## Conventions

- When adding a new client folder, add a matching entry here.
- When removing a client, remove its entry here too.
- The `client-id` value must equal the folder name under `architectures/`.
