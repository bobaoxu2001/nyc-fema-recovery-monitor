"use client";

import { interviewDisasterShortcuts } from "@/lib/interview-disasters";
import type { GeographyFilter } from "@/lib/types";
import { usePortfolio } from "./providers";

export function ScopeBar() {
  const { filters, setFilters, resetFilters, byDisaster, summary, hydrating } = usePortfolio();
  const disasters = byDisaster.length ? byDisaster : summary.allNy.byDisaster;
  const shortcuts = interviewDisasterShortcuts(disasters);
  return (
    <section className="panel px-3 py-2" aria-label="Portfolio universe">
      <div className="flex flex-wrap items-center gap-2">
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
                  className={`rounded border px-3 py-1 text-left text-sm leading-tight ${
                    active
                      ? "border-navy bg-navy text-paper-3"
                      : "border-rule bg-paper-3 text-navy hover:bg-navy-pale"
                  }`}
                  disabled={hydrating}
                  onClick={() =>
                    setFilters({ disaster: active ? "all" : shortcut.key })
                  }
                >
                  <span className="block">{shortcut.label}</span>
                  <span className={`block text-[11px] ${active ? "text-paper-3/80" : "text-ink-faint"}`}>
                    {shortcut.declaration}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
        <button type="button" className="btn-secondary ml-auto" onClick={resetFilters}>
          Reset
        </button>
      </div>
    </section>
  );
}
