import { median } from "./stats";
import { percentile } from "./stats";
import type {
  ConcentrationRow,
  FlagCode,
  Kpis,
  NamedTotal,
  PortfolioSignals,
  Project,
  ProjectFlag,
} from "./types";

const FLAG_META: Record<FlagCode, Omit<ProjectFlag, "reason">> = {
  high_dollar: {
    code: "high_dollar",
    label: "High-dollar project",
    suggestedReview:
      "Confirm the project scope, cost estimate, and that the federal share is consistent with the documented work.",
  },
  extreme_outlier: {
    code: "extreme_outlier",
    label: "Extreme amount outlier",
    suggestedReview:
      "Review why this project is far above typical amounts in the selected portfolio, including whether it is a bundled or statewide worksheet.",
  },
  missing_fields: {
    code: "missing_fields",
    label: "Missing project information",
    suggestedReview:
      "Fill or verify the missing fields in the source system before using the record in a management report.",
  },
  negative_obligation: {
    code: "negative_obligation",
    label: "Negative federal obligation",
    suggestedReview:
      "Check whether this is a deobligation, version adjustment, or data issue, and document the net funding position.",
  },
  duplicate_looking: {
    code: "duplicate_looking",
    label: "Potential duplicate-looking record",
    suggestedReview:
      "Compare worksheets with the same applicant, disaster, title, and similar federal share. They may be valid versions, not duplicates.",
  },
};

const APPLICANT_CONCENTRATION = 0.1;
const CATEGORY_CONCENTRATION = 0.25;

export function flagDefinitions(): Array<{
  code: FlagCode;
  label: string;
  method: string;
}> {
  return [
    {
      code: "high_dollar",
      label: FLAG_META.high_dollar.label,
      method:
        "Federal share is at or above the 95th percentile of projects with a positive federal share in the currently filtered portfolio. Percentile flags are applied only when at least 20 positive-amount projects are in the selection.",
    },
    {
      code: "extreme_outlier",
      label: FLAG_META.extreme_outlier.label,
      method:
        "Federal share is at or above the 99th percentile of projects with a positive federal share in the currently filtered portfolio.",
    },
    {
      code: "missing_fields",
      label: FLAG_META.missing_fields.label,
      method:
        "The record is missing one or more fields used in this monitor: applicant name, disaster, work category, project title, or federal share.",
    },
    {
      code: "negative_obligation",
      label: FLAG_META.negative_obligation.label,
      method:
        "Federal share obligated is negative. OpenFEMA notes that negative amounts can reflect deobligations or adjustments. This is a monitoring flag, not a finding.",
    },
    {
      code: "duplicate_looking",
      label: FLAG_META.duplicate_looking.label,
      method:
        "Another New York record shares the same disaster, applicant, normalized project title, and federal share rounded to the nearest $100. These are not confirmed duplicates.",
    },
  ];
}

function sumFederal(projects: Project[]): number {
  return projects.reduce((sum, project) => sum + (project.federalShare ?? 0), 0);
}

function groupTotals(
  projects: Project[],
  keyFn: (project: Project) => string,
  nameFn: (project: Project) => string,
  total: number,
  threshold: number,
): ConcentrationRow[] {
  const map = new Map<string, { name: string; federalShare: number; projects: number }>();
  for (const project of projects) {
    const key = keyFn(project);
    const current = map.get(key) || { name: nameFn(project), federalShare: 0, projects: 0 };
    current.federalShare += project.federalShare ?? 0;
    current.projects += 1;
    map.set(key, current);
  }
  const rows: ConcentrationRow[] = [...map.entries()]
    .map(([key, value]) => ({
      key,
      name: value.name,
      federalShare: value.federalShare,
      projects: value.projects,
      share: total === 0 ? 0 : value.federalShare / total,
      concentrated: total !== 0 && value.federalShare / total >= threshold,
    }))
    .sort((a, b) => b.federalShare - a.federalShare);
  return rows;
}

export function computeSignals(projects: Project[]): PortfolioSignals {
  const positive = projects
    .map((project) => project.federalShare)
    .filter((value): value is number => typeof value === "number" && value > 0);
  const enoughForPercentiles = positive.length >= 20;
  const p95 = enoughForPercentiles ? percentile(positive, 0.95) : null;
  const p99 = enoughForPercentiles ? percentile(positive, 0.99) : null;
  const flagsById: Record<string, ProjectFlag[]> = {};

  const addFlag = (id: string, flag: ProjectFlag) => {
    if (!flagsById[id]) flagsById[id] = [];
    flagsById[id].push(flag);
  };

  for (const project of projects) {
    const amount = project.federalShare;
    if (typeof amount === "number" && amount < 0) {
      addFlag(project.id, {
        ...FLAG_META.negative_obligation,
        reason: `Federal share obligated is ${amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}. Negative amounts may be deobligations or adjustments.`,
      });
    }
    if (project.missingFields.length > 0) {
      addFlag(project.id, {
        ...FLAG_META.missing_fields,
        reason: `Missing ${project.missingFields.join(", ")}.`,
      });
    }
    if (project.duplicateGroup) {
      addFlag(project.id, {
        ...FLAG_META.duplicate_looking,
        reason:
          "Another record has the same disaster, applicant, similar title, and federal share rounded to the nearest $100.",
      });
    }
    if (typeof amount === "number" && amount > 0 && p95 != null && amount >= p95) {
      addFlag(project.id, {
        ...FLAG_META.high_dollar,
        reason: `Federal share is at or above the 95th percentile of the selected portfolio (${p95.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}).`,
      });
    }
    if (typeof amount === "number" && amount > 0 && p99 != null && amount >= p99) {
      addFlag(project.id, {
        ...FLAG_META.extreme_outlier,
        reason: `Federal share is at or above the 99th percentile of the selected portfolio (${p99.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}).`,
      });
    }
  }

  const total = sumFederal(projects);
  return {
    flagsById,
    highDollarThreshold: p95,
    extremeThreshold: p99,
    p95,
    p99,
    applicantConcentration: groupTotals(
      projects,
      (project) => project.applicantId,
      (project) => project.applicantName,
      total,
      APPLICANT_CONCENTRATION,
    ),
    categoryConcentration: groupTotals(
      projects,
      (project) => project.category || "Unspecified",
      (project) => project.category || "Unspecified",
      total,
      CATEGORY_CONCENTRATION,
    ),
  };
}

export function projectIsFlagged(
  project: Project,
  flagsById: Record<string, ProjectFlag[]>,
): boolean {
  return (flagsById[project.id]?.length ?? 0) > 0;
}

export function computeKpis(
  projects: Project[],
  flagsById: Record<string, ProjectFlag[]>,
): Kpis {
  const amounts = projects
    .map((project) => project.federalShare)
    .filter((value): value is number => typeof value === "number");
  const applicants = new Set(projects.map((project) => project.applicantId));
  const disasters = new Set(projects.map((project) => project.disasterNumber));
  const categories = new Set(
    projects.map((project) => project.category).filter((value) => value),
  );
  return {
    projectCount: projects.length,
    federalShare: amounts.reduce((sum, value) => sum + value, 0),
    applicantCount: applicants.size,
    disasterCount: disasters.size,
    medianProject: median(amounts),
    averageProject: amounts.length ? amounts.reduce((sum, value) => sum + value, 0) / amounts.length : null,
    largestProject: amounts.length ? Math.max(...amounts) : null,
    categoryCount: categories.size,
    flaggedCount: projects.filter((project) => projectIsFlagged(project, flagsById)).length,
  };
}

export function totalsByDisaster(projects: Project[]): NamedTotal[] {
  const total = sumFederal(projects);
  const map = new Map<string, NamedTotal>();
  for (const project of projects) {
    const key = String(project.disasterNumber);
    const current = map.get(key) || {
      key,
      name: `${project.femaDeclarationString}: ${project.disasterTitle}`,
      projects: 0,
      federalShare: 0,
      share: 0,
    };
    current.projects += 1;
    current.federalShare += project.federalShare ?? 0;
    map.set(key, current);
  }
  return [...map.values()]
    .map((row) => ({ ...row, share: total === 0 ? 0 : row.federalShare / total }))
    .sort((a, b) => b.federalShare - a.federalShare);
}

export function totalsByApplicant(projects: Project[], limit = 15): NamedTotal[] {
  const total = sumFederal(projects);
  const map = new Map<string, NamedTotal>();
  for (const project of projects) {
    const key = project.applicantId;
    const current = map.get(key) || {
      key,
      name: project.applicantName,
      projects: 0,
      federalShare: 0,
      share: 0,
    };
    current.projects += 1;
    current.federalShare += project.federalShare ?? 0;
    map.set(key, current);
  }
  return [...map.values()]
    .map((row) => ({ ...row, share: total === 0 ? 0 : row.federalShare / total }))
    .sort((a, b) => b.federalShare - a.federalShare)
    .slice(0, limit);
}

export function totalsByCategory(projects: Project[]): NamedTotal[] {
  const total = sumFederal(projects);
  const map = new Map<string, NamedTotal>();
  for (const project of projects) {
    const key = project.category || "Unspecified";
    const current = map.get(key) || {
      key,
      name: key,
      projects: 0,
      federalShare: 0,
      share: 0,
    };
    current.projects += 1;
    current.federalShare += project.federalShare ?? 0;
    map.set(key, current);
  }
  return [...map.values()]
    .map((row) => ({ ...row, share: total === 0 ? 0 : row.federalShare / total }))
    .sort((a, b) => b.federalShare - a.federalShare);
}

export function flaggedProjects(
  projects: Project[],
  flagsById: Record<string, ProjectFlag[]>,
): Array<Project & { flags: ProjectFlag[] }> {
  return projects
    .map((project) => ({ ...project, flags: flagsById[project.id] || [] }))
    .filter((project) => project.flags.length > 0)
    .sort((a, b) => (b.federalShare ?? 0) - (a.federalShare ?? 0));
}
