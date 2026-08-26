import { describe, expect, it } from "vitest";
import {
  formatCompactUsd,
  formatPercent,
  formatProvenanceCount,
  formatProvenanceUsd,
  formatRefreshShort,
  formatRefreshedAt,
  formatUsd,
} from "@/lib/format";

describe("formatCompactUsd", () => {
  it("formats billions, millions, and thousands", () => {
    expect(formatCompactUsd(4_200_000_000)).toBe("$4.2B");
    expect(formatCompactUsd(315_600_000)).toBe("$315.6M");
    expect(formatCompactUsd(820_000)).toBe("$820K");
  });

  it("handles null, zero, and negatives", () => {
    expect(formatCompactUsd(null)).toBe("—");
    expect(formatCompactUsd(0)).toBe("$0");
    expect(formatCompactUsd(-1_500_000)).toBe("-$1.5M");
  });
});

describe("formatUsd", () => {
  it("uses rounded currency", () => {
    expect(formatUsd(1999.6)).toBe("$2,000");
  });
});

describe("formatPercent", () => {
  it("formats shares", () => {
    expect(formatPercent(0.1234)).toBe("12.3%");
    expect(formatPercent(null)).toBe("—");
  });
});

describe("provenance formatting", () => {
  it("does not turn missing metadata into zero", () => {
    expect(formatProvenanceCount(null)).toBe("Unavailable");
    expect(formatProvenanceCount(undefined)).toBe("Unavailable");
    expect(formatProvenanceCount(Number.NaN)).toBe("Unavailable");
    expect(formatProvenanceUsd(null)).toBe("Unavailable");
    expect(formatProvenanceCount(0)).toBe("0");
    expect(formatProvenanceCount(59291)).toBe("59,291");
    expect(formatProvenanceUsd(41058915840.25)).toBe("$41.1B");
  });

  it("formats refresh dates without ISO strings", () => {
    expect(formatRefreshShort(null)).toBe("Unavailable");
    expect(formatRefreshedAt(undefined)).toBe("Unavailable");
    expect(formatRefreshShort("2026-08-26T02:30:43Z")).toBe("Aug 26, 2026");
    expect(formatRefreshedAt("2026-08-26T02:30:43Z")).toBe("August 26, 2026");
  });
});
