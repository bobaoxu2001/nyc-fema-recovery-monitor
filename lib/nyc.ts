export const NYC_REASON_LABELS: Record<string, string> = {
  borough_county:
    "County is one of the five boroughs (Bronx, Kings, New York, Queens, or Richmond).",
  applicant_city:
    "Applicant city is New York, Manhattan, Bronx, Brooklyn, Queens, or Staten Island.",
  applicant_name:
    "Applicant name matches a documented NYC entity pattern (for example City of New York, NYCHA, MTA New York City Transit).",
};

export function nycReasonText(reasons: string[]): string {
  if (!reasons.length) return "Not tagged as NYC-related under this prototype's rules.";
  return reasons.map((reason) => NYC_REASON_LABELS[reason] || reason).join(" ");
}
