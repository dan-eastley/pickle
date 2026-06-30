# Validate Context

**File:** [`/.github/workflows/validate-context.yml`](../../.github/workflows/validate-context.yml)
**Trigger:** push to `decisions/**` or `features/**`.

## Purpose

Gate the change surface a branch is allowed to touch, based on its branch type.

| Branch | Allowed surface | Disallowed surface |
|---|---|---|
| `decisions/<architecture>/<transition>/<decision-id>` | `architectures/<architecture>/...` only | anything outside `architectures/<architecture>/` |
| `features/<feature-id>` | everything outside `architectures/<architecture>/...` | any file inside `architectures/<some-client>/...` |

A decision branch is for client-specific architecture change. A feature branch is for everything else (schemas, workflows, docs, tooling). The two surfaces are deliberately disjoint: no branch type can touch both worlds at once.

## Behaviour

### Decision branches

1. Parses the branch name → `(client, version, decision)`.
2. Diffs the branch against `origin/main`.
3. Any changed file not starting with `architectures/<architecture>/` is a violation.
4. Verifies the decision JSON exists; fails if the author hasn't created it.
5. Writes the outcome to the decision JSON's `context-validation` property:
   ```json
   {
     "branch-type":    "decision",
     "outcome":        "pass" | "fail",
     "allowed-prefix": "architectures/<architecture>/",
     "changed-files": ["..."],
     "violations":    ["..."],
     "checked-at":    "<iso8601>"
   }
   ```
6. Commits the decision file back via `GITHUB_TOKEN`.
7. Exits non-zero on violation, surfacing the failure on the branch's checks before the decision can move to Proposed and trigger [Decisions Analysis](decisions-analysis.md).

### Feature branches

1. Diffs the branch against `origin/develop`.
2. Any changed file matching `architectures/<some-client>/...` (i.e. depth ≥ 3 under `architectures/`) is a violation, with one exception:
   - **`decisions.json` index files are allowed.** They are organisational metadata (decision IDs only), not architecture content, and may be updated from a feature branch: for example, when registering a new decision ID ahead of the decision branch that fills it in.
3. Files at `architectures/architectures.json` and similar top-level index files are **not** violations either: they sit outside any client folder.
4. No decision JSON to update; the result is reported via build status and workflow logs.
5. Exits non-zero on violation.

## Notes

- Logic is deterministic; no AI involvement.
- The two diff bases differ deliberately: decision branches integrate to `main`, feature branches integrate to `develop`.
- The shape of `context-validation` is permissive in [`config/schemas/decision.json`](../../config/schemas/decision.json), it deviates from the 4-string `$defs/section` shape used by the analysis workflows because the output is structured data, not narrative.
