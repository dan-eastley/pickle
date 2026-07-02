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

### DEC-3 · ✅ Decision narrative migration · Low
**Done:** `lib/narrative.parseNarrative` is the inverse of the compose step (splits `## Context … ## Problem … ## Proposal` back into the three fields; an un-headed narrative becomes Context). `decisionChangeFields(d)` prefers the split fields and falls back to parsing the narrative. Wired into the full editor load and the inline-edit start, so any legacy narrative-only decision is **backfilled into the split fields on next edit** (and persisted on save). Unit-tested.

### DEC-4 · ⬜ Branch preview for STAGED decisions · Medium
**Context:** Staged changes live on the decision branch / PR.
**Gap:** The app only reads `main`; there's no in-app preview of the staged diff.
**Proposed fix:** Support `?ref=<branch>` reads so the staged artefact state can be previewed before commit.

### DEC-5 · ✅ Inline editing of decisions (replaces the edit form) · Medium
**Done:** Full inline editing on the decision detail page (draft-only): Title, Context/Problem/Proposal, **Requirements** (shared RequirementsList) and **Scope** (ScopeSelector) all edit in place; Save & re-review calls edit-decision and re-dispatches decisions-to-draft. The standalone `/edit` route is **retired** (removed from the router; RequirementsList extracted to a shared component). DEC-3 backfill applies on edit for legacy records.
**Context:** A draft decision is edited through a separate full-page editor (`/decisions/:id/edit`), away from the recommendations and analysis the workflow produced. This forces a context switch — you can't see the Narrative Review feedback while you revise.
**Gap:** No way to edit the Title / Context / Problem / Proposal / Requirements / Scope *in place* on the decision detail page, alongside the recommendations they should respond to.
**Proposed fix:** Add an edit (pencil) affordance per editable field/section on the detail page. Clicking it swaps the rendered Markdown for an `AutoGrowTextarea` (reuse the create-modal inputs); Save calls the existing `edit-decision` API, which already re-composes the narrative and **re-dispatches `decisions-to-draft.yml`** so recommendations refresh. Editing is allowed **only while `status === 'draft'`** (gate the affordance on status; show a read-only note otherwise). This is the preferred approach and **supersedes the standalone edit form** (retire `/edit` once parity is reached). Cross-cutting with [PDL-4] (live refresh once the workflow finishes) and [QV-5] (focus management for the inline editors).

### DEC-6 · ⬜ Multi-party governance & approvals · High
**Context:** Today a single actor drives a decision through every transition (DRAFT → … → COMMITTED). There is no separation of duties, no notion of *who is allowed* to accept a change, and no link to the owner(s) of the artefacts a decision touches. Roles exist in `config/roles.json` but aren't enforced.
**Gap:** A change can be self-approved end-to-end. No artefact ownership, no required reviewers, no quorum/approval policy, no audit of who approved what.
**Proposed fix:** A governance model layered onto the pipeline: (1) **artefact ownership** — each catalogue/document declares owning role(s)/people; (2) **approval policy per transition** — e.g. ACCEPTED requires N approvals from owners of the impacted domains plus an architecture-authority role; (3) **reviewer assignment & sign-off UI** — approvers recorded as activity entries with identity, decision can't advance until policy met; (4) **separation of duties** — the proposer can't be the sole approver. Ties into [RAS-2] (authentication — real identities), [RAS-3] (authorization/RBAC + ACL), and per-artefact owners. High impact, large effort; sequence after authentication lands.

### DEC-7 · ⬜ Hide the action bar while editing · Low
**Context:** On the decision/discovery detail pages the stage/action bar stays visible during inline editing.
**Proposed fix:** Hide the action bar whenever the record is in edit mode, so editing and stage actions don't compete.

### DEC-8 · ⬜ Gate stage advance on the workflow having run · High
**Context:** Stages can be advanced from the UI regardless of whether the prior workflow has completed (e.g. you can move PROPOSED → ACCEPTED before the analysis streams have run). Overlaps with [DEC-1] (workflow-owned status).
**Proposed fix:** You cannot advance to the next stage until the current stage's workflow has finished. While a workflow is running, the **"now running" box replaces the action bar** (not shown alongside it), so the only state visible is "analysis in progress". Advance controls reappear, gated, once it completes.

### DEC-9 · ⬜ Lock accept/reject once STAGED · Medium
**Context:** After a decision is STAGED, the Architecture Changes can still appear accept/rejectable, and the interaction is the row-toggle used by the analysis streams — wrong affordance for a locked state.
**Proposed fix:** Once STAGED, accept/reject on the changes is **locked** and rendered as a distinct locked state (visually different from the analysis streams — not a clickable row toggle).

---

## Epic: Discovery (Virtual Architect Agent)

### DSC-1 · ✅ Discovery (Virtual Architect Agent) · Medium
**Context:** Full flow works end-to-end. The form/modal call `create-discovery`; the self-contained `discovery-to-active` workflow runs the `architecture-discovery` prompt and commits Markdown `findings` back to main; the detail page Archive/Reactivate calls `update-discovery`. A **Refresh** action re-dispatches `discovery-to-active.yml` to regenerate findings (`refresh-discovery` API), and the header shows an "As at <date>" stamp for the point-in-time view. **Verified live (DSC-003).**
**Gap:** Findings aren't versioned across re-runs (a refresh overwrites the prior view).

### DSC-2 · ✅ Inline editing of discoveries (replace the edit form) · Medium
**Done:** The discovery detail page has an inline **Edit** mode (pencil affordance, active-only) that swaps Title / Context / Request to inline inputs (`AutoGrowTextarea`) and saves via `update-discovery`. The API now **re-dispatches `discovery-to-active`** when any of title/context/request changes, regenerating the point-in-time view; the page shows the regenerating banner. Archived discoveries are read-only (reactivate first). No standalone discovery edit form is needed. Cross-cutting with [PDL-4] (live refresh instead of manual page refresh) and [DSC-1] (findings versioning across re-runs) remain open.

---

## Epic: UI & Design System

### UI-1 · ✅ Action-bar system · Medium
**Context:** `ActionBar` (title + strapline, no bar icon, actions ordered Tertiary → Secondary → Primary) and Button variants. Index headers, editor headers, and the artefact bar use it.
**Done:** The decision `StatusActions` lifecycle transitions are now expressed through the shared `Button` vocabulary — forward actions via a `ForwardButton` (custom variant carrying each stage's signature colour, spinner-on-transition), "Back to …" as `secondary`, "Reject" as `danger`, "Cancel" as `ghost`. The rejection panel is extracted to a shared `RejectPanel`.

### UI-2 · ✅ Analysis tables · Medium
**Context:** All seven tables use uniform 25% columns; clicking a finding row accepts/declines it; step headers are collapsible; analysis locks once Accepted.

### UI-3 · ✅ Auto-grow fields, terminology, help panels · Low
**Context:** Context/Problem/Proposal/Request auto-grow; count casing; "New Architecture Decision/Discovery" titles + primary buttons; confirm-on-discard; friendly help panels.

### UI-4 · ✅ Global search / command palette · High
**Done:** Header **QuickPicker** — a wide always-visible jump-to box (`components/layout/QuickPicker.jsx`) scoped to the current client + version (and current domain when active). Type to filter artefacts by name/id; ↑/↓/Enter to navigate; results dropdown only on typing; **`/` shortcut focuses it from anywhere** (command-palette convention) with a visible `/` hint. Now also indexes the client's **decisions and discoveries** (loaded lazily on first focus) with per-kind icons, so you can jump to any artefact, decision, or discovery by name/id. **Optional later:** index individual entities (each capability/process by id).

### UI-5 · ✅ Responsiveness, loading skeletons, entity deep-linking · Low
**Context:** Desktop-first; some routes flash a bare spinner; the entity panel has no shareable URL.
**Proposed fix:** A mobile pass, skeleton loaders, and deep-linkable entity URLs.
**Done:** Skeleton loader (`components/ui/Skeleton.jsx`) replaces the bare spinner on the artefact surface. **Deep-linkable entity-panel URLs** — the entity panel selection now lives in the URL (`?entity=…`) via a reusable `useSearchParamState` hook, so an open entity is shareable, survives refresh, and is restorable from a link.
**Responsive pass:** TopBar uses reduced padding/gaps on mobile (`px-3 sm:px-6`); document/decision/discovery surfaces soften to `px-4 sm:px-8` on small screens; grids and the contents-nav rails were already responsive (`hidden lg:block`, `grid-cols-1 sm:…`), and wide tables scroll. Done: contents-nav rails hide on mobile (hidden lg:block), the 5-step decision status bar scrolls rather than squishing, header + document surfaces use mobile padding. A deep device-by-device QA sweep remains optional.

### UI-6 · ✅ Artefact export / download · Medium
**Done:** A shared `DownloadMenu` on the artefact page offers per-format downloads — **Diagrams** → PowerPoint (.pptx) or PNG; **Catalogues** → Excel (.xlsx) or CSV; **Documents** → Word (.docx) or PDF. **Matrices** have no download (by design). Built on a format-agnostic intermediate "block" model (`lib/export/blocks.js`) consumed by each renderer; the heavy writers (`exceljs`, `pptxgenjs`, `docx`, `jspdf`) are **lazy-loaded via dynamic import**, so they stay out of the initial bundle. Diagrams rasterise the live SVG with computed styles inlined (Tailwind classes don't survive a raw serialize) → PNG, embedded into a 16:9 slide for PowerPoint.

### UI-7 · ⬜ Brand/client-specific diagram theming · Low
**Proposed fix:** Allow per-client colourways for diagrams.

### UI-8 · ⬜ Folder organisation for decisions & discoveries · Medium
**Context:** Decisions and discoveries are flat lists within a stage/status. As volume grows (many in-flight ADRs, many discoveries) the lists become unmanageable; there's no way to group related items (e.g. by initiative, domain, or workstream).
**Gap:** No grouping construct; the index pages are a single flat list per stage.
**Proposed fix:** A lightweight **folder** tree *within* each stage/status, max **3 levels** deep. Capabilities:
- **Create / rename / delete folders** at any of the three levels.
- **Move items** by drag-and-drop — between folders, or up to the parent/root.
- **Assign on edit** — a decision/discovery's folder is an editable field (set on create or change later).
- Folders are organisational only: they don't change a decision's branch/path or its stage; an item still belongs to exactly one stage and now optionally one folder path.
**Design notes:** Model the tree as an index-level concern (e.g. a `folders` array + a `folderPath` on each index entry in `decisions.json` / `discovery.json`), so the architecture record itself is untouched and the tree is cheap to reorganise. Enforce the 3-level cap and prevent cycles in the move logic. Persist folder assignment through the existing index-sync path. Consider a shared `<FolderTree>` component reused by both index pages. Drag-and-drop via the native HTML5 DnD API or a small library; keep keyboard-accessible move actions for [QV-5].

### UI-9 · ✅ Navigate the architecture (matrix-driven relationship explorer) · High
**Done:** `EntityPanel` (the slide-out) resolves every relationship an entity participates in **from the matrices** (`lib/relationships.loadEntityRelationships`), grouped by related artefact type. Clicking a related entity — or a `parent-id`/`domain-id` link — **traverses** to it; an internal **breadcrumb navigation stack** lets you step back (a Back control + clickable crumbs), so you can follow "capability → processes → their data" and return. The stack reseeds whenever the panel opens on a new root, so parent components need no change. (A multi-panel *overlay* stack is optional future polish; the breadcrumb delivers the traverse-and-return intent.)
**Context:** Artefacts are viewed in isolation; the rich relationships captured in matrices (capability↔process, capability↔application, etc.) aren't browsable. You can't follow the thread "this capability → its processes → their data".
**Gap:** No way to traverse the architecture graph from one entity to its related entities, and no single place that shows *all* relationships an entity participates in.
**Proposed fix:** A **slide-out relationship explorer** (reuse/extend `EntityPanel`). When viewing an entity (e.g. a capability) the panel shows a **table of every relationship** that entity participates in, grouped by relationship type and **sourced from the matrices** (each matrix defines a typed mapping between two artefact types). Clicking a related entity (e.g. a process) **slides out a new panel from the right, overlaying** the previous one (a breadcrumb stack); from a process you can step to its data, and so on. Clicking the backdrop/off dismisses the whole stack.
**Design notes:** Requires a **relationship resolver** that, given an entity id, finds all matrices referencing its artefact type and collects the mapped entities (both directions). Define this over the matrix data model (and `config/artefact-relationships.json`). Cap stack depth for sanity; animate the overlay; make each level independently closeable. Strongly related to [AMC-5] (we can only navigate relationships we actually model — missing matrices = missing edges) and [UI-5] (deep-linkable panel state) and [QV-5] (focus management across stacked panels).

### UI-10 · ✅ Header: search on the right, combined architecture/transition selector on the left · Medium
**Done:** The header now reads logo → combined **ArchitectureSelector** (one dropdown with an Architectures section over a Transitions section, styled like the search box) → spacer → **search** (QuickPicker) → user menu. The two separate switchers are merged; the old centre client-name label is dropped (the selector shows it).

### UI-11 · ✅ Share link on every artefact (copy to clipboard) · Low
**Done:** A **Share** button on the artefact header copies the current deep link (`ShareLink`, `components/ui/ShareLink.jsx`) with a brief "Copied" confirmation; sits beside the download control.

### UI-12 · ✅ Rename "AI-generated" → "PICKLE-generated" · Low
**Done (this pass):** Every user-facing "AI-generated" label is now "PICKLE-generated".

### UI-13 · ✅ Draggable modal windows · Low
**Done:** `useDraggable` hook (drag by the header, ignores clicks on controls). Applied to the shared SettingsModal and the New Decision / New Discovery modals.

### UI-14 · ⬜ Slide-out: "New Decision" call-to-action · Low
**Context:** The entity slide-out ([UI-9]) shows relationships but no route to change the entity.
**Proposed fix:** A **New Decision** button at the bottom of the slide-out with the narrative *"Changes to this entity must go through a Decision Record."* — pre-scoped to the entity.

### UI-15 · 🟡 Standardised enum meta on models (legend + inline) · Medium
**Done:** A standardised enum system — `lib/enums.js` maps any `meta.<enum>` value to one consistent look (coloured dot/badge + SVG fills) via a fixed palette (explicit colours for known values e.g. importance/lifecycle/status, stable-hash fallback otherwise). `MetaBadges` renders a badge for every enum on a group/item in the nested-group diagram; `EnumLegend` renders the matching legend in the diagram footer. Live on the capability model (`importance`) now; any diagram lights up automatically when its data carries enum meta.
**Remaining (data):** enrich the applications (APP-DPM) and process (BUS-BPM) diagram *data* with `meta` enums (e.g. platform lifecycle/type) — needs the shared card-diagram item `$def` to allow `meta`. Optional: extend the same badges to CatalogueView.

### UI-16 · ✅ Capability/Process L2: ID above the name · Low
**Done (this pass):** On the level-2 capability and process models the entity ID now sits **above** the name (was to the left), matching the slide-out and the rest of the UI.

### UI-17 · ✅ Analysis/change output too verbose · Medium
**Done:** The decision-analysis prompts now instruct succinct output — each Finding / Impact / Recommendation / Rationale field is "a single statement or a few short bullets, not a paragraph" (max ~300 chars, was ~500) across all six analysis streams plus narrative-validation; the architecture-change `description` is now a single precise instruction. Prompt-only change.

### UI-18 · ✅ "To Top" link in left-hand nav · Low
**Done (this pass):** The documents / decisions / discovery contents rail now has a **To Top** link at the bottom (same small text as expand/collapse).

### UI-19 · ⬜ Catalogues: main columns only, name is the link · Medium
**Context:** Catalogue tables show every column and scroll horizontally.
**Proposed fix:** Show only the main columns (name/title + description) so there's no horizontal scroll; the **name is a link that opens the right-hand entity popout** (traverse the architecture, per [UI-9]). Visually flag the name as the link.

### UI-20 · ✅ Drop marketing illustrations from list pages · Low
**Done (this pass):** The architectures list and the transitions list no longer show the decorative illustrations.

### UI-21 · ✅ Page `<title>` uses a hyphen, not an em-dash · Low
**Done (this pass):** The separator in the browser tab `<title>` is a single hyphen.

---

## Epic: Editing, Modals & Settings

### EDIT-1 · ✅ Edit Architecture / Transition via a reusable settings modal · Medium
**Done:** Shared **SettingsModal** shell (`components/ui/SettingsModal.jsx`) — left-hand category rail that jump-scrolls to each settings section, Save Settings / Cancel footer matching the New Decision / New Discovery modals — plus `EditSettingsModal` (Name + Status). **Edit** entry points on each `/architectures` card and each row of `/architectures/<id>/transitions`, shown only when [RAS-3] `can()` allows (Owner/Admin). Writes persist via the gated `update-architecture` / `update-transition` API actions to `architecture.json` / `transition.json` on `main`; the page updates optimistically. Added an optional `status` (active/archived) to the architecture schema so architectures carry a status too.
**Deferred:** **Icon** and **Colour** categories; draggable modal ([UI-13]); the create flows ([EDIT-2]).

### EDIT-2 · ✅ New Architecture / New Transition · Medium
**Done (0.5.1-alpha):** create-architecture (empty seed, one Git Trees commit, creator granted Owner) + create-transition (single-commit clone via the Git Trees API); CreateEntityModal + gated New buttons. Integration-tested.
**Context:** Creating architectures/transitions is not yet possible in-app (only editing, [EDIT-1]). Reuses the [EDIT-1] `SettingsModal` shell and the [RAS-3] gate.
**Scoped implementation plan:**
- **New Architecture (empty):** creator becomes **Owner**. A `create-architecture` action seeds, in one Git Trees commit, `architecture.json` + `transitions.json` (a single `baseline`) + `baseline/transition.json` + `baseline/decisions/decisions.json` (empty), and appends the id to `architectures.json`. Then insert an `architecture_membership` (owner) row (fail-soft). Domains fill in as content is added (no seed content — decided). Gate: `ACTIONS.ARCHITECTURE_CREATE` (any authenticated member).
- **New Transition (clone):** a transition carries ~50 files, so copy via the **GitHub Git Trees API** — read the recursive tree, re-point the source subtree's blob SHAs at the new prefix, override the new `transition.json` (id/name/status), append to `transitions.json`, and commit **once** (no per-file writes). Gate: `ACTIONS.TRANSITION_CREATE` (Owner/Admin).
- Needs new `GitHubClient` helpers (`commitFiles`, `cloneDir`) over the existing `request()` primitive. New-Architecture/New-Transition buttons on `/architectures` and `/architectures/<id>/transitions`, gated.
**Note:** New production write paths against `main` (Git Trees) — build carefully and verify on first live use, as with the decision/discovery writes ([DEC-1]).

---

## Epic: Architecture Model & Content

### AMC-1 · 🟡 Artefact registry in config (i18n) · Low
**Context:** User-facing names/descriptions live in `config/i18n/en.json`, overlaid onto the structural registry. The inline English in `artefacts.js` is kept as an intentional fallback (robustness if a key is missing); a coverage test (`lib/i18n.test.js`) now enforces that the locale covers every registry id, so the two can't drift and a new artefact can't ship without a locale entry.
**Gap:** Per-client terminology overrides aren't supported.
**Scoping (investigated):** `src/i18n` imports `config/i18n/en.json` at build time and `lib/artefacts.js` bakes the labels into the static `DOMAINS` / `ARTEFACTS` / `FORMATS` exports at module load — before any architecture is selected. A per-architecture overlay therefore needs label resolution to become **dynamic/reactive** (a `useLabels()`-style layer keyed on the active architecture) and every consumer of the static exports migrated to it, or the overlay won't take effect. That is a cross-cutting refactor out of proportion to this Low item; do it deliberately, not inline.
**Proposed fix:** (1) store overrides per architecture (e.g. `architectures/<id>/i18n.json` or a `terminology` field on `architecture.json`); (2) add a reactive label layer that merges base locale + active-architecture overrides; (3) migrate label consumers off the static exports. Sequence when a client actually needs bespoke terminology.

### AMC-2 · ✅ Derived-artefact cascade on apply · High
**Context:** `config/artefact-relationships.json` maps each artefact to the artefacts `derived` from it. The Apply Changes prompt reads it and regenerates derivatives in the same PR when a source catalogue changes. **Verified live (ADR-015):** a `BUS-PRO` edit regenerated both `BUS-BPM` (diagram) and `BUS-CAP-PRO` (matrix).
**Gap:** Catalogue→catalogue derivatives are left to Claude's judgement (rare).

### AMC-3 · ⬜ Technology domain + Roadmap/Transition artefacts · Medium
**Context:** Five domains today; only `APP-DAP` physical hints at technology.
**Proposed fix:** Add a Technology domain (TOGAF Phase D) and explicit Roadmap / Transition-Architecture artefact types (Phase E/F).

### AMC-4 · ⬜ Matrix/diagram formats beyond current set · Low
**Proposed fix:** Define the remaining diagram/matrix types in the registry and renderers.

### AMC-5 · 🟡 Matrix coverage review — find the missing mappings · Medium
**Done:** Coverage review published in [docs/artefacts.md](docs/artefacts.md#matrix-coverage-amc-5) (concept × concept map + prioritised gaps). Defined the first missing matrix end-to-end — **DAT-PRO-DAC** (Process ↔ Data, the classic **CRUD** matrix): schema + schema-index + i18n + registry + schema-doc + registry row, instances for fedc & fwwc, and a small reusable MatrixView enhancement to render an optional `operation` (CRUD) value per cell. Also defined **APP-PRO-DAP** (Process↔Application) end-to-end — schema, index, i18n, registry, doc, registry row, and instances for all five clients. **Remaining:** Capability↔Data, Application↔Data, Capability↔Strategy/Principle.
**Context:** A handful of matrices exist (e.g. capability↔process `BUS-CAP-PRO`, capability↔application `APP-CAP-DAP`). Matrices are the edges of the architecture graph, so coverage directly limits what [UI-9] can navigate and what governance/impact analysis can reason about.
**Gap:** No deliberate review of *which* cross-artefact mappings matter. Likely-missing examples: **Data ↔ Process** (which processes create/read/update/delete which data), **Capability ↔ Data** (data owned/used by a capability), **Application ↔ Data** (systems of record), **Process ↔ Application** (which app supports which process step), **Capability ↔ Strategy/Principle** (traceability), **Application ↔ Integration/Interface**, **Capability ↔ Org/Role** (ownership, feeds [DEC-6]).
**Proposed fix:** Produce a coverage map of artefact-type × artefact-type, mark which mappings are valuable, prioritise, then define the missing matrix types (registry entry + schema + doc + renderer, per `docs/artefacts.md` and [AMC-4]). Start with **Data ↔ Process**.

### AMC-6 · ✅ Multi-sector sample content · Medium
**Done:** All five sample clients now exist at **full parity with fedc** (45–46 catalogues each across 5 domains × 3 layers, L1/L2 + build green):
- `fedc` — Energy Distribution (original baseline)
- `fwwc` — Water & Wastewater (renamed from `fwdc`)
- `fetc` — Energy Transmission (Transmission System Operations, Connection & Charging)
- `fegc` — Energy Generation (Energy Generation core, Plant Operations, Wholesale Settlement)
- `fersc` — Energy Retail & Supply (Customer Management, Power Purchasing, Retail & Billing)

All carry the new DAT-PRO-DAC CRUD matrix too. `clients.json` lists all five with sector logos ([ClientLogo]).
**Method (reusable):** preserve fedc's id graph and **retheme prose per sector** (term-map generator) so matrices/diagrams stay referentially valid by construction; **generate BUS-BCM/BUS-BPM from the rethemed catalogues**; reuse sector-neutral operating-model principles/governance; sweep for sector accuracy (company id, regulator, sector-only concepts).
**Note:** content is **retheme-based** — sector identity lives in capability/process/data *names and emphasis* while the structural skeleton (an integrated-utility shape) is shared. Deeper per-sector restructuring (e.g. dropping generation from a pure retailer) is a future refinement, not required for demo/test content.
**Context:** Demo content should let us exercise the product across a range of regulated-utility sectors, not just one. Naming convention: **"Fictitious &lt;Sector&gt; Company"**.
**Target sectors / clients:**
| # | Sector | Client id | State |
|---|---|---|---|
| 1 | Energy Transmission | `fetc` | to add |
| 2 | Energy Distribution | `fedc` | exists, fully populated (reference baseline) |
| 3 | Water & Wastewater | `fwwc` | exists as `fwdc` "Water Distribution" — **rename** to Water & Wastewater |
| 4 | Energy Generation | `fegc` | to add |
| 5 | Energy Retail & Supply | `fersc` | to add |
**Gap:** Only sectors 2 and 3 exist; 3 is mis-named; the new sectors have no architecture content.
**Proposed fix:** Add the three missing clients (metadata + `versions.json` + `1.0.0` skeleton) and **synthesise industry-appropriate architecture content for every sector except Energy Distribution** (which is already the populated baseline). Content should be tailored per industry (a generation company's capabilities/processes/data differ from a retailer's) rather than copied. Sequence the synthesis per domain × layer, validating against schemas as we go ([QV-1]/[QV-2]). Large content effort — best done sector-by-sector. **Decide depth before starting** (full parity with `fedc` vs a representative subset of catalogues).

**Recommendations for deeper sector work (pick what we need — not yet actioned):**
- **R1 · Per-sector structural divergence (highest value, highest effort).** Current content is *retheme-based* (shared integrated-utility skeleton, sector-specific names/emphasis). For a more convincing demo, restructure the *shape* per sector — e.g. drop generation/plant capabilities from the pure retailer (`fersc`), foreground Connection & Charging for the TSO (`fetc`), settlement/trading for generation (`fegc`). Do one flagship sector end-to-end first.
- **R2 · Sector-specific regulators & compliance artefacts.** Add each sector's real regulatory context (Ofgem/Ofwat schemes, licence conditions, market codes) as Strategy/Principle/Guardrail content, so governance analysis reasons over realistic constraints.
- **R3 · A second version per client (`1.1.0` or `2.0.0`).** Exercises the versioning/baseline story and the per-version metrics — pick one client and add a small "next baseline" with a handful of changed artefacts + an ADR or two.
- **R4 · Cross-sector reference data.** Populate `architectures/references/` (currently TBD) with shared, sector-neutral vocabulary (common capabilities, canonical data concepts) that clients can point at — reduces duplication and demonstrates a reference-architecture pattern.
- **R5 · Richer document instances.** Most depth lives in catalogues; add 1–2 fully-worked solution documents (Vision → Intent → Design → Interface Spec) per flagship sector to showcase the document chain and the Word/PDF export.
- **R6 · Realistic decision/discovery history.** Seed each flagship client with a few committed ADRs and archived discoveries so the governance timeline, activity attribution, and metrics look lived-in for demos.

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

### RAS-2 · ✅ Authentication · High
**Context:** The app was unauthenticated.
**Done:** **Better Auth** (email + password) backed by **Postgres via Drizzle** on the existing Vercel functions, **live in production**. Schema covers Better Auth's user/session/account/verification tables plus custom user fields — `firstName`, `lastName`, `jobRole` (id from `config/roles.json`), and an `access_tier` enum (`admin`/`member`/`viewer`, `input:false` so it can't be self-assigned at sign-up). Registration + login pages, `useAuth` context, `UserMenu` in both headers, and a `RequireAuth` guard (gated by `VITE_REQUIRE_AUTH`, **enabled in prod**). Postgres provisioned (Neon), migration applied, env set, sign-up/sign-in verified end-to-end on the live deployment. **`/api/github` writes are now session-gated** (401 without a valid session; read-only GETs stay open) and activity is **attributed to the signed-in user** (replacing the `Joe B`/`System` placeholder) — this also closed [QV-8] finding #1.
**Production-only fixes en route (Vercel native ESM):** SPA catch-all rewrite scoped to non-`/api`; explicit `/api/auth/(.*)` rewrite for multi-segment routing; all relative server imports given explicit `.js`/`index.js` (the dev shim had masked these). See [[vercel-esm-functions]].
**Deferred (own items):** email verification / password reset need an email provider; authorization (who-can-do-what) is [RAS-3].

### RAS-3 · 🟡 Authorization (RBAC + per-architecture access) · High
**Context:** Roles exist as data but don't gate anything. Two *different* role concepts must be kept separate:
- **Content roles** — `config/roles.json` (27 job titles) + `user.jobRole`. Used as artefact `audience`/`author` and for tailored UI. **Not** access control. Unchanged by this item.
- **Access roles** (new, below) — who can *do* what. This item.

Today the only access primitive is `user.accessTier` (`admin`/`member`/`viewer`, `input:false`), which gates nothing beyond "is authenticated". `/api/github` writes are session-gated but not permission-gated: any signed-in user can drive any decision on any architecture.

**Done (0.5.1-alpha + 0.5.3-alpha):** the `can()` permission core (`lib/permissions.ts`, unit-tested), `architecture_membership` table + migration, server `resolvePermissions` (admin via accessTier / `PICKLE_ADMIN_EMAILS`, memberships fail-soft) + gated write actions, and the client `usePermissions` seam. **Access management** now ships: `grant-access` / `revoke-access` / `members` API actions (gated on `access:grant`) + an **Access** category in the architecture settings modal (`AccessManager`) to add members by email, set Owner/Contributor/Consumer, and remove them. Integration-tested.
**Remaining:** flip decision/discovery **governance writes** from session-only to `can(GOVERNANCE_WRITE)` once memberships are seeded in prod; a global **admin console** (manage every architecture + users' global tier); optional view-gating for Consumers.

**Proposed model — four access roles**

| Role | Scope | Can |
|---|---|---|
| **Admin** | Global (platform) | Everything: view + edit **every** architecture, add architectures, create/edit transitions anywhere, manage **all** access (grant any role to anyone), promote other admins. The super-user. |
| **Owner** | Per-architecture | View + edit their architecture's content and settings; create + edit transitions within it; assign **Contributors** and **Consumers** (and co-**Owners**) to it. Creating a new architecture makes the creator its Owner. No rights over architectures they don't own. |
| **Contributor** | Per-architecture | View all content; create/edit **decisions, discoveries, and scouts** within the architecture. **Cannot** change architecture/transition settings or manage access. |
| **Consumer** | Per-architecture | **View only.** No writes of any kind. |

**Permission matrix** (✓ allowed · ✗ denied · *self* = only records they authored)

| Action | Admin | Owner | Contributor | Consumer |
|---|:--:|:--:|:--:|:--:|
| View architecture content | ✓ | ✓ | ✓ | ✓ |
| Create / edit decisions, discoveries, scouts | ✓ | ✓ | ✓ | ✗ |
| Advance decision workflow stages | ✓ | ✓ | ✗¹ | ✗ |
| Edit architecture settings (name, status, icon, colour) | ✓ | ✓ | ✗ | ✗ |
| Create / edit transitions | ✓ | ✓ | ✗ | ✗ |
| Add a new architecture | ✓ | ✓² | ✓² | ✗ |
| Assign Contributors / Consumers | ✓ | ✓ (own) | ✗ | ✗ |
| Assign co-Owners | ✓ | ✓ (own)³ | ✗ | ✗ |
| Manage global access / all architectures / admins | ✓ | ✗ | ✗ | ✗ |

¹ Advancing to ACCEPTED/STAGED/COMMITTED is a governance act — reserve for Owner/Admin (ties to [DEC-6]). ² See open question 1. ³ See open question 2.

**Data model (Postgres, extends [RAS-4])**
- Keep `user.accessTier` as the **global tier**: `admin` (platform super-user) vs `member` (normal, gains rights via memberships) vs `viewer` (read-only everywhere, no memberships).
- New table `architecture_membership`: `(id, userId → user.id, architectureId text, role enum('owner','contributor','consumer'), grantedBy → user.id, createdAt)`, unique on `(userId, architectureId)`. A user's effective rights on an architecture = **global admin** OR their membership `role` for that `architectureId`.
- Drizzle migration + `db:generate`/`db:migrate`. Seed: promote initial admin(s) (email allowlist / manual), and backfill an Owner onto the existing sample architectures so they're manageable.

**Enforcement — single permission seam**
- One module, `can(user, memberships, action, { architectureId })`, is the *only* place the matrix lives. **Server** (`/api/github`) calls it per action (`create-decision`, `create-discovery`, `update-architecture`, `create-transition`, `grant-access`, workflow-advance, …) → **403** on failure; this is authoritative. **Client** mirrors it (a `usePermissions()` hook fed by `/api/me` returning user + memberships) to hide/disable controls — defence-in-depth, never the gate of record.
- The Edit-architecture button (see [EDIT-1]) and every write control resolve visibility through `can()`. Until this lands, [EDIT-1] wires the button to a **placeholder `can()`** (currently: admin tier, or any authenticated user in dev) so the seam exists and only its body changes when memberships arrive.

**UI**
- "Access" category in the architecture settings modal (Owner/Admin): list members, add by email, set/remove role.
- Admin console: manage architectures + every user's global tier.

**Sequencing:** depends on [RAS-2] (auth ✓) and [RAS-4] (DB ✓). [DEC-6] (multi-party governance/approvals) builds **on top** — Owners become approvers, separation-of-duties uses these roles. [EDIT-1] ships the settings modal now against the `can()` seam.

**Open questions (for review):**
1. Can any authenticated `member` self-serve a new architecture (becoming its Owner), or is "create architecture" an Admin-granted capability?
2. May Owners appoint co-Owners, or only Admins?
3. Is Consumer purely per-architecture, or is there also a global read-only `viewer` tier (and how do they interact)?
4. Do Contributors get scoped writes (only records they authored) or full write on all decisions/discoveries in the architecture?
5. How are grants surfaced and audited (activity log entries, notifications)?

### RAS-4 · 🟡 Storage for non-GitHub state · Medium
**Context:** Architecture content stays in Git (the source of truth); other state needs a database.
**Done (phase 1 — identity):** **Postgres (Neon) via Drizzle** is provisioned and live, holding the auth tables (user/session/account/verification) — see [RAS-2]. Migrations are versioned (`src/db/migrations`, `db:generate`/`db:migrate`). The DB layer (`src/db`, `src/lib/auth.ts`) is in place to extend.
**Remaining (later phases):** move **ACLs / client↔user mapping** ([RAS-3]) into the DB; consider migrating **discovery results** and an **audit log** off Git into Postgres as volume grows; add **blob storage** if/when large artefacts (exports, uploads) need it. Keep architecture content in Git.

---

## Epic: Framework Alignment

### FW-1 · 🟡 TOGAF alignment · Low
**Context:** ADM phase labels on solution documents; ABB/SBB language; "TOGAF Architecture Repository, as code" framing; Stakeholders & Concerns on AVI/AIN; homepage TOGAF table.
**Gap:** No Technology domain, Roadmap/Transition artefacts, or cross-cutting Requirements repository.

### FW-2 · 🟡 SAFe alignment · Low
**Context:** Solution Vision → Solution Intent (fixed vs variable); homepage SAFe table; roles drawn partly from SAFe.
**Gap:** No Architectural Runway view, Enabler type, WSJF, PI/release labels on versions, Value Stream artefact, or backlog-tool links.

### FW-3 · 🟡 Zachman alignment · Low
**Done:** Homepage now carries a Zachman alignment card (interrogatives → domains, perspectives → layers) alongside TOGAF/SAFe. **Remaining:** the `docs/` page placing each artefact type in its 6×6 cell, and flagging empty cells as gaps.
**Context:** Like the TOGAF and SAFe alignments, we should show how Pickle's model maps onto the **Zachman Framework** — the 6×6 ontology of interrogatives (What / How / Where / Who / When / Why) × perspectives (Executive/Contextual, Business Management/Conceptual, Architect/Logical, Engineer/Physical, Technician/Detailed, Enterprise).
**Gap:** No Zachman framing anywhere; no mapping of our domains/layers/artefacts onto Zachman cells.
**Proposed fix:** Map the model: **interrogatives → architecture domains** (What→Data, How→Business Process, Where→Integration/locations, Who→Org/roles, When→roadmap/events, Why→Strategy/Principles) and **perspectives → abstraction layers** (Conceptual/Logical/Physical map onto rows 2–4). Produce a homepage Zachman table (mirroring the TOGAF/SAFe tables) and a `docs/` page placing each artefact type in its cell; flag empty cells as gaps that motivate new artefact types ([AMC-3]/[AMC-5]).

### FW-4 · 🟡 UAF (Unified Architecture Framework) alignment · Low
**Done:** Homepage now carries a UAF alignment card (model kinds → Catalogue/Matrix/Diagram formats, UAF domains → our five domains). **Remaining:** the `docs/` page mapping our domains × layers × formats onto the full UAF grid, and the Security/Projects domain candidates.
**Context:** Like the TOGAF/SAFe alignments, map Pickle onto **UAF** — the OMG Unified Architecture Framework, whose grid crosses **domains** (Strategic, Operational, Services, Personnel, Resources, Security, Projects, Standards, Actual Resources, …) with **model kinds** (Taxonomy, Structure, Connectivity, Processes, States, Sequences, Information, Constraints, Roadmap, Traceability).
**Gap:** No UAF framing; no mapping of our domains/layers/formats onto UAF's grid.
**Proposed fix:** Map our five domains + three layers + three formats (Catalogue/Matrix/Diagram) onto the UAF domain × model-kind grid — e.g. Catalogue→Taxonomy, Matrix→Connectivity/Traceability, Diagram→Structure/Processes. Add a homepage UAF table and a `docs/` page; use empty intersections to motivate missing artefacts/matrices ([AMC-5]). Note UAF's first-class **Security** and **Projects** domains as candidate future domains.

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

### QV-5 · ✅ Accessibility pass · Medium
**Context:** `useFocusTrap` traps Tab and returns focus to the trigger on the New Decision/Discovery modals (`role=dialog`/`aria-modal`).
**Done:** `SlidePanel` (entity panel) now has full focus management — `role=dialog`/`aria-modal`/`aria-label`, focus moves in on open and returns to the trigger on close (`useFocusTrap`), and the off-screen closed panel is `inert` so its controls leave the tab order. Real `htmlFor`/`id` label association added to the New Decision and New Discovery create forms (replacing the `<span>` pseudo-labels).
**Also done:** real `htmlFor`/`id` label association on the full Decision and Discovery **editor pages** too (matching the modals). Keyboard: a consistent always-visible :focus-visible ring (box-shadow, survives focus:outline-none) now applies to every interactive element.
**Contrast (done):** swept all 154 `text-gray-400` usages (41 files) → `text-gray-500`; none sit on a dark background, so this clears WCAG AA (4.5:1+) for secondary text everywhere without regressions. Future per-component fine-tuning (e.g. larger/decorative text could go lighter) is optional polish, not a blocker.

### QV-6 · ✅ Formatting + coverage · Low
**Context:** Whole `src/` tree normalised with Prettier; `format:check` runs in the `ci.yml` lint job so style stays consistent. Use-case checks continue to widen under TT-1.

### QV-7 · ✅ Footer config banner · Low
**Context:** The footer shows owner/repo only when `/api/github` config is available (it now is in dev via the shim); the raw "not configured" env-var banner is gone.

### QV-8 · ✅ Productionisation security review · High
**Context:** Pickle is moving from PoC toward production; before exposure it needs a deliberate security pass.
**Review done (first pass)** — findings by severity:

| # | Severity | Finding | Status |
|---|---|---|---|
| 1 | **High** | `/api/github` has **no authentication** and **CORS `*`** — any origin can call it, and it performs repo writes + workflow dispatches with the server `GITHUB_TOKEN`. Effectively unauthenticated write access. | ✅ **Fixed** — CORS hardened (same-origin default + `API_ALLOWED_ORIGINS` allow-list) **and** every POST write is now gated on a valid Better Auth session (401 otherwise; read-only GETs stay open), verified live on production. [RAS-2] complete. |
| 2 | **Medium** | **Path-segment injection** — `clientId`/`versionId`/`decisionId`/`discoveryId` from the request flowed into repository paths (`architectures/<clientId>/…`), so a crafted value could traverse the tree. | ✅ **Fixed & strengthened** — `assertSafeIds` rejects any id not matching `^[A-Za-z0-9._-]+$`, and additionally any value containing `..` or equal to `.` (the regex alone allowed `..`, since dots are needed for versions like `1.0.0`). |
| 7 | Low | **Unvalidated `prNumber`** flowed into the PR-merge URL (`/pulls/${prNumber}/merge`). | ✅ **Fixed** — coerced to a positive integer (400 otherwise) during the TS migration. |
| 8 | Low | **Prototype-pollution surface** — the attacker-influenced `sectionKey` indexed into the parsed decision doc (`content[sectionKey][findingIndex]`). | ✅ **Fixed** — `sectionKey` rejects `__proto__`/`prototype`/`constructor`; `findingIndex` must be a non-negative integer. |
| 9 | Low | `/api/content` interpolated `ref` into the GitHub URL unencoded. | ✅ **Fixed** — `ref` is URL-encoded (via the shared `GitHubClient`) and reads are wrapped in try/catch. |
| 3 | Low (dev-only) | `npm audit`: 3 vulns (1 high, 2 moderate) in **esbuild/vite** — build/dev tooling only, **not in the production runtime bundle**. Fix is a breaking vite major bump. | ⬜ Defer; revisit on the next Vite upgrade. |
| 4 | Low | `/api/arch` GitHub proxy interpolates `relPath` into the contents URL; the local schema/docs shim has a `startsWith(basePath)` traversal guard. | ✅ **Fixed** — `/api/content` now allow-lists `prefix` to the three content roots and rejects `..`/leading-`/` paths. |
| 5 | Info | Markdown rendering does **not** enable `rehype-raw`, so embedded HTML isn't rendered (no stored-XSS via authored/AI content); links are `rel="noopener noreferrer"`. | ✅ No action. |
| 6 | Info | `GITHUB_TOKEN` is server-only; the `config` endpoint returns owner/repo/env but never the token. | ✅ No action. |

**Status:** ✅ all findings resolved. Finding #1 (the unauthenticated write endpoint) is now closed — `/api/github` writes require a valid session, verified live (see [RAS-2]). The remaining open item is only the **dev-tooling** npm-audit vulns (#3, vite/esbuild build step, not in the runtime bundle), deferred to the next Vite major. This first security pass is complete; a re-review is warranted whenever new endpoints/state land (e.g. [RAS-3] authorization, [RAS-4] DB state).

### QV-9 · ✅ Codebase refactor & enhancement pass · Medium
**Context:** A top-to-bottom review of `src/` (and `api/`, `tests/`) for refactoring opportunities: shared-component reuse, deduplication, consistent naming/terminology, dead-code removal, spelling/grammar, and small efficiency wins.
**Done:**
- **Dedup** — extracted `hooks/useClickOutside.js`, adopted in the 5 components that hand-rolled the outside-mousedown listener (DownloadMenu, DomainNav, TopBar, QuickPicker, UserMenu); shared `lib/github.ts` `GitHubClient` already de-duplicated the API layer.
- **Dead code** — removed the unused `loadClientMetrics` alias (audited all flagged exports; the rest are intentional vocabulary or used internally).
- **Correctness** — added cancellation guards to every page's data-loading effect (navigation races / set-state-after-unmount); fixed the lazy-route Suspense boundary; fixed `navigate()`-during-render in the auth pages.
- **Security** — full pattern scan clean: no `eval`/`innerHTML`/open-redirects; the one `dangerouslySetInnerHTML` (Illustration) is a bundled static SVG (`?raw`), not user content; every `target="_blank"` has `rel="noopener noreferrer"`; API hardening (id `..` rejection, `prNumber`/`sectionKey` guards, `ref` encoding); `/api/github` writes session-gated.
- **A11y/cleanliness** — AA contrast pass ([QV-5]); no copy/comment typos; lint at zero (no unused vars/imports); whole tree Prettier-clean.
**Future refactors (own items as they arise):** deeper structural review of the heavy view components (`DocumentView` ~1400 lines, `CatalogueView`, diagram renderers) if they grow further; a shared `fetchJson` is intentionally **not** merged (`lib/api.js` throws vs `lib/metrics.js` swallows — different semantics).

---

## Epic: Testing & Tooling

### TT-1 · ✅ Use-case corpus · Medium
**Done:** The corpus is an established, working test asset — `tests/use-cases.json` (100 cases), the `tests/run-use-cases.mjs` harness (filterable by `COMPLEXITY`/`PRIORITY`, drives them against the deployment), the reusable `rendersWithContent(path, mustText)` check, and outcome tracking in the JSON + `tests/use-case-outcomes.md`. **54 passed, 0 failed, 46 to-do**; no product defects surfaced. Failures auto-route to *Use Case Outcomes* ([UCO-n]).
**Ongoing (living asset, not a blocker):** the 46 "to-do" titles are incremental automated-check coverage, added opportunistically; the harness makes wiring each a small, low-risk addition. New use cases get appended as features land.

### TT-2 · ✅ URL-mapped screenshots + route smoke · Low
**Context:** `screenshot.mjs` mirrors the URL structure; `smoke.spec.js` hits all 66 routes against the deployment; `nightly.yml` regenerates screenshots.

### TT-3 · ✅ Decision schema & workflow docs · Low
**Done (0.5.2-alpha):** `docs/schemas/decision.md` rewritten to the current schema (context/problem/proposal, requirements, scope, recommendations, architecture-changes, history/activity, PR fields, full lifecycle); `docs/workflows/decisions-analysis.md` extended with the Accepted→Staged→Committed workflows.

---

## Epic: Platform & Data Layer

### PDL-1 · ⬜ Multi-repository support · Low
**Proposed fix:** Allow the architecture state to span more than one repository.

### PDL-2 · ⬜ Bring-your-own Anthropic credentials (per-client) · Medium
**Context:** Workflows call Anthropic with a single shared key. For multi-tenant / customer-hosted use, each customer should run AI under **their own Anthropic account** — their key, their billing, their data boundary — and optionally choose the model.
**Proposed fix:** Let each client **supply their own Anthropic API key** (and/or authenticate/log in with their Anthropic account) and select a model; store the credential as a per-client secret (never client-exposed) and have the decision/discovery/apply workflows resolve the per-client key at dispatch. Pairs with [RAS-2] (auth) and [QV-8] (secret handling).

### PDL-3 · ⬜ Features workflow: Fable review → Sonnet apply · Low
**Proposed fix:** A code-change workflow mirroring the decisions pipeline for non-ADR changes.

### PDL-4 · ⬜ Workflow-completion notifications (live UI updates) · Medium
**Context:** When a transition dispatches a workflow (narrative review, analysis, apply, discovery), the UI shows a "this takes a couple of minutes — check back" banner and the user must **manually refresh** to see results. There's no signal when the workflow actually finishes.
**Gap:** No back-end → front-end channel to announce "the workflow has run; new data is on `main`". Polling is wasteful and laggy.
**Proposed fix:** A notification path so the UI knows when GitHub state has changed: at workflow completion, a final step **calls back to the API** (`repository_dispatch` / a small notify endpoint), which **pushes to the front end** over a **WebSocket** (or SSE) keyed by client/version/record id. The relevant section then flips its banner to **"This is complete — hit refresh to view"** (or auto-refetches). Needs a stateful back end ([RAS-4]) to hold connections. This is the live-update backbone for [DEC-5]/[DSC-2] (inline edits that re-dispatch) and the existing decision/discovery refresh banners. Fallback: lightweight polling of the index `updatedAt` if a socket isn't available.

### PDL-5 · ⬜ Bring-your-own GitHub credentials / login · Medium
**Context:** The repository is accessed with one configured token (`GITHUB_TOKEN`/`OWNER`/`REPO`). For customer-hosted use, each customer should connect **their own GitHub** — their org/repo, their auth — rather than ours.
**Proposed fix:** Support **GitHub login (OAuth / GitHub App install)** and/or a customer-supplied PAT, scoping all reads/writes and workflow dispatches to the customer's repo. Store per-tenant; never expose to the client. Pairs with [PDL-1] (multi-repo), [RAS-2] (auth), and [QV-8] (token scopes/secret handling).

---

## Epic: Use Case Outcomes

Failures from running the use-case corpus against the product, captured here so they can be fixed. Outcomes are tracked in [tests/use-cases.json](tests/use-cases.json) and reported in [tests/use-case-outcomes.md](tests/use-case-outcomes.md).

### UCO-1 · ✅ No outstanding failures · High
**Context:** Latest run (2026-06-25) over XS/S/M × Must Have/Should Have — **62 cases: 37 passed, 0 failed, 25 to-do** (the to-do titles have no automated check yet, tracked under TT-1). No product defects surfaced.
**Gap:** None. Any future failure gets its own `UCO-n` entry here with Context / Gap / Proposed fix.

---

## Ops Notes

### OPS-1 · ✅ Vercel `ignoreCommand` skips multi-commit pushes ending in a data-only commit · Medium
**Context:** `src/vercel.json` sets `ignoreCommand: git diff --quiet HEAD^ HEAD -- . ':(exclude)architectures'` so the frontend isn't rebuilt when only architecture *data* changes. Vercel evaluates this against the **tip commit only** (`HEAD^..HEAD`).
**Gap:** When a push contains several commits and the **last** one touches only `architectures/` (e.g. the app's own `Update decisions` writes), Vercel skips the build for the *entire* push — stranding code changes earlier in the same push. Hit once (2026-06-26) by manually batching code + a data tidy-up into one push.
**Resolved (by process):** in normal operation this can't strand code — the app's own automated writes are **single, data-only commits** (one per decision/discovery action), which correctly skip without any code to strand. The incident only arose from manually mixing code and data in one push. **Rule:** never end a code push with a data-only commit; keep them on separate pushes. Quick unblock if it ever recurs: push any commit touching a `src/` path.
**Robust option (if it recurs / for full automation):** disable Vercel Git auto-deploy and trigger a **Vercel Deploy Hook** from a GitHub Action that builds only when `git diff ${{ github.event.before }}..${{ github.event.after }} -- src` is non-empty — this evaluates the whole push, not just the tip. Logged as the future-proof fix; not needed for current cadence.
