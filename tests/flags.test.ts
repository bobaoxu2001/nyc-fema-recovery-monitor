import { describe, expect, it } from "vitest";
import { computeKpis, computeSignals } from "@/lib/flags";
import type { Project } from "@/lib/types";

function project(id: string, amount: number, extra: Partial<Project> = {}): Project {
  return {
    id,
    gmProjectId: Number(id.replace(/\D/g, "") || 1),
    disasterNumber: 4085,
    disasterTitle: "HURRICANE SANDY",
    femaDeclarationString: "DR-4085-NY",
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
  it("does not apply percentile flags when n < 20", () => {
    const rows = Array.from({ length: 10 }, (_, i) => project(`p${i}`, (i + 1) * 1000));
    const signals = computeSignals(rows);
    expect(signals.p95).toBeNull();
    expect(Object.values(signals.flagsById).flat().some((flag) => flag.code === "high_dollar")).toBe(
      false,
    );
  });

  it("flags top 5% and top 1% on a 100-project set", () => {
    const rows = Array.from({ length: 100 }, (_, i) => project(`p${i}`, i + 1));
    const signals = computeSignals(rows);
    expect(signals.p95).toBeCloseTo(95.05, 5);
    expect(signals.p99).toBeCloseTo(99.01, 5);
    const high = rows.filter((row) => (signals.flagsById[row.id] || []).some((flag) => flag.code === "high_dollar"));
    const extreme = rows.filter((row) =>
      (signals.flagsById[row.id] || []).some((flag) => flag.code === "extreme_outlier"),
    );
    expect(high.length).toBeGreaterThanOrEqual(5);
    expect(extreme.length).toBeGreaterThanOrEqual(1);
    expect(extreme.every((row) => high.some((item) => item.id === row.id))).toBe(true);
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

  it("marks applicant concentration at 10%", () => {
    const rows = [
      ...Array.from({ length: 9 }, (_, i) => project(`s${i}`, 100, { applicantId: `s${i}`, applicantName: `Small ${i}` })),
      project("big", 1000, { applicantId: "big", applicantName: "Large Applicant" }),
    ];
    const signals = computeSignals(rows);
    const large = signals.applicantConcentration.find((row) => row.key === "big");
    expect(large?.concentrated).toBe(true);
    expect(large?.share).toBeCloseTo(1000 / 1900);
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
