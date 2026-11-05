"use client";

import { formatCompactUsd, formatCount } from "@/lib/format";
import type { Kpis } from "@/lib/types";

const ITEMS: Array<{
  key: keyof Pick<Kpis, "projectCount" | "federalShare" | "applicantCount" | "disasterCount" | "flaggedCount">;
  label: string;
  hint: string;
  money?: boolean;
  footnote: string;
}> = [
  {
    key: "projectCount",
    label: "Project worksheets",
    hint: "One row is one obligated Public Assistance project worksheet in the selected set.",
    footnote: "Selected universe",
  },
  {
    key: "federalShare",
    label: "Federal share obligated",
    hint: "Sum of federalShareObligated. This is the federal share in OpenFEMA, not a City reimbursement total.",
    money: true,
    footnote: "OpenFEMA federal share",
  },
  {
    key: "applicantCount",
    label: "Applicants",
    hint: "Distinct OpenFEMA applicantId values. A single applicantId can carry multiple source-name variants across disasters. This count does not perform legal-entity resolution.",
    footnote: "Distinct applicantId",
  },
  {
    key: "disasterCount",
    label: "Disaster declarations",
    hint: "Distinct FEMA disaster numbers in the selected portfolio.",
    footnote: "Selected universe",
  },
  {
    key: "flaggedCount",
    label: "Worksheets flagged for review",
    hint: "Worksheets with at least one screening flag versus the disaster cohort, or a data-quality flag. A queue near 5% is partly by design because of the p95 materiality screen. Not a compliance finding or an error-rate estimate.",
    footnote: "Screening only",
  },
];

export function KpiGrid({ kpis, hydrating = false }: { kpis: Kpis; hydrating?: boolean }) {
  return (
    <section aria-label="Portfolio snapshot">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ITEMS.map((item) => {
          const raw = kpis[item.key];
          const pending =
            raw == null &&
            (item.key === "flaggedCount" || item.key === "applicantCount" || item.key === "disasterCount");
          const display = pending
            ? hydrating
              ? "Loading"
              : "—"
            : item.money
              ? formatCompactUsd(typeof raw === "number" ? raw : null)
              : formatCount(typeof raw === "number" ? raw : null);
          return (
            <article key={item.key} className="kpi-card" title={item.hint}>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                {item.label}
              </p>
              <p className="mt-2 font-serif text-[1.65rem] leading-none text-navy tabular">
                {display}
              </p>
              <p className="mt-2 text-[11px] text-ink-soft">{item.footnote}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
