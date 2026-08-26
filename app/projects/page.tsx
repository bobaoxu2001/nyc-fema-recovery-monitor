"use client";

import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { FilterBar } from "@/components/filter-bar";
import { ProjectTable } from "@/components/project-table";
import { usePortfolio } from "@/components/providers";
import { ErrorState, LoadingState } from "@/components/status-panels";

export default function ProjectsPage() {
  const { loading, hydrating, error, filtered, signals, kpis } = usePortfolio();

  if (loading || hydrating) {
    return <LoadingState label="Loading project worksheets" />;
  }
  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <DisclaimerBanner compact />
      <FilterBar />
      <p className="text-sm text-ink-soft">
        {kpis.projectCount.toLocaleString()} worksheets in the selected portfolio.
        Sort, search, export, or open a row for the illustrative review checklist.
      </p>
      <ProjectTable projects={filtered} flagsById={signals.flagsById} />
    </div>
  );
}
