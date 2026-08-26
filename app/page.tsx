"use client";

import { ApplicantTable } from "@/components/applicant-table";
import { CategoryChart } from "@/components/category-chart";
import { DisasterChart } from "@/components/disaster-chart";
import { KpiGrid } from "@/components/kpi-grid";
import { usePortfolio } from "@/components/providers";
import { ScopeBar } from "@/components/scope-bar";
import { ErrorState } from "@/components/status-panels";
import { canonicalMeta } from "@/lib/canonical";
import { displayApplicantName } from "@/lib/display-name";
import { formatPercent } from "@/lib/format";
import Link from "next/link";

export default function OverviewPage() {
  const { error, meta, kpis, byDisaster, byApplicant, byCategory } = usePortfolio();
  const proven = canonicalMeta(meta);
  const topApplicant = byApplicant[0];
  const topCategory = byCategory[0];

  if (error && !proven.recordCount) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <ScopeBar />
      <KpiGrid kpis={kpis} hydrating={false} />
      <DisasterChart rows={byDisaster} />
      {topApplicant || topCategory ? (
        <section className="panel p-4" aria-label="Portfolio concentration">
          <h2 className="font-serif text-lg text-navy">Portfolio concentration indicator</h2>
          <p className="text-xs text-ink-soft">
            Share of federal obligations in the current view. Descriptive only. Not a
            risk finding.
          </p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded border border-rule bg-paper px-3 py-2">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">
                Top applicant share
              </dt>
              <dd className="mt-1 font-serif text-2xl text-navy tabular">
                {topApplicant ? formatPercent(topApplicant.share) : "—"}
              </dd>
              <p className="mt-1 text-xs text-ink-soft">
                {topApplicant ? displayApplicantName(topApplicant.name) : ""}
              </p>
            </div>
            <div className="rounded border border-rule bg-paper px-3 py-2">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">
                Top category share
              </dt>
              <dd className="mt-1 font-serif text-2xl text-navy tabular">
                {topCategory ? formatPercent(topCategory.share) : "—"}
              </dd>
              <p className="mt-1 text-xs text-ink-soft">{topCategory?.name}</p>
            </div>
          </dl>
        </section>
      ) : null}
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
          tab.
        </p>
      )}
      <p className="text-sm text-ink-soft">
        <Link href="/exceptions" className="text-navy underline-offset-2 hover:underline">
          Open exception monitor
        </Link>
      </p>
    </div>
  );
}
