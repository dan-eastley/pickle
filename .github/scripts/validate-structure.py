#!/usr/bin/env python3
"""
Validate the folder/file structure of architectures/.

Asserts these invariants:

  1.  architectures/architectures.json exists.
  2.  Every architecture-id in architectures.json has a matching architectures/<id>/ folder.
  3.  Every architectures/<id>/ folder has an entry in architectures.json (no orphans).
  4.  Each architecture folder has architecture.json and transitions.json.
  5.  The architecture.json's architecture-id field equals the folder name.
  6.  Every transition-id in transitions.json has a matching <architecture>/<transition>/ folder.
  7.  Every <architecture>/<transition>/ folder has an entry in transitions.json (no orphans).
  8.  Each transition folder has transition.json, domains/, decisions/.
  9.  The transition.json's transition-id field equals the folder name.
 10.  Under domains/, the 5 architecture-domain folders are present
      (business, data, integration, application, solution) and each contains
      the 3 abstraction-layer folders (conceptual, logical, physical).
 11.  Under decisions/, decisions.json exists.
 12.  Every decision-id in decisions.json has a matching <id>/decision.json.
 13.  Every <id>/ folder under decisions/ has an entry in decisions.json (no orphans).

Exits non-zero with GitHub Actions error annotations if any check fails.
"""

from __future__ import annotations

import json
import pathlib
import sys

ARCH = pathlib.Path("architectures")

EXPECTED_DOMAINS = {"business", "data", "integration", "application", "solution"}
EXPECTED_LAYERS = {"conceptual", "logical", "physical"}

errors: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)
    print(f"::error::{msg}")


def load_json(path: pathlib.Path) -> dict:
    try:
        return json.loads(path.read_text())
    except Exception as e:
        err(f"Failed to parse {path}: {e}")
        return {}


def child_dirs(parent: pathlib.Path) -> set[str]:
    return {p.name for p in parent.iterdir() if p.is_dir()}


def check_architectures() -> set[str]:
    """Returns the set of architecture-ids both declared and present on disk."""
    idx_path = ARCH / "architectures.json"
    if not idx_path.is_file():
        err(f"Missing index: {idx_path}")
        return set()

    idx = load_json(idx_path)
    declared = {e["architecture-id"] for e in idx.get("architectures", [])}
    present = child_dirs(ARCH)

    for c in declared - present:
        err(f'architectures.json declares "{c}" but no folder architectures/{c}/')
    for c in present - declared:
        err(f"Folder architectures/{c}/ has no entry in architectures.json")

    return declared & present


def check_architecture(arch_id: str) -> set[tuple[str, str]]:
    """Returns the set of (architecture, transition) pairs both declared and present."""
    base = ARCH / arch_id

    arch_file = base / "architecture.json"
    if not arch_file.is_file():
        err(f"Missing: {arch_file}")
    else:
        data = load_json(arch_file)
        if data.get("architecture-id") != arch_id:
            err(
                f'{arch_file}: architecture-id "{data.get("architecture-id")}" does not '
                f'match folder name "{arch_id}"'
            )

    transitions_idx_path = base / "transitions.json"
    if not transitions_idx_path.is_file():
        err(f"Missing index: {transitions_idx_path}")
        return set()

    idx = load_json(transitions_idx_path)
    declared = {e["transition-id"] for e in idx.get("transitions", [])}
    # Folders only — architecture.json and transitions.json are files
    present = child_dirs(base)

    for v in declared - present:
        err(f'{transitions_idx_path} declares "{v}" but no folder {base}/{v}/')
    for v in present - declared:
        err(f"Folder {base}/{v}/ has no entry in {transitions_idx_path}")

    return {(arch_id, v) for v in (declared & present)}


def check_transition(arch_id: str, transition_id: str) -> None:
    base = ARCH / arch_id / transition_id

    transition_file = base / "transition.json"
    if not transition_file.is_file():
        err(f"Missing: {transition_file}")
    else:
        data = load_json(transition_file)
        if data.get("transition-id") != transition_id:
            err(
                f'{transition_file}: transition-id "{data.get("transition-id")}" does not '
                f'match folder name "{transition_id}"'
            )

    # domains/<dom>/<layer>/
    domains = base / "domains"
    if not domains.is_dir():
        err(f"Missing: {domains}/")
    else:
        present_doms = child_dirs(domains)
        for d in EXPECTED_DOMAINS - present_doms:
            err(f"Missing architecture-domain folder: {domains}/{d}/")
        for d in present_doms - EXPECTED_DOMAINS:
            err(f"Unexpected folder under {domains}/: {d}/")

        for d in present_doms & EXPECTED_DOMAINS:
            layer_dir = domains / d
            present_layers = child_dirs(layer_dir)
            for layer in EXPECTED_LAYERS - present_layers:
                err(f"Missing abstraction-layer folder: {layer_dir}/{layer}/")
            for layer in present_layers - EXPECTED_LAYERS:
                err(f"Unexpected folder under {layer_dir}/: {layer}/")

    # decisions/
    decisions = base / "decisions"
    if not decisions.is_dir():
        err(f"Missing: {decisions}/")
        return

    idx_path = decisions / "decisions.json"
    if not idx_path.is_file():
        err(f"Missing index: {idx_path}")
        return

    idx = load_json(idx_path)
    declared = {e["decision-id"] for e in idx.get("decisions", [])}
    present = child_dirs(decisions)

    for did in declared - present:
        err(f'{idx_path} declares "{did}" but no folder {decisions}/{did}/')
    for did in present - declared:
        err(f"Folder {decisions}/{did}/ has no entry in {idx_path}")

    for did in declared & present:
        dec_file = decisions / did / "decision.json"
        if not dec_file.is_file():
            err(f"Missing: {dec_file}")


def main() -> int:
    if not ARCH.is_dir():
        err(f"Missing root folder: {ARCH}/")
    else:
        architectures = check_architectures()
        for c in sorted(architectures):
            for arch, transition in sorted(check_architecture(c)):
                check_transition(arch, transition)

    if errors:
        print(f"\n{len(errors)} structural violation(s) detected", file=sys.stderr)
        return 1

    print("Structure OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
