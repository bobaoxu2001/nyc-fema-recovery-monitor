"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
  loading: boolean;
  error: string | null;
  meta: SnapshotMeta | null;
  summary: PortfolioSummary | null;
  projects: Project[];
};

const EMPTY_KPIS: Kpis = {
  projectCount: 0,
  federalShare: 0,
  applicantCount: 0,
  disasterCount: 0,
  medianProject: null,
  averageProject: null,
  largestProject: null,
  categoryCount: 0,
  flaggedCount: 0,
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

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>({
    loading: true,
    error: null,
    meta: null,
    summary: null,
    projects: [],
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const summaryResponse = await fetch("/data/summary.json");
        if (summaryResponse.ok) {
          const summary = (await summaryResponse.json()) as PortfolioSummary;
          if (!cancelled) {
            setState((current) => ({
              ...current,
              meta: summary.meta,
              summary,
            }));
          }
        }

        const response = await fetch("/data/projects.json");
        if (!response.ok) {
          throw new Error(`Snapshot HTTP ${response.status}`);
        }
        const snapshot = (await response.json()) as Snapshot;
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          meta: snapshot.meta,
          summary: null,
          projects: expandProjects(snapshot),
        });
      } catch (error) {
        if (cancelled) return;
        setState((current) => ({
          ...current,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "The processed OpenFEMA snapshot could not be loaded.",
        }));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return <DataContext.Provider value={state}>{children}</DataContext.Provider>;
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

export function usePortfolio() {
  const { projects, loading, error, meta, summary } = useData();
  const { filters, setFilters, resetFilters } = useFilters();

  const baseFiltered = useMemo(() => {
    const { flag: _flag, ...rest } = filters;
    return applyBaseFilters(projects, rest);
  }, [projects, filters]);

  const signals: PortfolioSignals = useMemo(
    () => computeSignals(baseFiltered),
    [baseFiltered],
  );

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

  const usingSummary = loading && Boolean(summary) && isDefaultPortfolio(filters);
  const summarySlice =
    filters.geography === "nyc" ? summary?.nyc : summary?.allNy;

  const kpis: Kpis = usingSummary && summarySlice
    ? { ...EMPTY_KPIS, ...summarySlice, flaggedCount: 0 }
    : liveKpis;
  const byDisaster: NamedTotal[] = usingSummary && summarySlice ? summarySlice.byDisaster : liveByDisaster;
  const byApplicant: NamedTotal[] = usingSummary && summarySlice ? summarySlice.byApplicant : liveByApplicant;
  const byCategory: NamedTotal[] = usingSummary && summarySlice ? summarySlice.byCategory : liveByCategory;

  return {
    loading: loading && !usingSummary,
    hydrating: loading,
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
  };
}
