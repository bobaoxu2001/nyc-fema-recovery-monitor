"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { computeSignals } from "@/lib/flags";
import { applyBaseFilters } from "@/lib/filters";
import { ProjectDetail } from "@/components/project-detail";
import { useData, useFilters } from "@/components/providers";
import { ErrorState, LoadingState } from "@/components/status-panels";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { loading, error, projects } = useData();
  const { filters } = useFilters();

  const project = useMemo(
    () => projects.find((item) => item.id === params.id),
    [projects, params.id],
  );

  const flags = useMemo(() => {
    const { flag: _flag, ...rest } = filters;
    const base = applyBaseFilters(projects, rest);
    const signals = computeSignals(base);
    return project ? signals.flagsById[project.id] || [] : [];
  }, [filters, projects, project]);

  if (loading) {
    return <LoadingState label="Loading project worksheet" />;
  }
  if (error) {
    return <ErrorState message={error} />;
  }
  if (!project) {
    return (
      <ErrorState message="That project id is not in the current OpenFEMA snapshot." />
    );
  }

  return <ProjectDetail project={project} flags={flags} />;
}
