// src/domain/reasoning/engine.ts
//
// Deterministic creative reasoning engine.
// Every insight must have traceable evidence.
// No AI. No generated text. Pure rules.

import type {
  ReasoningContext,
  ReasoningResult,
  ReasoningInsight,
  ReasoningEvidence,
  ReasoningRuleId,
  InsightSeverity,
} from "./types";

// ---------------------------------------------------------------------------
// Rule helpers
// ---------------------------------------------------------------------------

function makeInsight(
  ruleId: ReasoningRuleId,
  severity: InsightSeverity,
  title: string,
  message: string,
  evidence: ReasoningEvidence[]
): ReasoningInsight {
  return {
    id: `insight::${ruleId}::${Date.now()}`,
    ruleId,
    severity,
    title,
    message,
    evidence,
  };
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

function ruleGoalBlocked(ctx: ReasoningContext): ReasoningInsight | null {
  if (!ctx.intent.goal) return null;

  const goalBlockers = ctx.dependencies.blockers.filter((b) =>
    b.blockedIds.some((id) => id === "intent::goal")
  );

  if (goalBlockers.length === 0) return null;

  const evidence: ReasoningEvidence[] = goalBlockers.map((b) => ({
    entityType: b.blockerType,
    entityId: b.blockerId,
    label: b.blockerLabel,
    detail: b.reason,
  }));

  return makeInsight(
    "goal_blocked",
    "critical",
    "Goal is blocked",
    `${goalBlockers.length} unresolved issue${goalBlockers.length !== 1 ? "s" : ""} blocking your project goal.`,
    evidence
  );
}

function ruleFocusStale(ctx: ReasoningContext): ReasoningInsight | null {
  if (!ctx.intent.currentFocus) return null;
  if (ctx.activityLast7Days >= 3) return null;

  // Focus exists but no recent activity
  return makeInsight(
    "focus_stale",
    "warning",
    "Focus may be stale",
    "Your current focus is set but there has been little recent activity.",
    [
      {
        entityType: "intent",
        entityId: "focus",
        label: "Current Focus",
        detail: ctx.intent.currentFocus,
      },
      {
        entityType: "activity",
        entityId: "recent",
        label: "Recent Activity",
        detail: `${ctx.activityLast7Days} activities in the last 7 days`,
      },
    ]
  );
}

function ruleThreadStalled(ctx: ReasoningContext): ReasoningInsight | null {
  const stalledThreads = ctx.progress.threadProgress.filter(
    (tp) => tp.completionPercentage > 20 && tp.completionPercentage < 60
  );

  if (stalledThreads.length === 0) return null;

  // Check if these threads have unresolved blockers
  const blockerThreadIds = new Set(
    ctx.dependencies.blockers.flatMap((b) => b.blockedIds)
  );
  const blockedStalled = stalledThreads.filter((tp) =>
    blockerThreadIds.has(`thread::${tp.threadId}`)
  );

  if (blockedStalled.length === 0) return null;

  const evidence: ReasoningEvidence[] = blockedStalled.map((tp) => ({
    entityType: "thread",
    entityId: tp.threadId,
    label: tp.threadTitle,
    detail: `${tp.completionPercentage}% complete but blocked`,
  }));

  return makeInsight(
    "thread_stalled",
    "warning",
    "Creative threads are stalled",
    `${blockedStalled.length} thread${blockedStalled.length !== 1 ? "s are" : " is"} partially complete but blocked by unresolved dependencies.`,
    evidence
  );
}

function ruleQuestionsAccumulating(ctx: ReasoningContext): ReasoningInsight | null {
  const openQuestions = ctx.input.questions.filter(
    (q) => q.status === "open" || q.status === "in_progress"
  );

  if (openQuestions.length < 5) return null;

  const evidence: ReasoningEvidence[] = openQuestions.slice(0, 3).map((q) => ({
    entityType: "question",
    entityId: q.id,
    label: q.question,
    detail: `Status: ${q.status}`,
  }));

  return makeInsight(
    "questions_accumulating",
    "warning",
    "Questions are accumulating",
    `${openQuestions.length} questions remain unresolved. Consider addressing some before adding more.`,
    evidence
  );
}

function ruleOrphanGrowth(ctx: ReasoningContext): ReasoningInsight | null {
  const coveredNoteIds = new Set<string>();
  for (const t of ctx.threads) {
    for (const nid of t.memberNoteIds) coveredNoteIds.add(nid);
  }

  const orphanNotes = ctx.input.notes.filter((n) => !coveredNoteIds.has(n.id));
  const orphanRate = ctx.input.notes.length > 0
    ? orphanNotes.length / ctx.input.notes.length
    : 0;

  if (orphanNotes.length < 3 || orphanRate < 0.4) return null;

  const evidence: ReasoningEvidence[] = orphanNotes.slice(0, 3).map((n) => ({
    entityType: "note",
    entityId: n.id,
    label: n.title,
    detail: `Category: ${n.category}, not connected to any thread`,
  }));

  return makeInsight(
    "orphan_growth",
    "warning",
    "Many notes are disconnected",
    `${orphanNotes.length} of ${ctx.input.notes.length} notes don't belong to any creative thread.`,
    evidence
  );
}

function ruleDependencyChainBroken(ctx: ReasoningContext): ReasoningInsight | null {
  if (ctx.dependencies.criticalPath.length < 3) return null;

  const unresolvedOnPath = ctx.dependencies.graph.nodes.filter(
    (n) => ctx.dependencies.criticalPath.includes(n.id) && !n.resolved
  );

  if (unresolvedOnPath.length < 2) return null;

  const evidence: ReasoningEvidence[] = unresolvedOnPath.slice(0, 3).map((n) => ({
    entityType: n.type,
    entityId: n.id,
    label: n.label,
    detail: `Unresolved ${n.type} on the critical dependency path`,
  }));

  return makeInsight(
    "dependency_chain_broken",
    "critical",
    "Dependency chain is broken",
    `${unresolvedOnPath.length} unresolved dependencies form a chain that blocks progress.`,
    evidence
  );
}

function ruleStrongMomentum(ctx: ReasoningContext): ReasoningInsight | null {
  if (ctx.writingStreakDays < 3 || ctx.activityLast7Days < 5) return null;

  return makeInsight(
    "strong_momentum",
    "positive",
    "Strong writing momentum",
    `${ctx.writingStreakDays}-day writing streak with ${ctx.activityLast7Days} activities this week.`,
    [
      {
        entityType: "activity",
        entityId: "streak",
        label: "Writing Streak",
        detail: `${ctx.writingStreakDays} consecutive days`,
      },
    ]
  );
}

function ruleResearchComplete(ctx: ReasoningContext): ReasoningInsight | null {
  const researchThreads = ctx.threads.filter((t) =>
    t.title.toLowerCase().includes("research") ||
    t.memberNoteIds.some((nid) => {
      const note = ctx.input.notes.find((n) => n.id === nid);
      return note?.category === "research";
    })
  );

  if (researchThreads.length === 0) return null;

  const researchProgress = ctx.progress.threadProgress.filter((tp) =>
    researchThreads.some((rt) => rt.id === tp.threadId)
  );

  const allComplete = researchProgress.every((rp) => rp.completionPercentage >= 80);
  if (!allComplete) return null;

  return makeInsight(
    "research_complete",
    "positive",
    "Research threads are well-developed",
    "Research-related threads have reached high completion.",
    researchProgress.map((rp) => ({
      entityType: "thread",
      entityId: rp.threadId,
      label: rp.threadTitle,
      detail: `${rp.completionPercentage}% complete`,
    }))
  );
}

function ruleApproachingCompletion(ctx: ReasoningContext): ReasoningInsight | null {
  if (ctx.progress.overallPercentage < 75) return null;
  if (ctx.dependencies.blockers.length > 0) return null;

  return makeInsight(
    "approaching_completion",
    "positive",
    "Approaching completion",
    `Overall narrative progress is at ${ctx.progress.overallPercentage}% with no blockers.`,
    [
      {
        entityType: "project",
        entityId: ctx.projectId,
        label: "Narrative Progress",
        detail: `${ctx.progress.overallPercentage}% complete`,
      },
    ]
  );
}

function ruleCreativeDrift(ctx: ReasoningContext): ReasoningInsight | null {
  if (!ctx.intent.currentFocus) return null;
  if (ctx.threads.length === 0) return null;

  // Check if any thread aligns with current focus via intent links
  const focusAligned = ctx.threads.some((t) =>
    t.linkedIntentContexts.some((l) => l.context === "focus")
  );

  if (focusAligned) return null;

  // Recent work doesn't align with focus
  return makeInsight(
    "creative_drift",
    "info",
    "Work may be drifting from focus",
    "No creative threads are currently linked to your stated focus.",
    [
      {
        entityType: "intent",
        entityId: "focus",
        label: "Current Focus",
        detail: ctx.intent.currentFocus,
      },
    ]
  );
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

const ALL_RULES = [
  ruleGoalBlocked,
  ruleFocusStale,
  ruleThreadStalled,
  ruleQuestionsAccumulating,
  ruleOrphanGrowth,
  ruleDependencyChainBroken,
  ruleStrongMomentum,
  ruleResearchComplete,
  ruleApproachingCompletion,
  ruleCreativeDrift,
];

export function analyzeProject(ctx: ReasoningContext): ReasoningResult {
  const insights: ReasoningInsight[] = [];

  for (const rule of ALL_RULES) {
    const result = rule(ctx);
    if (result) insights.push(result);
  }

  // Sort: critical first, then warning, then info, then positive
  const severityOrder: Record<InsightSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
    positive: 3,
  };
  insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Continue here — derive from highest-priority actionable insight
  let continueHere: string | null = null;
  const firstActionable = insights.find(
    (i) => i.severity === "critical" || i.severity === "warning"
  );
  if (firstActionable) {
    continueHere = firstActionable.message;
  } else if (ctx.intent.nextStep) {
    continueHere = ctx.intent.nextStep;
  }

  // Attention areas — top 3 non-positive insights
  const attentionAreas = insights
    .filter((i) => i.severity !== "positive")
    .slice(0, 3)
    .map((i) => i.title);

  return {
    projectId: ctx.projectId,
    insights,
    continueHere,
    attentionAreas,
    generatedAt: new Date().toISOString(),
  };
}
