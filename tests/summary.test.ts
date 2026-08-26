import { describe, expect, it } from "vitest";
import { CANONICAL_SUMMARY, canonicalMeta } from "@/lib/canonical";
import { interviewDisasterShortcuts } from "@/lib/interview-disasters";

describe("canonical summary", () => {
  it("exposes live OpenFEMA provenance without fallback zeroes", () => {
    const meta = canonicalMeta(CANONICAL_SUMMARY.meta);
    expect(meta.recordCount).toBe(59291);
    expect(meta.federalShareSum).toBe(41058915840.25);
    expect(meta.nycRelatedCount).toBe(3100);
    expect(meta.sourceCheck?.openFemaCount).toBe(59291);
    expect(meta.sourceCheck?.retrievedRows).toBe(59291);
    expect(meta.sourceCheck?.matchedCount).toBe(true);
    expect(meta.sourceCheck?.apiKeyRequired).toBe(false);
    expect(meta.identifier.identifier).toBe("gmProjectId");
    expect(meta.retrievedAt).toMatch(/^2026-08-26/);
    expect(meta.joinQuality?.applicantJoinMatched).toBe(59291);
    expect(meta.joinQuality?.applicantJoinTotal).toBe(59291);
    expect(meta.joinQuality?.missingGmProjectId).toBe(0);
    expect(meta.joinQuality?.missingFederalShare).toBe(0);
    expect(meta.joinQuality?.distinctApplicantId).toBe(4819);
  });

  it("keeps All New York and NYC-related denominators separate", () => {
    expect(CANONICAL_SUMMARY.allNy.projectCount).toBe(59291);
    expect(CANONICAL_SUMMARY.nyc.projectCount).toBe(3100);
    expect(CANONICAL_SUMMARY.nyc.federalShare).toBeLessThan(CANONICAL_SUMMARY.allNy.federalShare);
    expect(CANONICAL_SUMMARY.allNy.federalShare).toBe(metaSum());
    expect(CANONICAL_SUMMARY.allNy.flaggedCount).toBeGreaterThan(0);
    expect(CANONICAL_SUMMARY.nyc.flaggedCount).toBeGreaterThan(0);
    expect(CANONICAL_SUMMARY.allNy.flaggedCount).toBeGreaterThan(CANONICAL_SUMMARY.nyc.flaggedCount);
  });

  it("derives interview disaster shortcuts from real titles", () => {
    const shortcuts = interviewDisasterShortcuts(CANONICAL_SUMMARY.allNy.byDisaster);
    expect(shortcuts.map((item) => item.label)).toEqual([
      "Hurricane Sandy",
      "Hurricane Ida",
      "COVID-19",
    ]);
    expect(shortcuts.find((item) => item.label === "Hurricane Sandy")?.key).toBe("4085");
    expect(shortcuts.find((item) => item.label === "Hurricane Ida")?.key).toBe("4615");
    expect(shortcuts.find((item) => item.label === "COVID-19")?.key).toBe("4480");
    expect(shortcuts.find((item) => item.label === "Hurricane Sandy")?.declaration).toBe("DR-4085-NY");
  });
});

function metaSum() {
  return CANONICAL_SUMMARY.meta.federalShareSum;
}
