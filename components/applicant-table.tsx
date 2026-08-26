"use client";

import { formatCompactUsd, formatCount, formatPercent } from "@/lib/format";
import type { NamedTotal } from "@/lib/types";
import { EmptyState } from "./status-panels";
import { usePortfolio } from "./providers";

export function ApplicantTable({ rows }: { rows: NamedTotal[] }) {
  const { setFilters } = usePortfolio();

  if (!rows.length) {
    return <EmptyState title="No applicant totals" body="No projects match the current filters." />;
  }

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-rule px-4 py-3">
        <h2 className="font-serif text-lg text-navy">Applicant portfolio</h2>
        <p className="text-xs text-ink-soft">
          Top 15 applicants by federal share obligated in the selected set. Click a row to filter.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Applicant</th>
              <th className="text-right">Projects</th>
              <th className="text-right">Federal obligations</th>
              <th className="text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="cursor-pointer hover:bg-navy-pale/60"
                onClick={() => setFilters({ applicant: row.key })}
              >
                <td className="max-w-[280px]">{row.name}</td>
                <td className="text-right tabular">{formatCount(row.projects)}</td>
                <td className="text-right tabular">{formatCompactUsd(row.federalShare)}</td>
                <td className="text-right tabular">{formatPercent(row.share)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
