import { describe, expect, it } from "vitest";
import { expandProjects } from "@/lib/expand";
import type { Snapshot } from "@/lib/types";

describe("expandProjects", () => {
  it("expands interned array rows from the public snapshot", () => {
    const snapshot: Snapshot = {
      meta: {
        title: "test",
        retrievedAt: "2026-08-26T00:00:00Z",
        geography: "New York State",
        geographyNote: "",
        source: {
          dataset: "PublicAssistanceFundedProjectsDetails",
          version: 2,
          endpoint: "https://www.fema.gov/api/open/v2/PublicAssistanceFundedProjectsDetails",
          page: "https://www.fema.gov/openfema-data-page/public-assistance-funded-projects-details-v2",
          applicantsDataset: "PublicAssistanceApplicants",
          applicantsEndpoint: "https://www.fema.gov/api/open/v1/PublicAssistanceApplicants",
          declarationsDataset: "DisasterDeclarationsSummaries",
          declarationsEndpoint: "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries",
        },
        identifier: {
          identifier: "gmProjectId",
          aggregation: "one_row_per_project_worksheet",
          note: "unique",
          rowCount: 1,
          gmProjectIdUnique: 1,
          disasterPwApplicantUnique: 1,
          hashUnique: 1,
          safeToSumFederalShare: true,
        },
        disclaimer: "",
        flagDisclaimer: "",
        recordCount: 1,
        nycRelatedCount: 1,
        applicantCount: 1,
        disasterCount: 1,
        federalShareSum: 3750000,
      },
      disasters: [
        {
          disasterNumber: 4085,
          title: "HURRICANE SANDY",
          incidentType: "Hurricane",
          declarationDate: "2012-10-30",
          year: 2012,
          femaDeclarationString: "DR-4085-NY",
        },
      ],
      applicants: [{ applicantId: "047-51000-00", name: "City of New York", city: "Brooklyn" }],
      lookups: {
        cc: ["G"],
        cat: ["Parks, Recreational, and Other"],
        st: ["Eligible"],
        ps: ["Obligated"],
        sz: ["Large"],
        co: ["Kings County"],
        it: ["Hurricane"],
      },
      fields: ["gm", "d", "pw", "t", "a", "cc", "cat", "st", "ps", "sz", "co", "pa", "fs", "to", "dd", "fo", "lo", "it"],
      projects: [
        [111, 4085, 9, "Coney Island Boardwalk", 0, 0, 0, 0, 0, 0, 0, 5000000, 3750000, 3750000, "2012-10-30", "2013-01-01", "2014-01-01", 0],
      ],
      nyc: { "111": ["borough_county"] },
    };

    const [project] = expandProjects(snapshot);
    expect(project.id).toBe("111");
    expect(project.applicantName).toBe("City of New York");
    expect(project.category).toBe("Parks, Recreational, and Other");
    expect(project.county).toBe("Kings County");
    expect(project.federalShare).toBe(3750000);
    expect(project.nycRelated).toBe(true);
    expect(project.disasterTitle).toBe("HURRICANE SANDY");
  });
});
