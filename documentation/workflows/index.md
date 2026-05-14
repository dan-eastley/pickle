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

| Workflow | File | Triggers after | Purpose |
|---|---|---|---|
| [Scope Validation](decisions-pipeline.md#1-scope-validation) | `decisions-scope-validation.yml` | push to decisions/** | First link in the chain |
| [Decision Change Discovery](decisions-pipeline.md#2-decision-change-discovery) | `decisions-change-discovery.yml` | Scope Validation | Recommend artefact-type changes |
| [Referential Integrity](decisions-pipeline.md#3-referential-integrity) | `decisions-referential-integrity.yml` | Decision Change Discovery | Cross-reference IDs, flag orphans |
| [Strategy Alignment](decisions-pipeline.md#4-strategy-alignment) | `decisions-strategy-alignment.yml` | Referential Integrity | Review conceptual changes against domain Strategy |
| [Principles Alignment](decisions-pipeline.md#5-principles-alignment) | `decisions-principles-alignment.yml` | Strategy Alignment | Review logical changes against domain Principles |
| [Decision Change Proponent](decisions-pipeline.md#6-decision-change-proponent) | `decisions-change-proponent.yml` | Principles Alignment | Narrative arguing FOR the change |
| [Decision Change Challenger](decisions-pipeline.md#7-decision-change-challenger) | `decisions-change-challenger.yml` | Decision Change Proponent | Narrative arguing AGAINST the change |

All seven decision-pipeline workflows are currently structural **stubs** — see [decisions-pipeline.md](decisions-pipeline.md) for the shared mechanism and what each workflow will eventually do.
