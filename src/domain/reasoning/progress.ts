// src/domain/reasoning/progress.ts
//
// Deterministic narrative progress calculation.
// Pure function. No IO.

import type {
  CreativeThread,
  ThreadResolverInput,
  ThreadProgress,
  ProjectNarrativeProgress,
  ProgressFactor,
} from "./types";

// ---------------------------------------------------------------------------
// Thread-level progress
// ---------------------------------------------------------------------------

export function calculateThreadProgress(
  thread: CreativeThread,
  input: ThreadResolverInput
): ThreadProgress {
  const factors: ProgressFactor[] = [];

  const memberSet = new Set(thread.memberNoteIds);
  const memberNotes = input.notes.filter((n) => memberSet.has(n.id));

  // Factor 1: Note coverage (max 30)
  // At least 3 notes = full contribution
  const noteCoverage = Math.min(memberNotes.length / 3, 1);
  const noteContribution = Math.round(noteCoverage * 30);
  factors.push({
    label: `${memberNotes.length} notes in thread`,
    contribution: noteContribution,
    maxContribution: 30,
  });

  // Factor 2: Question resolution (max 35)
  const linkedQuestions = input.questions.filter((q) =>
    thread.linkedQuestionIds.includes(q.id)
  );
  if (linkedQuestions.length > 0) {
    const resolved = linkedQuestions.filter(
      (q) => q.status === "answered" || q.status === "archived"
    ).length;
    const resolutionRate = resolved / linkedQuestions.length;
    const questionContribution = Math.round(resolutionRate * 35);
    factors.push({
      label: `${resolved}/${linkedQuestions.length} questions resolved`,
      contribution: questionContribution,
      maxContribution: 35,
    });
  } else {
    // No questions = neutral, give partial credit
    factors.push({
      label: "No linked questions",
      contribution: 15,
      maxContribution: 35,
    });
  }

  // Factor 3: Intent alignment (max 20)
  const hasIntentLink = thread.linkedIntentContexts.length > 0;
  const intentContribution = hasIntentLink ? 20 : 0;
  factors.push({
    label: hasIntentLink
      ? `Supports ${thread.linkedIntentContexts.map((l) => l.context).join(", ")}`
      : "Not linked to project intent",
    contribution: intentContribution,
    maxContribution: 20,
  });

  // Factor 4: Relationship density (max 15)
  const internalRelationships = input.relationships.filter(
    (r) => memberSet.has(r.fromNoteId) && memberSet.has(r.toNoteId)
  ).length;
  const densityRatio =
    memberNotes.length > 1
      ? Math.min(internalRelationships / (memberNotes.length - 1), 1)
      : 0;
  const densityContribution = Math.round(densityRatio * 15);
  factors.push({
    label: `${internalRelationships} internal connections`,
    contribution: densityContribution,
    maxContribution: 15,
  });

  const total = factors.reduce((sum, f) => sum + f.contribution, 0);

  return {
    threadId: thread.id,
    threadTitle: thread.title,
    completionPercentage: Math.min(total, 100),
    factors,
  };
}

// ---------------------------------------------------------------------------
// Project-level narrative progress
// ---------------------------------------------------------------------------

export function calculateProjectNarrativeProgress(
  threads: CreativeThread[],
  input: ThreadResolverInput
): ProjectNarrativeProgress {
  if (threads.length === 0) {
    return {
      projectId: input.projectId,
      overallPercentage: 0,
      threadProgress: [],
      factors: [
        {
          label: "No creative threads detected",
          contribution: 0,
          maxContribution: 100,
        },
      ],
    };
  }

  const threadProgress = threads.map((t) => calculateThreadProgress(t, input));

  // Overall = weighted average by member count (larger threads weigh more)
  let totalWeight = 0;
  let weightedSum = 0;
  for (const tp of threadProgress) {
    const thread = threads.find((t) => t.id === tp.threadId);
    const weight = thread ? thread.memberNoteIds.length : 1;
    weightedSum += tp.completionPercentage * weight;
    totalWeight += weight;
  }

  const overall = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  // Project-level factors
  const factors: ProgressFactor[] = [];

  // All questions
  const totalQuestions = input.questions.length;
  const resolvedQuestions = input.questions.filter(
    (q) => q.status === "answered" || q.status === "archived"
  ).length;
  if (totalQuestions > 0) {
    factors.push({
      label: `${resolvedQuestions}/${totalQuestions} project questions resolved`,
      contribution: Math.round((resolvedQuestions / totalQuestions) * 30),
      maxContribution: 30,
    });
  }

  // Thread coverage
  const coveredNoteIds = new Set<string>();
  for (const t of threads) {
    for (const nid of t.memberNoteIds) coveredNoteIds.add(nid);
  }
  const coverageRate =
    input.notes.length > 0
      ? coveredNoteIds.size / input.notes.length
      : 0;
  factors.push({
    label: `${coveredNoteIds.size}/${input.notes.length} notes belong to threads`,
    contribution: Math.round(coverageRate * 20),
    maxContribution: 20,
  });

  return {
    projectId: input.projectId,
    overallPercentage: overall,
    threadProgress,
    factors,
  };
}
