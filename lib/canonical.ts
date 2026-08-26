import summaryJson from "../data/processed/summary.json";
import type { PortfolioSummary, SnapshotMeta } from "./types";

export const CANONICAL_SUMMARY = summaryJson as unknown as PortfolioSummary;

export function canonicalMeta(meta?: SnapshotMeta | null): SnapshotMeta {
  return meta ?? CANONICAL_SUMMARY.meta;
}
