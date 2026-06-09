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
