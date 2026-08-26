"""Transform, validate, and compact OpenFEMA Public Assistance snapshots.

Grain: one row = one obligated Public Assistance project worksheet from
PublicAssistanceFundedProjectsDetails v2.

Primary dollar metric: federalShareObligated (federal share obligated).
Do not use Grant Award Activities for portfolio totals — that dataset can
contain multiple obligation events per project.
"""

from __future__ import annotations

import json
import math
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import Any, Iterable

from nyc_classify import classify_nyc

SOURCE = {
    "dataset": "PublicAssistanceFundedProjectsDetails",
    "version": 2,
    "endpoint": "https://www.fema.gov/api/open/v2/PublicAssistanceFundedProjectsDetails",
    "page": "https://www.fema.gov/openfema-data-page/public-assistance-funded-projects-details-v2",
    "applicantsDataset": "PublicAssistanceApplicants",
    "applicantsVersion": 1,
    "applicantsEndpoint": "https://www.fema.gov/api/open/v1/PublicAssistanceApplicants",
    "declarationsDataset": "DisasterDeclarationsSummaries",
    "declarationsVersion": 2,
    "declarationsEndpoint": "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries",
}

REQUIRED_PROJECT_FIELDS = (
    "disasterNumber",
    "applicantId",
    "federalShareObligated",
    "projectAmount",
    "damageCategoryCode",
    "damageCategoryDescrip",
    "stateAbbreviation",
)

TITLE_NORM_RE = re.compile(r"[^a-z0-9]+")


def parse_number(value: Any) -> float | None:
    if value is None or value == "":
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
            return None
        return float(value)
    text = str(value).strip().replace(",", "")
    if not text:
        return None
    try:
        number = float(text)
    except ValueError:
        return None
    if math.isnan(number) or math.isinf(number):
        return None
    return number


def parse_date(value: Any) -> str | None:
    if not value:
        return None
    text = str(value).strip()
    if not text:
        return None
    return text[:10]


def year_from_date(value: str | None) -> int | None:
    if not value or len(value) < 4:
        return None
    try:
        return int(value[:4])
    except ValueError:
        return None


def normalize_title(value: Any) -> str:
    text = TITLE_NORM_RE.sub(" ", str(value or "").lower()).strip()
    return " ".join(text.split())


def round_money_bucket(amount: float | None, bucket: int = 100) -> int | None:
    if amount is None:
        return None
    return int(round(amount / bucket) * bucket)


def build_applicant_lookup(applicants: Iterable[dict[str, Any]]) -> dict[tuple[int, str], dict[str, Any]]:
    lookup: dict[tuple[int, str], dict[str, Any]] = {}
    for row in applicants:
        disaster = row.get("disasterNumber")
        applicant_id = row.get("applicantId")
        if disaster is None or not applicant_id:
            continue
        lookup[(int(disaster), str(applicant_id))] = row
    return lookup


def build_disaster_lookup(declarations: Iterable[dict[str, Any]]) -> dict[int, dict[str, Any]]:
    lookup: dict[int, dict[str, Any]] = {}
    for row in declarations:
        number = row.get("disasterNumber")
        if number is None:
            continue
        number = int(number)
        current = lookup.get(number)
        title = (row.get("declarationTitle") or "").strip()
        if current is None:
            lookup[number] = {
                "disasterNumber": number,
                "title": title or f"Disaster {number}",
                "incidentType": row.get("incidentType") or "",
                "declarationDate": parse_date(row.get("declarationDate")),
                "femaDeclarationString": row.get("femaDeclarationString") or "",
                "declarationType": row.get("declarationType") or "",
            }
            continue
        # Prefer a row that has a title / FEMS declaration string.
        if not current.get("femaDeclarationString") and row.get("femaDeclarationString"):
            current["femaDeclarationString"] = row.get("femaDeclarationString")
        if current.get("title", "").startswith("Disaster ") and title:
            current["title"] = title
        if not current.get("incidentType") and row.get("incidentType"):
            current["incidentType"] = row.get("incidentType")
        if not current.get("declarationDate") and row.get("declarationDate"):
            current["declarationDate"] = parse_date(row.get("declarationDate"))
    return lookup


def choose_project_identifier(projects: list[dict[str, Any]]) -> dict[str, Any]:
    n = len(projects)
    gm_ids = [row.get("gmProjectId") for row in projects]
    gm_non_null = [g for g in gm_ids if g is not None and g != ""]
    gm_unique = len(set(gm_non_null))
    pair_keys = [
        (row.get("disasterNumber"), row.get("pwNumber"), row.get("applicantId"))
        for row in projects
    ]
    pair_unique = len(set(pair_keys))
    hashes = [row.get("hash") for row in projects]
    hash_unique = len(set(h for h in hashes if h))

    # Prefer gmProjectId when it uniquely identifies every row.
    if len(gm_non_null) == n and gm_unique == n:
        identifier = "gmProjectId"
        aggregation = "one_row_per_project_worksheet"
        note = (
            "gmProjectId is present and unique for every New York row. "
            "Portfolio totals sum federalShareObligated across rows without collapsing."
        )
    elif pair_unique == n:
        identifier = "disasterNumber+pwNumber+applicantId"
        aggregation = "one_row_per_project_worksheet"
        note = (
            "gmProjectId is not unique or complete; disasterNumber + pwNumber + applicantId "
            "uniquely identifies each row. Totals sum federalShareObligated across rows."
        )
    else:
        identifier = "hash"
        aggregation = "one_row_per_openfema_record"
        note = (
            "No complete unique project key besides the OpenFEMA record hash. "
            "Totals sum federalShareObligated across records. Review duplicate-looking flags."
        )

    return {
        "rowCount": n,
        "gmProjectIdNonNull": len(gm_non_null),
        "gmProjectIdUnique": gm_unique,
        "disasterPwApplicantUnique": pair_unique,
        "hashUnique": hash_unique,
        "identifier": identifier,
        "aggregation": aggregation,
        "note": note,
        "safeToSumFederalShare": True,
    }


def missing_critical_fields(row: dict[str, Any], applicant_name: str | None) -> list[str]:
    missing: list[str] = []
    if row.get("disasterNumber") in (None, ""):
        missing.append("disasterNumber")
    applicant_id = row.get("applicantId")
    if applicant_id is None or str(applicant_id).strip() == "":
        missing.append("applicantId")
    if not (applicant_name or "").strip() or applicant_name == "Unknown applicant":
        missing.append("applicantName")
    if not (row.get("applicationTitle") or "").strip():
        missing.append("applicationTitle")
    if not (row.get("damageCategoryDescrip") or row.get("damageCategoryCode")):
        missing.append("workCategory")
    if parse_number(row.get("federalShareObligated")) is None:
        missing.append("federalShareObligated")
    return missing


def duplicate_group_key(row: dict[str, Any]) -> tuple[Any, ...]:
    amount = parse_number(row.get("federalShareObligated"))
    return (
        row.get("disasterNumber"),
        row.get("applicantId"),
        normalize_title(row.get("applicationTitle")),
        round_money_bucket(amount, 100),
    )


def attach_duplicate_groups(rows: list[dict[str, Any]]) -> dict[str, int]:
    groups: dict[tuple[Any, ...], list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        key = duplicate_group_key(row)
        # Skip empty titles — they would over-flag missing-title records.
        if not key[2]:
            row["duplicateGroup"] = None
            continue
        groups[key].append(row)

    flagged = 0
    for key, members in groups.items():
        if len(members) < 2:
            for member in members:
                member["duplicateGroup"] = None
            continue
        group_id = "dg-" + "-".join(str(part) for part in key if part is not None)[:80]
        for member in members:
            member["duplicateGroup"] = group_id
            flagged += 1
    return {"groups": sum(1 for members in groups.values() if len(members) >= 2), "records": flagged}


def transform_projects(
    raw_projects: list[dict[str, Any]],
    applicants: list[dict[str, Any]],
    declarations: list[dict[str, Any]],
) -> dict[str, Any]:
    applicant_lookup = build_applicant_lookup(applicants)
    disaster_lookup = build_disaster_lookup(declarations)
    identity = choose_project_identifier(raw_projects)

    working: list[dict[str, Any]] = []
    for row in raw_projects:
        disaster_number = row.get("disasterNumber")
        applicant_id = str(row.get("applicantId") or "")
        applicant_row = applicant_lookup.get((int(disaster_number), applicant_id)) if disaster_number is not None else None
        applicant_name = None
        applicant_city = None
        if applicant_row:
            applicant_name = (applicant_row.get("applicantName") or "").strip() or None
            applicant_city = (applicant_row.get("city") or "").strip() or None
        if not applicant_name:
            applicant_name = "Unknown applicant"

        disaster_meta = disaster_lookup.get(int(disaster_number)) if disaster_number is not None else None
        declaration_date = parse_date(row.get("declarationDate")) or (
            disaster_meta.get("declarationDate") if disaster_meta else None
        )
        title = (row.get("applicationTitle") or "").strip() or "Untitled project"
        county = (row.get("county") or "").strip()
        nyc_reasons = classify_nyc(
            county=county,
            applicant_name=applicant_name,
            applicant_city=applicant_city,
        )
        federal_share = parse_number(row.get("federalShareObligated"))
        project_amount = parse_number(row.get("projectAmount"))
        total_obligated = parse_number(row.get("totalObligated"))

        working.append(
            {
                **row,
                "applicantName": applicant_name,
                "applicantCity": applicant_city,
                "disasterTitle": (disaster_meta or {}).get("title")
                or f"{row.get('incidentType') or 'Disaster'} {disaster_number}",
                "femaDeclarationString": (disaster_meta or {}).get("femaDeclarationString")
                or (f"DR-{disaster_number}" if disaster_number else ""),
                "declarationDate": declaration_date,
                "declarationYear": year_from_date(declaration_date),
                "title": title,
                "county": county,
                "nycReasons": nyc_reasons,
                "nycRelated": bool(nyc_reasons),
                "federalShare": federal_share,
                "projectAmount": project_amount,
                "totalObligated": total_obligated,
                "missingFields": missing_critical_fields(row, applicant_name),
            }
        )

    dup_stats = attach_duplicate_groups(working)

    applicant_index: dict[str, int] = {}
    applicants_out: list[dict[str, Any]] = []
    disasters_out_map: dict[int, dict[str, Any]] = {}
    compact_projects: list[dict[str, Any]] = []

    for row in working:
        aid = str(row.get("applicantId") or "")
        if aid not in applicant_index:
            applicant_index[aid] = len(applicants_out)
            applicants_out.append(
                {
                    "applicantId": aid,
                    "name": row["applicantName"],
                    "city": row.get("applicantCity"),
                }
            )
        else:
            # Prefer a known name over Unknown if a later disaster has a join hit.
            existing = applicants_out[applicant_index[aid]]
            if existing["name"] == "Unknown applicant" and row["applicantName"] != "Unknown applicant":
                existing["name"] = row["applicantName"]
                existing["city"] = row.get("applicantCity")

        dnum = int(row["disasterNumber"]) if row.get("disasterNumber") is not None else -1
        if dnum not in disasters_out_map:
            disasters_out_map[dnum] = {
                "disasterNumber": dnum,
                "title": row["disasterTitle"],
                "incidentType": row.get("incidentType") or "",
                "declarationDate": row.get("declarationDate"),
                "year": row.get("declarationYear"),
                "femaDeclarationString": row.get("femaDeclarationString") or "",
            }

        record_id = str(row.get("hash") or f"{dnum}-{row.get('pwNumber')}-{aid}")
        compact_projects.append(
            {
                "id": record_id,
                "gm": row.get("gmProjectId"),
                "d": dnum,
                "pw": row.get("pwNumber"),
                "t": row["title"],
                "a": applicant_index[aid],
                "cc": row.get("damageCategoryCode") or "",
                "cat": row.get("damageCategoryDescrip") or "",
                "st": row.get("projectStatus") or "",
                "ps": row.get("projectProcessStep") or "",
                "sz": row.get("projectSize") or "",
                "co": row.get("county") or "",
                "pa": row.get("projectAmount"),
                "fs": row.get("federalShare"),
                "to": row.get("totalObligated"),
                "dd": row.get("declarationDate"),
                "fo": parse_date(row.get("firstObligationDate")),
                "lo": parse_date(row.get("lastObligationDate")),
                "it": row.get("incidentType") or "",
                "nyc": 1 if row["nycRelated"] else 0,
                "nr": row["nycReasons"],
                "dg": row.get("duplicateGroup"),
                "mf": row.get("missingFields") or [],
            }
        )

    disasters_out = [disasters_out_map[k] for k in sorted(disasters_out_map.keys())]
    return {
        "identity": identity,
        "applicants": applicants_out,
        "disasters": disasters_out,
        "projects": compact_projects,
        "working": working,
        "duplicateStats": dup_stats,
    }


def percentile(values: list[float], p: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    if len(ordered) == 1:
        return ordered[0]
    rank = (len(ordered) - 1) * p
    low = math.floor(rank)
    high = math.ceil(rank)
    if low == high:
        return ordered[low]
    weight = rank - low
    return ordered[low] * (1 - weight) + ordered[high] * weight


def validate_snapshot(
    raw_projects: list[dict[str, Any]],
    transformed: dict[str, Any],
) -> dict[str, Any]:
    projects = transformed["projects"]
    identity = transformed["identity"]
    issues: list[str] = []

    if not raw_projects:
        issues.append("API returned zero New York project records.")

    for field in REQUIRED_PROJECT_FIELDS:
        if raw_projects and field not in raw_projects[0]:
            issues.append(f"Required field missing from API payload: {field}")

    federal_values = [p["fs"] for p in projects if p["fs"] is not None]
    project_amounts = [p["pa"] for p in projects if p["pa"] is not None]
    negative_federal = sum(1 for v in federal_values if v < 0)
    unparsable_federal = sum(1 for row in raw_projects if parse_number(row.get("federalShareObligated")) is None)
    missing_applicant = sum(1 for p in projects if not p.get("mf") is None and "applicantName" in (p.get("mf") or []))
    nyc_count = sum(1 for p in projects if p["nyc"] == 1)
    unknown_disaster = sum(1 for d in transformed["disasters"] if str(d.get("title", "")).startswith("Disaster "))

    # Hash uniqueness
    ids = [p["id"] for p in projects]
    if len(ids) != len(set(ids)):
        issues.append("Processed record ids are not unique.")

    if identity["rowCount"] != len(projects):
        issues.append("Transformed row count does not match raw row count.")

    amounts = [v for v in federal_values if v > 0]
    report = {
        "ok": len(issues) == 0,
        "issues": issues,
        "recordCount": len(projects),
        "applicantCount": len(transformed["applicants"]),
        "disasterCount": len(transformed["disasters"]),
        "nycRelatedCount": nyc_count,
        "federalShare": {
            "sum": round(sum(federal_values), 2) if federal_values else 0,
            "nullOrUnparsable": unparsable_federal,
            "negative": negative_federal,
            "zero": sum(1 for v in federal_values if v == 0),
            "median": percentile(federal_values, 0.5),
            "p95": percentile(amounts, 0.95),
            "p99": percentile(amounts, 0.99),
            "mean": (sum(federal_values) / len(federal_values)) if federal_values else None,
            "max": max(federal_values) if federal_values else None,
        },
        "projectAmount": {
            "nullOrUnparsable": sum(1 for row in raw_projects if parse_number(row.get("projectAmount")) is None),
            "negative": sum(1 for v in project_amounts if v < 0),
        },
        "missing": {
            "applicantName": missing_applicant,
            "workCategory": sum(1 for p in projects if "workCategory" in (p.get("mf") or [])),
            "applicationTitle": sum(1 for p in projects if "applicationTitle" in (p.get("mf") or [])),
            "federalShareObligated": sum(1 for p in projects if "federalShareObligated" in (p.get("mf") or [])),
        },
        "duplicateLooking": transformed["duplicateStats"],
        "unknownDisasterTitleCount": unknown_disaster,
        "identity": identity,
        "topCounties": Counter(p["co"] or "Unknown" for p in projects).most_common(12),
        "topCategories": Counter(p["cat"] or "Unknown" for p in projects).most_common(12),
        "nycReasons": Counter(reason for p in projects for reason in p.get("nr") or []),
    }
    return report


def build_meta(validation: dict[str, Any], retrieved_at: str) -> dict[str, Any]:
    return {
        "title": "NYC FEMA Public Assistance Recovery Monitor",
        "retrievedAt": retrieved_at,
        "geography": "New York State",
        "geographyNote": (
            "The snapshot includes all OpenFEMA Public Assistance funded projects with "
            "stateAbbreviation = NY. NYC-related is an analyst-constructed subset based on "
            "five-borough county, applicant city, and documented NYC entity name patterns. "
            "It is not an official FEMA or City of New York classification."
        ),
        "source": SOURCE,
        "identifier": validation["identity"],
        "disclaimer": (
            "This application is an independent analytical prototype created for educational "
            "and interview demonstration purposes. It is not affiliated with FEMA, NYC OMB, "
            "New York State, or the City of New York."
        ),
        "flagDisclaimer": (
            "Analytical flags are screening indicators only and do not represent findings of "
            "non-compliance, fraud, grant ineligibility, or improper expenditure."
        ),
        "recordCount": validation["recordCount"],
        "nycRelatedCount": validation["nycRelatedCount"],
        "applicantCount": validation["applicantCount"],
        "disasterCount": validation["disasterCount"],
        "federalShareSum": validation["federalShare"]["sum"],
    }


def write_json(path: str, payload: Any) -> None:
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, separators=(",", ":"))
        handle.write("\n")
