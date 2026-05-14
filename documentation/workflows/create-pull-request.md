# Create Pull Request

**File:** [`/.github/workflows/create-pull-request.yml`](../../.github/workflows/create-pull-request.yml)
**Trigger:** push to `features/**` or `decisions/**`.

## Purpose

Automatically open a pull request when a feature or decision branch is pushed, targeting the right base branch.

## Target mapping

| Pushed branch | PR target |
|---|---|
| `features/**` | `develop` |
| `decisions/**` | `main` |

## Behaviour

1. Determines the target branch from the pushed branch's prefix.
2. Skips if a PR is already open for this branch.
3. Skips if the branch has no commits ahead of the target (nothing to PR).
4. Otherwise runs `gh pr create` with:
   - **Title** = the latest commit's subject (stub, pending AI generation).
   - **Body** = a Markdown summary with the commit list (stub).

## Notes

- Required setting: Settings → Actions → General → Workflow permissions → **"Allow GitHub Actions to create and approve pull requests"** must be enabled, otherwise `gh pr create` is blocked.
- The PR is opened by `github-actions[bot]` via `GITHUB_TOKEN`. GitHub does **not** fire `pull_request` events on this PR (anti-recursion), so no other workflows trigger as a side effect.
- The title/body generation step is a placeholder; AI generation (via `anthropics/claude-code-base-action`) is pending.
