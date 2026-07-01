# Testing Strategy

How Pickle is tested on the road to production. Two guiding constraints:

1. **Minimise Claude usage.** Every automated test gate is deterministic (Node / Playwright / Ajv) and needs **no `ANTHROPIC_API_KEY`**. Claude runs only in the event-driven decision/discovery/apply workflows, which are human-triggered and billed: never in a test gate.
2. **Only run what the change touches.** A data-only change doesn't run the SPA e2e suite; a component tweak doesn't re-validate every schema. Path filters scope each job.

## Layers

| # | Layer | Tool | Claude? | Catches |
|---|---|---|---|---|
| L0 | Syntax / format | `JSON.parse`, Prettier `--check`, ESLint | No | Broken JSON, unformatted code, lint errors |
| L1 | Schema validation | Ajv (`tests/validate-schemas.mjs`) | No | Instances invalid vs their JSON Schema; schemas not valid 2020-12; `$ref` (scope/roles URNs) unresolved |
| L2 | Referential integrity | `tests/validate-integrity.mjs` | No | Dangling artefact/entity IDs, scope enums, index↔folder drift, roles used vs `roles.json`, root-array/metadata regressions |
| L3 | Unit | vitest | No | `lib/` logic (collections, format, artefacts overlay, i18n) |
| L4 | Component | vitest + Testing Library | No | Key renderers (CatalogueView with metadata arrays, ActionBar, ActivityHistory) |
| L5 | Build | `vite build` | No | Bundle compiles |
| L6 | Smoke (e2e) | Playwright vs preview URL | No | All routes render, no error boundary |
| L7 | Use-case acceptance | `tests/run-use-cases.mjs` vs preview | No | Behavioural checks from the use-case corpus |
| — | AI pipelines | decisions / discovery / apply | **Yes** | Not tests: billed, human-triggered, separate |

L1 + L2 are the highest production-readiness payoff: they catch data/schema regressions (including the class of bug where adding metadata arrays broke catalogue rendering) without any Claude cost.

## When they run

Browser layers (L6/L7) run against the **per-PR Vercel preview deployment**, so CI needs no data server or secrets.

| Change area | L0 | L1 | L2 | L3/L4 | L5 | L6 | L7 |
|---|---|---|---|---|---|---|---|
| `architectures/**` (data) | JSON | ✅ | ✅ | — | — | — | — |
| `config/schemas/**` | ✅ | ✅ (+ all instances) | ✅ | — | — | — | — |
| `config/{roles,i18n}/**` | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| `src/**` | ✅ | — | — | ✅ | ✅ | ✅ | subset |
| `config/prompts/**`, `.github/**` | lint | — | — | — | — | — | — |

**Triggers**
- **Pull request (merge gate):** path-scoped L0–L5; L6 + L7-subset (XS · Must Have) against the preview when `src/**` changes.
- **Push to `main`:** same gates, plus post-deploy L6 full smoke against production.
- **Nightly (cron):** full L7 across the corpus + screenshot regen; failures route to the *Use Case Outcomes* backlog epic.
- **Manual (`workflow_dispatch`):** any layer on demand.

## Workflows

- **`ci.yml`**: PR gate. A `changes` job (paths-filter) drives conditional `lint`, `unit`, `build`, `validate-data`, `e2e` jobs.
- **`validate-data.yml`**: reusable; runs L1 (Ajv) + L2 (integrity). Re-enables and replaces the dormant `validate-schema` / `validate-structure`.
- **`post-deploy.yml`**: waits for the Vercel deployment, runs L6 (+ L7 subset) against the URL.
- **`nightly.yml`**: cron: full use-cases + screenshots.
- Existing `decisions-*`, `discovery-to-active`, `decisions-apply-changes` are the only Claude consumers and stay event-driven.

## Rollout

1. **L1**: Ajv schema validation (this is where data/schema bugs get caught). ✅
2. **L2**: referential-integrity checks.
3. **Path scoping** in `ci.yml`.
4. **Preview-URL e2e (L6) + L7 subset** on PR.
5. **Component tests (L4)** for the renderers most prone to silent breakage.
6. **Nightly** full use-cases + screenshots.
7. **Backfill** use-case checks so more of the corpus is real rather than "to do".

See `BACKLOG.md` → *Quality, Validation & CI* for live status.
