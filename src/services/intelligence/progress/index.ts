// src/services/intelligence/progress/index.ts

import { createClient } from "@/lib/supabase/client";
import type { GoalProgress } from "@/types/intelligence";

export async function calculateGoalProgress(
  projectId: string
): Promise<GoalProgress> {
  const supabase = createClient();

  const [projectRes, notesRes, questionsRes, intentLinksRes] =
    await Promise.all([
      supabase
        .from("projects")
        .select("goal")
        .eq("id", projectId)
        .single(),
      supabase.from("notes").select("id").eq("project_id", projectId),
      supabase
        .from("questions")
        .select("status")
        .eq("project_id", projectId),
      supabase
        .from("note_intent_links")
        .select("context")
        .eq("project_id", projectId)
        .eq("context", "goal"),
    ]);

  const goal = projectRes.data?.goal ?? null;

  if (!goal) {
    return {
      has_goal: false,
      estimated_percentage: 0,
      factors: [],
    };
  }

  const notes = notesRes.data ?? [];
  const questions = questionsRes.data ?? [];
  const goalLinks = intentLinksRes.data ?? [];

  const answered = questions.filter((q) => q.status === "answered").length;
  const answerRate =
    questions.length > 0 ? answered / questions.length : 0;

  const factors: GoalProgress["factors"] = [];

  // Factor 1 — Goal-supporting notes (max 40%)
  const goalSupportRatio = Math.min(goalLinks.length / Math.max(notes.length, 1), 1);
  const goalSupportContribution = Math.round(goalSupportRatio * 40);
  if (goalLinks.length > 0) {
    factors.push({
      label: `${goalLinks.length} note${goalLinks.length !== 1 ? "s" : ""} supporting the goal`,
      contribution: goalSupportContribution,
    });
  }

  // Factor 2 — Question resolution (max 30%)
  const questionContribution = Math.round(answerRate * 30);
  if (questions.length > 0) {
    factors.push({
      label: `${answered} of ${questions.length} questions answered`,
      contribution: questionContribution,
    });
  }

  // Factor 3 — Note volume (max 20%)
  // A rough proxy: 20 notes = full contribution
  const volumeContribution = Math.min(Math.round((notes.length / 20) * 20), 20);
  if (notes.length > 0) {
    factors.push({
      label: `${notes.length} note${notes.length !== 1 ? "s" : ""} captured`,
      contribution: volumeContribution,
    });
  }

  // Factor 4 — Knowledge coverage baseline (10% if any activity exists)
  const baseline = notes.length > 0 ? 10 : 0;
  if (baseline > 0) {
    factors.push({
      label: "Project actively developed",
      contribution: baseline,
    });
  }

  const estimated = Math.min(
    factors.reduce((sum, f) => sum + f.contribution, 0),
    100
  );

  return {
    has_goal: true,
    estimated_percentage: estimated,
    factors,
  };
}