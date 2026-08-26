import type { AmountFilter, Filters, Project } from "./types";

function inAmountBucket(amount: number | null, bucket: AmountFilter): boolean {
  if (bucket === "all") return true;
  if (amount == null) return false;
  const abs = Math.abs(amount);
  if (bucket === "lt100k") return abs < 100_000;
  if (bucket === "100k-1m") return abs >= 100_000 && abs < 1_000_000;
  if (bucket === "1m-10m") return abs >= 1_000_000 && abs < 10_000_000;
  if (bucket === "10mplus") return abs >= 10_000_000;
  return true;
}

function matchesSearch(project: Project, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    project.title,
    project.applicantName,
    project.disasterTitle,
    project.femaDeclarationString,
    project.category,
    project.categoryCode,
    project.county,
    project.applicantId,
    String(project.disasterNumber),
    project.pwNumber != null ? String(project.pwNumber) : "",
    project.gmProjectId != null ? String(project.gmProjectId) : "",
    project.id,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function applyBaseFilters(
  projects: Project[],
  filters: Omit<Filters, "flag" | "search"> & { search?: string },
): Project[] {
  return projects.filter((project) => {
    if (filters.geography === "nyc" && !project.nycRelated) return false;
    if (filters.disaster !== "all" && String(project.disasterNumber) !== filters.disaster) return false;
    if (filters.applicant !== "all" && project.applicantId !== filters.applicant) return false;
    if (filters.category !== "all" && project.category !== filters.category) return false;
    if (filters.year !== "all" && String(project.declarationYear) !== filters.year) return false;
    if (!inAmountBucket(project.federalShare, filters.amount)) return false;
    if (filters.search && !matchesSearch(project, filters.search)) return false;
    return true;
  });
}

export function uniqueSorted(values: Array<string | number | null | undefined>): string[] {
  const set = new Set<string>();
  for (const value of values) {
    if (value == null || value === "") continue;
    set.add(String(value));
  }
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}
