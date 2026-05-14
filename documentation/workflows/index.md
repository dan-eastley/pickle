# Workflows

GitHub Actions workflows live at [`/.github/workflows/`](../../.github/workflows/). Each is documented on its own page below. Every workflow has the same skeleton: a `Started` step that logs startup, the main work, and a `Finished` step (with `if: always()`) that logs completion regardless of success or failure.

## Branch / merge / schema gates

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| [Validate Branch](validate-branch.md) | `validate-branch.yml` | branch create | Reject branch names that don't match the allowed patterns |
| [Validate Merge](validate-merge.md) | `validate-merge.yml` | push to develop / features/** / decisions/** | Test-merge the upstream branch; fail on real conflicts |
| [Validate Schema](validate-schema.md) | `validate-schema.yml` | push | JSON-parse changed `.json` files; validate against the matching schema where one applies |

## PR and release lifecycle

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| [Create Pull Request](create-pull-request.md) | `create-pull-request.yml` | push to features/** or decisions/** | Auto-open a PR to the right target branch |
| [Create Release](create-release.md) | `create-release.yml` | tag push (`v*`) | Create a GitHub release from the tag and merge main back into develop |

## Decision pipeline (7-workflow chain)

Each workflow writes to a section in the decision JSON whose property name equals the kebab-cased workflow name.

| # | Workflow | File | Triggers after | Decision-JSON section |
|---|---|---|---|---|
| 1 | [Scope Validation](decisions-pipeline.md#1-scope-validation) | `decisions-scope-validation.yml` | push to decisions/** | `scope-validation` |
| 2 | [Architecture Review](decisions-pipeline.md#2-architecture-review) | `decisions-architecture-review.yml` | Scope Validation | `architecture-review` |
| 3 | [Referential Integrity](decisions-pipeline.md#3-referential-integrity) | `decisions-referential-integrity.yml` | Architecture Review | `referential-integrity` |
| 4 | [Strategy Alignment](decisions-pipeline.md#4-strategy-alignment) | `decisions-strategy-alignment.yml` | Referential Integrity | `strategy-alignment` |
| 5 | [Principles Alignment](decisions-pipeline.md#5-principles-alignment) | `decisions-principles-alignment.yml` | Strategy Alignment | `principles-alignment` |
| 6 | [Proponent Analysis](decisions-pipeline.md#6-proponent-analysis) | `decisions-proponent-analysis.yml` | Principles Alignment | `proponent-analysis` |
| 7 | [Challenger Analysis](decisions-pipeline.md#7-challenger-analysis) | `decisions-challenger-analysis.yml` | Proponent Analysis | `challenger-analysis` |

All seven decision-pipeline workflows are currently structural **stubs** — see [decisions-pipeline.md](decisions-pipeline.md) for the shared mechanism and what each workflow will eventually do.
