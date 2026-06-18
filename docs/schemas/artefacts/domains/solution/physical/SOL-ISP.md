# SOL-ISP — Interface Specification

**Domain:** Solution · **Layer:** Physical · **Format:** Document

Physical-level technical specifications for integration interfaces. One document per interface — covering protocol, authentication, data format, endpoints, data model, error handling, SLA, and test scenarios.

## Document properties

| Property | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique instance ID (e.g. `SOL-ISP-001`) |
| `title` | string | yes | Title (e.g. "CIS to Data Lakehouse Ingestion Specification") |
| `description` | string | yes | One-paragraph summary |
| `status` | enum | no | `draft` · `in-review` · `approved` · `superseded` |
| `interface-id` | string | no | INT-IFC interface ID this spec covers (e.g. `INT-IFC-001`) |
| `source-system` | string | no | APP-DAP platform ID of the source system |
| `target-system` | string | no | APP-DAP platform ID of the target system |
| `technical-protocol` | enum | no | `REST` · `SOAP` · `GraphQL` · `gRPC` · `event-stream` · `batch-file` · `database-link` |
| `authentication` | enum | no | `OAuth2` · `API-key` · `mTLS` · `service-account` · `none` |
| `data-format` | enum | no | `JSON` · `XML` · `CSV` · `Parquet` · `Avro` · `Protobuf` · `EDI` · `binary` |
| `trigger` | enum | no | `real-time` · `scheduled` · `event-driven` · `on-demand` |
| `overview` | string | no | Interface overview — rendered as prose |
| `endpoints` | array | no | Each: `path`, `method` (GET/POST/PUT/DELETE/PATCH/SUBSCRIBE/PUBLISH), `description` |
| `data-model` | string | no | Schema definition or field mapping — rendered as code block |
| `error-handling` | string | no | Error handling strategy — rendered as prose |
| `sla` | object | no | `latency-p99-ms` (int), `throughput-tps` (int), `availability-percent` (number) |
| `test-scenarios` | array | no | Each: `id`, `description`, `expected-outcome` |
| `diagrams` | array | no | Embedded diagram references |

## Usage

Derived from Solution Designs (`SOL-SDE`) and references an INT-IFC interface record. One specification per interface — typically authored by the integration architect or technical lead. Feeds into interface acceptance testing.

**Source/target metadata** (`interface-id`, `source-system`, `target-system`, `technical-protocol`, `authentication`, `data-format`, `trigger`) is rendered as a metadata table at the top of the document view rather than as a section.
