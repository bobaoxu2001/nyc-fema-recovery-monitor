export type FlagCode =
  | "high_dollar"
  | "extreme_outlier"
  | "missing_fields"
  | "negative_obligation"
  | "duplicate_looking";

export type ProjectFlag = {
  code: FlagCode;
  label: string;
  reason: string;
  suggestedReview: string;
};

export type Disaster = {
  disasterNumber: number;
  title: string;
  incidentType: string;
  declarationDate: string | null;
  year: number | null;
  femaDeclarationString: string;
};

export type Applicant = {
  applicantId: string;
  name: string;
  city: string | null;
};

export type CompactProject = {
  id?: string;
  gm: number | string | null;
  d: number;
  pw: number | null;
  t: string;
  a: number;
  cc: string | number;
  cat: string | number;
  st: string | number;
  ps: string | number;
  sz: string | number;
  co: string | number;
  pa: number | null;
  fs: number | null;
  to: number | null;
  dd: string | null;
  fo: string | null;
  lo: string | null;
  it: string | number;
  nyc?: 0 | 1;
  nr?: string[];
  dg?: string | null;
  mf?: string[];
};

export type ProjectRow = Array<string | number | null>;

export type SnapshotLookups = {
  cc: string[];
  cat: string[];
  st: string[];
  ps: string[];
  sz: string[];
  co: string[];
  it: string[];
};

export type SnapshotMeta = {
  title: string;
  retrievedAt: string;
  geography: string;
  geographyNote: string;
  source: {
    dataset: string;
    version: number;
    endpoint: string;
    page: string;
    applicantsDataset: string;
    applicantsEndpoint: string;
    declarationsDataset: string;
    declarationsEndpoint: string;
  };
  identifier: {
    identifier: string;
    aggregation: string;
    note: string;
    rowCount: number;
    gmProjectIdUnique: number;
    disasterPwApplicantUnique: number;
    hashUnique: number;
    safeToSumFederalShare: boolean;
  };
  disclaimer: string;
  flagDisclaimer: string;
  recordCount: number;
  nycRelatedCount: number;
  applicantCount: number;
  disasterCount: number;
  federalShareSum: number;
  sourceCheck?: {
    apiKeyRequired?: boolean;
    endpoint?: string;
    page?: string;
    filter?: string;
    openFemaCount?: number | null;
    openFemaRundate?: string | null;
    retrievedRows?: number;
    matchedCount?: boolean;
  };
};

export type Snapshot = {
  meta: SnapshotMeta;
  disasters: Disaster[];
  applicants: Applicant[];
  projects: CompactProject[] | ProjectRow[];
  lookups?: SnapshotLookups;
  fields?: string[];
  nyc?: Record<string, string[]>;
  missing?: Record<string, string[]>;
  duplicates?: Record<string, string>;
};

export type PortfolioSummarySlice = {
  projectCount: number;
  federalShare: number;
  applicantCount: number;
  disasterCount: number;
  medianProject: number | null;
  averageProject: number | null;
  largestProject: number | null;
  categoryCount: number;
  byDisaster: NamedTotal[];
  byApplicant: NamedTotal[];
  byCategory: NamedTotal[];
};

export type PortfolioSummary = {
  meta: SnapshotMeta;
  allNy: PortfolioSummarySlice;
  nyc: PortfolioSummarySlice;
};

export type Project = {
  id: string;
  gmProjectId: number | string | null;
  disasterNumber: number;
  disasterTitle: string;
  femaDeclarationString: string;
  pwNumber: number | null;
  title: string;
  applicantId: string;
  applicantName: string;
  applicantCity: string | null;
  categoryCode: string;
  category: string;
  status: string;
  processStep: string;
  size: string;
  county: string;
  projectAmount: number | null;
  federalShare: number | null;
  totalObligated: number | null;
  declarationDate: string | null;
  declarationYear: number | null;
  firstObligationDate: string | null;
  lastObligationDate: string | null;
  incidentType: string;
  nycRelated: boolean;
  nycReasons: string[];
  duplicateGroup: string | null;
  missingFields: string[];
};

export type GeographyFilter = "all-ny" | "nyc";
export type AmountFilter = "all" | "lt100k" | "100k-1m" | "1m-10m" | "10mplus";
export type FlagFilter = "all" | "flagged" | "unflagged";

export type Filters = {
  geography: GeographyFilter;
  disaster: string;
  applicant: string;
  category: string;
  year: string;
  amount: AmountFilter;
  flag: FlagFilter;
  search: string;
};

export const DEFAULT_FILTERS: Filters = {
  geography: "all-ny",
  disaster: "all",
  applicant: "all",
  category: "all",
  year: "all",
  amount: "all",
  flag: "all",
  search: "",
};

export type NamedTotal = {
  key: string;
  name: string;
  projects: number;
  federalShare: number;
  share: number;
};

export type Kpis = {
  projectCount: number;
  federalShare: number;
  applicantCount: number;
  disasterCount: number;
  medianProject: number | null;
  averageProject: number | null;
  largestProject: number | null;
  categoryCount: number;
  flaggedCount: number | null;
};

export type ConcentrationRow = {
  key: string;
  name: string;
  federalShare: number;
  share: number;
  projects: number;
  concentrated: boolean;
};

export type PortfolioSignals = {
  flagsById: Record<string, ProjectFlag[]>;
  highDollarThreshold: number | null;
  extremeThreshold: number | null;
  p95: number | null;
  p99: number | null;
  applicantConcentration: ConcentrationRow[];
  categoryConcentration: ConcentrationRow[];
};
