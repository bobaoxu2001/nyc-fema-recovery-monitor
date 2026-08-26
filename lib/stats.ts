export function percentile(values: number[], p: number): number | null {
  if (!values.length) return null;
  const ordered = [...values].sort((a, b) => a - b);
  if (ordered.length === 1) return ordered[0];
  const rank = (ordered.length - 1) * p;
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return ordered[low];
  const weight = rank - low;
  return ordered[low] * (1 - weight) + ordered[high] * weight;
}

export function median(values: number[]): number | null {
  return percentile(values, 0.5);
}

export function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function sumNumbers(values: Array<number | null | undefined>): number {
  let total = 0;
  for (const value of values) {
    if (typeof value === "number" && !Number.isNaN(value)) {
      total += value;
    }
  }
  return total;
}
