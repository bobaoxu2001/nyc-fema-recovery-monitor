"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CANONICAL_SUMMARY } from "@/lib/canonical";
import { expandProjects } from "@/lib/expand";
import { applyBaseFilters } from "@/lib/filters";
import {
  computeKpis,
  computeSignals,
  totalsByApplicant,
  totalsByCategory,
  totalsByDisaster,
} from "@/lib/flags";
import {
  DEFAULT_FILTERS,
  type Filters,
  type Kpis,
  type NamedTotal,
  type PortfolioSignals,
  type PortfolioSummary,
  type Project,
  type Snapshot,
  type SnapshotMeta,
} from "@/lib/types";

type DataState = {
  worksheetsStatus: "idle" | "loading" | "ready" | "error";
  error: string | null;
  meta: SnapshotMeta;
  summary: PortfolioSummary;
  projects: Project[];
  loadWorksheets: () => void;
};

const DataContext = createContext<DataState | null>(null);
const FilterContext = createContext<{
  filters: Filters;
  setFilters: (patch: Partial<Filters>) => void;
  resetFilters: () => void;
} | null>(null);

function isDefaultPortfolio(filters: Filters): boolean {
  return (
    filters.disaster === "all" &&
    filters.applicant === "all" &&
    filters.category === "all" &&
    filters.year === "all" &&
    filters.amount === "all" &&
    filters.flag === "all" &&
    filters.search.trim() === ""
  );
}

export function DataProvider({
  children,
  initialSummary = CANONICAL_SUMMARY,
}: {
  children: ReactNode;
  initialSummary?: PortfolioSummary;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [worksheetsStatus, setWorksheetsStatus] = useState<DataState["worksheetsStatus"]>("idle");
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const loadWorksheets = useCallback(() => {
    if (started.current) return;
    started.current = true;
    setWorksheetsStatus("loading");
    fetch("/data/projects.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Snapshot HTTP ${response.status}`);
        return response.json() as Promise<Snapshot>;
      })
      .then((snapshot) => {
        setProjects(expandProjects(snapshot));
        setWorksheetsStatus("ready");
        setError(null);
      })
      .catch((err: unknown) => {
        started.current = false;
        setWorksheetsStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : "The processed OpenFEMA snapshot could not be loaded.",
        );
      });
  }, []);

  const value = useMemo<DataState>(
    () => ({
      worksheetsStatus,
      error,
      meta: initialSummary.meta,
      summary: initialSummary,
      projects,
      loadWorksheets,
    }),
    [worksheetsStatus, error, initialSummary, projects, loadWorksheets],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS);
  const setFilters = useCallback((patch: Partial<Filters>) => {
    setFiltersState((current) => ({ ...current, ...patch }));
  }, []);
  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);
  const value = useMemo(
    () => ({ filters, setFilters, resetFilters }),
    [filters, setFilters, resetFilters],
  );
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used within FilterProvider");
  return ctx;
}

export function useWorksheets() {
  const { loadWorksheets, worksheetsStatus } = useData();
  useEffect(() => {
    loadWorksheets();
  }, [loadWorksheets]);
  return worksheetsStatus;
}

export function usePortfolio() {
  const { projects, worksheetsStatus, error, meta, summary } = useData();
  const { filters, setFilters, resetFilters } = useFilters();
  const ready = worksheetsStatus === "ready";

  const geographyUniverse = useMemo(() => {
    if (!ready) return [];
    return applyBaseFilters(projects, {
      ...DEFAULT_FILTERS,
      geography: filters.geography,
    });
  }, [projects, ready, filters.geography]);

  const signals: PortfolioSignals = useMemo(
    () =>
      computeSignals(
        geographyUniverse,
        filters.geography === "nyc"
          ? "the NYC-related analytical universe"
          : "the All New York universe",
      ),
    [geographyUniverse, filters.geography],
  );

  const baseFiltered = useMemo(() => {
    const { flag: _flag, ...rest } = filters;
    return applyBaseFilters(projects, rest);
  }, [projects, filters]);

  const filtered = useMemo(() => {
    if (filters.flag === "all") return baseFiltered;
    return baseFiltered.filter((project) => {
      const flagged = (signals.flagsById[project.id]?.length ?? 0) > 0;
      return filters.flag === "flagged" ? flagged : !flagged;
    });
  }, [baseFiltered, filters.flag, signals.flagsById]);

  const liveKpis = useMemo(
    () => computeKpis(filtered, signals.flagsById),
    [filtered, signals.flagsById],
  );
  const liveByDisaster = useMemo(() => totalsByDisaster(filtered), [filtered]);
  const liveByApplicant = useMemo(() => totalsByApplicant(filtered, 15), [filtered]);
  const liveByCategory = useMemo(() => totalsByCategory(filtered), [filtered]);

  const summarySlice = filters.geography === "nyc" ? summary.nyc : summary.allNy;
  const disasterRow =
    filters.disaster === "all"
      ? null
      : summarySlice.byDisaster.find((row) => row.key === filters.disaster) || null;

  const usingSummary = !ready && isDefaultPortfolio(filters);
  const usingSummaryDisaster =
    !ready && filters.disaster !== "all" && isDefaultPortfolio({ ...filters, disaster: "all" });

  let kpis: Kpis;
  let byDisaster: NamedTotal[];
  let byApplicant: NamedTotal[];
  let byCategory: NamedTotal[];

  if (usingSummary) {
    kpis = {
      projectCount: summarySlice.projectCount,
      federalShare: summarySlice.federalShare,
      applicantCount: summarySlice.applicantCount,
      disasterCount: summarySlice.disasterCount,
      medianProject: summarySlice.medianProject,
      averageProject: summarySlice.averageProject,
      largestProject: summarySlice.largestProject,
      categoryCount: summarySlice.categoryCount,
      flaggedCount: summarySlice.flaggedCount,
    };
    byDisaster = summarySlice.byDisaster;
    byApplicant = summarySlice.byApplicant;
    byCategory = summarySlice.byCategory;
  } else if (usingSummaryDisaster && disasterRow) {
    kpis = {
      projectCount: disasterRow.projects,
      federalShare: disasterRow.federalShare,
      applicantCount: disasterRow.applicantCount ?? null,
      disasterCount: 1,
      medianProject: null,
      averageProject: null,
      largestProject: null,
      categoryCount: null,
      flaggedCount: disasterRow.flaggedCount ?? null,
    };
    byDisaster = summarySlice.byDisaster;
    byApplicant = [];
    byCategory = [];
  } else if (ready) {
    kpis = liveKpis;
    byDisaster = liveByDisaster;
    byApplicant = liveByApplicant;
    byCategory = liveByCategory;
  } else {
    kpis = {
      projectCount: summarySlice.projectCount,
      federalShare: summarySlice.federalShare,
      applicantCount: summarySlice.applicantCount,
      disasterCount: summarySlice.disasterCount,
      medianProject: summarySlice.medianProject,
      averageProject: summarySlice.averageProject,
      largestProject: summarySlice.largestProject,
      categoryCount: summarySlice.categoryCount,
      flaggedCount: summarySlice.flaggedCount,
    };
    byDisaster = summarySlice.byDisaster;
    byApplicant = summarySlice.byApplicant;
    byCategory = summarySlice.byCategory;
  }

  return {
    loading: worksheetsStatus === "loading",
    hydrating: worksheetsStatus === "loading",
    ready,
    error,
    meta,
    allProjects: projects,
    filtered,
    baseFiltered,
    filters,
    setFilters,
    resetFilters,
    signals,
    kpis,
    byDisaster,
    byApplicant,
    byCategory,
    summary,
    summaryMode: !ready,
  };
}
