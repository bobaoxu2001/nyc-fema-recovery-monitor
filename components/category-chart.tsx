"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactUsd, formatPercent } from "@/lib/format";
import type { NamedTotal } from "@/lib/types";
import { EmptyState } from "./status-panels";
import { usePortfolio } from "./providers";

export function CategoryChart({ rows, interactive = true }: { rows: NamedTotal[]; interactive?: boolean }) {
  const { setFilters } = usePortfolio();
  if (!rows.length) {
    return <EmptyState title="No category totals" body="No projects match the current filters." />;
  }

  return (
    <section className="panel p-4">
      <div className="mb-3">
        <h2 className="font-serif text-lg text-navy">Work category analysis</h2>
        <p className="text-xs text-ink-soft">
          FEMA Public Assistance work categories come from{" "}
          <code>damageCategoryDescrip</code> on each project worksheet (for
          example Debris Removal, Emergency Protective Measures, Utilities).
          Categories are not hard-coded.
        </p>
      </div>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
            <CartesianGrid stroke="#e4ddd0" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCompactUsd(Number(value))}
              stroke="#6b7380"
              fontSize={11}
            />
            <YAxis type="category" dataKey="name" width={180} stroke="#6b7380" fontSize={11} />
            <Tooltip
              cursor={{ fill: "rgba(26,54,84,0.06)" }}
              content={({ payload }) => {
                const row = payload?.[0]?.payload as NamedTotal | undefined;
                if (!row) return null;
                return (
                  <div className="rounded border border-rule bg-paper-3 px-3 py-2 text-xs shadow-card">
                    <div className="font-medium text-navy">{row.name}</div>
                    <div className="mt-1 tabular">{formatCompactUsd(row.federalShare)}</div>
                    <div className="text-ink-soft">
                      {row.projects.toLocaleString()} projects · {formatPercent(row.share)}
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="federalShare"
              fill="#215e57"
              radius={[0, 2, 2, 0]}
              cursor={interactive ? "pointer" : "default"}
              onClick={
                interactive
                  ? (item) => {
                      const name = (item as NamedTotal).name;
                      if (name) setFilters({ category: name });
                    }
                  : undefined
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
