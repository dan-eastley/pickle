# Prompts

Claude Code prompts that drive the AI-assisted parts of the architecture-as-code pipeline. Each markdown file in this tree is read by exactly one GitHub Actions workflow at runtime and passed verbatim to Claude.

Prompts live in the repo (not in workflow YAML) for three reasons:

- **Visibility** — prompts are governance content, not CI configuration. They should be reviewable in the GitHub UI alongside schemas and architectures.
- **Iteration** — markdown supports rich structure (examples, format hints, tables) without YAML escaping pain.
- **Reviewable diffs** — one file per workflow means each prompt change produces a focused diff.

## Layout

```
prompts/
├── README.md           # This file
└── decisions/          # One prompt per workflow in the decision analysis chain
    ├── architecture-review.md
    ├── referential-integrity.md
    ├── strategy-alignment.md
    ├── principles-alignment.md
    ├── proponent-analysis.md
    └── challenger-analysis.md
```

## How a workflow consumes its prompt

Each analysis workflow declares a `PROMPT_FILE` environment variable pointing at its prompt:

```yaml
env:
  PROMPT_FILE: prompts/decisions/architecture-review.md
```

When Claude is wired in (currently the workflows are stubs), that file's contents are passed to `anthropics/claude-code-base-action` as the prompt. The workflow handles I/O — reading the decision JSON, writing the result back — while the prompt defines what Claude should produce.

## Output contract

Each prompt must instruct Claude to produce the four-string section shape defined at `$defs/section` in [`/schemas/decision.json`](../schemas/decision.json):

| Field | Description |
|---|---|
| `finding` | What was observed — the analytical output |
| `impact` | Why it matters — consequence for the proposed change |
| `recommendation` | What the author should do |
| `rationale` | Why the recommendation is the right action |

The `Validate Context` workflow does **not** use a prompt — it's deterministic.

## Current status

All six prompts are **stubs**. They describe the intended role, inputs, task, and output shape, but the task descriptions are placeholders to be authored properly when each workflow is wired to Claude.
