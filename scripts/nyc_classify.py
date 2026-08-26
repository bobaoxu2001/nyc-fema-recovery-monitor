"""Conservative NYC-related tagging for OpenFEMA Public Assistance records.

NYC city agencies are often recorded with county = "Statewide" in OpenFEMA.
Borough-county matching alone therefore undercounts NYC activity.

Rules are intentionally narrow. They do not claim that a record is a City of
New York grant, only that it is reasonably NYC-related for screening.
"""

from __future__ import annotations

import re
from typing import Any, Iterable

BOROUGH_COUNTIES = {
    "bronx county",
    "kings county",
    "new york county",
    "queens county",
    "richmond county",
}

NYC_CITIES = {
    "new york",
    "manhattan",
    "bronx",
    "brooklyn",
    "staten island",
    "queens",
}

# Whole-string / phrase matches against uppercased applicant names.
# Keep this list explicit and document it in the methodology page.
NYC_NAME_PHRASES = (
    "CITY OF NEW YORK",
    "NEW YORK CITY",
    "NYC ",
    " NYC",
    "NYC-",
    "NYCHA",
    "NEW YORK CITY HOUSING AUTHORITY",
    "HOUSING AUTHORITY OF THE CITY OF NEW YORK",
    "METROPOLITAN TRANSPORTATION AUTHORITY",
    "MTA NEW YORK CITY TRANSIT",
    "NEW YORK CITY TRANSIT",
    "NYC TRANSIT",
    "MTA BUS",
    "FIRE DEPARTMENT OF THE CITY OF NEW YORK",
    "POLICE DEPARTMENT OF THE CITY OF NEW YORK",
    "CITY UNIVERSITY OF NEW YORK",
    "CUNY",
    "NYC HEALTH",
    "NEW YORK CITY HEALTH",
    "HEALTH AND HOSPITALS CORPORATION",
    "NYC HEALTH + HOSPITALS",
    "NEW YORK CITY SCHOOL CONSTRUCTION AUTHORITY",
    "SCHOOL CONSTRUCTION AUTHORITY",
    "DEPARTMENT OF SANITATION OF NEW YORK",
    "NEW YORK CITY DEPARTMENT",
    "NYC DEPARTMENT",
    "BOARD OF EDUCATION OF THE CITY OF NEW YORK",
    "DEPARTMENT OF EDUCATION OF THE CITY OF NEW YORK",
    "NEW YORK CITY BOARD OF EDUCATION",
    "PORT AUTHORITY OF NEW YORK",
    "PORT AUTHORITY OF NY",
    "NEW YORK PUBLIC LIBRARY",
    "BROOKLYN PUBLIC LIBRARY",
    "QUEENS PUBLIC LIBRARY",
    "QUEENS BOROUGH PUBLIC LIBRARY",
)

# Regex for standalone NYC token (avoids matching "NYC" inside unrelated words).
NYC_TOKEN_RE = re.compile(r"(?:^|[^A-Z0-9])NYC(?:[^A-Z0-9]|$)", re.I)


def _norm(value: Any) -> str:
    if value is None:
        return ""
    return " ".join(str(value).strip().lower().split())


def classify_nyc(
    *,
    county: Any = None,
    applicant_name: Any = None,
    applicant_city: Any = None,
) -> list[str]:
    """Return reason codes if the record is NYC-related, else an empty list."""
    reasons: list[str] = []
    county_n = _norm(county)
    city_n = _norm(applicant_city)
    name = str(applicant_name or "").upper()

    if county_n in BOROUGH_COUNTIES:
        reasons.append("borough_county")

    if city_n in NYC_CITIES:
        reasons.append("applicant_city")

    if any(phrase in name for phrase in NYC_NAME_PHRASES) or NYC_TOKEN_RE.search(name):
        reasons.append("applicant_name")

    # de-dupe while preserving order
    seen: set[str] = set()
    ordered: list[str] = []
    for reason in reasons:
        if reason not in seen:
            seen.add(reason)
            ordered.append(reason)
    return ordered


def is_nyc_related(reasons: Iterable[str]) -> bool:
    return any(True for _ in reasons)
