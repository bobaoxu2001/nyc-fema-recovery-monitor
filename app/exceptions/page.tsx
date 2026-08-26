"use client";

import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { ExceptionMonitor } from "@/components/exception-monitor";
import { FilterBar } from "@/components/filter-bar";
import { ScopeBar } from "@/components/scope-bar";
import { WorksheetGate } from "@/components/worksheet-gate";

function ExceptionsBody() {
  return (
    <div className="space-y-4">
      <DisclaimerBanner />
      <ScopeBar />
      <FilterBar />
      <ExceptionMonitor />
    </div>
  );
}

export default function ExceptionsPage() {
  return (
    <WorksheetGate label="Loading exception monitor">
      <ExceptionsBody />
    </WorksheetGate>
  );
}
