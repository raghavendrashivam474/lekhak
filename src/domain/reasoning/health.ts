// src/domain/reasoning/health.ts
//
// Deterministic creative health scoring.
// Pure function. No IO.

import type {
  CreativeThread,
  ThreadResolverInput,
  ProjectNarrativeProgress,
  DependencyAnalysis,
  CreativeHealth,
  CreativeHealthMetric,
} from "./types";

interface CreativeHealthInput {
  projectId: string;
  threads: CreativeThread[];
  progress: ProjectNarrativeProgress;
  dependencies: DependencyAnalysis;
  input: ThreadResolverInput;
  intent: {
    goal: string | null;
    currentFocus: string | null;
    nextStep: string | null;
  };
  activityLast7Days: number;
  activityLast30Days: number;
  writingStreakDays: number;
}

export function calculateCreativeHealth(ctx: CreativeHealthInput): CreativeHealth {
  const metrics: CreativeHealthMetric[] = [];

  // 1. Intent Clarity (max 20)
  const intentFields = [ctx.intent.goal, ctx.intent.currentFocus, ctx.intent.nextStep];
  const definedIntents = intentFields.filter((f) => f !== null && f.trim() !== "").length;
  const intentScore = Math.round((definedIntents / 3) * 20);
  metrics.push({
    label: "Intent Clarity",
    score: intentScore,
    maxScore: 20,
    explanation: `${definedIntents}/3 intent fields defined (goal, focus, next step)`,
  });

  // 2. Thread Coverage (max 15)
  const coveredNoteIds = new Set<string>();
  for (const t of ctx.threads) {
    for (const nid of t.memberNoteIds) coveredNoteIds.add(nid);
  }
  const totalNotes = ctx.input.notes.length;
  const coverageRate = totalNotes > 0 ? coveredNoteIds.size / totalNotes : 0;
  const coverageScore = Math.round(coverageRate * 15);
  metrics.push({
    label: "Thread Coverage",
    score: coverageScore,
    maxScore: 15,
    explanation: `${coveredNoteIds.size}/${totalNotes} notes belong to creative threads`,
  });

  // 3. Question Health (max 20)
  const totalQuestions = ctx.input.questions.length;
  const resolved = ctx.input.questions.filter(
    (q) => q.status === "answered" || q.status === "archived"
  ).length;
  const unresolved = totalQuestions - resolved;
  let questionScore = 0;
  if (totalQuestions === 0) {
    questionScore = 10; // neutral — no questions isn't bad
  } else {
    const resolutionRate = resolved / totalQuestions;
    questionScore = Math.round(resolutionRate * 20);
  }
  metrics.push({
    label: "Question Resolution",
    score: questionScore,
    maxScore: 20,
    explanation: totalQuestions > 0
      ? `${resolved}/${totalQuestions} questions resolved, ${unresolved} remaining`
      : "No questions raised yet",
  });

  // 4. Dependency Health (max 15)
  const blockerCount = ctx.dependencies.blockers.length;
  const depScore = blockerCount === 0 ? 15 : Math.max(15 - blockerCount * 3, 0);
  metrics.push({
    label: "Dependency Health",
    score: depScore,
    maxScore: 15,
    explanation: blockerCount === 0
      ? "No blockers detected"
      : `${blockerCount} blocker${blockerCount !== 1 ? "s" : ""} detected`,
  });

  // 5. Momentum (max 15)
  let momentumScore = 0;
  if (ctx.writingStreakDays >= 5) momentumScore = 15;
  else if (ctx.writingStreakDays >= 3) momentumScore = 12;
  else if (ctx.activityLast7Days >= 5) momentumScore = 10;
  else if (ctx.activityLast7Days >= 2) momentumScore = 7;
  else if (ctx.activityLast30Days >= 3) momentumScore = 4;
  else momentumScore = 0;
  metrics.push({
    label: "Writing Momentum",
    score: momentumScore,
    maxScore: 15,
    explanation: ctx.writingStreakDays > 0
      ? `${ctx.writingStreakDays}-day writing streak, ${ctx.activityLast7Days} activities this week`
      : `${ctx.activityLast7Days} activities this week`,
  });

  // 6. Narrative Progress (max 15)
  const progressScore = Math.round((ctx.progress.overallPercentage / 100) * 15);
  metrics.push({
    label: "Narrative Progress",
    score: progressScore,
    maxScore: 15,
    explanation: `Overall narrative progress at ${ctx.progress.overallPercentage}%`,
  });

  const overall = metrics.reduce((sum, m) => sum + m.score, 0);
  const maxPossible = metrics.reduce((sum, m) => sum + m.maxScore, 0);

  // Confidence is based on data availability
  let confidence = 0.3; // baseline
  if (totalNotes >= 3) confidence += 0.15;
  if (totalQuestions >= 1) confidence += 0.1;
  if (ctx.threads.length >= 1) confidence += 0.15;
  if (ctx.activityLast30Days >= 5) confidence += 0.15;
  if (definedIntents >= 2) confidence += 0.15;
  confidence = Math.min(confidence, 1.0);

  return {
    projectId: ctx.projectId,
    overallScore: overall,
    confidence: Math.round(confidence * 100) / 100,
    metrics,
  };
}
