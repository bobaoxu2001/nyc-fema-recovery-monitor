export const NYC_REASON_LABELS: Record<string, string> = {
  borough_county:
    "County is one of the five boroughs (Bronx, Kings, New York, Queens, or Richmond).",
  applicant_city:
    "Applicant city is New York, Manhattan, Bronx, Brooklyn, Queens, or Staten Island.",
  applicant_name:
    "Applicant name matches a documented NYC-related entity pattern.",
};

export type NycKind = "city_entity" | "public_authority" | "geographic";

const CITY_ENTITY_RE =
  /CITY OF NEW YORK|NEW YORK CITY HOUSING|NYCHA|HEALTH AND HOSPITALS|NYC HEALTH|FIRE DEPARTMENT OF THE CITY OF NEW YORK|POLICE DEPARTMENT OF THE CITY OF NEW YORK|SCHOOL CONSTRUCTION AUTHORITY|NEW YORK CITY DEPARTMENT|NYC DEPARTMENT|BOARD OF EDUCATION OF THE CITY OF NEW YORK|DEPARTMENT OF EDUCATION OF THE CITY OF NEW YORK|DEPARTMENT OF SANITATION OF NEW YORK|NEW YORK, CITY OF|NEW YORK \/ /i;

const PUBLIC_AUTHORITY_RE =
  /PORT AUTHORITY OF NEW YORK|PORT AUTHORITY OF NY|METROPOLITAN TRANSPORTATION AUTHORITY|\bMTA\b|NEW YORK CITY TRANSIT|NYC TRANSIT|MTA BUS/i;

export function nycKind(applicantName: string, reasons: string[]): NycKind | null {
  if (!reasons.length) return null;
  const name = applicantName || "";
  if (PUBLIC_AUTHORITY_RE.test(name)) return "public_authority";
  if (CITY_ENTITY_RE.test(name) || /\bNYC\b/.test(name.toUpperCase())) return "city_entity";
  return "geographic";
}

export function nycKindLabel(kind: NycKind | null): string {
  if (kind === "city_entity") return "City-related name match";
  if (kind === "public_authority") return "Regional / public authority";
  if (kind === "geographic") return "NYC geographic match";
  return "Not NYC-related";
}

export function nycReasonText(reasons: string[]): string {
  if (!reasons.length) return "Not tagged as NYC-related under this prototype's rules.";
  return reasons.map((reason) => NYC_REASON_LABELS[reason] || reason).join(" ");
}

export function nycReasonDetails(project: {
  nycReasons: string[];
  county: string;
  applicantCity: string | null;
  applicantNameRaw?: string;
  applicantName: string;
}): string[] {
  const lines: string[] = [];
  if (project.nycReasons.includes("borough_county")) {
    lines.push(`County = ${project.county || "borough county"}`);
  }
  if (project.nycReasons.includes("applicant_city")) {
    lines.push(
      project.applicantCity
        ? `Applicant city = ${project.applicantCity}`
        : "Applicant city matched the NYC city rule in the joined source row",
    );
  }
  if (project.nycReasons.includes("applicant_name")) {
    lines.push("Applicant name matched a documented NYC-related pattern");
  }
  return lines;
}
