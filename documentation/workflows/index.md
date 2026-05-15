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

Each workflow writes to a section in the decision JSON whose property name equals the kebab-cased workflow name.

| # | Workflow | File | Triggers after | Decision-JSON section |
|---|---|---|---|---|
| 1 | [Architecture Review](decisions-pipeline.md#1-architecture-review) | `decisions-architecture-review.yml` | Validate Context | `architecture-review` |
| 2 | [Referential Integrity](decisions-pipeline.md#2-referential-integrity) | `decisions-referential-integrity.yml` | Architecture Review | `referential-integrity` |
| 3 | [Strategy Alignment](decisions-pipeline.md#3-strategy-alignment) | `decisions-strategy-alignment.yml` | Referential Integrity | `strategy-alignment` |
| 4 | [Principles Alignment](decisions-pipeline.md#4-principles-alignment) | `decisions-principles-alignment.yml` | Strategy Alignment | `principles-alignment` |
| 5 | [Proponent Analysis](decisions-pipeline.md#5-proponent-analysis) | `decisions-proponent-analysis.yml` | Principles Alignment | `proponent-analysis` |
| 6 | [Challenger Analysis](decisions-pipeline.md#6-challenger-analysis) | `decisions-challenger-analysis.yml` | Proponent Analysis | `challenger-analysis` |
| 7 | [Update Pull Request](decisions-update-pull-request.md) | `decisions-update-pull-request.yml` | Challenger Analysis | _(updates PR body, no JSON section)_ |

All six analysis workflows are currently structural **stubs** — see [decisions-pipeline.md](decisions-pipeline.md) for the shared mechanism and what each workflow will eventually do. Validate Context and Update Pull Request are the fully-implemented decision-related workflows.
