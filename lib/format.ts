const compactFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const countFormatter = new Intl.NumberFormat("en-US");

function stripTrailingZero(text: string): string {
  return text.replace(/\.0$/, "");
}

export function formatCompactUsd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${sign}$${stripTrailingZero((abs / 1_000_000_000).toFixed(1))}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}$${stripTrailingZero((abs / 1_000_000).toFixed(1))}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${Math.round(abs / 1_000)}K`;
  }
  return `${sign}$${compactFormatter.format(abs)}`;
}

export function formatUsd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return usdFormatter.format(value);
}

export function formatUsdPrecise(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return usdPrecise.format(value);
}

export function formatCount(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return countFormatter.format(value);
}

/** Provenance facts: never render a missing value as 0. */
export function formatProvenanceCount(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "Unavailable";
  return countFormatter.format(value);
}

export function formatProvenanceUsd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "Unavailable";
  return formatCompactUsd(value);
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const iso = value.slice(0, 10);
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${month}/${day}/${year}`;
}

const LONG_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function partsFromIso(iso: string | null | undefined): { year: string; month: number; day: number } | null {
  if (!iso) return null;
  const date = iso.slice(0, 10);
  const [year, month, day] = date.split("-");
  const monthNum = Number(month);
  const dayNum = Number(day);
  if (!year || !monthNum || !dayNum) return null;
  return { year, month: monthNum, day: dayNum };
}

export function formatRefreshedAt(iso: string | null | undefined): string {
  const parts = partsFromIso(iso);
  if (!parts) return "Unavailable";
  return `${LONG_MONTHS[parts.month - 1]} ${parts.day}, ${parts.year}`;
}

export function formatRefreshShort(iso: string | null | undefined): string {
  const parts = partsFromIso(iso);
  if (!parts) return "Unavailable";
  return `${SHORT_MONTHS[parts.month - 1]} ${parts.day}, ${parts.year}`;
}
