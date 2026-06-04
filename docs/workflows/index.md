# Workflows

GitHub Actions workflows live at [`/.github/workflows/`](../../.github/workflows/). Each is documented on its own page below. Every workflow has the same skeleton: a `Started` step that logs startup, the main work, and a `Finished` step (with `if: always()`) that logs completion regardless of success or failure.

## Validation gates

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| [Validate Branch](validate-branch.md) | `validate-branch.yml` | branch create | Reject branch names that don't match the allowed patterns |
| [Validate Merge](validate-merge.md) | `validate-merge.yml` | push to develop / features/** / decisions/** | Test-merge the upstream branch; fail on real conflicts |
| [Validate Schema](validate-schema.md) | `validate-schema.yml` | push | JSON-parse changed `.json` files; validate against the matching schema where one applies |
| [Validate Structure](validate-structure.md) | `validate-structure.yml` | push | Walk the `architectures/` tree; assert indexes and folders agree, and required files are present |
| [Validate Context](validate-context.md) | `validate-context.yml` | push to decisions/** or features/** | Decision branch: changes must live inside the client folder. Feature branch: changes must live outside any client folder. |

## PR and release lifecycle

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| [Create Pull Request](create-pull-request.md) | `create-pull-request.yml` | push to features/** or decisions/** | Auto-open a PR to the right target branch |
| [Create Release](create-release.md) | `create-release.yml` | tag push (`v*`) | Create a GitHub release from the tag and merge main back into develop |

## Decision analysis pipeline (chained after Validate Context)

A single orchestrator workflow runs six Claude-driven analyses as sequential jobs, then updates the PR description. Each analysis writes to a section in the decision JSON whose property name equals the kebab-cased step name.

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| [Decisions Pipeline](decisions-pipeline.md) | `decisions-pipeline.yml` | `workflow_run` after Validate Context | Orchestrates the six analyses + PR update as sequential jobs |
| (reusable analysis step) | `decisions-analysis-step.yml` | `workflow_call` from orchestrator | One Claude analysis pass — parameterised by section key, prompt file, and branch |

Within the orchestrator, jobs run in this order — each writes its result to the matching decision-JSON section:

| # | Job | Decision-JSON section |
|---|---|---|
| 1 | `architecture-review` | `architecture-review` |
| 2 | `referential-integrity` | `referential-integrity` |
| 3 | `strategy-alignment` | `strategy-alignment` |
| 4 | `principles-alignment` | `principles-alignment` |
| 5 | `proponent-analysis` | `proponent-analysis` |
| 6 | `challenger-analysis` | `challenger-analysis` |
| 7 | `update-pull-request` | _(updates PR body, no JSON section)_ |

All six analysis jobs are currently **prompt stubs** — see [decisions-pipeline.md](decisions-pipeline.md) for the orchestration mechanism and what each step will eventually do. Validate Context and Update Pull Request are the fully-implemented deterministic links bookending the chain.
