import { describe, expect, it } from "vitest";
import { displayApplicantName, hasDisplayNormalization } from "@/lib/display-name";

describe("displayApplicantName", () => {
  it("fixes the OpenFEMA Management typo without changing the raw source", () => {
    const raw = "NEW YORK / MANAGMENT AND BUDGET, OFFICE OF";
    expect(displayApplicantName(raw)).toBe("New York / Management and Budget, Office of");
    expect(hasDisplayNormalization(raw)).toBe(true);
  });

  it("leaves a mixed-case name alone", () => {
    expect(displayApplicantName("New York City Housing Authority")).toBe(
      "New York City Housing Authority",
    );
  });
});
