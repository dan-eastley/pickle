# Prompts

Claude Code prompts that drive the AI-assisted parts of the architecture-as-code pipeline. Each markdown file in this tree is read by exactly one GitHub Actions workflow at runtime and passed verbatim to Claude.

Prompts live in the repo (not in workflow YAML) for three reasons:

- **Visibility** — prompts are governance content, not CI configuration. They should be reviewable in the GitHub UI alongside schemas and architectures.
- **Iteration** — markdown supports rich structure (examples, format hints, tables) without YAML escaping pain.
- **Reviewable diffs** — one file per workflow means each prompt change produces a focused diff.

## Layout

```
config/prompts/
├── README.md           # This file
└── decisions/          # One prompt per workflow in the decision analysis chain
    ├── narrative-validation.md
    ├── architecture-review.md
    ├── referential-integrity.md
    ├── strategy-alignment.md
    ├── principles-alignment.md
    ├── guardrails-alignment.md
    ├── proponent-analysis.md
    └── challenger-analysis.md
```

## How a workflow consumes its prompt

Each analysis workflow declares a `PROMPT_FILE` environment variable pointing at its prompt:

```yaml
env:
  PROMPT_FILE: config/prompts/decisions/architecture-review.md
```

That file's contents are passed to `anthropics/claude-code-base-action` as the prompt. The workflow handles I/O — reading the decision JSON, writing the result back — while the prompt defines what Claude should produce.

## Output contract

Each of the seven analysis prompts must instruct Claude to produce the four-string section shape defined at `$defs/section` in [`/config/schemas/decision.json`](../schemas/decision.json):

| Field | Description |
|---|---|
| `finding` | What was observed — the analytical output (max ~500 characters) |
| `impact` | Why it matters — consequence for the proposed change (max ~500 characters) |
| `recommendation` | What the author should do (max ~500 characters) |
| `rationale` | Why the recommendation is the right action (max ~500 characters) |

Fields should use plain markdown for readability in PR descriptions. The `Validate Context` workflow does **not** use a prompt — it's deterministic.

`narrative-validation.md` is the exception: it writes to the `recommendations` property using `$defs/recommendation` — a single `recommendation` string per entry, with no accept/decline tracking. It is down to the author whether to act on each suggestion.

## Current status

All prompts are **ready for use**. Each has a defined role, inputs, task, output shape, and constraints tailored to the target audience for that architecture domain.
