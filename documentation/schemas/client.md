# Client Metadata Schema

**File:** [`/schemas/client.json`](../../schemas/client.json)
**Validates:** `/architectures/<client>/client.json`

## Purpose

Per-client metadata file living inside each client's folder. Carries human-readable information about the client. The plural index at [`architectures/clients.json`](../../architectures/clients.json) only lists IDs — names and other metadata live here.

## Shape

```json
{
    "client-id": "client-a",
    "name": "Client A Name"
}
```

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `client-id` | string | yes | Unique identifier — must match the client folder name |
| `name` | string | yes | Human-readable client name |

## Conventions

- The `client-id` value must equal the parent folder name under `architectures/`.
- Add a matching entry to [`schemas/clients.json`](../../architectures/clients.json) (the index) when creating a new client folder.
