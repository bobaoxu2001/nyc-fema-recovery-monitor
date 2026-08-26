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

export function DisasterChart({ rows }: { rows: NamedTotal[] }) {
  const { setFilters } = usePortfolio();
  const top = rows.slice(0, 12);
  const data = top.map((row) => ({
    ...row,
    shortName: row.name.length > 42 ? `${row.name.slice(0, 40)}…` : row.name,
  }));

  if (!data.length) {
    return <EmptyState title="No disaster totals" body="No projects match the current filters." />;
  }

  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg text-navy">Federal obligations by disaster</h2>
          <p className="text-xs text-ink-soft">
            Ranked by federal share obligated. Click a bar to filter the portfolio to that declaration.
          </p>
        </div>
      </div>
      <div className="h-[min(420px,calc(36px*12+48px))] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid stroke="#e4ddd0" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCompactUsd(Number(value))}
              stroke="#6b7380"
              fontSize={11}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              width={210}
              stroke="#6b7380"
              fontSize={11}
            />
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
                      {row.projects.toLocaleString()} projects · {formatPercent(row.share)} of selected
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="federalShare"
              fill="#1a3654"
              radius={[0, 2, 2, 0]}
              cursor="pointer"
              onClick={(item) => {
                const key = (item as NamedTotal).key;
                if (key) setFilters({ disaster: key });
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
