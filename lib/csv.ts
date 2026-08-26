import { projectDisplayId } from "./expand";
import type { Project, ProjectFlag } from "./types";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function projectsToCsv(
  projects: Project[],
  flagsById: Record<string, ProjectFlag[]>,
): string {
  const header = [
    "record_id",
    "gm_project_id",
    "pw_number",
    "project_title",
    "applicant_id",
    "applicant_name",
    "disaster_number",
    "disaster_title",
    "work_category",
    "county",
    "federal_share_obligated",
    "project_amount",
    "total_obligated",
    "declaration_date",
    "nyc_related",
    "review_flags",
  ];
  const lines = [header.join(",")];
  for (const project of projects) {
    const flags = (flagsById[project.id] || []).map((flag) => flag.label).join("; ");
    const row = [
      projectDisplayId(project),
      project.gmProjectId == null ? "" : String(project.gmProjectId),
      project.pwNumber == null ? "" : String(project.pwNumber),
      project.title,
      project.applicantId,
      project.applicantName,
      String(project.disasterNumber),
      project.disasterTitle,
      project.category,
      project.county,
      project.federalShare == null ? "" : String(project.federalShare),
      project.projectAmount == null ? "" : String(project.projectAmount),
      project.totalObligated == null ? "" : String(project.totalObligated),
      project.declarationDate || "",
      project.nycRelated ? "yes" : "no",
      flags,
    ];
    lines.push(row.map((value) => csvEscape(value)).join(","));
  }
  return lines.join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
