"use client";

import { ApplicantTable } from "@/components/applicant-table";
import { CategoryChart } from "@/components/category-chart";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { DisasterChart } from "@/components/disaster-chart";
import { FilterBar } from "@/components/filter-bar";
import { KpiGrid } from "@/components/kpi-grid";
import { ProjectTable } from "@/components/project-table";
import { usePortfolio } from "@/components/providers";
import { ScopeBar } from "@/components/scope-bar";
import { ErrorState, LoadingState } from "@/components/status-panels";
import { canonicalMeta } from "@/lib/canonical";
import { formatProvenanceCount, formatProvenanceUsd } from "@/lib/format";
import Link from "next/link";

export default function OverviewPage() {
  const {
    hydrating,
    error,
    meta,
    kpis,
    byDisaster,
    byApplicant,
    byCategory,
    filtered,
    signals,
    filters,
  } = usePortfolio();
  const proven = canonicalMeta(meta);
  const universe =
    filters.geography === "nyc"
      ? "NYC-related analytical subset"
      : "New York State Public Assistance";

  if (error && !proven.recordCount) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <DisclaimerBanner compact />
      <section className="panel p-4">
        <p className="kicker">What this screen shows</p>
        <h2 className="mt-1 font-serif text-xl text-navy">{universe}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          Public OpenFEMA project worksheets for New York State. The dollar figure
          is federal share obligated, not City reimbursement. Use the universe
          toggle and disaster shortcuts, then open the Exception Monitor for
          records that may deserve a closer look.
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          Full New York file: {formatProvenanceCount(proven.recordCount)} worksheets ·{" "}
          {formatProvenanceUsd(proven.federalShareSum)} federal share. NYC-related
          subset: {formatProvenanceCount(proven.nycRelatedCount)} worksheets.
        </p>
      </section>
      <ScopeBar />
      <FilterBar />
      {hydrating ? (
        <p className="text-xs text-ink-soft">
          Totals below are from the OpenFEMA snapshot summary. Worksheet-level
          flags load with the full file.
        </p>
      ) : null}
      <KpiGrid kpis={kpis} hydrating={hydrating} />
      <DisasterChart rows={byDisaster} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ApplicantTable rows={byApplicant} />
        <CategoryChart rows={byCategory} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-lg text-navy">Selected worksheets</h2>
        <Link href="/exceptions" className="text-sm text-navy underline-offset-2 hover:underline">
          Open exception monitor
        </Link>
      </div>
      {hydrating ? (
        <LoadingState label="Loading project worksheets from the OpenFEMA snapshot" />
      ) : (
        <ProjectTable projects={filtered} flagsById={signals.flagsById} />
      )}
    </div>
  );
}
