import { describe, expect, it } from "vitest";
import { applyBaseFilters } from "@/lib/filters";
import { DEFAULT_FILTERS, type Project } from "@/lib/types";

function project(overrides: Partial<Project>): Project {
  return {
    id: "a",
    gmProjectId: 1,
    disasterNumber: 4085,
    disasterTitle: "HURRICANE SANDY",
    femaDeclarationString: "DR-4085-NY",
    pwNumber: 10,
    title: "Debris removal",
    applicantId: "nyc-1",
    applicantName: "City of New York",
    applicantCity: "New York",
    categoryCode: "A",
    category: "Debris Removal",
    status: "Eligible",
    processStep: "Obligated",
    size: "Large",
    county: "New York County",
    projectAmount: 100,
    federalShare: 100,
    totalObligated: 100,
    declarationDate: "2012-10-30",
    declarationYear: 2012,
    firstObligationDate: "2013-01-01",
    lastObligationDate: "2013-06-01",
    incidentType: "Hurricane",
    nycRelated: true,
    nycReasons: ["borough_county"],
    duplicateGroup: null,
    missingFields: [],
    ...overrides,
  };
}

describe("applyBaseFilters", () => {
  const rows = [
    project({ id: "sandy-nyc", federalShare: 5_000_000 }),
    project({
      id: "ida-upstate",
      disasterNumber: 4615,
      disasterTitle: "REMNANTS OF HURRICANE IDA",
      femaDeclarationString: "DR-4615-NY",
      applicantId: "up-1",
      applicantName: "Town of Delhi",
      county: "Delaware County",
      nycRelated: false,
      nycReasons: [],
      federalShare: 50_000,
      declarationYear: 2021,
      declarationDate: "2021-09-05",
      category: "Roads and Bridges",
    }),
  ];

  it("filters to NYC-related records", () => {
    const result = applyBaseFilters(rows, { ...DEFAULT_FILTERS, geography: "nyc" });
    expect(result.map((row) => row.id)).toEqual(["sandy-nyc"]);
  });

  it("filters by amount bucket and disaster", () => {
    const result = applyBaseFilters(rows, {
      ...DEFAULT_FILTERS,
      disaster: "4615",
      amount: "lt100k",
    });
    expect(result.map((row) => row.id)).toEqual(["ida-upstate"]);
  });

  it("searches applicant and title", () => {
    const result = applyBaseFilters(rows, { ...DEFAULT_FILTERS, search: "delhi" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("ida-upstate");
  });

  it("treats null federal share as outside amount buckets", () => {
    const withNull = [project({ id: "missing", federalShare: null })];
    const result = applyBaseFilters(withNull, { ...DEFAULT_FILTERS, amount: "10mplus" });
    expect(result).toHaveLength(0);
  });
});
