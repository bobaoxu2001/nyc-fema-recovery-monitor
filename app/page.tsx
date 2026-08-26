"use client";

import { ApplicantTable } from "@/components/applicant-table";
import { CategoryChart } from "@/components/category-chart";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { DisasterChart } from "@/components/disaster-chart";
import { FilterBar } from "@/components/filter-bar";
import { KpiGrid } from "@/components/kpi-grid";
import { ProjectTable } from "@/components/project-table";
import { usePortfolio } from "@/components/providers";
import { ErrorState, LoadingState } from "@/components/status-panels";
import { formatCompactUsd, formatCount } from "@/lib/format";
import Link from "next/link";

export default function OverviewPage() {
  const { loading, error, meta, kpis, byDisaster, byApplicant, byCategory, filtered, signals } =
    usePortfolio();

  if (loading) {
    return <LoadingState label="Loading New York Public Assistance snapshot" />;
  }
  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <DisclaimerBanner />
      <section className="panel p-4">
        <p className="text-sm leading-relaxed text-ink">
          This view summarizes obligated FEMA Public Assistance project worksheets
          for New York. Use it to see funding by disaster, applicant, and work
          category, then move unusually large or incomplete records into review.
          NYC-related is an optional subset. It is not an official City portfolio.
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          Snapshot: {formatCount(meta?.recordCount ?? 0)} NY worksheets ·{" "}
          {formatCompactUsd(meta?.federalShareSum ?? null)} federal share ·{" "}
          {formatCount(meta?.nycRelatedCount ?? 0)} tagged NYC-related.
        </p>
      </section>
      <FilterBar />
      <KpiGrid kpis={kpis} />
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
      <ProjectTable projects={filtered} flagsById={signals.flagsById} />
    </div>
  );
}
