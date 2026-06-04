# Create Release

**File:** [`/.github/workflows/create-release.yml`](../../.github/workflows/create-release.yml)
**Trigger:** push of a tag matching `v*`.

## Purpose

On tag push, create a GitHub release for the tag and merge `main` back into `develop` (downstream sync).

## Behaviour

1. Checks out the tagged commit.
2. Runs `gh release create <tag> --title <tag> --generate-notes` — GitHub auto-generates release notes from commit history since the previous release.
3. Syncs main back into develop:
   - Fetches both refs.
   - Checks out `develop`.
   - Merges `origin/main` with `--no-edit`.
   - On clean merge, pushes `develop`.
   - On conflict, fails the workflow and asks for manual resolution.

## Notes

- The push to `develop` is done by `github-actions[bot]` via `GITHUB_TOKEN`, so it does **not** re-trigger other workflows on `develop`.
- Standard release flow: merge `develop` → `main`, then tag, then push the tag. The workflow fires on the tag push.
