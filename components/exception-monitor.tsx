"use client";

import Link from "next/link";
import { displayApplicantName } from "@/lib/display-name";
import { flaggedProjects } from "@/lib/flags";
import { formatCompactUsd, formatPercent } from "@/lib/format";
import { FlagStack } from "./flag-badge";
import { EmptyState } from "./status-panels";
import { usePortfolio } from "./providers";

export function ExceptionMonitor() {
  const { filtered, signals, kpis, byApplicant, byCategory } = usePortfolio();
  const rows = flaggedProjects(filtered, signals.flagsById).slice(0, 40);
  const topApplicant = byApplicant[0];
  const topCategory = byCategory[0];

  return (
    <div className="space-y-4">
      <section className="panel p-4">
        <h2 className="font-serif text-lg text-navy">Why a record is flagged</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Amount flags compare a worksheet with other projects in the same
          disaster. They do not change when you filter to one applicant. High-dollar
          is the 95th–99th percentile. Extreme is the 99th percentile and above.
          A project gets one amount flag, not both. A queue near 5% of worksheets
          is partly by design because of that materiality screen; it is not an
          estimated error rate. These are not findings of non-compliance.
        </p>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded border border-rule bg-paper px-3 py-2">
            <dt className="text-xs uppercase tracking-[0.12em] text-ink-faint">Amount baseline</dt>
            <dd className="mt-1 font-serif text-xl text-navy">Same disaster</dd>
          </div>
          <div className="rounded border border-rule bg-paper px-3 py-2">
            <dt className="text-xs uppercase tracking-[0.12em] text-ink-faint">Minimum cohort</dt>
            <dd className="mt-1 font-serif text-xl text-navy tabular">20 projects</dd>
          </div>
          <div className="rounded border border-rule bg-paper px-3 py-2">
            <dt className="text-xs uppercase tracking-[0.12em] text-ink-faint">Flagged for review</dt>
            <dd className="mt-1 font-serif text-xl text-navy tabular">
              {kpis.flaggedCount == null ? "Unavailable" : kpis.flaggedCount.toLocaleString()}
            </dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel p-4">
          <h2 className="font-serif text-lg text-navy">Portfolio concentration indicator</h2>
          <p className="text-xs text-ink-soft">
            Share of federal obligations in the current view. This is descriptive.
            It is not a risk finding, and there is no extra threshold label.
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3 border-b border-rule/70 py-1">
              <dt>Top applicant share</dt>
              <dd className="tabular">
                {topApplicant
                  ? `${formatPercent(topApplicant.share)} · ${displayApplicantName(topApplicant.name)}`
                  : "Unavailable"}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-rule/70 py-1">
              <dt>Top category share</dt>
              <dd className="tabular">
                {topCategory ? `${formatPercent(topCategory.share)} · ${topCategory.name}` : "Unavailable"}
              </dd>
            </div>
          </dl>
        </article>
        <article className="panel p-4">
          <h2 className="font-serif text-lg text-navy">Largest holders in this view</h2>
          <p className="text-xs text-ink-soft">
            {topApplicant
              ? `${displayApplicantName(topApplicant.name)} accounts for ${formatCompactUsd(topApplicant.federalShare)}.`
              : "No applicant totals in this selection."}
          </p>
          <p className="mt-2 text-xs text-ink-soft">
            Concentration is common in disaster recovery. It does not mean the
            funding is improper.
          </p>
        </article>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-rule px-4 py-3">
          <h2 className="font-serif text-lg text-navy">Projects requiring review</h2>
          <p className="text-xs text-ink-soft">
            Up to 40 flagged worksheets, ordered by federal share.
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
                  <th>Why review?</th>
                  <th>What to review next</th>
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
