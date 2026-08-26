export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-paper-3">
      <div className="page-wrap py-6 text-xs leading-relaxed text-ink-soft">
        <p>
          Independent analytical prototype using public OpenFEMA data. Not
          affiliated with FEMA, NYC OMB, New York State, or the City of New York.
        </p>
        <p className="mt-2">
          Source: OpenFEMA Public Assistance Funded Projects Details v2, joined
          to Public Assistance Applicants v1 and Disaster Declarations Summaries
          v2. Financial figures in OpenFEMA may differ from official federal
          financial systems.
        </p>
      </div>
    </footer>
  );
}
