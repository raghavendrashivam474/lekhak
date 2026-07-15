// src/services/reasoning/explanations.ts
//
// Loads temporal events and reasoning state, then calls pure explanation functions.

import type { ServiceResult } from "@/types/service";
import { createClient } from "@/lib/supabase/client";
import { getProjectTemporalEvents } from "@/services/temporal";
import { getProjectReasoning } from "./index";
import {
  buildEvolutionSummary,
  type ExplanationSummary,
} from "@/domain/reasoning/explanations";

export async function getProjectEvolutionExplanation(
  projectId: string
): Promise<ServiceResult<ExplanationSummary>> {
  const supabase = createClient();

  const [eventsRes, reasoningRes] = await Promise.all([
    getProjectTemporalEvents(projectId, 2000),
    getProjectReasoning(projectId),
  ]);

  const events = eventsRes.data ?? [];

  if (reasoningRes.error || !reasoningRes.data) {
    return {
      data: null,
      error: reasoningRes.error ?? "Failed to load reasoning",
    };
  }

  const { threads, input } = reasoningRes.data;

  const questionIds = input.questions.map((q) => ({
    id: q.id,
    question: q.question,
  }));

  const summary = buildEvolutionSummary(events, threads, questionIds);

  return { data: summary, error: null };
}
