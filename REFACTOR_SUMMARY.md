# Refactor Summary — `features/codebase-refactor`

Branch: `features/codebase-refactor` (from `develop` @ `9c114146`).
Note: the task brief asked for a branch named `codebase-refactor`; this repo's
`validate-branch.yml` only accepts `features/<feature-id>` for codebase changes,
so the branch is `features/codebase-refactor` (confirmed with the maintainer).

## 1. Overview

This was a full top-to-bottom review of the repository: the React/Vite SPA and
Vercel serverless API under `src/`, the shared `lib/` layer, the repo-level
validation scripts under `tests/`, and the project configuration and docs.

The codebase is in genuinely good health. Modules are small and cohesive, the
comment discipline is unusually strong (most files explain *why*, not just
*what*), security-sensitive paths (path traversal, prototype pollution, RBAC,
CORS) are explicitly guarded, and the logic layer carries a coverage ratchet
with near-total thresholds on the permission and git-tree modules. There was no
dead code, no leftover `console.log` debugging, and no TODO/FIXME debt markers
anywhere in the app source.

The changes therefore concentrate on three themes rather than restructuring:
**consolidating duplicated logic** into single sources of truth (`humanize`
defined four times, discovery status styling defined three times, the ADR
narrative composition defined three times, duplicated fs helpers in the
validation scripts); **two genuine bug fixes** found during review (date
formatting whose error fallback could never fire, and decision creation
hard-coding the activity actor as `'Joe B'` instead of the signed-in user); and
**hygiene** (a lint-config warning, 36 files drifted from Prettier, an unused
dependency, and a `CLAUDE.md` repo map that predated the entire web app).

Every commit was verified against the full local gate: `vite build`,
`tsc --noEmit`, `eslint .`, `prettier --check .`, the vitest suite (110 → 120
tests), and the repo-level schema/integrity validators.

## 2. Changes Made

#### ESLint react-version warning
- **Category:** Hygiene · **Severity addressed:** Low
- **File(s):** `src/eslint.config.js`
- **What changed:** The `react.version` setting only covered `**/*.{js,jsx}`; hoisted to a global settings object so Node scripts linted by the react preset stop warning.
- **Behavior impact:** None.
- **Commit:** `8f85c4a9`

#### Prettier: ignore generated migration metadata
- **Category:** Hygiene · **Severity addressed:** Low
- **File(s):** `src/.prettierignore`
- **What changed:** Excluded `db/migrations` (drizzle-kit output) from formatting so regeneration doesn't churn.
- **Behavior impact:** None.
- **Commit:** `e0657f48`

#### Formatting pass
- **Category:** Consistency · **Severity addressed:** Low
- **File(s):** 32 files across `src/`
- **What changed:** `prettier --write .` — 36 files had drifted from the configured style.
- **Behavior impact:** None (pure formatting).
- **Commit:** `7dc7e6b5`

#### Date formatting: dead error fallback
- **Category:** Quality · **Severity addressed:** Medium
- **File(s):** `src/lib/format.js`, `src/lib/format.test.js`
- **What changed:** `formatDate`/`formatDateTime` wrapped `new Date()` in try/catch, but `new Date(bad)` returns an Invalid Date rather than throwing — so bad timestamps rendered as the string "Invalid Date". Replaced with an explicit NaN check; added tests.
- **Behavior impact:** **Intended fix** — unparseable timestamps now render as the raw stored value.
- **Commit:** `9ade4e66`

#### Consolidated duplicated lib helpers
- **Category:** Refactor · **Severity addressed:** Medium
- **File(s):** `src/lib/format.js`, `src/lib/export/blocks.js`, `src/lib/metrics.js`, `src/lib/enums.js`, `src/lib/api.js`, `src/components/artefacts/EntityPanel.jsx`
- **What changed:** `humanize()` was implemented four times (blocks, metrics, enums' `enumValueLabel`, EntityPanel); all now delegate to one canonical `lib/format.humanize`. `META_ARRAY_KEYS` was defined in both `collections` and `metrics`. The soft (null-on-failure) `fetchJson` in `metrics` moved to `lib/api` as `fetchJsonSoft`.
- **Why:** Single source of truth; EntityPanel's variant silently diverged (didn't handle `_`).
- **Behavior impact:** None (EntityPanel now title-cases `_`-separated keys like everywhere else).
- **Commit:** `d1abc69f`

#### API helper extraction
- **Category:** Refactor · **Severity addressed:** Low
- **File(s):** `src/api/github.ts`
- **What changed:** Extracted `nextSequentialId` (was duplicated for `ADR-`/`DSC-` ids) and `decisionInputs`/`discoveryInputs` (the kebab-cased workflow-dispatch payload, built inline at four call sites).
- **Behavior impact:** None.
- **Commit:** `c13a3882`

#### Named constants for repeated literals
- **Category:** Quality · **Severity addressed:** Low
- **File(s):** `src/hooks/usePageTitle.js`, `src/context/ArchitectureContext.jsx`
- **What changed:** Hoisted the default document title and the two localStorage keys to named constants.
- **Behavior impact:** None.
- **Commit:** `02f587b4`

#### Discovery status styling centralised
- **Category:** Consistency · **Severity addressed:** Medium
- **File(s):** `src/lib/theme.js`, `src/pages/DiscoveryPage.jsx`, `src/pages/DiscoveryDetailPage.jsx`, `src/pages/DomainsPage.jsx`, `src/pages/ArtefactPage.jsx`
- **What changed:** Discovery status labels/badges were defined independently (with identical values) in three pages; now `DISCOVERY_STATUS` in `lib/theme` alongside `DECISION_STATUS`/`VERSION_STATUS`. `ArtefactPage` also re-implemented `formatDate` inline.
- **Behavior impact:** None.
- **Commit:** `f5ce1306`

#### Decision creation attribution (bug fix)
- **Category:** Quality · **Severity addressed:** **High**
- **File(s):** `src/api/github.ts`, `src/lib/narrative.ts` (moved from `.js`), `src/components/decisions/NewDecisionModal.jsx`, `src/pages/DecisionEditorPage.jsx`
- **What changed:** Both decision-creation UIs hard-coded the activity actor as `'Joe B'` (dev scaffolding), so every created decision was mis-attributed in the audit trail. `createDecision` now stamps the Created activity entry server-side with the authenticated actor — the same pattern `updateDecision`/`createDiscovery` already used — and clients no longer self-attribute. The `## Context / ## Problem / ## Proposal` narrative composition, previously duplicated in the modal, the editor page, and the API, is now a single `composeNarrative` in `lib/narrative`, converted to TypeScript so the serverless functions (`allowJs: false`) can share it.
- **Behavior impact:** **Intended fix** — new decisions record the real creator.
- **Commit:** `44efbf36`

#### Shared CloseIcon
- **Category:** Consistency · **Severity addressed:** Low
- **File(s):** `src/components/ui/SettingsModal.jsx`, `src/components/ui/JsonPreview.jsx`, `src/components/decisions/NewDecisionModal.jsx`, `src/components/decisions/NewDiscoveryModal.jsx`
- **What changed:** Four components inlined the same close-X SVG that `icons.jsx` already exports as `CloseIcon`; all now use it, matching the existing usage in `AccountSettingsModal`/`RequirementsList`.
- **Behavior impact:** None functionally (close glyph is now pixel-identical across all modals).
- **Commit:** `33926e4a`

#### Validation-script helpers
- **Category:** Refactor · **Severity addressed:** Low
- **File(s):** `tests/lib.mjs` (new), `tests/validate-schemas.mjs`, `tests/validate-integrity.mjs`
- **What changed:** Both scripts defined their own `walk`/`read`/repo-root helpers; extracted to a shared `tests/lib.mjs`, and integrity errors now print repo-relative paths via the shared `rel()`.
- **Behavior impact:** None (both validators produce the same pass results).
- **Commit:** `a26b20c2`

#### Unused dependency removed
- **Category:** Hygiene · **Severity addressed:** Low
- **File(s):** `src/package.json`, `src/package-lock.json`
- **What changed:** Removed `vite-plugin-static-copy` — the static-copy build step was retired when `/api/content` took over serving data (per the note in `vite.config.js`). `@babel/runtime` was checked and **kept**: it is a deliberate peer dep of `@untitled-ui/icons-react`.
- **Behavior impact:** None.
- **Commit:** `1d032d8b`

#### CLAUDE.md accuracy
- **Category:** Hygiene · **Severity addressed:** Medium
- **File(s):** `CLAUDE.md`
- **What changed:** The repo map predated `src/` entirely; added `src/`, `tests/`, `assets/`, `BACKLOG.md`, the per-transition `discovery/` tree and missing `config/` entries; corrected the decision id form (`ADR-NNN`, not `adr-NNN`); extended the tech-stack table.
- **Behavior impact:** None (docs).
- **Commit:** `b0edda15`

#### composeNarrative tests
- **Category:** Quality · **Severity addressed:** Low
- **File(s):** `src/lib/narrative.test.js`
- **What changed:** Four new tests covering the newly shared `composeNarrative`, including a compose→parse round-trip.
- **Commit:** `daec8bc0`

## 3. Verification

All commands run from `src/` unless noted; every commit passed this gate.

| Check | Command | Result |
|---|---|---|
| Build | `npm run build` | ✅ (pre-existing >500 kB chunk warning for lazy-loaded exporters — unchanged) |
| Typecheck | `npm run typecheck` | ✅ |
| Lint | `npm run lint` | ✅ zero warnings (baseline had the react-version warning) |
| Format | `npx prettier --check .` | ✅ (baseline: 36 files failing) |
| Unit tests | `npm test` | ✅ **120 passed** (baseline 110) |
| Coverage ratchet | `npm run test:coverage` | ✅ thresholds met (permissions 98%, gitTree 100%) |
| Schema validation | `node tests/validate-schemas.mjs` (repo root) | ✅ 63 schemas, 292 instances |
| Integrity | `node tests/validate-integrity.mjs` (repo root) | ✅ |

Not run: `npm run test:e2e` (Playwright smoke needs a running app with
`GITHUB_*`/auth env; recommended on the preview deployment for this PR).

## 4. Deferred Items & Open Questions

- **`DocumentView.jsx` (1,379 lines) / `DecisionDetailPage.jsx` (1,498 lines) / `HomePage.jsx` (994 lines)** — large but internally well-factored into many small section components. Splitting them into files would be reviewable-churn without behavioral benefit; left alone deliberately. If they keep growing, `DocumentView`'s section renderers are the natural extraction seam.
- **`DOCS_NAV` in `src/lib/docs.js`** looks derivable from the `ARTEFACTS` registry, but titles are hand-abbreviated and several artefact types are intentionally absent — treated as curated content, not duplication.
- **Discovery id fallback badge**: unknown discovery statuses now fall back to the *active* badge (previously one page used a gray fallback). Statuses are enum-constrained so this is unreachable in practice; flagging for completeness.
- **`resolveRefArtefactId`'s prefix table** (`lib/artefacts.js`) hard-codes instance-id prefixes; if new catalogue types gain instance ids, this needs a matching entry. A registry-driven mapping could replace it later.
- **Dev-permissive auth** (`resolvePermissions` treats missing auth/local dev as admin) is documented, deliberate behavior — untouched, but worth revisiting before production per `BACKLOG.md`.

## 5. Suggested Next Steps

1. Open a PR `features/codebase-refactor` → `develop`; review the two
   intentional behavior changes first (`9ade4e66` date fallback, `44efbf36`
   actor attribution) — everything else is pure refactor/hygiene.
2. Run the Playwright smoke suite against the PR's preview deployment
   (decision creation now relies on the server stamping the actor).
3. After merge, exercise the create-decision flow once in an authenticated
   session and confirm the activity entry shows the real user.
4. Optional follow-ups: split `DocumentView` section renderers if that file
   keeps growing; consider a registry-driven `resolveRefArtefactId`.
