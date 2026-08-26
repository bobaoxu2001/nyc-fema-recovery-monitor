"use client";

import { formatCompactUsd, formatCount, formatRefreshedAt } from "@/lib/format";
import { flagDefinitions } from "@/lib/flags";
import { useData } from "./providers";

export function MethodologyContent() {
  const { meta } = useData();
  const flags = flagDefinitions();

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <p className="kicker">Methodology & data limitations</p>
        <h2 className="mt-1 font-serif text-2xl text-navy">How this monitor is built</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
          This page is the data workpaper behind the dashboard. It records the
          source, the grain of each row, the NYC tagging rules, and the limits of
          public FEMA data.
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
          <code>{meta?.sourceCheck?.filter || "stateAbbreviation eq 'NY'"}</code>.
          OpenFEMA reported {formatCount(meta?.sourceCheck?.openFemaCount ?? meta?.recordCount ?? 0)}{" "}
          New York rows
          {meta?.sourceCheck?.matchedCount === false
            ? "; the downloaded file did not match that count and should be refreshed."
            : "; the downloaded file matched that count."}{" "}
          Data last refreshed {formatRefreshedAt(meta?.retrievedAt)}. Federal share
          obligated in the snapshot: {formatCompactUsd(meta?.federalShareSum ?? null)}.
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
          Each dashboard row is one obligated Public Assistance project worksheet.
          Open projects still in pre-obligation processing are not in this dataset.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          Identifier used: <code>{meta?.identifier.identifier ?? "hash"}</code>.{" "}
          {meta?.identifier.note}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          Federal obligation totals are the sum of <code>federalShareObligated</code>{" "}
          across those rows. The prototype does not use Public Assistance Grant
          Award Activities for portfolio totals, because that file can contain
          multiple obligation events for one project.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          <code>totalObligated</code> includes administrative amounts and is shown
          on the project detail page. Portfolio KPIs use federal share so the
          headline number stays aligned with FEMA&apos;s federal funding concept.
        </p>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">New York and NYC-related</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          The default universe is New York State. City agencies are often stored
          with county = Statewide, so five-borough county filters alone would
          undercount NYC activity. NYC-related is therefore an analyst-constructed
          subset, not an official FEMA or City geography.
        </p>
        <p className="mt-2 text-sm text-ink">A record is tagged NYC-related if any of these is true:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
          <li>County is Bronx, Kings, New York, Queens, or Richmond.</li>
          <li>Applicant city is New York, Manhattan, Bronx, Brooklyn, Queens, or Staten Island.</li>
          <li>
            Applicant name matches a documented NYC entity pattern, including City
            of New York, NYCHA, MTA New York City Transit, CUNY, NYC Health +
            Hospitals, and the Port Authority of New York.
          </li>
        </ul>
        <p className="mt-2 text-sm text-ink-soft">
          {formatCount(meta?.nycRelatedCount ?? 0)} of {formatCount(meta?.recordCount ?? 0)}{" "}
          New York worksheets currently meet at least one rule. Long Island, upstate,
          and statewide non-NYC agencies remain in the All New York view.
        </p>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">Data processing</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink">
          <li>Retrieve NY project worksheets from the OpenFEMA API using hash-cursor paging.</li>
          <li>Retrieve New York applicants and NY disaster declarations.</li>
          <li>Join applicant name and city on disaster number + applicant ID.</li>
          <li>Join disaster title on disaster number.</li>
          <li>Parse money fields to numbers. Unparsable values are stored as null.</li>
          <li>Standardize dates to YYYY-MM-DD.</li>
          <li>Tag NYC-related records and missing-field lists.</li>
          <li>
            Group potential duplicate-looking records by disaster, applicant,
            normalized title, and federal share rounded to the nearest $100.
          </li>
          <li>Write a compact JSON snapshot for the dashboard. No database is used.</li>
        </ol>
        <p className="mt-2 text-sm text-ink-soft">
          Null handling: missing applicant names appear as &quot;Unknown applicant&quot; and
          are flagged. Missing category, title, or federal share are flagged.
          Negative federal shares are kept. OpenFEMA notes that negative amounts
          can reflect deobligations or adjustments.
        </p>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">Monitoring flags</h3>
        <p className="mt-2 text-sm text-ink-soft">
          High-dollar and outlier flags are recomputed whenever the selected
          portfolio changes, so a $2 million worksheet can be routine in Sandy
          and unusual in a small flood declaration.
        </p>
        <ul className="mt-3 space-y-3 text-sm">
          {flags.map((flag) => (
            <li key={flag.code} className="border-b border-rule pb-3">
              <div className="font-medium text-navy">{flag.label}</div>
              <p className="mt-1 text-ink-soft">{flag.method}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink">
          Applicant concentration is shown when an applicant is 10% or more of
          selected federal obligations. Category concentration uses a 25%
          threshold. These are portfolio indicators, not row-level findings.
        </p>
      </section>

      <section className="panel p-5">
        <h3 className="font-serif text-xl text-navy">
          Illustrative future workflow — not implemented because these data are not public
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
          In an internal OMB setting, the public worksheet would be the index row.
          City cost, contract, invoice, and insurance files would attach to that
          row. This prototype stops at the public index.
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
          <li>
            NYC-related tagging can both miss City entities with unusual names and
            include bi-state entities such as the Port Authority.
          </li>
        </ul>
      </section>

      <section className="panel p-5" id="about">
        <h3 className="font-serif text-xl text-navy">Why I built this</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink">
          I built this prototype to better understand FEMA Public Assistance from
          the perspective of a grant-management analyst.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink">
          My prior work has involved reimbursement monitoring, financial controls,
          audit reconciliation, risk monitoring, and data validation.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink">
          This project explores how public FEMA data can be organized into a
          simple portfolio-monitoring workflow for disaster recovery grants.
        </p>
      </section>
    </div>
  );
}
