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
    label: "High-dollar worksheet",
    suggestedReview: "Confirm worksheet context and supporting cost documentation.",
  },
  extreme_outlier: {
    code: "extreme_outlier",
    label: "Extreme amount",
    suggestedReview:
      "Confirm why this amount is far above typical worksheets in the same disaster, including whether the work is bundled.",
  },
  missing_fields: {
    code: "missing_fields",
    label: "Missing worksheet information",
    suggestedReview: "Determine whether the information exists in internal grant records.",
  },
  negative_obligation: {
    code: "negative_obligation",
    label: "Negative federal obligation",
    suggestedReview:
      "Review whether the amount reflects an amendment, adjustment, or deobligation.",
  },
  duplicate_looking: {
    code: "duplicate_looking",
    label: "Potential duplicate-looking record",
    suggestedReview: "Compare worksheet identifiers and underlying supporting documentation.",
  },
};

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
        "Federal share is at or above the 95th percentile and below the 99th percentile of positive-amount worksheets in the same disaster within the selected All New York or NYC-related universe. Applied only when that cohort has at least 20 positive-amount worksheets. Other filters do not change the baseline. This flag is not stacked with Extreme.",
    },
    {
      code: "extreme_outlier",
      label: FLAG_META.extreme_outlier.label,
      method:
        "Federal share is at or above the 99th percentile of positive-amount worksheets in the same disaster within the selected All New York or NYC-related universe. Applied only when that cohort has at least 20 positive-amount worksheets. Other filters do not change the baseline.",
    },
    {
      code: "missing_fields",
      label: FLAG_META.missing_fields.label,
      method: "One or more fields used by this monitor are missing.",
    },
    {
      code: "negative_obligation",
      label: FLAG_META.negative_obligation.label,
      method:
        "The public record contains a negative federal share, which may reflect an adjustment or deobligation.",
    },
    {
      code: "duplicate_looking",
      label: FLAG_META.duplicate_looking.label,
      method:
        "Another record has similar identifying attributes. Manual review may be useful. These are not confirmed duplicates.",
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
): ConcentrationRow[] {
  const map = new Map<string, { name: string; federalShare: number; projects: number }>();
  for (const project of projects) {
    const key = keyFn(project);
    const current = map.get(key) || { name: nameFn(project), federalShare: 0, projects: 0 };
    current.federalShare += project.federalShare ?? 0;
    current.projects += 1;
    map.set(key, current);
  }
  const total = sumFederal(projects);
  return [...map.entries()]
    .map(([key, value]) => ({
      key,
      name: value.name,
      federalShare: value.federalShare,
      projects: value.projects,
      share: total === 0 ? 0 : value.federalShare / total,
      concentrated: false,
    }))
    .sort((a, b) => b.federalShare - a.federalShare);
}

function usd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function computeSignals(
  universe: Project[],
  cohortLabel = "the selected geography universe",
): PortfolioSignals {
  const flagsById: Record<string, ProjectFlag[]> = {};
  const addFlag = (id: string, flag: ProjectFlag) => {
    if (!flagsById[id]) flagsById[id] = [];
    flagsById[id].push(flag);
  };

  const byDisaster = new Map<number, Project[]>();
  for (const project of universe) {
    const list = byDisaster.get(project.disasterNumber) || [];
    list.push(project);
    byDisaster.set(project.disasterNumber, list);
  }

  for (const [, cohort] of byDisaster) {
    const positive = cohort
      .map((project) => project.federalShare)
      .filter((value): value is number => typeof value === "number" && value > 0);
    const p95 = positive.length >= 20 ? percentile(positive, 0.95) : null;
    const p99 = positive.length >= 20 ? percentile(positive, 0.99) : null;
    const disasterName = cohort[0]?.femaDeclarationString || `Disaster ${cohort[0]?.disasterNumber}`;

    for (const project of cohort) {
      const amount = project.federalShare;
      if (typeof amount === "number" && amount < 0) {
        addFlag(project.id, {
          ...FLAG_META.negative_obligation,
          reason: `The public record contains a negative federal share (${usd(amount)}), which may reflect an adjustment or deobligation.`,
        });
      }
      if (project.missingFields.length > 0) {
        addFlag(project.id, {
          ...FLAG_META.missing_fields,
          reason: `One or more fields used by this monitor are missing: ${project.missingFields.join(", ")}.`,
        });
      }
      if (project.duplicateGroup) {
        addFlag(project.id, {
          ...FLAG_META.duplicate_looking,
          reason: "Another record has similar identifying attributes. Manual review may be useful.",
        });
      }
      if (typeof amount === "number" && amount > 0 && p99 != null && amount >= p99) {
        addFlag(project.id, {
          ...FLAG_META.extreme_outlier,
          reason: `Federal share is at or above the 99th percentile of ${disasterName} worksheets in ${cohortLabel} (${usd(p99)}). Other page filters do not change this baseline.`,
        });
      } else if (typeof amount === "number" && amount > 0 && p95 != null && amount >= p95) {
        addFlag(project.id, {
          ...FLAG_META.high_dollar,
          reason: `Federal share is in the 95th–99th percentile of ${disasterName} worksheets in ${cohortLabel} (threshold ${usd(p95)}). Other page filters do not change this baseline.`,
        });
      }
    }
  }

  return {
    flagsById,
    highDollarThreshold: null,
    extremeThreshold: null,
    p95: null,
    p99: null,
    applicantConcentration: groupTotals(
      universe,
      (project) => project.applicantId,
      (project) => project.applicantName,
    ),
    categoryConcentration: groupTotals(
      universe,
      (project) => project.category || "Unspecified",
      (project) => project.category || "Unspecified",
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
