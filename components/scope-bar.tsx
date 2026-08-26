"use client";

import { interviewDisasterShortcuts } from "@/lib/interview-disasters";
import type { GeographyFilter } from "@/lib/types";
import { usePortfolio } from "./providers";

export function ScopeBar() {
  const { filters, setFilters, resetFilters, byDisaster, summary, hydrating } = usePortfolio();
  const disasters = byDisaster.length ? byDisaster : summary.allNy.byDisaster;
  const shortcuts = interviewDisasterShortcuts(disasters);
  const universeLabel =
    filters.geography === "nyc"
      ? "NYC-related analytical subset"
      : "New York State FEMA Public Assistance portfolio";

  return (
    <section className="panel p-4" aria-label="Portfolio universe">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="kicker">Data universe</p>
          <h2 className="mt-1 font-serif text-lg text-navy">{universeLabel}</h2>
          <p className="mt-1 text-xs text-ink-soft">
            All New York is the OpenFEMA file. NYC-related is an analyst-constructed
            subset. It is not an official City or FEMA geography, and not every
            tagged applicant is a City agency.
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={resetFilters}>
          Reset filters
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div
          className="inline-flex rounded border border-rule bg-paper p-0.5"
          role="group"
          aria-label="Data universe"
        >
          {(
            [
              { id: "all-ny", label: "All New York" },
              { id: "nyc", label: "NYC-related" },
            ] as const
          ).map((option) => {
            const active = filters.geography === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                className={`rounded px-3 py-1.5 text-sm ${
                  active ? "bg-navy text-paper-3" : "text-navy hover:bg-navy-pale"
                }`}
                onClick={() => setFilters({ geography: option.id as GeographyFilter })}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {shortcuts.length ? (
          <div className="flex flex-wrap items-center gap-2" aria-label="Interview disaster shortcuts">
            {shortcuts.map((shortcut) => {
              const active = filters.disaster === shortcut.key;
              return (
                <button
                  key={shortcut.key}
                  type="button"
                  aria-pressed={active}
                  title={shortcut.name}
                  className={`rounded border px-3 py-1.5 text-sm ${
                    active
                      ? "border-navy bg-navy text-paper-3"
                      : "border-rule bg-paper-3 text-navy hover:bg-navy-pale"
                  }`}
                  disabled={hydrating}
                  onClick={() =>
                    setFilters({ disaster: active ? "all" : shortcut.key })
                  }
                >
                  {shortcut.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
