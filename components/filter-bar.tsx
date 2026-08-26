"use client";

import { useMemo } from "react";
import { uniqueSorted } from "@/lib/filters";
import type { AmountFilter, FlagFilter, GeographyFilter } from "@/lib/types";
import { usePortfolio } from "./providers";

function Select({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-xs text-ink-soft">
      {label}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded border border-rule bg-paper-3 px-2 text-sm text-ink"
      >
        {children}
      </select>
    </label>
  );
}

export function FilterBar() {
  const { allProjects, filters, setFilters, resetFilters, meta } = usePortfolio();

  const disasters = useMemo(
    () =>
      uniqueSorted(
        allProjects.map(
          (project) =>
            `${project.disasterNumber}\t${project.femaDeclarationString}\t${project.disasterTitle}`,
        ),
      ).map((value) => {
        const [number, code, title] = value.split("\t");
        return { number, label: `${code} — ${title}` };
      }),
    [allProjects],
  );

  const applicants = useMemo(() => {
    const applicantTotals = new Map<string, { name: string; amount: number }>();
    for (const project of allProjects) {
      const current = applicantTotals.get(project.applicantId) || {
        name: project.applicantName,
        amount: 0,
      };
      current.amount += project.federalShare ?? 0;
      applicantTotals.set(project.applicantId, current);
    }
    const ranked = [...applicantTotals.entries()]
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 40);
    if (
      filters.applicant !== "all" &&
      !ranked.some(([id]) => id === filters.applicant)
    ) {
      const selected = applicantTotals.get(filters.applicant);
      if (selected) ranked.unshift([filters.applicant, selected]);
    }
    return ranked;
  }, [allProjects, filters.applicant]);

  const categories = useMemo(
    () => uniqueSorted(allProjects.map((project) => project.category)),
    [allProjects],
  );
  const years = useMemo(
    () => uniqueSorted(allProjects.map((project) => project.declarationYear)).reverse(),
    [allProjects],
  );

  return (
    <section className="panel p-4" aria-label="Portfolio filters">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg text-navy">Portfolio filters</h2>
          <p className="text-xs text-ink-soft">
            {meta?.geography}. NYC-related is an analyst-constructed subset, not an official geography.
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={resetFilters}>
          Reset filters
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Select
          id="geography"
          label="Geography"
          value={filters.geography}
          onChange={(value) => setFilters({ geography: value as GeographyFilter })}
        >
          <option value="all-ny">All New York</option>
          <option value="nyc">NYC-related subset</option>
        </Select>
        <Select
          id="disaster"
          label="Disaster"
          value={filters.disaster}
          onChange={(value) => setFilters({ disaster: value })}
        >
          <option value="all">All disasters</option>
          {disasters.map((disaster) => (
            <option key={disaster.number} value={disaster.number}>
              {disaster.label}
            </option>
          ))}
        </Select>
        <Select
          id="applicant"
          label="Applicant"
          value={filters.applicant}
          onChange={(value) => setFilters({ applicant: value })}
        >
          <option value="all">All applicants</option>
          {applicants.map(([id, meta]) => (
            <option key={id} value={id}>
              {meta.name}
            </option>
          ))}
        </Select>
        <Select
          id="category"
          label="Work category"
          value={filters.category}
          onChange={(value) => setFilters({ category: value })}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        <Select
          id="year"
          label="Declaration year"
          value={filters.year}
          onChange={(value) => setFilters({ year: value })}
        >
          <option value="all">All years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
        <Select
          id="amount"
          label="Federal share"
          value={filters.amount}
          onChange={(value) => setFilters({ amount: value as AmountFilter })}
        >
          <option value="all">All amounts</option>
          <option value="lt100k">Under $100K</option>
          <option value="100k-1m">$100K–$1M</option>
          <option value="1m-10m">$1M–$10M</option>
          <option value="10mplus">$10M and above</option>
        </Select>
        <Select
          id="flag"
          label="Flag status"
          value={filters.flag}
          onChange={(value) => setFilters({ flag: value as FlagFilter })}
        >
          <option value="all">All records</option>
          <option value="flagged">Flagged for review</option>
          <option value="unflagged">No screening flag</option>
        </Select>
        <label className="flex min-w-[180px] flex-[1.4] flex-col gap-1 text-xs text-ink-soft">
          Search
          <input
            type="search"
            value={filters.search}
            onChange={(event) => setFilters({ search: event.target.value })}
            placeholder="Applicant, project, PW, disaster"
            className="h-9 rounded border border-rule bg-paper-3 px-2 text-sm text-ink"
          />
        </label>
      </div>
    </section>
  );
}
