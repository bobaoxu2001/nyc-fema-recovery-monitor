import { describe, expect, it } from "vitest";
import { computeKpis, computeSignals } from "@/lib/flags";
import type { Project } from "@/lib/types";

function project(id: string, amount: number, extra: Partial<Project> = {}): Project {
  return {
    id,
    gmProjectId: Number(id.replace(/\D/g, "") || 1),
    disasterNumber: extra.disasterNumber ?? 4085,
    disasterTitle: extra.disasterTitle ?? "HURRICANE SANDY",
    femaDeclarationString: extra.femaDeclarationString ?? "DR-4085-NY",
    pwNumber: 1,
    title: `Project ${id}`,
    applicantId: extra.applicantId || "a1",
    applicantName: extra.applicantName || "Applicant A",
    applicantCity: "New York",
    categoryCode: "B",
    category: extra.category || "Emergency Protective Measures",
    status: "Eligible",
    processStep: "Obligated",
    size: "Large",
    county: "Queens County",
    projectAmount: amount,
    federalShare: amount,
    totalObligated: amount,
    declarationDate: "2012-10-30",
    declarationYear: 2012,
    firstObligationDate: "2013-01-01",
    lastObligationDate: "2013-01-01",
    incidentType: "Hurricane",
    nycRelated: true,
    nycReasons: ["borough_county"],
    duplicateGroup: extra.duplicateGroup ?? null,
    missingFields: extra.missingFields ?? [],
    ...extra,
  };
}

describe("computeSignals", () => {
  it("does not apply percentile flags when a disaster cohort has n < 20", () => {
    const rows = Array.from({ length: 10 }, (_, i) => project(`p${i}`, (i + 1) * 1000));
    const signals = computeSignals(rows);
    expect(Object.values(signals.flagsById).flat().some((flag) => flag.code === "high_dollar")).toBe(
      false,
    );
    expect(Object.values(signals.flagsById).flat().some((flag) => flag.code === "extreme_outlier")).toBe(
      false,
    );
  });

  it("makes high-dollar and extreme mutually exclusive", () => {
    const rows = Array.from({ length: 100 }, (_, i) => project(`p${i}`, i + 1));
    const signals = computeSignals(rows);
    const high = rows.filter((row) => (signals.flagsById[row.id] || []).some((flag) => flag.code === "high_dollar"));
    const extreme = rows.filter((row) =>
      (signals.flagsById[row.id] || []).some((flag) => flag.code === "extreme_outlier"),
    );
    expect(high.length).toBeGreaterThanOrEqual(1);
    expect(extreme.length).toBeGreaterThanOrEqual(1);
    const overlap = high.filter((row) => extreme.some((item) => item.id === row.id));
    expect(overlap).toHaveLength(0);
  });

  it("compares amount flags within the same disaster, not the whole file", () => {
    const sandy = Array.from({ length: 100 }, (_, i) => project(`s${i}`, i + 1, { disasterNumber: 4085, femaDeclarationString: "DR-4085-NY" }));
    const flood = Array.from({ length: 25 }, (_, i) =>
      project(`f${i}`, i + 1, { disasterNumber: 4397, femaDeclarationString: "DR-4397-NY", disasterTitle: "FLOOD" }),
    );
    const signals = computeSignals([...sandy, ...flood]);
    const floodMax = flood[24];
    const sandyMid = sandy[49];
    expect((signals.flagsById[floodMax.id] || []).map((flag) => flag.code)).toContain("extreme_outlier");
    expect((signals.flagsById[sandyMid.id] || []).map((flag) => flag.code)).not.toContain("high_dollar");
    expect((signals.flagsById[sandyMid.id] || []).map((flag) => flag.code)).not.toContain("extreme_outlier");
  });

  it("keeps amount flags if a later page filter isolates one applicant", () => {
    const rows = Array.from({ length: 100 }, (_, i) =>
      project(`p${i}`, i + 1, { applicantId: i === 99 ? "big" : "small", applicantName: i === 99 ? "Big" : "Small" }),
    );
    const universe = computeSignals(rows);
    const onlyBig = rows.filter((row) => row.applicantId === "big");
    expect(onlyBig).toHaveLength(1);
    expect((universe.flagsById[onlyBig[0].id] || []).map((flag) => flag.code)).toContain("extreme_outlier");
  });

  it("flags missing fields, negatives, and duplicate-looking records", () => {
    const rows = [
      project("m", 10, { missingFields: ["applicantName"] }),
      project("n", -50),
      project("d", 20, { duplicateGroup: "dg-1" }),
    ];
    const signals = computeSignals(rows);
    expect(signals.flagsById.m.map((flag) => flag.code)).toContain("missing_fields");
    expect(signals.flagsById.n.map((flag) => flag.code)).toContain("negative_obligation");
    expect(signals.flagsById.d.map((flag) => flag.code)).toContain("duplicate_looking");
  });

  it("reports top applicant share without a concentrated label", () => {
    const rows = [
      ...Array.from({ length: 9 }, (_, i) => project(`s${i}`, 100, { applicantId: `s${i}`, applicantName: `Small ${i}` })),
      project("big", 1000, { applicantId: "big", applicantName: "Large Applicant" }),
    ];
    const signals = computeSignals(rows);
    expect(signals.applicantConcentration[0].key).toBe("big");
    expect(signals.applicantConcentration[0].share).toBeCloseTo(1000 / 1900);
    expect(signals.applicantConcentration.every((row) => row.concentrated === false)).toBe(true);
  });
});

describe("computeKpis", () => {
  it("sums federal share without double-counting rows", () => {
    const rows = [project("a", 100), project("b", 250)];
    const kpis = computeKpis(rows, {});
    expect(kpis.projectCount).toBe(2);
    expect(kpis.federalShare).toBe(350);
    expect(kpis.medianProject).toBe(175);
  });

  it("handles empty portfolios", () => {
    const kpis = computeKpis([], {});
    expect(kpis.projectCount).toBe(0);
    expect(kpis.federalShare).toBe(0);
    expect(kpis.medianProject).toBeNull();
    expect(kpis.flaggedCount).toBe(0);
  });
});
