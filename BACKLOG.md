# Backlog

The product backlog for Pickle, structured loosely as **Epic → Feature**. Each feature has a stable **ID** (quote it to pick what to work on), a **status**, an **impact**, and a short **Context / Gap / Proposed fix**.

- **Status:** ✅ Fully implemented · 🟡 Partially implemented · ⬜ Not implemented
- **Impact:** High · Medium · Low

> This file supersedes the former `IMPROVEMENTS.md` and `PRODUCTION_READINESS.md`, which have been folded in here.

---

## Epic: Decisions & Governance

### DEC-1 · 🟡 End-to-end ADR pipeline · High
**Context:** Decisions flow DRAFT → PROPOSED → ACCEPTED → STAGED → COMMITTED, with workflows generating recommendations, the seven analysis streams, and architecture changes; STAGED applies accepted changes to artefacts via Claude and opens a PR; COMMITTED merges it, closes the PR, and deletes the branch. Verified live on ADR-014. A dev shim now lets `/api/github` run locally.
**Gap:** Status is UI-driven, not owned by the workflows — after a green run a decision can read `proposed` while already carrying later-stage output. No explicit "analysis complete, awaiting human" state beyond the workflow banner.
**Proposed fix:** Let the workflow (or the API on dispatch) own the status transition; surface a "ready for review" state.

### DEC-2 · ✅ "New Decision" modal persistence · Medium
**Context:** The artefact-page modal collects Title + Context/Problem/Proposal + Scope and now POSTs `create-decision` (same path as the full editor), then links to the created draft.

### DEC-3 · 🟡 Decision narrative migration · Low
**Context:** New decisions use Context/Problem/Proposal; the detail view renders these (falling back to legacy `narrative`).
**Gap:** Older decisions on branches still carry only `narrative`.
**Proposed fix:** Backfill on next edit, or a one-off migration.

### DEC-4 · ⬜ Branch preview for STAGED decisions · Medium
**Context:** Staged changes live on the decision branch / PR.
**Gap:** The app only reads `main`; there's no in-app preview of the staged diff.
**Proposed fix:** Support `?ref=<branch>` reads so the staged artefact state can be previewed before commit.

---

## Epic: Discovery (Virtual Architect Agent)

### DSC-1 · ✅ Discovery (Virtual Architect Agent) · Medium
**Context:** Full flow works end-to-end. The form/modal call `create-discovery`; the self-contained `discovery-to-active` workflow runs the `architecture-discovery` prompt and commits Markdown `findings` back to main; the detail page Archive/Reactivate calls `update-discovery`. **Verified live (DSC-003).**
**Gap:** No re-run/refresh action on an existing discovery; findings aren't versioned across re-runs.

---

## Epic: UI & Design System

### UI-1 · ✅ Action-bar system · Medium
**Context:** `ActionBar` (title + strapline, no bar icon, actions ordered Tertiary → Secondary → Primary) and Button variants. Index headers, editor headers, and the artefact bar use it.
**Gap:** The decision `StatusActions` transition buttons aren't yet folded into the system.
**Proposed fix:** Express `StatusActions` through the same primary/secondary vocabulary.

### UI-2 · ✅ Analysis tables · Medium
**Context:** All seven tables use uniform 25% columns; clicking a finding row accepts/declines it; step headers are collapsible; analysis locks once Accepted.

### UI-3 · ✅ Auto-grow fields, terminology, help panels · Low
**Context:** Context/Problem/Proposal/Request auto-grow; count casing; "New Architecture Decision/Discovery" titles + primary buttons; confirm-on-discard; friendly help panels.

### UI-4 · ⬜ Global search / command palette · High
**Context:** Navigation is via domain tabs only.
**Gap:** No way to jump to a capability/process/platform/decision by name or id.
**Proposed fix:** A search index over artefacts and entities with a command-palette UI.

### UI-5 · 🟡 Responsiveness, loading skeletons, entity deep-linking · Low
**Context:** Desktop-first; some routes flash a bare spinner; the entity panel has no shareable URL.
**Proposed fix:** A mobile pass, skeleton loaders, and deep-linkable entity URLs.
**Done:** Skeleton loader (`components/ui/Skeleton.jsx`) replaces the bare spinner on the artefact surface, giving the page its eventual shape (title + intro + card rows) with an `sr-only` loading status.
**Remaining:** Deliberate mobile/responsive pass; deep-linkable entity-panel URLs (e.g. `?entity=…`).

### UI-6 · ⬜ Diagram export / download · Medium
**Context:** Diagrams render as SVG in-app.
**Gap:** No export to PNG/SVG for slides and docs.
**Proposed fix:** Add an export action to the diagram views.

### UI-7 · ⬜ Brand/client-specific diagram theming · Low
**Proposed fix:** Allow per-client colourways for diagrams.

---

## Epic: Architecture Model & Content

### AMC-1 · 🟡 Artefact registry in config (i18n) · Low
**Context:** User-facing names/descriptions live in `config/i18n/en.json`, overlaid onto the structural registry. The inline English in `artefacts.js` is kept as an intentional fallback (robustness if a key is missing); a coverage test (`lib/i18n.test.js`) now enforces that the locale covers every registry id, so the two can't drift and a new artefact can't ship without a locale entry.
**Gap:** Per-client terminology overrides aren't supported.
**Proposed fix:** Add a per-client locale overlay.

### AMC-2 · ✅ Derived-artefact cascade on apply · High
**Context:** `config/artefact-relationships.json` maps each artefact to the artefacts `derived` from it. The Apply Changes prompt reads it and regenerates derivatives in the same PR when a source catalogue changes. **Verified live (ADR-015):** a `BUS-PRO` edit regenerated both `BUS-BPM` (diagram) and `BUS-CAP-PRO` (matrix).
**Gap:** Catalogue→catalogue derivatives are left to Claude's judgement (rare).

### AMC-3 · ⬜ Technology domain + Roadmap/Transition artefacts · Medium
**Context:** Five domains today; only `APP-DAP` physical hints at technology.
**Proposed fix:** Add a Technology domain (TOGAF Phase D) and explicit Roadmap / Transition-Architecture artefact types (Phase E/F).

### AMC-4 · ⬜ Matrix/diagram formats beyond current set · Low
**Proposed fix:** Define the remaining diagram/matrix types in the registry and renderers.

---

## Epic: Document Artefacts (Low-Level Designs)

Candidate document artefact types to add alongside the existing Interface Specification (`SOL-ISP`). Each is a low-level design produced during solution delivery; pick one to define (registry entry + schema + schema doc + per-version folder, per `docs/artefacts.md`). Most live in the Solution domain, Logical or Physical layer.

- **DOC-1 · ⬜ Application Component Specification · Low** — detailed design of one application component: responsibilities, provided/consumed interfaces, internal data, dependencies, and configuration. (Physical)
- **DOC-2 · ⬜ API Specification · Low** — formal API contract for a service (resources, operations, schemas, auth, versioning) — an OpenAPI-style document. (Physical)
- **DOC-3 · ⬜ Physical Data Model · Low** — tables/collections, columns, keys, indexes, and constraints for a data store. (Physical)
- **DOC-4 · ⬜ Data Migration Specification · Low** — source→target field mapping, transformation rules, reconciliation, and cutover. (Logical/Physical)
- **DOC-5 · ⬜ Integration Design · Low** — end-to-end message flows, sequencing, idempotency, and error handling across systems (broader than a single interface). (Logical)
- **DOC-6 · ⬜ Security Design · Low** — authn/authz flows, data protection, secrets, and the controls a solution implements. (Physical)
- **DOC-7 · ⬜ Infrastructure / Deployment Design · Low** — hosting, network topology, environments, scaling, and resilience. (Physical / Technology)
- **DOC-8 · ⬜ Sequence / Interaction Design · Low** — sequence diagrams for key scenarios across components and systems. (Logical)
- **DOC-9 · ⬜ Non-Functional Requirements Specification · Low** — performance, availability, scalability, and operability targets with measures. (Logical)
- **DOC-10 · ⬜ Operational Runbook · Low** — run, monitor, alert, and recover procedures for a deployed solution. (Physical)
- **DOC-11 · ⬜ Batch / Job Specification · Low** — scheduled job design: inputs/outputs, schedule, dependencies, and SLAs. (Physical)
- **DOC-12 · ⬜ Report / Dashboard Specification · Low** — analytics output design: datasets, metrics, filters, and audience. (Physical)

---

## Epic: Roles, Access & Storage

### RAS-1 · ✅ Roles & audience/author · Medium
**Context:** `config/roles.json` (27 roles) + `config/schemas/roles.json` enum; `audience`/`author` on all 45 artefact schemas and **backfilled into every instance** by artefact type.
**Gap:** Fields are optional, not required (kept optional so partial data stays valid).

### RAS-2 · ⬜ Authentication · High
**Context:** The app is unauthenticated.
**Proposed fix:** Add an identity provider (OAuth/OIDC) and sessions.

### RAS-3 · ⬜ Authorization (RBAC + ACL) · High
**Context:** Roles exist as data but don't gate anything.
**Proposed fix:** Map roles to permissions (e.g. who can commit a decision); enforce in the API.

### RAS-4 · ⬜ Storage for non-GitHub state · Medium
**Context:** All state is in Git today.
**Gap:** User accounts, ACLs, discovery results, and audit will outgrow Git.
**Proposed fix:** Introduce a database (and blob storage), phased.

---

## Epic: Framework Alignment

### FW-1 · 🟡 TOGAF alignment · Low
**Context:** ADM phase labels on solution documents; ABB/SBB language; "TOGAF Architecture Repository, as code" framing; Stakeholders & Concerns on AVI/AIN; homepage TOGAF table.
**Gap:** No Technology domain, Roadmap/Transition artefacts, or cross-cutting Requirements repository.

### FW-2 · 🟡 SAFe alignment · Low
**Context:** Solution Vision → Solution Intent (fixed vs variable); homepage SAFe table; roles drawn partly from SAFe.
**Gap:** No Architectural Runway view, Enabler type, WSJF, PI/release labels on versions, Value Stream artefact, or backlog-tool links.

---

## Epic: Quality, Validation & CI

See [docs/testing-strategy.md](docs/testing-strategy.md) for the layered, path-scoped, Claude-free approach.

### QV-1 · ✅ L1 — Schema validation · High
**Context:** `tests/validate-schemas.mjs` (Ajv) loads every schema by `$id`, compiles them, and validates every instance with a `$schema` URN. Runs in `ci.yml` → `validate-data`.

### QV-2 · ✅ L2 — Referential integrity · Medium
**Context:** `tests/validate-integrity.mjs` checks index↔folder consistency, roles vs `roles.json`, `$schema`↔path mirroring, and content-array presence.

### QV-3 · ✅ Path-scoped CI · Medium
**Context:** `ci.yml` runs only the touched areas; browser tests run against the Vercel deployment (`post-deploy.yml`); nightly full corpus + screenshots (`nightly.yml`).
**Gap:** The dormant `validate-context.yml` is still `if: false` — fold into validate-data or retire.

### QV-4 · ✅ Lint to zero · Low
**Context:** ESLint reports **0 problems**. Removed unused vars, switched modal autofocus to refs, justified the intentional exhaustive-deps/react-refresh cases, and converted false-association form labels to spans. `format:check` also gates CI.

### QV-5 · 🟡 Accessibility pass · Medium
**Context:** `useFocusTrap` traps Tab and returns focus to the trigger on the New Decision/Discovery modals (now `role=dialog`/`aria-modal`).
**Gap:** Slide panel focus management, real `htmlFor` label association, and a contrast/keyboard-order audit remain.

### QV-6 · ✅ Formatting + coverage · Low
**Context:** Whole `src/` tree normalised with Prettier; `format:check` runs in the `ci.yml` lint job so style stays consistent. Use-case checks continue to widen under TT-1.

### QV-7 · ✅ Footer config banner · Low
**Context:** The footer shows owner/repo only when `/api/github` config is available (it now is in dev via the shim); the raw "not configured" env-var banner is gone.

---

## Epic: Testing & Tooling

### TT-1 · 🟡 Use-case corpus · Medium
**Context:** `tests/use-cases.json` — 100 use cases; `tests/run-use-cases.mjs` drives them against the deployment (comma-separated `COMPLEXITY`/`PRIORITY` filters) and records outcomes in the JSON + `tests/use-case-outcomes.md`.
**Gap:** Some titles still need an automated check (recorded "to do"); failures auto-route to *Use Case Outcomes*.
**Progress:** Added a reusable `rendersWithContent(path, mustText)` check and wired 7 more titles (capability-to-process / capability-to-application matrices, follow related-artefact link, raise decision, raise discovery, review past discoveries, filter decisions by scope). Full corpus now **54 passed, 0 failed, 46 to-do** (was 37/0/63). No product defects surfaced.

### TT-2 · ✅ URL-mapped screenshots + route smoke · Low
**Context:** `screenshot.mjs` mirrors the URL structure; `smoke.spec.js` hits all 66 routes against the deployment; `nightly.yml` regenerates screenshots.

### TT-3 · ⬜ Decision schema & workflow docs · Low
**Context:** `docs/schemas/decision.md` predates several fields; two decision workflows are undocumented.
**Proposed fix:** Rewrite the schema doc and add the missing workflow pages.

---

## Epic: Platform & Data Layer

### PDL-1 · ⬜ Multi-repository support · Low
**Proposed fix:** Allow the architecture state to span more than one repository.

### PDL-2 · ⬜ Per-client AI model & credentials · Low
**Proposed fix:** Let each client choose its model and supply its own credentials.

### PDL-3 · ⬜ Features workflow: Fable review → Sonnet apply · Low
**Proposed fix:** A code-change workflow mirroring the decisions pipeline for non-ADR changes.

---

## Epic: Use Case Outcomes

Failures from running the use-case corpus against the product, captured here so they can be fixed. Outcomes are tracked in [tests/use-cases.json](tests/use-cases.json) and reported in [tests/use-case-outcomes.md](tests/use-case-outcomes.md).

### UCO-1 · ✅ No outstanding failures · High
**Context:** Latest run (2026-06-25) over XS/S/M × Must Have/Should Have — **62 cases: 37 passed, 0 failed, 25 to-do** (the to-do titles have no automated check yet, tracked under TT-1). No product defects surfaced.
**Gap:** None. Any future failure gets its own `UCO-n` entry here with Context / Gap / Proposed fix.
