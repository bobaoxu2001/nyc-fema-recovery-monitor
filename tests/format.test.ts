import { describe, expect, it } from "vitest";
import { formatCompactUsd, formatPercent, formatUsd } from "@/lib/format";

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
