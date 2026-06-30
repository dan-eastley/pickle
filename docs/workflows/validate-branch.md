# Validate Branch

**File:** [`/.github/workflows/validate-branch.yml`](../../.github/workflows/validate-branch.yml)
**Trigger:** GitHub `create` event (a new branch ref lands on the remote: covers fresh branches and renames).

## Purpose

Reject branch names that don't fit one of the allowed patterns.

| Pattern | Purpose |
|---|---|
| `main` | Default branch |
| `develop` | Integration branch |
| `features/<feature-id>` | Codebase changes |
| `decisions/<architecture-id>/<transition-id>/<decision-id>` | Architecture changes driven by an ADR |

ID segments accept `[A-Za-z0-9._-]+`.

## Behaviour

- On match: emits a notice and exits 0.
- On non-match: emits an error with the allowed patterns and a hint (`git branch -m <new-name>`), then exits 1, flagging the branch creation as failed.

## Notes

- Only triggers on the `create` event, so existing branches are grandfathered in.
- For PR-time enforcement, add `Validate Branch` as a required status check in Settings → Branches.
