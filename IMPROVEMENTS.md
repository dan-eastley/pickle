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
**Status (2026-06): mostly done.** User-facing strings (name/description for every domain, abstraction, format, diagram type, and artefact type) now live in [`config/i18n/en.json`](config/i18n/en.json), loaded via [`src/i18n`](src/i18n/index.js) and overlaid onto the structural registry in [`src/lib/artefacts.js`](src/lib/artefacts.js). Localisation is drop-in (add `config/i18n/<locale>.json` + a `LOCALES` entry).

**Context:** [`src/lib/artefacts.js`](src/lib/artefacts.js) hardcodes the artefact-type registry, abstraction-layer labels, domain labels, and diagram-type metadata (`ARTEFACTS`, `ABSTRACTIONS`, `DOMAINS`, `DIAGRAM_TYPES`, etc.) as JS constants.

**Gap:** These are display strings tightly coupled to source code. If the project ever needs localisation, or per-client terminology overrides, they'd need to live in data/config rather than JS.

**Remaining:** The structural arrays still carry the inline English as a fallback — these duplicate `en.json` and could be pruned. Per-client terminology overrides (a second overlay) are not yet supported.

---

## Decision schema & workflow docs out of date
**Context:** While renaming "Decisions Pipeline" to "Decisions Analysis" (see [decisions-analysis.md](docs/workflows/decisions-analysis.md)), found that [docs/schemas/decision.md](docs/schemas/decision.md) predates several fields in [config/schemas/decision.json](config/schemas/decision.json) — `recommendations`, `architecture-changes`, `history`, `rejection-reason`, `pr-number`, `pr-url`, `requirements`, `scope`, and the `review` field on `$defs/section`. [docs/workflows/index.md](docs/workflows/index.md) also has no entries for `decisions-architecture-changes.yml` or `decisions-apply-changes.yml`.

**Gap:** Docs don't reflect the full DRAFT → PROPOSED → ACCEPTED → STAGED → COMMITTED (or REJECTED) lifecycle or the workflows that drive it.

**Proposed fix:** Rewrite `docs/schemas/decision.md` to cover every schema field and the full lifecycle; add `docs/workflows/` entries (and pages, if warranted) for the two undocumented workflows.

---

## End-to-end functionality review (2026-06)

A top-to-bottom pass over the live app. Ordered roughly by impact.

**Shipped in the 2026-06 pass:** decision narrative split into required Context/Problem/Proposal (modal trimmed to Title + the three + Scope-at-bottom; Requirements full-form only); Analysis tabs reworked into jumpable h3 sub-sections with per-step counts in the contents nav and headings; counts on Recommendations and Architecture Changes; architecture-change Description and Detail merged; activity/change-history table on artefact and decision pages (auto-seeded on decision create/edit); the **Discovery** Virtual-Architect-Agent scaffold (page, form, schema, storage, homepage); the SVG hover-over-text and SOL-ISP duplicate-Overview bugs; gradient PICKLE wordmark and blue→red decision stepper.

**Still open from the list below:** the items in High/Medium/Lower remain except where noted inline.

### High impact
- **"New Decision" modal Save is still a stub.** [`NewDecisionModal`](src/components/decisions/NewDecisionModal.jsx) now collects the right fields (Title + Context/Problem/Proposal + Scope) but `handleSave` still just sets `saved = true` with a `// TODO: push to repo on new branch`. Raising a decision from an artefact page does nothing durable; only the full editor (`DecisionEditorPage` → `/api/github` `create-decision`) actually creates one. Either wire the modal to `create-decision` or make it route to the editor with the fields pre-filled.
- **Decision transitions don't work in local dev.** Status changes call `/api/github`, which is a Vercel serverless function — the Vite dev middleware only serves `/api/arch` and `/api/schemas|docs`. Add a dev shim (or document that transitions are deploy-only) so the pipeline can be exercised locally.
- **No global search / command palette.** Navigation is entirely via the domain tabs; there's no way to jump to a capability/process/platform/decision by name or ID. This is the single biggest usability gap (and is designed for in `proposed-design/shell.html`).
- **Decision status vs. analysis content.** The analysis workflows write findings/changes to `decision.json` but never advance `status`; status is UI-driven. After a green pipeline a decision can read `proposed` while carrying `accepted`-stage `architecture-changes`. Make the workflow (or the API on dispatch) own the status transition, or surface "analysis complete, awaiting human" explicitly.

### Medium impact
- **Footer mis-reports config.** The footer shows "GITHUB_OWNER / GITHUB_REPO not configured" in dev because it checks build-time `import.meta.env` vars that aren't set, even though data loads fine. Fix the check or remove the banner.
- **Validation workflows are disabled.** `validate-schema`, `validate-structure`, `validate-context` all carry `if: false`. Re-enable JSON-Schema validation of architecture instances and the change-surface checks as PR gates (the new `test.yml` shows the pattern).
- **Cross-reference integrity isn't checked.** Document refs (e.g. `PLAT-MDM`, context `document-id`s) aren't validated against the catalogues/instances they point at. Add a referential-integrity check (mirrors the decision pipeline's `referential-integrity` step, but for committed data).
- **Diagram export/download** — see backlog item above; recurring user need.
- **Staged-changes preview** — see backlog item above (`?ref=<branch>`).

### Lower impact / polish
- **Accessibility:** form labels in the decision editor/modal aren't associated with controls; modals and the slide panel don't trap focus or restore it on close. (Tracked in `PRODUCTION_READINESS.md`.)
- **Responsiveness:** the document/decision two-column layout hides the contents nav below `lg`; catalogue/matrix tables rely on horizontal scroll. The product is desktop-first — a deliberate mobile pass would help.
- **Loading states:** some routes flash a bare spinner; skeletons would feel faster.
- **Entity deep-linking:** the entity detail panel has no shareable URL.

---

## Framework alignment — TOGAF

Pickle already implements several TOGAF ideas natively; a few terminology and structural tweaks would make the alignment explicit and marketable.

| TOGAF concept | Pickle today | Tweak to align |
|---|---|---|
| **ADM phases A–H** | The document chain AVI → AIN → SVI → SDE → ISP loosely tracks Vision → Definition → Governance | Label each document type with its ADM phase (AVI = *Phase A: Architecture Vision*; SDE = *Architecture Definition*; decisions = *Phase G/H Governance & Change Management*) |
| **Architecture domains (Business / Data / Application / Technology)** | Business, Data, Integration, Application, Solution | Add a **Technology** domain (infrastructure, networks, hosting — TOGAF Phase D); position **Integration** as a cross-cutting concern. Currently only `APP-DAP` physical hints at technology |
| **Architecture Repository** | The Git repo *is* the repository | Surface this framing in docs/home — "your TOGAF Architecture Repository, as code" |
| **ABB → SBB (building blocks)** | Conceptual → Logical → Physical layers | Adopt ABB/SBB language: conceptual/logical = Architecture Building Blocks, physical = Solution Building Blocks |
| **Architecture Definition Document / Requirements Specification** | SDE document + decision requirements + SDE NFRs | Group these as the "Architecture Definition" and a cross-cutting **Requirements** repository (TOGAF Requirements Management sits at the centre of the ADM) |
| **Architecture Roadmap / Transition Architectures** | AVI `transformation-themes` | Add explicit **Roadmap** and **Transition State** artefact types (Phase E/F) — these were intentionally removed from SDE earlier; they belong at the vision/portfolio level |
| **Principles / Decisions / Stakeholders / Concerns / Viewpoints** | Per-domain Strategy/Principles/Guardrails; ADRs | Already strong. Add **stakeholder** and **concern** fields to visions/intents to complete the TOGAF/ArchiMate vocabulary |

**Status (2026-06): partially done.** ADM-phase labelling applied to the solution document descriptions (AVI/AIN = Phase A; SVI/SDE/ISP = Phases B–D); ABB/SBB language added to the abstraction-layer descriptions; "your TOGAF Architecture Repository, as code" framing on the homepage; **stakeholder** and **concern** fields added to AVI/AIN (schema, renderer, sample data); homepage TOGAF support table shipped. **Remaining:** a dedicated Technology domain, explicit Roadmap/Transition-Architecture artefact types, and a cross-cutting Requirements repository.

**Net:** Pickle is a TOGAF-shaped tool that codifies the Architecture Repository and ADRs. The gaps are a Technology domain, explicit Roadmap/Transition artefacts, and ADM-phase labelling.

---

## Framework alignment — SAFe

SAFe is delivery-flow oriented; Pickle's strongest SAFe fit is **Solution Intent** and the **Architectural Runway**.

| SAFe concept | Pickle today | Tweak to align |
|---|---|---|
| **Solution Intent** (single source of truth for current & future solution behaviour) | The Solution document set (SVI/SDE/ISP) + the repository | Brand the solution document set as **Solution Intent**; distinguish *fixed* vs *variable* intent (decided vs. options-open) — Pickle's `status` + decision options already model this |
| **Architectural Runway** (existing components/infra enabling near-term features) | Physical-layer catalogues (`APP-CAT`, platforms) + guardrails | Add a **Runway** view that reads the physical layer and shows what's "ready" vs "needs an enabler" |
| **Enabler / Enabler Epic** (architectural work) | ADR-driven architecture changes | Add an **Enabler** decision/change type; link enablers to the capabilities/features they unblock |
| **Epics → Capabilities → Features → Stories** | `BUS-CAP` (enterprise capabilities), SDE `features` | Clarify enterprise-capability vs SAFe-Capability; add optional links from decisions/features to external backlog IDs (Jira/ADO Epic/Feature) |
| **Lean Portfolio Management / Lean Business Case** | AVI drivers/objectives/benefits | Map AVI to a portfolio **Epic hypothesis / Lean Business Case**; add WSJF (Cost of Delay ÷ size) scoring to decisions for prioritisation |
| **Program Increment (PI) / releases** | Per-client **versions** (`1.0.0` …) | Map versions to PIs/releases; allow a version to carry a PI label and dates |
| **Value Streams** | `BUS-PRO` (business processes) partially | Add an operational/development **Value Stream** business artefact |
| **Continuous Delivery Pipeline** | The decisions + GitHub Actions pipeline | Already a real CD-style governance pipeline — surface it as such |

**Status (2026-06): partially done.** Solution Vision renamed to **Solution Intent** (registry, SVI schema, docs, homepage chain), with SAFe *fixed vs variable intent* framing in the descriptions; homepage SAFe support table shipped. **Remaining:** Architectural Runway view, an Enabler decision/change type, WSJF scoring, PI/release labels on versions, Value Stream artefact, and backlog-tool links.

**Net:** Pickle can position itself as a **Solution Intent + Architectural Runway** repository for SAFe, with enablers driven by ADRs. The gaps are enabler/WSJF fields, runway views, and backlog-tool links.

> **Homepage:** add a "Works with your framework" section with a TOGAF and a SAFe support table summarising the rows above (what's supported today vs. on the roadmap).

---

## Authentication, access control & storage

The app is currently **unauthenticated** — anyone with the URL can view everything and drive decision transitions (the server holds the only GitHub token). Fine for a demo, not for production. Proposed setup, to be fleshed out then built.

### Authentication
- **Primary: GitHub OAuth** (via Auth.js / NextAuth-style flow on Vercel). Natural fit — the architecture lives in GitHub, so a user's GitHub identity can map to repository permissions.
- **Enterprise SSO:** OIDC/SAML (Okta, Entra ID) for client orgs that don't use GitHub identities.
- Sessions in secure, HTTP-only cookies; server-side session validation on every mutating call.

### Authorization (RBAC + ACL)
- **Roles:** `Viewer` (read), `Contributor` (raise decisions/edit drafts), `Approver/Architect` (accept / reject / stage / commit), `Admin` (manage clients, users, config).
- **Scoping:** roles assigned **per client** (optionally per version/domain). A user holds `{ clientId, role }` grants.
- **Enforcement:** add an authz layer to `/api/github` — every `create-decision` / `update-decision` / `commit-decision` checks the session's role for the target client. Today these are unprotected.
- **Optional GitHub mapping:** when using per-client repos, derive roles from the user's repo permission (push → Contributor, admin → Approver).
- **Audit:** log every transition (who, when, from→to) for governance.

### Storage for non-GitHub state
Keep architecture-as-code in GitHub (source of truth); add an operational tier:
- **Relational DB** (Vercel Postgres / Neon / Supabase): users, role/ACL grants, per-client repo + model + encrypted API-key config, audit log, comments/annotations on decisions and artefacts, WSJF/prioritisation scores, external backlog links (Jira/ADO), sessions.
- **Blob storage** (Vercel Blob / S3): binary artefacts — uploaded/exported diagrams (PNG/PDF), client logos (currently read from the repo), decision attachments, generated reports.

### Phased rollout
1. **Login gate** — GitHub OAuth + a single `Admin` allowlist; everyone else read-only.
2. **RBAC in DB** — per-client role grants; enforce on the mutating API; audit log.
3. **Per-client repos + blob** — multi-repo config in DB, GitHub-permission mapping, blob for binaries, enterprise SSO.
