// src/services/temporal/reconstruction.ts
//
// Thin orchestrator: loads current project state + temporal history,
// hands to the pure domain reconstructor, returns a TemporalSnapshot.

import type { ServiceResult } from "@/types/service";

import { createClient } from "@/lib/supabase/client";
import { getProjectTemporalEvents } from "@/services/temporal";
import {
  reconstructIntentAt,
  reconstructQuestionsAt,
  reconstructRelationshipsAt,
  type TemporalSnapshot,
} from "@/domain/temporal";

export async function reconstructProjectSnapshot(
  projectId: string,
  referenceTime: Date
): Promise<ServiceResult<TemporalSnapshot>> {
  const supabase = createClient();

  const { data: project, error: projectErr } = await supabase
    .from("projects")
    .select("id, goal, current_focus, next_step")
    .eq("id", projectId)
    .single();

  if (projectErr || !project) {
    return {
      data: null,
      error: projectErr?.message ?? "Project not found",
    };
  }

  const eventsRes = await getProjectTemporalEvents(projectId, 2000);
  const eventsNewestFirst = eventsRes.data ?? [];
  const eventsOldestFirst = [...eventsNewestFirst].reverse();

  const intent = reconstructIntentAt(
    {
      goal: project.goal,
      current_focus: project.current_focus,
      next_step: project.next_step,
    },
    eventsOldestFirst,
    referenceTime
  );

  const questions = reconstructQuestionsAt(eventsOldestFirst, referenceTime);
  const relationships = reconstructRelationshipsAt(
    eventsOldestFirst,
    referenceTime
  );

  return {
    data: {
      project_id: projectId,
      at: referenceTime.toISOString(),
      intent,
      questions,
      relationships,
    },
    error: null,
  };
}
