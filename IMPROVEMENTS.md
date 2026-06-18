# Product Improvements Backlog

Tracked improvements, known gaps, and ideas for future development. Items are added here as they are identified during development rather than being lost in conversation history.

---

## API & Data Layer

### Branch preview for STAGED decisions
**Context:** Both `/api/content` and `/api/github` hardcode `ref=main`. This is correct for the current design where decision records always live on main. However, when a decision reaches STAGED, the actual architecture artefact changes are applied to the `decisions/<client>/<version>/<id>` branch, not main.

**Gap:** There is currently no way to preview what the architecture would look like with the STAGED artefact changes applied — you'd need to read from the decisions branch, not main.

**Proposed fix:** Pass an optional `?ref=<branch>` parameter to `/api/content`. The UI could offer a "Preview staged changes" toggle that switches the data source to the decisions branch, letting architects see the post-change architecture state before the PR is merged.

---

## Decisions data model — title/status duplication (resolved, do not change)
**Context:** `decision.json` (on the decisions branch) and `decisions.json` (index on main) both carry `title` and `status`.

**Decision:** Keep the duplication. `decisions.json` is a denormalised summary index that powers the list page with a single fetch. Removing `title`/`status` from `decision.json` would force the detail page to do two fetches (index + full file) just to render the header, and force the list page to check N branch existences to derive status. The `syncIndex` function keeps both files in step on every write, so drift risk is low.

---

## Multi-repository support
**Context:** `GITHUB_OWNER` and `GITHUB_REPO` are single Vercel environment variables. All clients in the app read from the same repository.

**Gap:** Eventually each client should be able to store their architecture in their own GitHub repository.

**Proposed fix:** Store `github-owner` and `github-repo` in each `client.json`. The `/api/content` and `/api/github` functions would read these per-client values instead of the global env vars, allowing the app to proxy content from multiple repositories.

---

## Per-client AI model & credentials selection
**Context:** `decisions-analysis-step.yml` now takes a `model` input (default Haiku 4.5 — see [decisions-analysis.md](docs/workflows/decisions-analysis.md)), but the model and the `ANTHROPIC_API_KEY` secret are global to the repo — every client's decisions are analysed with the same model and billed to the same key.

**Gap:** A client may want their architecture analysed with a different Claude model (cost/quality tradeoff), and billed against their own Anthropic key — especially once "Multi-repository support" (above) lets each client own their architecture repo.

**Proposed fix:** Store a `model` field (and a reference to a per-client API key/secret) in each `client.json`. When the Pickle API dispatches `decisions-analysis.yml`, pass the client's chosen `model` as a workflow input; key storage location TBD (likely per-client repo secrets once multi-repo lands).

---

## Features workflow: Fable review → Sonnet apply
**Context:** Feature branches (`features/<feature-id>`) cover non-architecture codebase changes (schemas, workflows, docs, UI) and currently have no automated review step.

**Gap:** No automated review/recommendation pass runs when a feature PR opens.

**Proposed fix:** New workflow triggered on PR open for `features/**`: Claude Fable reviews the changed codebase and posts a recommendations backlog (e.g. as PR comments or a checklist in the PR body); a separate pass — tentatively Claude Sonnet — could then apply accepted recommendations as follow-up commits.

---

## Diagram export / download
**Context:** Diagram artefacts (BUS-BCM, DAT-CDM) render as inline SVG via [`NestedGroupDiagram`](src/components/artefacts/diagrams/NestedGroupDiagram.jsx). For now, embedding into PowerPoint relies on copy/paste or screen-grabbing the rendered SVG.

**Gap:** No built-in way to download a diagram as an image/file.

**Proposed fix:** Add a "Download" action to `DiagramView` that serialises the SVG (and optionally rasterises it to PNG via canvas) for direct download.

---

## Brand/client-specific diagram theming
**Context:** [`src/lib/diagramTheme.js`](src/lib/diagramTheme.js) defines one shared palette (`DIAGRAM_DOMAIN_COLORS`, `IMPORTANCE_COLORS`, `DIAGRAM_VARIANTS`) used for every client's diagrams.

**Gap:** Clients embedding diagrams into their own presentations may want them styled with their own brand colours/fonts.

**Proposed fix:** Allow `client.json` to carry theme overrides that `diagramTheme.js` merges over the defaults.

---

## Move artefact registry constants into config
**Context:** [`src/lib/artefacts.js`](src/lib/artefacts.js) hardcodes the artefact-type registry, abstraction-layer labels, domain labels, and diagram-type metadata (`ARTEFACTS`, `ABSTRACTIONS`, `DOMAINS`, `DIAGRAM_TYPES`, etc.) as JS constants.

**Gap:** These are display strings tightly coupled to source code. If the project ever needs localisation, or per-client terminology overrides, they'd need to live in data/config rather than JS.

**Proposed fix:** Move these registries into config (e.g. alongside `config/schemas/artefacts.json`), loaded by the UI at build/runtime.

---

## Decision schema & workflow docs out of date
**Context:** While renaming "Decisions Pipeline" to "Decisions Analysis" (see [decisions-analysis.md](docs/workflows/decisions-analysis.md)), found that [docs/schemas/decision.md](docs/schemas/decision.md) predates several fields in [config/schemas/decision.json](config/schemas/decision.json) — `recommendations`, `architecture-changes`, `history`, `rejection-reason`, `pr-number`, `pr-url`, `requirements`, `scope`, and the `review` field on `$defs/section`. [docs/workflows/index.md](docs/workflows/index.md) also has no entries for `decisions-architecture-changes.yml` or `decisions-apply-changes.yml`.

**Gap:** Docs don't reflect the full DRAFT → PROPOSED → ACCEPTED → STAGED → COMMITTED (or REJECTED) lifecycle or the workflows that drive it.

**Proposed fix:** Rewrite `docs/schemas/decision.md` to cover every schema field and the full lifecycle; add `docs/workflows/` entries (and pages, if warranted) for the two undocumented workflows.
