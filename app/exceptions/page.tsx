"use client";

import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { ExceptionMonitor } from "@/components/exception-monitor";
import { FilterBar } from "@/components/filter-bar";
import { usePortfolio } from "@/components/providers";
import { ScopeBar } from "@/components/scope-bar";
import { ErrorState, LoadingState } from "@/components/status-panels";

export default function ExceptionsPage() {
  const { hydrating, error, meta } = usePortfolio();

  if (error && !meta.recordCount) {
    return <ErrorState message={error} />;
  }
  if (hydrating) {
    return <LoadingState label="Loading exception monitor" />;
  }
  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <DisclaimerBanner />
      <ScopeBar />
      <FilterBar />
      <ExceptionMonitor />
    </div>
  );
}
