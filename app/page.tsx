"use client";

import { ApplicantTable } from "@/components/applicant-table";
import { CategoryChart } from "@/components/category-chart";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { DisasterChart } from "@/components/disaster-chart";
import { KpiGrid } from "@/components/kpi-grid";
import { usePortfolio } from "@/components/providers";
import { ScopeBar } from "@/components/scope-bar";
import { ErrorState } from "@/components/status-panels";
import { canonicalMeta } from "@/lib/canonical";
import { formatPercent, formatProvenanceCount, formatProvenanceUsd } from "@/lib/format";
import Link from "next/link";

export default function OverviewPage() {
  const { error, meta, kpis, byDisaster, byApplicant, byCategory, filters, summaryMode } =
    usePortfolio();
  const proven = canonicalMeta(meta);
  const universe =
    filters.geography === "nyc"
      ? "NYC-related analytical subset"
      : "New York State Public Assistance";
  const topApplicant = byApplicant[0];
  const topCategory = byCategory[0];

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
          Public OpenFEMA project worksheets. The dollar figure is federal share
          obligated, not City reimbursement. This overview uses a pre-aggregated
          snapshot, so it is ready immediately. Worksheet-level review is on
          Projects and Exception Monitor.
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          New York State file: {formatProvenanceCount(proven.recordCount)} worksheets ·{" "}
          {formatProvenanceUsd(proven.federalShareSum)} federal share. NYC-related
          subset: {formatProvenanceCount(proven.nycRelatedCount)} worksheets.
        </p>
      </section>
      <ScopeBar />
      <KpiGrid kpis={kpis} hydrating={false} />
      {topApplicant || topCategory ? (
        <section className="panel p-4" aria-label="Portfolio concentration">
          <h2 className="font-serif text-lg text-navy">Portfolio concentration indicator</h2>
          <p className="text-xs text-ink-soft">
            Share of federal obligations in the current view. This is descriptive.
            It is not a risk finding.
          </p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded border border-rule bg-paper px-3 py-2">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">
                Top applicant share
              </dt>
              <dd className="mt-1 font-serif text-2xl text-navy tabular">
                {topApplicant ? formatPercent(topApplicant.share) : "Unavailable"}
              </dd>
              <p className="mt-1 text-xs text-ink-soft">{topApplicant?.name}</p>
            </div>
            <div className="rounded border border-rule bg-paper px-3 py-2">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">
                Top category share
              </dt>
              <dd className="mt-1 font-serif text-2xl text-navy tabular">
                {topCategory ? formatPercent(topCategory.share) : "Unavailable"}
              </dd>
              <p className="mt-1 text-xs text-ink-soft">{topCategory?.name}</p>
            </div>
          </dl>
        </section>
      ) : null}
      <DisasterChart rows={byDisaster} />
      {byApplicant.length || byCategory.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ApplicantTable rows={byApplicant} interactive={false} />
          <CategoryChart rows={byCategory} interactive={false} />
        </div>
      ) : (
        <p className="text-sm text-ink-soft">
          Applicant and work-category detail for a single disaster is on the{" "}
          <Link href="/projects" className="text-navy underline-offset-2 hover:underline">
            Projects
          </Link>{" "}
          tab, where the worksheet file is loaded.
        </p>
      )}
      <p className="text-sm text-ink-soft">
        {summaryMode
          ? "This page does not load the full worksheet file. Open Projects or Exception Monitor to review individual records."
          : null}
        {" "}
        <Link href="/exceptions" className="text-navy underline-offset-2 hover:underline">
          Open exception monitor
        </Link>
      </p>
    </div>
  );
}
