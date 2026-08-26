#!/usr/bin/env python3
"""Recompute summary flagged counts and join quality from the compact snapshot.

Does not call the OpenFEMA API.
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from fema_pipeline import attach_flag_counts, write_json  # noqa: E402

ROOT = SCRIPT_DIR.parent
PUBLIC = ROOT / "public" / "data"
PROCESSED = ROOT / "data" / "processed"


def compact_rows(snapshot: dict) -> list[dict]:
    fields = snapshot["fields"]
    idx = {name: i for i, name in enumerate(fields)}
    applicants = snapshot["applicants"]
    nyc = snapshot.get("nyc") or {}
    missing = snapshot.get("missing") or {}
    duplicates = snapshot.get("duplicates") or {}
    rows = []
    for raw in snapshot["projects"]:
        gm = raw[idx["gm"]]
        row_id = str(gm) if gm is not None else ""
        applicant = applicants[raw[idx["a"]]]
        rows.append(
            {
                "id": row_id,
                "gm": gm,
                "d": raw[idx["d"]],
                "fs": raw[idx["fs"]],
                "a": raw[idx["a"]],
                "cat": raw[idx["cat"]],
                "nyc": 1 if row_id in nyc else 0,
                "mf": missing.get(row_id) or [],
                "dg": duplicates.get(row_id),
                "applicantName": applicant.get("name"),
                "applicantId": applicant.get("applicantId"),
            }
        )
    return rows


def join_quality(snapshot: dict, rows: list[dict]) -> dict:
    disasters = snapshot["disasters"]
    applicants = snapshot["applicants"]
    unknown_names = sum(1 for row in rows if row.get("applicantName") == "Unknown applicant")
    matched_names = len(rows) - unknown_names
    unknown_titles = sum(1 for item in disasters if str(item.get("title") or "").startswith("Disaster "))
    return {
        "applicantJoinKey": "disasterNumber + applicantId",
        "applicantJoinMatched": matched_names,
        "applicantJoinTotal": len(rows),
        "disasterTitleJoinKey": "disasterNumber",
        "disasterTitleMatched": len(disasters) - unknown_titles,
        "disasterTitleTotal": len(disasters),
        "missingGmProjectId": sum(1 for row in rows if row.get("gm") in (None, "")),
        "missingFederalShare": sum(1 for row in rows if row.get("fs") is None),
        "distinctApplicantId": len({item.get("applicantId") for item in applicants}),
        "distinctApplicantName": len({item.get("name") for item in applicants}),
        "applicantCountDefinition": (
            "Distinct OpenFEMA applicantId values in the New York snapshot. "
            "This is not a legal-entity count. The same organization can appear "
            "under more than one ID or name spelling."
        ),
    }


def main() -> int:
    snapshot = json.loads((PUBLIC / "projects.json").read_text(encoding="utf-8"))
    summary_path = PUBLIC / "summary.json"
    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    rows = compact_rows(snapshot)
    nyc_rows = [row for row in rows if row.get("nyc") == 1]
    summary["allNy"] = attach_flag_counts(summary["allNy"], rows)
    summary["nyc"] = attach_flag_counts(summary["nyc"], nyc_rows)
    quality = join_quality(snapshot, rows)
    summary["meta"]["joinQuality"] = quality
    summary["meta"]["applicantCountDefinition"] = quality["applicantCountDefinition"]
    write_json(str(summary_path), summary)
    write_json(str(PROCESSED / "summary.json"), summary)
    print("allNy flagged", summary["allNy"]["flaggedCount"])
    print("nyc flagged", summary["nyc"]["flaggedCount"])
    print("joinQuality", json.dumps(quality, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
