#!/usr/bin/env python3
"""Fetch a New York snapshot from OpenFEMA and write the processed dataset.

Usage:
    python3 scripts/fetch_fema_data.py

The script:
1. Pages through Public Assistance Funded Projects Details v2 (NY only)
2. Pages through Public Assistance Applicants v1 (New York)
3. Pages through Disaster Declarations Summaries v2 (NY)
4. Joins applicant names and disaster titles
5. Tags NYC-related records
6. Validates identifiers, money fields, and missing values
7. Writes compact JSON for the dashboard
"""

from __future__ import annotations

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from fema_pipeline import (  # noqa: E402
    SOURCE,
    build_meta,
    build_summary,
    encode_public_snapshot,
    transform_projects,
    validate_snapshot,
    write_json,
)

ROOT = SCRIPT_DIR.parent
PROCESSED_DIR = ROOT / "data" / "processed"
PUBLIC_DATA_DIR = ROOT / "public" / "data"
RAW_DIR = ROOT / "data" / "raw"

PAGE_SIZE = int(os.environ.get("OPENFEMA_PAGE_SIZE", "1000"))
TIMEOUT = 90
MAX_RETRIES = 6
USER_AGENT = (
    "NYC-FEMA-Recovery-Monitor/1.0 "
    "(independent interview prototype; OpenFEMA public data)"
)


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def request_json(session: requests.Session, url: str, params: dict[str, str]) -> dict:
    last_error: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = session.get(url, params=params, timeout=TIMEOUT)
            if response.status_code in {429, 500, 502, 503, 504}:
                raise requests.HTTPError(f"HTTP {response.status_code}", response=response)
            response.raise_for_status()
            return response.json()
        except (requests.RequestException, ValueError) as exc:
            last_error = exc
            wait = min(2 ** attempt, 30)
            print(f"  retry {attempt}/{MAX_RETRIES} after error: {exc} (sleep {wait}s)", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError(f"Failed to fetch {url}") from last_error


def fetch_collection(
    session: requests.Session,
    url: str,
    entity: str,
    extra_filter: str,
    select: str | None = None,
) -> list[dict]:
    """Hash-cursor pagination per OpenFEMA large-data guidance."""
    records: list[dict] = []
    last_hash: str | None = None
    while True:
        filt = extra_filter
        if last_hash:
            filt = f"{extra_filter} and hash gt '{last_hash}'"
        params = {
            "$filter": filt,
            "$orderby": "hash",
            "$top": str(PAGE_SIZE),
            "$metadata": "false",
        }
        if select:
            params["$select"] = select
        payload = request_json(session, url, params)
        if isinstance(payload, list):
            batch = payload
        elif isinstance(payload, dict):
            batch = payload.get(entity)
            if batch is None:
                keys = [k for k in payload.keys() if k != "metadata"]
                batch = payload.get(keys[0], []) if keys else []
        else:
            raise RuntimeError(f"Unexpected payload type: {type(payload)}")
        if not isinstance(batch, list):
            raise RuntimeError(f"Unexpected collection type for {entity}: {type(batch)}")
        if not batch:
            break
        records.extend(batch)
        last_hash = batch[-1].get("hash")
        print(f"  {entity}: {len(records):,} rows", flush=True)
        if len(batch) < PAGE_SIZE:
            break
        if not last_hash:
            raise RuntimeError(f"{entity} page missing hash; cannot continue cursor pagination")
    return records


def main() -> int:
    retrieved_at = utc_now()
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json"})

    print("Checking live OpenFEMA count (no API key)...")
    count_payload = request_json(
        session,
        SOURCE["endpoint"],
        {
            "$filter": "stateAbbreviation eq 'NY'",
            "$count": "true",
            "$top": "1",
            "$select": "gmProjectId",
        },
    )
    api_meta = count_payload.get("metadata") or {}
    api_count = api_meta.get("count")
    api_rundate = api_meta.get("rundate")
    print(f"  OpenFEMA NY count: {api_count}")
    print(f"  OpenFEMA rundate: {api_rundate}")

    print("Fetching Public Assistance Funded Projects Details v2 (NY)...")
    project_select = ",".join(
        [
            "disasterNumber",
            "declarationDate",
            "incidentType",
            "pwNumber",
            "applicationTitle",
            "applicantId",
            "damageCategoryCode",
            "damageCategoryDescrip",
            "projectStatus",
            "projectProcessStep",
            "projectSize",
            "county",
            "stateAbbreviation",
            "projectAmount",
            "federalShareObligated",
            "totalObligated",
            "lastObligationDate",
            "firstObligationDate",
            "gmProjectId",
            "hash",
        ]
    )
    projects = fetch_collection(
        session,
        SOURCE["endpoint"],
        "PublicAssistanceFundedProjectsDetails",
        "stateAbbreviation eq 'NY'",
        select=project_select,
    )
    print(f"Projects retrieved: {len(projects):,}")

    print("Fetching Public Assistance Applicants v1 (New York)...")
    applicants = fetch_collection(
        session,
        SOURCE["applicantsEndpoint"],
        "PublicAssistanceApplicants",
        "state eq 'New York'",
        select="disasterNumber,applicantId,applicantName,city,state,hash",
    )
    print(f"Applicants retrieved: {len(applicants):,}")

    print("Fetching Disaster Declarations Summaries v2 (NY)...")
    declarations = fetch_collection(
        session,
        SOURCE["declarationsEndpoint"],
        "DisasterDeclarationsSummaries",
        "state eq 'NY'",
        select="disasterNumber,declarationTitle,incidentType,declarationDate,femaDeclarationString,declarationType,hash",
    )
    print(f"Declaration rows retrieved: {len(declarations):,}")

    print("Transforming snapshot...")
    transformed = transform_projects(projects, applicants, declarations)
    validation = validate_snapshot(projects, transformed)
    if api_count is not None and int(api_count) != len(projects):
        validation["issues"].append(
            f"OpenFEMA $count was {api_count} but the download contained {len(projects)} NY rows."
        )
        validation["ok"] = False

    source_check = {
        "apiKeyRequired": False,
        "endpoint": SOURCE["endpoint"],
        "page": SOURCE["page"],
        "filter": "stateAbbreviation eq 'NY'",
        "openFemaCount": api_count,
        "openFemaRundate": api_rundate,
        "retrievedRows": len(projects),
        "matchedCount": api_count == len(projects),
    }
    meta = build_meta(validation, retrieved_at, source_check)
    public_snapshot = encode_public_snapshot(transformed, meta)
    summary = build_summary(transformed, meta)

    public_path = PUBLIC_DATA_DIR / "projects.json"
    summary_path = PUBLIC_DATA_DIR / "summary.json"
    validation_path = PROCESSED_DIR / "validation.json"
    meta_path = PROCESSED_DIR / "meta.json"

    print("Writing files...")
    write_json(str(public_path), public_snapshot)
    write_json(str(summary_path), summary)
    write_json(str(PROCESSED_DIR / "summary.json"), summary)
    write_json(str(validation_path), {"retrievedAt": retrieved_at, "sourceCheck": source_check, **validation})
    write_json(str(meta_path), meta)

    print("\n=== Validation report ===")
    print(json.dumps(validation, indent=2, default=str))
    print("sourceCheck", json.dumps(source_check, indent=2))
    print(f"public snapshot bytes: {public_path.stat().st_size:,}")
    if not validation["ok"]:
        print("Validation completed with issues.", file=sys.stderr)
        return 1
    print(f"\nWrote {public_path}")
    print(f"Wrote {summary_path}")
    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
