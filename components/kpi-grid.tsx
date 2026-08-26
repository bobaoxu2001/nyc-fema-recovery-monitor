"use client";

import { formatCompactUsd, formatCount } from "@/lib/format";
import type { Kpis } from "@/lib/types";

const ITEMS: Array<{
  key: keyof Kpis;
  label: string;
  hint: string;
  money?: boolean;
}> = [
  {
    key: "projectCount",
    label: "Total projects",
    hint: "One row is one obligated Public Assistance project worksheet in the selected set.",
  },
  {
    key: "federalShare",
    label: "Total federal obligations",
    hint: "Sum of federalShareObligated. This is the federal share recorded in OpenFEMA, not a City reimbursement total.",
    money: true,
  },
  {
    key: "applicantCount",
    label: "Applicants",
    hint: "Distinct applicant IDs in the selected portfolio.",
  },
  {
    key: "disasterCount",
    label: "Disaster declarations",
    hint: "Distinct FEMA disaster numbers in the selected portfolio.",
  },
  {
    key: "medianProject",
    label: "Median project amount",
    hint: "Median federal share obligated, including zeros and negatives if present.",
    money: true,
  },
  {
    key: "averageProject",
    label: "Average project amount",
    hint: "Mean federal share obligated. Large projects pull this well above the median.",
    money: true,
  },
  {
    key: "largestProject",
    label: "Largest project",
    hint: "Maximum federal share obligated in the selected set.",
    money: true,
  },
  {
    key: "flaggedCount",
    label: "Projects flagged for review",
    hint: "Count of records with at least one analytical screening flag. Not a compliance finding.",
  },
];

export function KpiGrid({ kpis, hydrating = false }: { kpis: Kpis; hydrating?: boolean }) {
  return (
    <section aria-label="Portfolio snapshot">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => {
          const raw = kpis[item.key];
          const pending = hydrating && item.key === "flaggedCount";
          const display = pending
            ? "—"
            : item.money
              ? formatCompactUsd(typeof raw === "number" ? raw : null)
              : formatCount(typeof raw === "number" ? raw : null);
          return (
            <article key={item.key} className="kpi-card" title={item.hint}>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                {item.label}
              </p>
              <p className="mt-2 font-serif text-[1.7rem] leading-none text-navy tabular">
                {display}
              </p>
              {item.key === "flaggedCount" ? (
                <p className="mt-2 text-[11px] text-ink-soft">Screening only</p>
              ) : item.key === "federalShare" ? (
                <p className="mt-2 text-[11px] text-ink-soft">Federal share obligated</p>
              ) : (
                <p className="mt-2 text-[11px] text-ink-soft">Selected portfolio</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
