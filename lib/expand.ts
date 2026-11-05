import { displayApplicantName } from "./display-name";
import type {
  CompactProject,
  Disaster,
  Project,
  ProjectRow,
  Snapshot,
  SnapshotLookups,
} from "./types";

const DEFAULT_FIELDS = [
  "gm",
  "d",
  "pw",
  "t",
  "a",
  "cc",
  "cat",
  "st",
  "ps",
  "sz",
  "co",
  "pa",
  "fs",
  "to",
  "dd",
  "fo",
  "lo",
  "it",
] as const;

function lookupText(
  table: string[] | undefined,
  value: string | number | null | undefined,
): string {
  if (typeof value === "number" && table) {
    return table[value] ?? "";
  }
  if (typeof value === "string") return value;
  return "";
}

function rowToCompact(
  row: CompactProject | ProjectRow,
  fields: string[],
): CompactProject {
  if (!Array.isArray(row)) return row;
  const obj: Record<string, unknown> = {};
  fields.forEach((field, index) => {
    obj[field] = row[index];
  });
  return obj as CompactProject;
}

export function expandProjects(snapshot: Snapshot): Project[] {
  const disasterByNumber = new Map<number, Disaster>();
  for (const disaster of snapshot.disasters) {
    disasterByNumber.set(disaster.disasterNumber, disaster);
  }
  const fields = snapshot.fields ?? [...DEFAULT_FIELDS];
  return snapshot.projects.map((row) =>
    expandProject(rowToCompact(row, fields), snapshot, disasterByNumber),
  );
}

export function expandProject(
  row: CompactProject,
  snapshot: Snapshot,
  disasterByNumber?: Map<number, Disaster>,
): Project {
  const lookups: SnapshotLookups | undefined = snapshot.lookups;
  const applicant = snapshot.applicants[row.a];
  const disaster =
    disasterByNumber?.get(row.d) ??
    snapshot.disasters.find((item) => item.disasterNumber === row.d);
  const declarationDate = row.dd ?? disaster?.declarationDate ?? null;
  const gm = row.gm;
  const id = row.id || (gm != null && gm !== "" ? String(gm) : `${row.d}-${row.pw}-${row.a}`);
  const category = lookupText(lookups?.cat, row.cat) || lookupText(lookups?.cc, row.cc) || "Unspecified";
  const categoryCode = lookupText(lookups?.cc, row.cc);
  const sourceApplicantName =
    (row.an !== undefined ? lookupText(lookups?.an, row.an) : "") ||
    applicant?.name ||
    "Unknown applicant";
  const sourceApplicantCity =
    row.ac !== undefined
      ? lookupText(lookups?.ac, row.ac) || null
      : applicant?.city ?? null;
  const nycReasons = snapshot.nyc?.[id] || row.nr || [];
  return {
    id,
    gmProjectId: gm,
    disasterNumber: row.d,
    disasterTitle: disaster?.title || `${lookupText(lookups?.it, row.it) || "Disaster"} ${row.d}`,
    femaDeclarationString: disaster?.femaDeclarationString || `DR-${row.d}`,
    pwNumber: row.pw,
    title: row.t,
    applicantId: applicant?.applicantId || "",
    applicantName: displayApplicantName(applicant?.name || "Unknown applicant"),
    applicantNameRaw: sourceApplicantName,
    applicantCity: sourceApplicantCity,
    applicantSourceScoped: row.an !== undefined || row.ac !== undefined,
    categoryCode,
    category,
    status: lookupText(lookups?.st, row.st),
    processStep: lookupText(lookups?.ps, row.ps),
    size: lookupText(lookups?.sz, row.sz),
    county: lookupText(lookups?.co, row.co),
    projectAmount: row.pa,
    federalShare: row.fs,
    totalObligated: row.to,
    declarationDate,
    declarationYear: declarationDate
      ? Number(declarationDate.slice(0, 4)) || null
      : disaster?.year ?? null,
    firstObligationDate: row.fo,
    lastObligationDate: row.lo,
    incidentType: lookupText(lookups?.it, row.it) || disaster?.incidentType || "",
    nycRelated: nycReasons.length > 0 || row.nyc === 1,
    nycReasons,
    duplicateGroup: snapshot.duplicates?.[id] ?? row.dg ?? null,
    missingFields: snapshot.missing?.[id] || row.mf || [],
  };
}

export function projectDisplayId(
  project: Pick<Project, "femaDeclarationString" | "pwNumber" | "gmProjectId" | "id">,
): string {
  if (project.gmProjectId != null && project.gmProjectId !== "") {
    return String(project.gmProjectId);
  }
  if (project.pwNumber != null) {
    return `${project.femaDeclarationString || "PA"}-PW-${project.pwNumber}`;
  }
  return project.id.slice(0, 12);
}
