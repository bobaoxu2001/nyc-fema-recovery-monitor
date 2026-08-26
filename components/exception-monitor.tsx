"use client";

import Link from "next/link";
import { flaggedProjects } from "@/lib/flags";
import { formatCompactUsd, formatPercent, formatUsd } from "@/lib/format";
import { FlagStack } from "./flag-badge";
import { EmptyState } from "./status-panels";
import { usePortfolio } from "./providers";

export function ExceptionMonitor() {
  const { filtered, signals, kpis } = usePortfolio();
  const rows = flaggedProjects(filtered, signals.flagsById).slice(0, 40);
  const concentratedApplicants = signals.applicantConcentration.filter((row) => row.concentrated);
  const concentratedCategories = signals.categoryConcentration.filter((row) => row.concentrated);

  return (
    <div className="space-y-4">
      <section className="panel p-4">
        <h2 className="font-serif text-lg text-navy">How screening works</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Flags are calculated on the currently filtered portfolio. High-dollar
          and outlier thresholds therefore move when filters change. They are
          prioritization aids, not determinations of eligibility, fraud, or
          improper payment.
        </p>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded border border-rule bg-paper px-3 py-2">
            <dt className="text-xs uppercase tracking-[0.12em] text-ink-faint">High-dollar (p95)</dt>
            <dd className="mt-1 font-serif text-xl text-navy tabular">
              {formatUsd(signals.p95)}
            </dd>
          </div>
          <div className="rounded border border-rule bg-paper px-3 py-2">
            <dt className="text-xs uppercase tracking-[0.12em] text-ink-faint">Extreme outlier (p99)</dt>
            <dd className="mt-1 font-serif text-xl text-navy tabular">
              {formatUsd(signals.p99)}
            </dd>
          </div>
          <div className="rounded border border-rule bg-paper px-3 py-2">
            <dt className="text-xs uppercase tracking-[0.12em] text-ink-faint">Flagged for review</dt>
            <dd className="mt-1 font-serif text-xl text-navy tabular">
              {kpis.flaggedCount.toLocaleString()}
            </dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel p-4">
          <h2 className="font-serif text-lg text-navy">Applicant concentration</h2>
          <p className="text-xs text-ink-soft">
            Portfolio concentration indicator. An applicant is listed here if it
            accounts for 10% or more of federal obligations in the selected set.
            Concentration is common in disaster recovery and is not a compliance
            problem.
          </p>
          {concentratedApplicants.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {concentratedApplicants.map((row) => (
                <li key={row.key} className="flex justify-between gap-3 border-b border-rule/70 py-1">
                  <span>{row.name}</span>
                  <span className="tabular text-ink-soft">
                    {formatCompactUsd(row.federalShare)} · {formatPercent(row.share)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">
              No applicant is at or above 10% of selected federal obligations.
            </p>
          )}
        </article>
        <article className="panel p-4">
          <h2 className="font-serif text-lg text-navy">Category concentration</h2>
          <p className="text-xs text-ink-soft">
            A work category is listed if it accounts for 25% or more of federal
            obligations in the selected set. Emergency work often dominates early
            in a disaster.
          </p>
          {concentratedCategories.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {concentratedCategories.map((row) => (
                <li key={row.key} className="flex justify-between gap-3 border-b border-rule/70 py-1">
                  <span>{row.name}</span>
                  <span className="tabular text-ink-soft">
                    {formatCompactUsd(row.federalShare)} · {formatPercent(row.share)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">
              No work category is at or above 25% of selected federal obligations.
            </p>
          )}
        </article>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-rule px-4 py-3">
          <h2 className="font-serif text-lg text-navy">Projects requiring review</h2>
          <p className="text-xs text-ink-soft">
            Up to 40 flagged worksheets, ordered by federal share. Open a row to
            see the suggested analyst review steps.
          </p>
        </div>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Applicant</th>
                  <th className="text-right">Federal amount</th>
                  <th>Flag</th>
                  <th>Reason</th>
                  <th>Recommended analyst review</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((project) => {
                  const primary = project.flags[0];
                  return (
                    <tr key={project.id} className="align-top">
                      <td className="max-w-[200px]">
                        <Link href={`/projects/${project.id}`} className="text-navy underline-offset-2 hover:underline">
                          {project.title}
                        </Link>
                        <div className="text-[11px] text-ink-faint">
                          {project.femaDeclarationString} · PW {project.pwNumber ?? "—"}
                        </div>
                      </td>
                      <td className="max-w-[160px]">{project.applicantName}</td>
                      <td className="text-right tabular">{formatCompactUsd(project.federalShare)}</td>
                      <td>
                        <FlagStack flags={project.flags} />
                      </td>
                      <td className="max-w-[240px] text-ink-soft">{primary?.reason}</td>
                      <td className="max-w-[240px] text-ink-soft">{primary?.suggestedReview}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <EmptyState
              title="No screening flags in this selection"
              body="Broaden filters or choose All records to see the rest of the portfolio."
            />
          </div>
        )}
      </section>
    </div>
  );
}
