import type { CompactProject, Disaster, Project, Snapshot } from "./types";

export function expandProjects(snapshot: Snapshot): Project[] {
  const disasterByNumber = new Map<number, Disaster>();
  for (const disaster of snapshot.disasters) {
    disasterByNumber.set(disaster.disasterNumber, disaster);
  }

  return snapshot.projects.map((row) => expandProject(row, snapshot, disasterByNumber));
}

export function expandProject(
  row: CompactProject,
  snapshot: Snapshot,
  disasterByNumber?: Map<number, Disaster>,
): Project {
  const applicant = snapshot.applicants[row.a];
  const disaster = disasterByNumber?.get(row.d) ?? snapshot.disasters.find((item) => item.disasterNumber === row.d);
  const declarationDate = row.dd ?? disaster?.declarationDate ?? null;
  return {
    id: row.id,
    gmProjectId: row.gm,
    disasterNumber: row.d,
    disasterTitle: disaster?.title || `${row.it || "Disaster"} ${row.d}`,
    femaDeclarationString: disaster?.femaDeclarationString || `DR-${row.d}`,
    pwNumber: row.pw,
    title: row.t,
    applicantId: applicant?.applicantId || "",
    applicantName: applicant?.name || "Unknown applicant",
    applicantCity: applicant?.city ?? null,
    categoryCode: row.cc,
    category: row.cat || row.cc || "Unspecified",
    status: row.st,
    processStep: row.ps,
    size: row.sz,
    county: row.co,
    projectAmount: row.pa,
    federalShare: row.fs,
    totalObligated: row.to,
    declarationDate,
    declarationYear: declarationDate ? Number(declarationDate.slice(0, 4)) || null : disaster?.year ?? null,
    firstObligationDate: row.fo,
    lastObligationDate: row.lo,
    incidentType: row.it || disaster?.incidentType || "",
    nycRelated: row.nyc === 1,
    nycReasons: row.nr || [],
    duplicateGroup: row.dg,
    missingFields: row.mf || [],
  };
}

export function projectDisplayId(project: Pick<Project, "femaDeclarationString" | "pwNumber" | "gmProjectId" | "id">): string {
  if (project.gmProjectId != null && project.gmProjectId !== "") {
    return String(project.gmProjectId);
  }
  if (project.pwNumber != null) {
    return `${project.femaDeclarationString || "PA"}-PW-${project.pwNumber}`;
  }
  return project.id.slice(0, 12);
}
