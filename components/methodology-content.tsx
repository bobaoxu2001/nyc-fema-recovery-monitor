"use client";

import { canonicalMeta } from "@/lib/canonical";
import { formatProvenanceCount, formatProvenanceUsd, formatRefreshedAt } from "@/lib/format";
import { flagDefinitions } from "@/lib/flags";
import { useData } from "./providers";

export function MethodologyContent() {
  const { meta } = useData();
  const proven = canonicalMeta(meta);
  const flags = flagDefinitions();
  const apiCount = proven.sourceCheck?.openFemaCount ?? proven.recordCount;
  const matched = proven.sourceCheck?.matchedCount;

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <p className="kicker">Methodology & data limitations</p>
        <h2 className="mt-1 font-serif text-2xl text-navy">How this monitor is built</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
          This is a small analytical prototype using public OpenFEMA data. It is
          not a FEMA grant-management system. The notes below record the source,
          the grain of each row, and what the public file cannot show.
        </p>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">Data source</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
          <li>
            Primary: OpenFEMA{" "}
            <a className="underline" href="https://www.fema.gov/openfema-data-page/public-assistance-funded-projects-details-v2">
              Public Assistance Funded Projects Details v2
            </a>
            . API: <code>https://www.fema.gov/api/open/v2/PublicAssistanceFundedProjectsDetails</code>
          </li>
          <li>
            Applicant names: OpenFEMA{" "}
            <a className="underline" href="https://www.fema.gov/openfema-data-page/public-assistance-applicants-v1">
              Public Assistance Applicants v1
            </a>
            , joined on disaster number and applicant ID.
          </li>
          <li>
            Disaster titles: OpenFEMA{" "}
            <a className="underline" href="https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2">
              Disaster Declarations Summaries v2
            </a>
            , unique by disaster number for New York.
          </li>
        </ul>
        <p className="mt-3 text-sm text-ink-soft">
          Retrieved from the official OpenFEMA API with no API key. Filter:{" "}
          <code>{proven.sourceCheck?.filter || "stateAbbreviation eq 'NY'"}</code>.
          OpenFEMA reported {formatProvenanceCount(apiCount)} New York rows
          {matched === false
            ? "; the downloaded file did not match that count and should be refreshed."
            : matched === true
              ? "; the downloaded file matched that count."
              : "."}{" "}
          Snapshot retrieved {formatRefreshedAt(proven.retrievedAt)}.
          {proven.sourceCheck?.openFemaRundate
            ? ` OpenFEMA API rundate ${proven.sourceCheck.openFemaRundate}.`
            : ""}{" "}
          Federal share obligated in the snapshot: {formatProvenanceUsd(proven.federalShareSum)}.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          OpenFEMA states that the financial information is derived from Grants
          Manager, not FEMA&apos;s official financial systems, and is not intended for
          official federal reporting. This prototype treats the public file as a
          monitoring snapshot, not a system of record.
        </p>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">Grain, identifier, and aggregation</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          OpenFEMA describes this dataset as obligated Public Assistance projects —
          one funded project worksheet per row. Open projects still in
          pre-obligation processing are not included.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          Identifier used: <code>{proven.identifier.identifier}</code>. In the v2
          field dictionary, <code>gmProjectId</code> is documented as the Grants
          Manager project identifier and is marked as a primary key. In this New
          York snapshot it is present and unique on every row. The combination of
          disaster number, PW number, and applicant ID is also unique.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          Federal obligation totals are the sum of <code>federalShareObligated</code>{" "}
          once per downloaded row. The prototype does not use Public Assistance
          Grant Award Activities for those totals. That file includes{" "}
          <code>versionNumber</code> and can contain multiple obligation events
          for one worksheet. Using it would double-count.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          This details file does not expose a version-history grain. Negative
          federal share values appear on the current worksheet and can reflect
          adjustments or deobligations. They are kept as flags, not dropped, and
          they are included in the portfolio sum so the total stays a net federal
          share figure.
        </p>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">New York State universe and NYC-related subset</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          The data universe is New York State Public Assistance. The{" "}
          {formatProvenanceUsd(proven.federalShareSum)} figure is statewide federal
          share, not NYC-only funding. City agencies are often stored with county
          = Statewide, so five-borough county filters alone would undercount NYC
          activity.
        </p>
        <p className="mt-2 text-sm text-ink">A record is tagged NYC-related if any of these is true:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
          <li>County is Bronx, Kings, New York, Queens, or Richmond.</li>
          <li>Applicant city is New York, Manhattan, Bronx, Brooklyn, Queens, or Staten Island.</li>
          <li>
            Applicant name matches a documented NYC-related pattern, including
            City of New York, NYCHA, MTA, CUNY, NYC Health + Hospitals, and the
            Port Authority of New York.
          </li>
        </ul>
        <p className="mt-2 text-sm text-ink-soft">
          {formatProvenanceCount(proven.nycRelatedCount)} of{" "}
          {formatProvenanceCount(proven.recordCount)} New York worksheets currently
          meet at least one rule. The tag means NYC-related applicant or location,
          not “NYC City agency.” Port Authority and MTA are treated as regional /
          public authorities. Hospitals, universities, and libraries that only
          match on city or county are geographic matches.
        </p>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">Data processing</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink">
          <li>Retrieve NY project worksheets from the OpenFEMA API using hash-cursor paging.</li>
          <li>Compare the download with OpenFEMA’s $count for the same filter.</li>
          <li>Retrieve New York applicants and NY disaster declarations.</li>
          <li>Join applicant name and city on disaster number + applicant ID.</li>
          <li>Join disaster title on disaster number.</li>
          <li>Parse money fields to numbers. Unparsable values are stored as null, not zero.</li>
          <li>Tag NYC-related records and missing-field lists.</li>
          <li>
            Group potential duplicate-looking records by disaster, applicant,
            normalized title, and federal share rounded to the nearest $100.
          </li>
        </ol>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">Monitoring flags</h3>
        <p className="mt-2 text-sm text-ink-soft">
          High-dollar and outlier flags are recomputed on the currently selected
          universe. They help prioritize review. They are not compliance findings.
        </p>
        <ul className="mt-3 space-y-3 text-sm">
          {flags.map((flag) => (
            <li key={flag.code} className="border-b border-rule pb-3">
              <div className="font-medium text-navy">{flag.label}</div>
              <p className="mt-1 text-ink-soft">{flag.method}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">
          Illustrative OMB analyst review workflow — not implemented
        </h3>
        <pre className="mt-3 overflow-x-auto rounded border border-rule bg-paper px-4 py-3 text-xs leading-6 text-ink">{`OpenFEMA grant data
+ NYC project cost data
+ Contracts
+ Procurement records
+ Invoices
+ Proofs of payment
+ Insurance information
+ Reimbursement status
        ↓
Grant portfolio monitoring
        ↓
Exception review
        ↓
Reconciliation
        ↓
Management reporting`}</pre>
        <p className="mt-2 text-sm text-ink-soft">
          These internal records are not available in the OpenFEMA public dataset.
          This workflow illustrates how public grant information could connect to
          an internal grant-management process.
        </p>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">Important limitations</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
          <li>
            This application is an independent analytical prototype created for
            educational and interview demonstration purposes. It is not affiliated
            with FEMA, NYC OMB, New York State, or the City of New York.
          </li>
          <li>
            Analytical flags are screening indicators only and do not represent
            findings of non-compliance, fraud, grant ineligibility, or improper
            expenditure.
          </li>
          <li>
            The file does not include unobligated projects, official financial
            system balances, or supporting documentation.
          </li>
        </ul>
      </section>

      <section className="panel p-5" id="about">
        <h3 className="font-serif text-xl text-navy">Why I built this</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink">
          I wanted to understand how the work in this role might look from an
          analyst&apos;s perspective, so I used OpenFEMA public data to build a small
          monitoring prototype.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink">
          My prior work has involved reimbursement monitoring, financial controls,
          audit reconciliation, risk monitoring, and data validation.
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
    </div>
  );
}
