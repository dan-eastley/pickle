# Production Readiness

Tracking the work to take Pickle from a polished proof-of-concept to a codebase
anyone would be happy to inherit. This file is the working plan for the
`productionising` branch.

## Coding standards (in place)

- **ESLint 9** (flat config, `src/eslint.config.js`) — `@eslint/js` recommended
  plus React, React Hooks, React Refresh, and jsx-a11y. Run with `npm run lint`.
- **Prettier** (`src/.prettierrc.json`) — single quotes, no semicolons, 100-col,
  ES5 trailing commas. Run with `npm run format` / `npm run format:check`.
- **CI gate** — the `lint` job in `.github/workflows/test.yml` runs ESLint on
  every push/PR outside `architectures/`, alongside the unit and e2e jobs.

The lint baseline is **0 errors**. Remaining items are tracked as warnings so
they surface without blocking, and are burned down below.

## Workstreams

### 1. Lint warnings → zero
- `no-unused-vars` (unused map indices, dead imports) — remove or prefix `_`.
- `react-hooks/exhaustive-deps` — audit each effect; add deps or document why
  the dep array is intentionally narrow.
- `react-refresh/only-export-components` — move non-component exports out of
  component modules.

### 2. Accessibility
- `jsx-a11y/label-has-associated-control` — associate every form label with its
  control (`htmlFor`/`id` or nesting) in the decision editor and modal.
- `jsx-a11y/no-autofocus` — replace autofocus with a managed focus approach.
- Audit colour contrast, focus order, and keyboard traps in the slide panel and
  modal (focus trap + return focus on close).

### 3. Formatting
- Run `npm run format` to apply Prettier across the tree, then add
  `format:check` to the CI lint job so style stays consistent.

### 4. Security
- Server (`api/`, `vite.config.js`): validate/escape all path inputs to the
  GitHub proxy (prevent path traversal beyond the configured prefixes — partly
  done via the `startsWith(basePath)` guard); rate-limit; never echo tokens.
- Client: confirm `dangerouslySetInnerHTML` is only fed trusted SVG assets
  (Illustration) and that markdown is sanitised (react-markdown is safe by
  default — keep `rehype-raw` disabled).
- Pin and audit dependencies (`npm audit`), add Dependabot.

### 5. Validation
- Re-enable the disabled `validate-*` workflows (`if: false`) and wire JSON
  Schema validation of architecture instances into PR checks.
- Validate API request bodies/params in `api/github.js`.

### 6. Test coverage
- Expand unit coverage (catalogue/count helpers, document section building,
  decision status transitions).
- Add component tests for the document and decision renderers.
- Add e2e flows for the architecture browser and a decision walkthrough.
- Add coverage reporting (`vitest run --coverage`) with a threshold.

### 7. Documentation & DX
- JSDoc on exported lib functions and non-obvious components.
- A `CONTRIBUTING.md` describing the standards, scripts, and branch model.
- An `.editorconfig` for consistent whitespace across editors.
