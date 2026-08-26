"use client";

import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { FilterBar } from "@/components/filter-bar";
import { ProjectTable } from "@/components/project-table";
import { usePortfolio } from "@/components/providers";
import { ScopeBar } from "@/components/scope-bar";
import { WorksheetGate } from "@/components/worksheet-gate";
import { formatCount } from "@/lib/format";

function ProjectsBody() {
  const { filtered, signals, kpis } = usePortfolio();
  return (
    <div className="space-y-4">
      <DisclaimerBanner compact />
      <ScopeBar />
      <FilterBar />
      <p className="text-sm text-ink-soft">
        {formatCount(kpis.projectCount)} worksheets in the selected portfolio.
        Sort, search, export, or open a row for the review workflow.
      </p>
      <ProjectTable projects={filtered} flagsById={signals.flagsById} />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <WorksheetGate label="Loading project worksheets">
      <ProjectsBody />
    </WorksheetGate>
  );
}
