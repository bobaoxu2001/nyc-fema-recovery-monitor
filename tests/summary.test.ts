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
    expect(meta.disclaimer).not.toMatch(/interview demonstration/i);
    expect(meta.applicantCountDefinition).toMatch(/applicantId/);
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

  it("precomputes flagged and applicant counts for interview disasters", () => {
    const byKey = Object.fromEntries(
      CANONICAL_SUMMARY.allNy.byDisaster.map((row) => [row.key, row]),
    );
    for (const key of ["4085", "4615", "4480"]) {
      expect(byKey[key]?.flaggedCount).toBeGreaterThan(0);
      expect(byKey[key]?.applicantCount).toBeGreaterThan(0);
    }
    expect(CANONICAL_SUMMARY.allNy.applicantCount).toBe(4819);
    expect(CANONICAL_SUMMARY.allNy.flaggedCount).toBe(2963);
  });

  it("records the materiality-screen mix and applicant name-stability audit", () => {
    const mix = CANONICAL_SUMMARY.meta.flagMix;
    expect(mix?.flaggedCount).toBe(2963);
    expect(mix?.amountScreen).toBe(2935);
    expect(mix?.highDollar).toBe(2327);
    expect(mix?.extreme).toBe(608);
    expect(mix?.negative).toBe(28);
    expect(mix?.missing).toBe(0);
    expect(mix?.duplicateLooking).toBe(0);
    expect(mix!.highDollar + mix!.extreme + mix!.negative).toBe(mix!.flaggedCount);

    const join = CANONICAL_SUMMARY.meta.joinQuality;
    expect(join?.internedExactNameOneToOne).toBe(true);
    expect(join?.nameStabilityAudit?.idsWithMultipleExactNames).toBe(523);
    expect(join?.nameStabilityAudit?.exactNamesWithMultipleIds).toBe(0);
    expect(join?.nameStabilityAudit?.applicantRowsForSnapshotIds).toBe(14908);
  });
});

function metaSum() {
  return CANONICAL_SUMMARY.meta.federalShareSum;
}
