export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className="banner-flag" role="note">
      <strong className="font-medium text-terracotta">Screening notice. </strong>
      {compact ? (
        <>
          Flags are analytical screening indicators only. They do not represent
          compliance findings or FEMA eligibility determinations.
        </>
      ) : (
        <>
          Flags are analytical screening indicators only. They do not represent
          compliance findings or FEMA eligibility determinations. OpenFEMA does
          not include procurement files, invoices, proofs of payment, or
          insurance records.
        </>
      )}
    </div>
  );
}
