"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadCsv, projectsToCsv } from "@/lib/csv";
import { projectDisplayId } from "@/lib/expand";
import { formatCompactUsd, formatCount, formatDate } from "@/lib/format";
import type { Project, ProjectFlag } from "@/lib/types";
import { FlagStack } from "./flag-badge";
import { EmptyState } from "./status-panels";

type SortKey =
  | "applicantName"
  | "disasterTitle"
  | "title"
  | "category"
  | "federalShare"
  | "declarationDate";

const PAGE_SIZE = 25;

export function ProjectTable({
  projects,
  flagsById,
}: {
  projects: Project[];
  flagsById: Record<string, ProjectFlag[]>;
}) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("federalShare");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [projects]);

  const sorted = useMemo(() => {
    const copy = [...projects];
    copy.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "federalShare") {
        return ((a.federalShare ?? 0) - (b.federalShare ?? 0)) * dir;
      }
      const left = String(a[sortKey] ?? "");
      const right = String(b[sortKey] ?? "");
      return left.localeCompare(right, undefined, { numeric: true }) * dir;
    });
    return copy;
  }, [projects, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const slice = sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "federalShare" ? "desc" : "asc");
    }
    setPage(0);
  }

  function header(key: SortKey, label: string, right = false) {
    const active = sortKey === key;
    return (
      <th className={right ? "text-right" : ""}>
        <button
          type="button"
          onClick={() => toggleSort(key)}
          className="inline-flex items-center gap-1"
        >
          {label}
          <span className="text-[10px] text-ink-faint">
            {active ? (sortDir === "asc" ? "▲" : "▼") : ""}
          </span>
        </button>
      </th>
    );
  }

  if (!projects.length) {
    return (
      <EmptyState
        title="No projects match the current filters"
        body="Reset filters or broaden the search to see project worksheets."
      />
    );
  }

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-4 py-3">
        <div>
          <h2 className="font-serif text-lg text-navy">Grant portfolio table</h2>
          <p className="text-xs text-ink-soft">
            {formatCount(projects.length)} worksheets in the selected set. Click a
            row for project detail.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            downloadCsv(
              "ny-fema-pa-selected-projects.csv",
              projectsToCsv(sorted, flagsById),
            )
          }
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              {header("applicantName", "Applicant")}
              {header("disasterTitle", "Disaster")}
              {header("title", "Project")}
              {header("category", "Work category")}
              {header("federalShare", "Federal obligation", true)}
              {header("declarationDate", "Declared")}
              <th>Review flag</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((project) => (
              <tr
                key={project.id}
                className="cursor-pointer hover:bg-navy-pale/60"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <td className="max-w-[180px]">
                  <div className="truncate">{project.applicantName}</div>
                  <div className="text-[11px] text-ink-faint">{project.county || "County not listed"}</div>
                </td>
                <td className="max-w-[160px]">
                  <div className="truncate">{project.femaDeclarationString}</div>
                  <div className="truncate text-[11px] text-ink-faint">{project.disasterTitle}</div>
                </td>
                <td className="max-w-[220px]">
                  <div className="truncate">{project.title}</div>
                  <div className="text-[11px] text-ink-faint">
                    PW {project.pwNumber ?? "—"} · {projectDisplayId(project)}
                  </div>
                </td>
                <td className="max-w-[140px] truncate">{project.category || "—"}</td>
                <td className="text-right tabular">{formatCompactUsd(project.federalShare)}</td>
                <td>{formatDate(project.declarationDate)}</td>
                <td>
                  <FlagStack flags={flagsById[project.id] || []} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-rule px-4 py-2 text-xs text-ink-soft">
        <span>
          Page {safePage + 1} of {pageCount}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary"
            disabled={safePage === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
