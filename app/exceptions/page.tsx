"use client";

import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { ExceptionMonitor } from "@/components/exception-monitor";
import { FilterBar } from "@/components/filter-bar";
import { usePortfolio } from "@/components/providers";
import { ErrorState, LoadingState } from "@/components/status-panels";

export default function ExceptionsPage() {
  const { loading, error } = usePortfolio();

  if (loading) {
    return <LoadingState label="Loading exception monitor" />;
  }
  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <DisclaimerBanner />
      <FilterBar />
      <ExceptionMonitor />
    </div>
  );
}
