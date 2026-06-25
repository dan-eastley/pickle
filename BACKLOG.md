# Backlog

The product backlog for Pickle, structured loosely as **Epic → Feature**. Each feature carries a **status**, an **impact**, and a short **Context / Gap / Proposed fix**.

- **Status:** ✅ Fully implemented · 🟡 Partially implemented · ⬜ Not implemented
- **Impact:** High · Medium · Low

> This file supersedes the former `IMPROVEMENTS.md` and `PRODUCTION_READINESS.md`, which have been folded in here.

---

## Epic: Decisions & Governance

### 🟡 End-to-end ADR pipeline · High
**Context:** Decisions flow DRAFT → PROPOSED → ACCEPTED → STAGED → COMMITTED, with workflows generating recommendations, the seven analysis streams, and architecture changes; STAGED applies accepted changes to artefacts via Claude and opens a PR; COMMITTED merges it, closes the PR, and deletes the branch. Verified live on ADR-014.
**Gap:** Status is UI-driven, not owned by the workflows — after a green run a decision can read `proposed` while already carrying later-stage output. Local dev can't exercise `/api/github` (Vercel-only). No "analysis complete, awaiting human" signal beyond the workflow banner.
**Proposed fix:** Let the workflow (or the API on dispatch) own the status transition; add a dev shim for `/api/github`; surface explicit "ready for review" state.

### 🟡 "New Decision" modal persistence · Medium
**Context:** The artefact-page modal collects Title + Context/Problem/Proposal + Scope.
**Gap:** `handleSave` is still a stub — only the full editor (`create-decision`) creates a durable decision.
**Proposed fix:** Wire the modal to `create-decision`, or route to the editor with the fields pre-filled.

### 🟡 Decision narrative migration · Low
**Context:** New decisions use Context/Problem/Proposal; the detail view renders these (falling back to legacy `narrative`).
**Gap:** Older decisions on branches still carry only `narrative`.
**Proposed fix:** Backfill on next edit, or a one-off migration.

### ⬜ Branch preview for STAGED decisions · Medium
**Context:** Staged changes live on the decision branch / PR.
**Gap:** The app only reads `main`; there's no in-app preview of the staged diff.
**Proposed fix:** Support `?ref=<branch>` reads so the staged artefact state can be previewed before commit.

---

## Epic: Discovery (Virtual Architect Agent)

### ✅ Discovery (Virtual Architect Agent) · Medium
**Context:** Full flow works end-to-end. The form/modal call `create-discovery` (writes the record + index on main, seeds activity, dispatches `discovery-to-active`); the self-contained `discovery-to-active` workflow runs the `architecture-discovery` prompt and commits Markdown `findings` back to main; the detail page Archive/Reactivate calls `update-discovery`. **Verified live (DSC-003):** the agent produced a capability-to-platform coverage view.
**Gap:** No re-run/refresh action on an existing discovery; findings aren't versioned across re-runs.

---

## Epic: UI & Design System

### ✅ Action-bar system · Medium
**Context:** `ActionBar` (title + strapline, no bar icon, actions ordered Tertiary → Secondary → Primary) and Button variants (primary always-icon, secondary white/no-icon, tertiary link). Index headers, editor headers, and the artefact bar use it.
**Gap:** The decision `StatusActions` transition buttons aren't yet folded into the system.
**Proposed fix:** Express `StatusActions` through the same primary/secondary vocabulary.

### ✅ Analysis tables · Medium
**Context:** All seven tables use uniform 25% columns; clicking a finding row accepts/declines it; step headers are collapsible; analysis locks once Accepted.

### ✅ Auto-grow narrative fields, terminology, help panels · Low
**Context:** Context/Problem/Proposal/Request auto-grow; counts read "1 Decision / 2 Decisions"; "New Architecture Decision/Discovery" titles + primary buttons; confirm-on-discard; friendly right-side help panels replace per-field hints.

### ⬜ Global search / command palette · High
**Context:** Navigation is via domain tabs only.
**Gap:** No way to jump to a capability/process/platform/decision by name or id.
**Proposed fix:** A search index over artefacts and entities with a command-palette UI.

### ⬜ Responsiveness, loading skeletons, entity deep-linking · Low
**Context:** Desktop-first; some routes flash a bare spinner; the entity panel has no shareable URL.
**Proposed fix:** A deliberate mobile pass, skeleton loaders, and deep-linkable entity URLs.

### ⬜ Diagram export / download · Medium
**Context:** Diagrams render as SVG in-app.
**Gap:** No export to PNG/SVG for slides and docs.
**Proposed fix:** Add an export action to the diagram views.

### ⬜ Brand/client-specific diagram theming · Low
**Proposed fix:** Allow per-client colourways for diagrams.

---

## Epic: Architecture Model & Content

### 🟡 Artefact registry in config (i18n) · Low
**Context:** User-facing names/descriptions live in `config/i18n/en.json`, overlaid onto the structural registry; localisation is drop-in.
**Gap:** Inline English fallbacks still duplicate the locale; per-client terminology overrides aren't supported.
**Proposed fix:** Prune the inline fallbacks; add a per-client overlay.

### ✅ Derived-artefact cascade on apply · High
**Context:** `config/artefact-relationships.json` (generated from the registry's `relatedTo` graph) maps each artefact to the artefacts `derived` from it. The Apply Changes prompt reads it and regenerates derivatives in the same PR when a source catalogue changes. **Verified live (ADR-015):** a `BUS-PRO` edit regenerated both `BUS-BPM` (diagram) and `BUS-CAP-PRO` (matrix) in the same PR.
**Gap:** Catalogue→catalogue derivatives are left to Claude's judgement (rare in practice).

### ⬜ Technology domain + Roadmap/Transition artefacts · Medium
**Context:** Five domains today; only `APP-DAP` physical hints at technology.
**Proposed fix:** Add a Technology domain (TOGAF Phase D) and explicit Roadmap / Transition-Architecture artefact types (Phase E/F).

### ⬜ Matrix/diagram formats beyond current set · Low
**Proposed fix:** Define the remaining diagram/matrix types in the registry and renderers.

---

## Epic: Roles, Access & Storage

### 🟡 Roles & audience/author · Medium
**Context:** `config/roles.json` (27 roles) + `config/schemas/roles.json` enum; `audience`/`author` added to all 45 artefact schemas; seeded on BUS-CAP.
**Gap:** Instances aren't backfilled with audience/author; fields are optional, not required.
**Proposed fix:** Backfill instances; consider making the fields required once populated.

### ⬜ Authentication · High
**Context:** The app is unauthenticated.
**Proposed fix:** Add an identity provider (OAuth/OIDC) and sessions.

### ⬜ Authorization (RBAC + ACL) · High
**Context:** Roles exist as data but don't gate anything.
**Proposed fix:** Map roles to permissions (e.g. who can commit a decision); enforce in the API.

### ⬜ Storage for non-GitHub state · Medium
**Context:** All state is in Git today.
**Gap:** User accounts, ACLs, discovery results, and audit will outgrow Git.
**Proposed fix:** Introduce a database (and blob storage for large outputs), with a phased rollout.

---

## Epic: Framework Alignment

### 🟡 TOGAF alignment · Medium
**Context:** ADM phase labels on solution documents; ABB/SBB language on layers; "TOGAF Architecture Repository, as code" framing; Stakeholders & Concerns on AVI/AIN; homepage TOGAF table.
**Gap:** No Technology domain, Roadmap/Transition artefacts, or cross-cutting Requirements repository.

### 🟡 SAFe alignment · Medium
**Context:** Solution Vision → Solution Intent (fixed vs variable); homepage SAFe table; roles drawn partly from SAFe.
**Gap:** No Architectural Runway view, Enabler type, WSJF, PI/release labels on versions, Value Stream artefact, or backlog-tool links.

---

## Epic: Quality, Validation & CI

### ⬜ Re-enable validation workflows · Medium
**Context:** `validate-schema`, `validate-structure`, `validate-context` carry `if: false`.
**Proposed fix:** Re-enable JSON-Schema validation of instances and change-surface checks as PR gates (the `test.yml` pattern shows the way). Resolve cross-file `$ref` (scope/roles URNs) in the validator.

### ⬜ Cross-reference integrity on committed data · Medium
**Context:** Document refs (e.g. `PLAT-MDM`, context `document-id`s) aren't validated against the catalogues they point at.
**Proposed fix:** A referential-integrity check over committed data (mirrors the decision pipeline's step).

### 🟡 Lint to zero · Low
**Context:** 0 errors; ~40+ warnings (mostly `jsx-a11y/label-has-associated-control`, `no-autofocus`).
**Proposed fix:** Associate labels with controls; managed focus; drive warnings to zero.

### ⬜ Accessibility pass · Medium
**Proposed fix:** Focus trap + return focus on modal/slide-panel close; audit contrast and keyboard order.

### ⬜ Formatting + test coverage · Low
**Proposed fix:** Run Prettier across the tree and add `format:check` to CI; grow unit/e2e coverage.

### ⬜ Footer mis-reports config · Low
**Context:** The footer shows "GITHUB_OWNER/REPO not configured" in dev even though data loads.
**Proposed fix:** Fix the check or remove the banner.

---

## Epic: Testing & Tooling

### ✅ Use-case corpus · Medium
**Context:** `tests/use-cases.json` — 99 use cases across the product surface, every role/complexity/priority covered; regenerated by `tests/generate-use-cases.mjs`.
**Gap:** Not yet driven against the product as acceptance tests.

### ✅ URL-mapped screenshots + route smoke · Low
**Context:** `screenshot.mjs` mirrors the URL structure; `smoke.spec.js` hits all 66 routes.
**Gap:** A full image regen run hasn't been committed.

### ⬜ Decision schema & workflow docs · Low
**Context:** `docs/schemas/decision.md` predates several fields; two decision workflows are undocumented.
**Proposed fix:** Rewrite the schema doc and add the missing workflow pages.

---

## Epic: Platform & Data Layer

### ⬜ Multi-repository support · Low
**Proposed fix:** Allow the architecture state to span more than one repository.

### ⬜ Per-client AI model & credentials · Low
**Proposed fix:** Let each client choose its model and supply its own credentials.

### ⬜ Features workflow: Fable review → Sonnet apply · Low
**Proposed fix:** A code-change workflow mirroring the decisions pipeline for non-ADR changes.
