"use client";

import { canonicalMeta } from "@/lib/canonical";
import { formatJoinCoverage, formatPercent, formatProvenanceCount, formatProvenanceUsd, formatRefreshedAt } from "@/lib/format";
import { flagDefinitions } from "@/lib/flags";
import { DUPLICATE_LOOKING_RULE, NYC_APPLICANT_CITIES, NYC_BOROUGH_COUNTIES, NYC_NAME_PHRASES } from "@/lib/nyc-rules";
import { useData } from "./providers";

export function MethodologyContent() {
  const { meta } = useData();
  const proven = canonicalMeta(meta);
  const flags = flagDefinitions();
  const apiCount = proven.sourceCheck?.openFemaCount ?? proven.recordCount;
  const matched = proven.sourceCheck?.matchedCount;
  const join = proven.joinQuality;
  const mix = proven.flagMix;
  const flaggedShare =
    mix && proven.recordCount ? mix.flaggedCount / proven.recordCount : null;
  const stability = join?.nameStabilityAudit;

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <p className="kicker">Methodology & data limitations</p>
        <h2 className="mt-1 font-serif text-2xl text-navy">How to read this prototype</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
          This is a small analytical prototype using public OpenFEMA data. It is
          not a FEMA grant-management system.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Methodology summary">
        <article className="panel p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">Source</p>
          <h3 className="mt-1 font-serif text-lg text-navy">OpenFEMA Public Assistance</h3>
          <p className="mt-1 text-sm text-ink-soft">Funded Projects Details v2, retrieved with no API key.</p>
        </article>
        <article className="panel p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">Universe</p>
          <h3 className="mt-1 font-serif text-lg text-navy">New York State</h3>
          <p className="mt-1 text-sm text-ink-soft">
            NYC-related is an analyst-created subset, not an official FEMA geography.
          </p>
        </article>
        <article className="panel p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">Grain</p>
          <h3 className="mt-1 font-serif text-lg text-navy">One obligated project worksheet per row</h3>
          <p className="mt-1 text-sm text-ink-soft">Identifier: {proven.identifier.identifier}.</p>
        </article>
        <article className="panel p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">Important limitation</p>
          <h3 className="mt-1 font-serif text-lg text-navy">Public data does not establish compliance</h3>
          <p className="mt-1 text-sm text-ink-soft">
            It cannot determine reimbursement eligibility, procurement adequacy, or insurance status.
          </p>
        </article>
      </section>

      <section className="panel p-5" id="about">
        <h3 className="font-serif text-xl text-navy">Why I built this</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink">
          I built this prototype to better understand FEMA Public Assistance from
          the perspective of a grant-management analyst.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink">
          It helped me connect public grant data with my previous experience in
          reimbursement monitoring, reconciliation, and exception review.
        </p>
      </section>

      <section className="panel p-5" id="learned">
        <h3 className="font-serif text-xl text-navy">What I learned</h3>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-ink">
          <li>
            Public Assistance grant monitoring requires understanding both funding
            data and project context.
          </li>
          <li>
            Public data can support portfolio monitoring and prioritization, but
            it cannot establish procurement compliance or reimbursement eligibility
            by itself.
          </li>
          <li>
            A useful analyst workflow connects project-level grant data with
            contracts, invoices, procurement, insurance, and reimbursement records.
          </li>
        </ul>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">Technical validation</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Snapshot retrieved {formatRefreshedAt(proven.retrievedAt)}. OpenFEMA
          reported {formatProvenanceCount(apiCount)} New York rows
          {matched === true
            ? "; the downloaded file matched that count."
            : matched === false
              ? "; the downloaded file did not match that count."
              : "."}
          {proven.sourceCheck?.openFemaRundate
            ? ` API rundate ${proven.sourceCheck.openFemaRundate}.`
            : ""}{" "}
          Federal share obligated: {formatProvenanceUsd(proven.federalShareSum)}.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink">
          Filter: <code>{proven.sourceCheck?.filter || "stateAbbreviation eq 'NY'"}</code>.
          Endpoint: <code>{proven.source.endpoint}</code>.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          Identifier used: <code>{proven.identifier.identifier}</code>. In the v2
          field dictionary, <code>gmProjectId</code> is the Grants Manager project
          identifier and is marked as a primary key. In this New York snapshot it
          is unique on every row. Federal totals sum <code>federalShareObligated</code>{" "}
          once per downloaded row. Public Assistance Grant Award Activities is not
          used for those totals, because that file can contain multiple obligation
          events per worksheet.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Negative federal share values remain in the net total. They can reflect
          adjustments or deobligations on the current worksheet. This details file
          does not expose a version-history grain.
        </p>
        {join ? (
          <div className="mt-4 rounded border border-rule bg-paper px-3 py-3 text-sm">
            <p className="font-medium text-navy">Join quality</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
              <li>
                Applicant join matched ({join.applicantJoinKey}):{" "}
                {formatJoinCoverage(join.applicantJoinMatched, join.applicantJoinTotal)}
              </li>
              <li>
                Disaster title join matched ({join.disasterTitleJoinKey}):{" "}
                {formatJoinCoverage(join.disasterTitleMatched, join.disasterTitleTotal)}
              </li>
              <li>Missing gmProjectId: {formatProvenanceCount(join.missingGmProjectId)}</li>
              <li>Missing federalShareObligated: {formatProvenanceCount(join.missingFederalShare)}</li>
              <li>
                Applicants: {formatProvenanceCount(join.distinctApplicantId)} distinct{" "}
                <code>applicantId</code> values. Distinct interned names:{" "}
                {formatProvenanceCount(join.distinctApplicantName)}. This is not a
                legal-entity count.
              </li>
            </ul>
            {stability ? (
              <div className="mt-3">
                <p className="font-medium text-navy">Applicant ID / name stability</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
                  <li>
                    One-time audit of {stability.source} on{" "}
                    {formatRefreshedAt(stability.auditedAt)}.
                  </li>
                  <li>
                    Applicant rows covering snapshot IDs:{" "}
                    {formatProvenanceCount(stability.applicantRowsForSnapshotIds)}
                  </li>
                  <li>
                    IDs with more than one exact source name across disasters:{" "}
                    {formatJoinCoverage(
                      stability.idsWithMultipleExactNames,
                      join.distinctApplicantId,
                    )}
                  </li>
                  <li>
                    Exact source names mapping to more than one applicantId:{" "}
                    {formatProvenanceCount(stability.exactNamesWithMultipleIds)}
                  </li>
                  <li>
                    Interned dashboard labels are one-to-one with{" "}
                    <code>applicantId</code>
                    {join.internedExactNameOneToOne ? "." : " in this snapshot."} The
                    same ID can still carry name variants in the source file.
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">New York State universe and NYC-related subset</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          The {formatProvenanceUsd(proven.federalShareSum)} figure is statewide
          federal share, not NYC-only funding. A record is tagged NYC-related if
          county is a borough, applicant city is a borough city, or the applicant
          name matches a documented NYC-related pattern.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          {formatProvenanceCount(proven.nycRelatedCount)} of{" "}
          {formatProvenanceCount(proven.recordCount)} worksheets currently meet at
          least one rule. The tag means NYC-related applicant or location, not
          “NYC City agency.” Port Authority and MTA are regional / public
          authorities.
        </p>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-navy">Show tagging rules</summary>
          <div className="mt-2 space-y-2 text-ink-soft">
            <p>
              Borough counties: {NYC_BOROUGH_COUNTIES.join("; ")}.
            </p>
            <p>
              Applicant cities: {NYC_APPLICANT_CITIES.join("; ")}.
            </p>
            <p>
              Name patterns include: {NYC_NAME_PHRASES.join("; ")}. A standalone
              “NYC” token also matches.
            </p>
          </div>
        </details>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">Monitoring flags</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Amount flags use the disaster as the peer group. A Sandy worksheet is
          compared with other Sandy worksheets. The flag does not change when the
          page is filtered to one applicant. High-dollar and Extreme are mutually
          exclusive. A 95th-percentile cut surfaces roughly the top twentieth of
          each disaster, so a review queue near 5% of worksheets is partly by
          design. It is not an estimated error or ineligibility rate.
        </p>
        {mix ? (
          <p className="mt-2 text-sm text-ink">
            In this snapshot: {formatProvenanceCount(mix.flaggedCount)} flagged
            worksheets
            {flaggedShare != null ? ` (${formatPercent(flaggedShare)})` : ""}.{" "}
            {formatProvenanceCount(mix.amountScreen)} are the materiality screen (
            {formatProvenanceCount(mix.highDollar)} high-dollar,{" "}
            {formatProvenanceCount(mix.extreme)} extreme) and{" "}
            {formatProvenanceCount(mix.negative)} are negative federal-share
            records.
          </p>
        ) : null}
        <ul className="mt-3 space-y-3 text-sm">
          {flags.map((flag) => (
            <li key={flag.code} className="border-b border-rule pb-3">
              <div className="font-medium text-navy">{flag.label}</div>
              <p className="mt-1 text-ink-soft">{flag.method}</p>
              {flag.code === "duplicate_looking" ? (
                <p className="mt-1 text-xs text-ink-faint">{DUPLICATE_LOOKING_RULE}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">
          Illustrative OMB analyst review workflow — not implemented
        </h3>
        <pre className="mt-3 overflow-x-auto rounded border border-rule bg-paper px-4 py-3 text-xs leading-6 text-ink">{`OpenFEMA grant data
+ contracts, procurement, invoices, proof of payment
+ insurance information
+ reimbursement status
        ↓
Grant portfolio monitoring → Exception review → Reconciliation → Reporting`}</pre>
        <p className="mt-2 text-sm text-ink-soft">
          These internal records are not available in the OpenFEMA public dataset.
        </p>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">Important limitations</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
          <li>
            Independent analytical prototype. Not affiliated with FEMA, NYC OMB,
            New York State, or the City of New York.
          </li>
          <li>
            Flags are screening indicators only. They are not findings of
            non-compliance, fraud, grant ineligibility, or improper expenditure.
          </li>
          <li>
            Federal-share amounts are nominal and already net of the applicable
            cost share; they are not a like-for-like comparison across disasters.
          </li>
          <li>
            This snapshot is a current-state obligated portfolio, not a measure of
            recovery progress over time.
          </li>
        </ul>
      </section>
    </div>
  );
}
