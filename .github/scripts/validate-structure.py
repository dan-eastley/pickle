#!/usr/bin/env python3
"""
Validate the folder/file structure of architectures/.

Asserts these invariants:

  1.  architectures/clients/clients.json exists.
  2.  Every client-id in clients.json has a matching architectures/clients/<id>/ folder.
  3.  Every architectures/clients/<id>/ folder has an entry in clients.json (no orphans).
  4.  Each client folder has client.json and versions.json.
  5.  The client.json's client-id field equals the folder name.
  6.  Every version-id in versions.json has a matching <client>/<version>/ folder.
  7.  Every <client>/<version>/ folder has an entry in versions.json (no orphans).
  8.  Each version folder has version.json, artefacts/, decisions/.
  9.  The version.json's version-id field equals the folder name.
 10.  Under artefacts/domains/, the 5 architecture-domain folders are present
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


def check_clients() -> set[str]:
    """Returns the set of client-ids both declared and present on disk."""
    idx_path = ARCH / "clients" / "clients.json"
    if not idx_path.is_file():
        err(f"Missing index: {idx_path}")
        return set()

    idx = load_json(idx_path)
    declared = {e["client-id"] for e in idx.get("clients", [])}
    present = child_dirs(ARCH / "clients")

    for c in declared - present:
        err(f'clients.json declares "{c}" but no folder architectures/clients/{c}/')
    for c in present - declared:
        err(f"Folder architectures/clients/{c}/ has no entry in clients.json")

    return declared & present


def check_client(client_id: str) -> set[tuple[str, str]]:
    """Returns the set of (client, version) pairs both declared and present."""
    base = ARCH / "clients" / client_id

    client_file = base / "client.json"
    if not client_file.is_file():
        err(f"Missing: {client_file}")
    else:
        data = load_json(client_file)
        if data.get("client-id") != client_id:
            err(
                f'{client_file}: client-id "{data.get("client-id")}" does not '
                f'match folder name "{client_id}"'
            )

    versions_idx_path = base / "versions.json"
    if not versions_idx_path.is_file():
        err(f"Missing index: {versions_idx_path}")
        return set()

    idx = load_json(versions_idx_path)
    declared = {e["version-id"] for e in idx.get("versions", [])}
    # Folders only — client.json and versions.json are files
    present = child_dirs(base)

    for v in declared - present:
        err(f'{versions_idx_path} declares "{v}" but no folder {base}/{v}/')
    for v in present - declared:
        err(f"Folder {base}/{v}/ has no entry in {versions_idx_path}")

    return {(client_id, v) for v in (declared & present)}


def check_version(client_id: str, version_id: str) -> None:
    base = ARCH / "clients" / client_id / version_id

    version_file = base / "version.json"
    if not version_file.is_file():
        err(f"Missing: {version_file}")
    else:
        data = load_json(version_file)
        if data.get("version-id") != version_id:
            err(
                f'{version_file}: version-id "{data.get("version-id")}" does not '
                f'match folder name "{version_id}"'
            )

    # artefacts/domains/<dom>/<layer>/
    artefacts = base / "artefacts"
    if not artefacts.is_dir():
        err(f"Missing: {artefacts}/")
    else:
        domains = artefacts / "domains"
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
        clients = check_clients()
        for c in sorted(clients):
            for client, version in sorted(check_client(c)):
                check_version(client, version)

    if errors:
        print(f"\n{len(errors)} structural violation(s) detected", file=sys.stderr)
        return 1

    print("Structure OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
