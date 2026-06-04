# Validate Merge

**File:** [`/.github/workflows/validate-merge.yml`](../../.github/workflows/validate-merge.yml)
**Trigger:** push to `develop`, `features/**`, or `decisions/**`.

## Purpose

Test-merge the configured upstream into the pushed branch. Fail the build on unresolved conflicts so authors know to integrate locally before merging.

## Upstream mapping

| Pushed branch | Upstream tested |
|---|---|
| `develop` | `main` |
| `decisions/**` | `main` |
| `features/**` | `develop` |

## Behaviour

1. Fetches the upstream ref.
2. Fast-path: if the branch already contains every commit on upstream, exits cleanly.
3. Otherwise runs `git merge --no-edit --no-commit <upstream>` — git auto-merges non-overlapping changes.
4. If unmerged paths remain, writes a markdown summary to `$GITHUB_STEP_SUMMARY` (list of conflicting files + copy-paste recipe to resolve locally) and fails.
5. `git merge --abort` is called on every exit path — no merge state is committed back.

## Notes

- True conflicts only — non-overlapping edits in the same file are not flagged.
- Auto-resolution strategies like `-X ours`/`-X theirs` are deliberately **not** used (they silently lose work).
