#!/usr/bin/env bash
# Shared helper invoked by every decision-* workflow.
# Reads $BRANCH, $WORKFLOW_NAME, $SECTION_KEY from the environment, writes
# a stub object to the named section of the decision JSON, commits back.
set -euo pipefail

if [[ -z "${BRANCH:-}" || -z "${SECTION_KEY:-}" || -z "${WORKFLOW_NAME:-}" ]]; then
  echo "::error::Missing required env vars (BRANCH, SECTION_KEY, WORKFLOW_NAME)"
  exit 1
fi

python3 - "$BRANCH" "$SECTION_KEY" "$WORKFLOW_NAME" <<'PYEOF'
import json
import pathlib
import sys
from datetime import datetime, timezone

branch, section_key, workflow_name = sys.argv[1], sys.argv[2], sys.argv[3]

parts = branch.split('/')
if len(parts) != 4 or parts[0] != 'decisions':
    print(f"::error::Unexpected branch name: {branch}")
    sys.exit(1)
_, client_id, version_id, decision_id = parts

decision_path = pathlib.Path(
    f"architectures/{client_id}/{version_id}/decisions/{decision_id}.json"
)
if not decision_path.exists():
    print(f"::error::Decision file not found at {decision_path}.")
    print("The author must create the decision JSON with id, title, status, "
          "and narrative when starting the branch.")
    sys.exit(1)

with open(decision_path) as fh:
    decision = json.load(fh)

decision[section_key] = {
    "status": "stub",
    "workflow": workflow_name,
    "ran-at": datetime.now(timezone.utc).isoformat(timespec='seconds'),
    "note": f"Stub for {workflow_name}. Real logic to be implemented."
}

with open(decision_path, 'w') as fh:
    json.dump(decision, fh, indent=4, ensure_ascii=False)
    fh.write('\n')

print(f"Wrote stub to '{section_key}' in {decision_path}")
PYEOF

# Commit if anything changed.
DECISION_FILE_PATH=$(python3 - "$BRANCH" <<'PYEOF'
import sys
parts = sys.argv[1].split('/')
print(f"architectures/{parts[1]}/{parts[2]}/decisions/{parts[3]}.json")
PYEOF
)

git add "$DECISION_FILE_PATH"
if git diff --cached --quiet; then
  echo "::notice::No changes to decision file; nothing to commit."
  exit 0
fi

git commit -m "[${WORKFLOW_NAME}] Update ${DECISION_FILE_PATH}"
git push origin "$BRANCH"
echo "::notice::Pushed ${SECTION_KEY} stub to ${BRANCH}."
