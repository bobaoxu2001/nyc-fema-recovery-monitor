export const INTERNAL_EVIDENCE = [
  {
    id: "scope",
    label: "Grant scope",
    availability: "Partial",
    note: "Worksheet title, disaster, and work category are in OpenFEMA.",
  },
  {
    id: "cost",
    label: "Project cost",
    availability: "Partial",
    note: "Project amount and federal share obligated are in OpenFEMA.",
  },
  {
    id: "contract",
    label: "Contract",
    availability: "Not in OpenFEMA",
    note: "Would be requested from the applicant or City files.",
  },
  {
    id: "procurement",
    label: "Procurement records",
    availability: "Not in OpenFEMA",
    note: "Bid method and award documentation are not in the public file.",
  },
  {
    id: "invoice",
    label: "Invoice",
    availability: "Not in OpenFEMA",
    note: "Cost support would come from internal grant files.",
  },
  {
    id: "payment",
    label: "Proof of payment",
    availability: "Not in OpenFEMA",
    note: "Payment evidence is not published in this dataset.",
  },
  {
    id: "insurance",
    label: "Insurance",
    availability: "Not in OpenFEMA",
    note: "Coverage and proceeds would be an internal duplication-of-benefits check.",
  },
  {
    id: "reimbursement",
    label: "Reimbursement status",
    availability: "Internal system needed",
    note: "Obligated versus drawn or reimbursed is not in OpenFEMA.",
  },
] as const;

export const CHECKLIST_DISCLAIMER =
  "These internal records are not available in the OpenFEMA public dataset. This workflow illustrates how public grant information could connect to an internal grant-management process.";
