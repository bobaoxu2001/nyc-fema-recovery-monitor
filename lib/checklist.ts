export const ANALYST_CHECKLIST = [
  {
    id: "scope",
    label: "Grant scope reviewed",
    note: "Does the worksheet description match the declared incident and eligible work category?",
  },
  {
    id: "cost",
    label: "Cost information reviewed",
    note: "Are project amount, federal share, and any adjustments reconcilable?",
  },
  {
    id: "procurement",
    label: "Procurement documentation",
    note: "Would an analyst next request bid documents, procurement method, and contract award records?",
  },
  {
    id: "contract",
    label: "Contract documentation",
    note: "Is there a contract or force-account record that supports the obligated amount?",
  },
  {
    id: "invoice",
    label: "Invoice documentation",
    note: "Do invoices support the costs claimed on the project worksheet?",
  },
  {
    id: "payment",
    label: "Proof of payment",
    note: "Is there evidence the applicant paid eligible costs before or as part of reimbursement?",
  },
  {
    id: "insurance",
    label: "Insurance considerations",
    note: "Has insurance coverage, proceeds, or a duplication-of-benefits check been documented?",
  },
  {
    id: "reimbursement",
    label: "Reimbursement status",
    note: "What has been obligated versus drawn, reimbursed, or still outstanding?",
  },
  {
    id: "outstanding",
    label: "Outstanding information",
    note: "What is still needed from the agency, the State, or FEMA before closeout?",
  },
] as const;

export const CHECKLIST_DISCLAIMER =
  "These internal records are not available in the OpenFEMA public dataset. This workflow illustrates how public grant information could connect to an internal grant-management process.";
