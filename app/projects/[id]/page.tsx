"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ProjectDetail } from "@/components/project-detail";
import { usePortfolio } from "@/components/providers";
import { ErrorState } from "@/components/status-panels";
import { WorksheetGate } from "@/components/worksheet-gate";

function ProjectDetailBody() {
  const params = useParams<{ id: string }>();
  const { allProjects, signals } = usePortfolio();
  const project = useMemo(
    () => allProjects.find((item) => item.id === params.id),
    [allProjects, params.id],
  );
  if (!project) {
    return <ErrorState message="That project id is not in the current OpenFEMA snapshot." />;
  }
  return <ProjectDetail project={project} flags={signals.flagsById[project.id] || []} />;
}

export default function ProjectDetailPage() {
  return (
    <WorksheetGate label="Loading project worksheet">
      <ProjectDetailBody />
    </WorksheetGate>
  );
}
