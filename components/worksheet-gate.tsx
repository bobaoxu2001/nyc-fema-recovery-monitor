"use client";

import { useData, useWorksheets } from "./providers";
import { ErrorState, LoadingState } from "./status-panels";

export function WorksheetGate({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const status = useWorksheets();
  const { error } = useData();

  if (status === "idle" || status === "loading") {
    return <LoadingState label={label} />;
  }
  if (status === "error") {
    return <ErrorState message={error || "The worksheet snapshot could not be loaded."} />;
  }
  return <>{children}</>;
}
