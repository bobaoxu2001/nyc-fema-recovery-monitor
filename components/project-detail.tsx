"use client";

import { useState } from "react";
import Link from "next/link";
import { CHECKLIST_DISCLAIMER, INTERNAL_EVIDENCE } from "@/lib/checklist";
import { projectDisplayId } from "@/lib/expand";
import { formatDate, formatUsdPrecise } from "@/lib/format";
import { nycKind, nycKindLabel, nycReasonText } from "@/lib/nyc";
import { OPENFEMA_DATASET_PAGE, openFemaProjectUrl } from "@/lib/openfema";
import type { Project, ProjectFlag } from "@/lib/types";
import { FlagStack } from "./flag-badge";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
    >
      {copied ? "Copied" : "Copy project ID"}
    </button>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-rule/80 py-2">
      <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}

export function ProjectDetail({
  project,
  flags,
}: {
  project: Project;
  flags: ProjectFlag[];
}) {
  const displayId = projectDisplayId(project);
  const sourceUrl = openFemaProjectUrl(project.gmProjectId);

  return (
    <article className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="kicker">Project worksheet</p>
          <h2 className="mt-1 max-w-3xl font-serif text-2xl text-navy">{project.title}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {project.applicantName} · {project.femaDeclarationString}
          </p>
        </div>
        <div className="flex gap-2">
          <CopyButton value={displayId} />
          <Link href="/projects" className="btn-secondary">
            Back to projects
          </Link>
        </div>
      </div>

      <section className="panel p-4">
        <h3 className="font-serif text-lg text-navy">Project summary</h3>
        <dl className="mt-2 grid gap-x-6 sm:grid-cols-2">
          <Fact label="Applicant" value={project.applicantName} />
          <Fact label="Applicant ID" value={project.applicantId || "—"} />
          <Fact label="Disaster" value={`${project.femaDeclarationString} — ${project.disasterTitle}`} />
          <Fact label="Incident type" value={project.incidentType || "—"} />
          <Fact label="FEMA project identifier (GM)" value={project.gmProjectId == null ? "—" : String(project.gmProjectId)} />
          <Fact label="Project worksheet number" value={project.pwNumber == null ? "—" : String(project.pwNumber)} />
          <Fact label="Work category" value={`${project.categoryCode ? `${project.categoryCode} — ` : ""}${project.category || "—"}`} />
          <Fact label="Project size" value={project.size || "—"} />
          <Fact label="Federal share obligated" value={formatUsdPrecise(project.federalShare)} />
          <Fact label="Project amount" value={formatUsdPrecise(project.projectAmount)} />
          <Fact label="Total obligated" value={formatUsdPrecise(project.totalObligated)} />
          <Fact label="Project status" value={project.status || "—"} />
          <Fact label="Process step" value={project.processStep || "—"} />
          <Fact label="County" value={project.county || "—"} />
          <Fact label="Applicant city" value={project.applicantCity || "—"} />
          <Fact label="Declaration date" value={formatDate(project.declarationDate)} />
          <Fact label="First obligation date" value={formatDate(project.firstObligationDate)} />
          <Fact label="Last obligation date" value={formatDate(project.lastObligationDate)} />
          <Fact
            label="NYC-related tag"
            value={
              project.nycRelated
                ? nycKindLabel(nycKind(project.applicantName, project.nycReasons))
                : "No"
            }
          />
        </dl>
        <p className="mt-3 text-xs text-ink-soft">{nycReasonText(project.nycReasons)}</p>
      </section>

      <section className="panel p-4">
        <h3 className="font-serif text-lg text-navy">Monitoring signals</h3>
        <div className="mt-2">
          <FlagStack flags={flags} />
        </div>
        {flags.length ? (
          <ul className="mt-3 space-y-3 text-sm">
            {flags.map((flag) => (
              <li key={flag.code} className="rounded border border-terracotta/30 bg-terracotta-pale px-3 py-2">
                <div className="font-medium text-terracotta">{flag.label}</div>
                <p className="mt-1 text-ink">Why review? {flag.reason}</p>
                <p className="mt-1 text-ink-soft">What to review next: {flag.suggestedReview}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">
            No screening flags apply to this worksheet against its disaster cohort.
          </p>
        )}
      </section>

      <section className="panel p-4">
        <p className="kicker">Illustrative OMB analyst review workflow</p>
        <h3 className="mt-1 font-serif text-lg text-navy">Internal evidence needed</h3>
        <p className="mt-1 text-xs text-ink-soft">{CHECKLIST_DISCLAIMER}</p>
        <p className="mt-2 text-xs text-ink-soft">Exception review → reconciliation → reporting</p>
        <div className="mt-3 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Evidence</th>
                <th>Public availability</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {INTERNAL_EVIDENCE.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.label}</td>
                  <td>{item.availability}</td>
                  <td className="text-ink-soft">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel p-4">
        <h3 className="font-serif text-lg text-navy">Source traceability</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Source: OpenFEMA Public Assistance Funded Projects Details v2.
        </p>
        {sourceUrl ? (
          <p className="mt-2 text-sm">
            <a href={sourceUrl} className="text-navy underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
              View source record
            </a>
            <span className="text-ink-soft"> · </span>
            <a href={OPENFEMA_DATASET_PAGE} className="text-navy underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
              Dataset page
            </a>
          </p>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">No Grants Manager project id is available for a source link.</p>
        )}
      </section>
    </article>
  );
}
