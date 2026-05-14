# Decision Pipeline

Six analysis workflows that run in sequence after [Validate Context](validate-context.md) passes on a `decisions/<client>/<version>/<decision-id>` branch push. Each fills in a section of the [decision JSON](../schemas/decision.md) at `architectures/<client>/<version>/decisions/<decision-id>.json`. **Schema property names match the kebab-cased workflow names** — e.g., the `Architecture Review` workflow writes to the `architecture-review` property.

## Pre-requisites

1. The **author** hand-creates the decision JSON at branch start, populating `decision-id`, `title`, `status: "draft"`, and `narrative`. The seven workflows refuse to run if the decision file is missing.
2. **Validate Context** (`validate-context.yml`) runs first on the push and gates the pipeline. If it fails (out-of-context file changes), the chain below does not run.

## Chain mechanism

- Validate Context is the trigger workflow — it runs on `push` to `decisions/**`.
- The six analysis workflows below are triggered by `workflow_run` on the prior workflow's successful completion.
- Each workflow checks out the decision branch, reads the decision JSON, fills its section, and commits back via `GITHUB_TOKEN`. The commit push does **not** re-trigger push events (GitHub anti-recursion), so the chain is linear and finite.
- The shared logic for the six analysis stubs lives in [`/.github/scripts/decision-stub.sh`](../../.github/scripts/decision-stub.sh).

> **`workflow_run` only fires from workflow files on the default branch.** The chain is dormant until these workflows reach `main`.

## The six analysis workflows

### 1. Architecture Review
- **File:** `decisions-architecture-review.yml`
- **Trigger:** `workflow_run` after Validate Context
- **Will eventually do:** take the narrative; recommend the artefact-type changes that ought to be made.
- **Section written:** `architecture-review`

### 2. Referential Integrity
- **File:** `decisions-referential-integrity.yml`
- **Trigger:** `workflow_run` after Architecture Review
- **Will eventually do:** check IDs align, no orphans (especially across matrix content); recommend updates to the ADR.
- **Section written:** `referential-integrity`

### 3. Strategy Alignment
- **File:** `decisions-strategy-alignment.yml`
- **Trigger:** `workflow_run` after Referential Integrity
- **Will eventually do:** if Conceptual artefacts are changing, review against the Strategy for the affected domain; recommend ADR updates.
- **Section written:** `strategy-alignment`

### 4. Principles Alignment
- **File:** `decisions-principles-alignment.yml`
- **Trigger:** `workflow_run` after Strategy Alignment
- **Will eventually do:** if Logical artefacts are changing, review against the Principles for the affected domain; recommend ADR updates.
- **Section written:** `principles-alignment`

### 5. Proponent Analysis
- **File:** `decisions-proponent-analysis.yml`
- **Trigger:** `workflow_run` after Principles Alignment
- **Will eventually do:** read the outputs from Referential Integrity, Strategy Alignment, Principles Alignment, and produce a narrative arguing FOR the change.
- **Section written:** `proponent-analysis`

### 6. Challenger Analysis
- **File:** `decisions-challenger-analysis.yml`
- **Trigger:** `workflow_run` after Proponent Analysis
- **Will eventually do:** read the same upstream outputs and produce a narrative arguing AGAINST the change.
- **Section written:** `challenger-analysis`

## Current status

All six analysis workflows are **structural stubs**. Each writes the 4-string `{finding, impact, recommendation, rationale}` shape defined at `$defs/section` in [schemas/decision.json](../../schemas/decision.json) with placeholder content. Real logic — both AI-driven analysis and deterministic checks — is pending.

[Validate Context](validate-context.md) is the only fully-implemented decision-related workflow.
