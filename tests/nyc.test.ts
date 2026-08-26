import { describe, expect, it } from "vitest";
import { nycKind } from "@/lib/nyc";

describe("NYC-related tagging kinds", () => {
  it("labels City entities, public authorities, and geographic matches separately", () => {
    expect(nycKind("New York City Housing Authority", ["applicant_name"])).toBe("city_entity");
    expect(nycKind("New York City Health and Hospitals Corporation", ["applicant_name"])).toBe(
      "city_entity",
    );
    expect(nycKind("Port Authority of New York and New Jersey", ["applicant_name"])).toBe(
      "public_authority",
    );
    expect(nycKind("Metropolitan Transportation Authority (MTA)", ["applicant_name"])).toBe(
      "public_authority",
    );
    expect(nycKind("New York University", ["applicant_city"])).toBe("geographic");
    expect(nycKind("Town of Delhi", [])).toBeNull();
  });
});
