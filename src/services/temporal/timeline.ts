// src/services/temporal/timeline.ts
//
// Loads current project + temporal events + turning points and returns a
// curated EvolutionTimelineItem[] plus the current phase snapshot.

import type { ServiceResult } from "@/types/service";

import { createClient } from "@/lib/supabase/client";
import {
  getProjectTemporalEvents,
} from "@/services/temporal";
import { getProjectPhaseSnapshot } from "@/services/temporal/phases";
import {
  buildEvolutionTimeline,
  type EvolutionTimelineItem,
  type ProjectPhaseResult,
  type TurningPoint,
} from "@/domain/temporal";

export interface EvolutionSnapshot {
  items: EvolutionTimelineItem[];
  phase: ProjectPhaseResult;
  turningPoints: TurningPoint[];
  projectCreatedAt: string;
}

export async function getProjectEvolutionTimeline(
  projectId: string
): Promise<ServiceResult<EvolutionSnapshot>> {
  const supabase = createClient();

  // Project creation date — used for the "Project Began" anchor.
  const { data: project, error: projectErr } = await supabase
    .from("projects")
    .select("id, created_at")
    .eq("id", projectId)
    .single();

  if (projectErr || !project) {
    return {
      data: null,
      error: projectErr?.message ?? "Project not found",
    };
  }

  const [eventsRes, phaseRes] = await Promise.all([
    getProjectTemporalEvents(projectId, 2000),
    getProjectPhaseSnapshot(projectId),
  ]);

  const eventsNewestFirst = eventsRes.data ?? [];
  const eventsOldestFirst = [...eventsNewestFirst].reverse();

  if (phaseRes.error || !phaseRes.data) {
    return { data: null, error: phaseRes.error ?? "Failed to resolve phase" };
  }

  const items = buildEvolutionTimeline({
    projectCreatedAt: project.created_at,
    events: eventsOldestFirst,
    turningPoints: phaseRes.data.turningPoints,
  });

  return {
    data: {
      items,
      phase: phaseRes.data.phase,
      turningPoints: phaseRes.data.turningPoints,
      projectCreatedAt: project.created_at,
    },
    error: null,
  };
}
