// src/services/temporal/phases.ts
//
// Thin orchestrator: pulls current project + intelligence + temporal events,
// then calls the pure domain resolver. Callers get a fully-formed
// ProjectPhaseResult and a list of TurningPoints.
//
// This layer is where IO lives so the domain stays pure.

import type { ServiceResult } from "@/types/service";

import { createClient } from "@/lib/supabase/client";
import { getProjectTemporalEvents } from "@/services/temporal";
import {
  calculateMomentum,
} from "@/services/intelligence/momentum";
import { calculateProjectStatus } from "@/services/intelligence/health";
import {
  resolveProjectPhase,
  detectTurningPoints,
  type ProjectPhaseResult,
  type TurningPoint,
} from "@/domain/temporal";

interface ProjectPhaseSnapshot {
  phase: ProjectPhaseResult;
  turningPoints: TurningPoint[];
}

/**
 * Compute the current phase AND the meaningful turning points for a project.
 *
 * `referenceTime` defaults to now. Passing an explicit value is how the
 * historical reconstruction layer (Commit 6/8) will ask "what phase was
 * this on July 4?".
 */
export async function getProjectPhaseSnapshot(
  projectId: string,
  referenceTime: Date = new Date()
): Promise<ServiceResult<ProjectPhaseSnapshot>> {
  const supabase = createClient();

  // --- Load the project row we need for phase inputs -----------------------
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

  // --- Ancillary counts ----------------------------------------------------
  const [notesRes, collectionsRes, questionsRes] = await Promise.all([
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("project_id", projectId),
    supabase.from("collections").select("id", { count: "exact", head: true }).eq("project_id", projectId),
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("project_id", projectId).eq("status", "open"),
  ]);

  const noteCount = notesRes.count ?? 0;
  const collectionCount = collectionsRes.count ?? 0;
  const openQuestionCount = questionsRes.count ?? 0;

  // --- Intelligence (Sprint 8) ---------------------------------------------
  const [momentum, status] = await Promise.all([
    calculateMomentum(),
    calculateProjectStatus(projectId),
  ]);

  const isDormant = status.status === "dormant";

  // --- Temporal events for this project ------------------------------------
  const eventsRes = await getProjectTemporalEvents(projectId, 1000);
  const events = eventsRes.data ?? [];
  // getProjectTemporalEvents returns newest-first; the phase/turning-point
  // detectors want oldest → newest.
  const eventsOldestFirst = [...events].reverse();

  // --- Pure resolution -----------------------------------------------------
  const phase = resolveProjectPhase({
    referenceTime,
    isDormant,
    writingStreakDays: momentum.writing_streak_days,
    activityLast7Days: momentum.active_this_week,
    activityLast30Days: momentum.active_this_month,
    hasGoal: !!project.goal,
    hasFocus: !!project.current_focus,
    hasNextStep: !!project.next_step,
    noteCount,
    collectionCount,
    openQuestionCount,
    events: eventsOldestFirst,
  });

  const turningPoints = detectTurningPoints({
    projectId,
    events: eventsOldestFirst,
    // No phase-transition input for now — Commit 6 may add per-day phase
    // sampling if we decide it is worth the load. Direction changes, focus
    // shifts, resolutions, and breakthroughs still produce turning points.
    phaseTransitions: undefined,
  });

  return {
    data: { phase, turningPoints },
    error: null,
  };
}
