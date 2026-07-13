// src/domain/temporal/phases.ts
//
// Deterministic project phase resolver.
//
// This is a PURE function surface — no IO, no clock reads except through
// the explicit `referenceTime` parameter. Same inputs, same output.
//
// The resolver reads:
//   - existing Sprint 8 intelligence (momentum, dormancy, status)
//   - temporal events (question activity, focus changes, relationships)
// and returns one of six phases with an ordered signal list explaining why.

import type { TemporalEvent } from "./types";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ProjectPhase =
  | "exploring"
  | "structuring"
  | "active"
  | "revising"
  | "dormant"
  | "resumed";

/**
 * A single reason contributing to a phase resolution.
 * `weight` is a positive integer; higher = stronger contribution.
 * The UI is free to display these as human-readable labels.
 */
export interface ProjectPhaseSignal {
  label: string;
  weight: number;
}

export interface ProjectPhaseResult {
  phase: ProjectPhase;
  /**
   * Deterministic confidence in [0, 1].
   * NOT AI certainty. It is `winningScore / totalScore`.
   * When all candidates score 0, confidence is 0 and phase falls back
   * to "exploring" (the safest early-project default).
   */
  confidence: number;
  signals: ProjectPhaseSignal[];
}

// -----------------------------------------------------------------------------
// Input contract
// -----------------------------------------------------------------------------

export interface PhaseResolverInput {
  referenceTime: Date;

  // From Sprint 8 intelligence (already computed by callers).
  isDormant: boolean;
  writingStreakDays: number;
  activityLast7Days: number;
  activityLast30Days: number;

  // From the current project row.
  hasGoal: boolean;
  hasFocus: boolean;
  hasNextStep: boolean;

  // Counts from existing data.
  noteCount: number;
  collectionCount: number;
  openQuestionCount: number;

  // Temporal events for THIS project, oldest first.
  events: TemporalEvent[];
}

// -----------------------------------------------------------------------------
// Rule table
// -----------------------------------------------------------------------------
//
// Each phase gets scored by rules examining recent events + intelligence.
// A rule contributes a positive weight to at most ONE phase per invocation.
// Rules are documented inline so future contributors understand precedence.

const DAY_MS = 24 * 60 * 60 * 1000;

function withinDays(
  eventTime: string,
  referenceTime: Date,
  days: number
): boolean {
  const t = new Date(eventTime).getTime();
  return referenceTime.getTime() - t <= days * DAY_MS;
}

function countRecent(
  events: TemporalEvent[],
  referenceTime: Date,
  days: number,
  eventType: TemporalEvent["event_type"]
): number {
  return events.filter(
    (e) => e.event_type === eventType && withinDays(e.occurred_at, referenceTime, days)
  ).length;
}

export function resolveProjectPhase(
  input: PhaseResolverInput
): ProjectPhaseResult {
  const {
    referenceTime,
    isDormant,
    writingStreakDays,
    activityLast7Days,
    activityLast30Days,
    hasGoal,
    hasFocus,
    hasNextStep,
    noteCount,
    collectionCount,
    openQuestionCount,
    events,
  } = input;

  // Per-phase score buckets and per-phase signal buckets.
  const scores: Record<ProjectPhase, number> = {
    exploring: 0,
    structuring: 0,
    active: 0,
    revising: 0,
    dormant: 0,
    resumed: 0,
  };
  const signals: Record<ProjectPhase, ProjectPhaseSignal[]> = {
    exploring: [],
    structuring: [],
    active: [],
    revising: [],
    dormant: [],
    resumed: [],
  };

  const add = (
    phase: ProjectPhase,
    label: string,
    weight: number
  ): void => {
    scores[phase] += weight;
    signals[phase].push({ label, weight });
  };

  // --- Recent event tallies ------------------------------------------------
  const questionsRaisedLast14 = countRecent(events, referenceTime, 14, "question_raised");
  const questionsResolvedLast14 = countRecent(events, referenceTime, 14, "question_resolved");
  const focusChangesLast14 = countRecent(events, referenceTime, 14, "focus_changed");
  const relationshipsCreatedLast14 = countRecent(events, referenceTime, 14, "relationship_created");
  const intentLinksCreatedLast14 = countRecent(events, referenceTime, 14, "intent_link_created");

  // --- Dormant --------------------------------------------------------------
  //
  // Reuse existing dormancy intelligence — do not implement a second threshold.
  if (isDormant) {
    add("dormant", "Sprint 8 intelligence flagged the project as dormant", 10);
  }

  // --- Resumed --------------------------------------------------------------
  //
  // Signals: previously dormant AND meaningful new activity in the last 7 days.
  // A recent burst after long silence is stronger than one edit.
  if (!isDormant && activityLast7Days >= 3) {
    const hasPriorSilence = events.length > 0 && (() => {
      // Look at the most recent event BEFORE the last 14 days;
      // if the gap from that event to now is >= 30 days, we call it
      // a resume signal.
      const cutoff = referenceTime.getTime() - 14 * DAY_MS;
      const olderEvents = events.filter(
        (e) => new Date(e.occurred_at).getTime() < cutoff
      );
      if (olderEvents.length === 0) return false;
      const mostRecentOld = olderEvents[olderEvents.length - 1];
      const gapDays =
        (referenceTime.getTime() - new Date(mostRecentOld.occurred_at).getTime()) / DAY_MS;
      return gapDays >= 30;
    })();

    if (hasPriorSilence) {
      add("resumed", "Meaningful activity has resumed after a long silence", 8);
    }
  }

  // --- Exploring ------------------------------------------------------------
  if (questionsRaisedLast14 >= 3) {
    add("exploring", `${questionsRaisedLast14} questions raised in the last 14 days`, 3);
  }
  if (questionsRaisedLast14 > questionsResolvedLast14 * 2) {
    add("exploring", "Question creation outpaces resolution", 2);
  }
  if (focusChangesLast14 >= 2) {
    add("exploring", "Focus is still shifting frequently", 2);
  }
  if (!hasGoal && noteCount >= 3) {
    add("exploring", "Notes exist but the goal is not yet defined", 2);
  }

  // --- Structuring ----------------------------------------------------------
  if (relationshipsCreatedLast14 >= 3) {
    add("structuring", `${relationshipsCreatedLast14} new connections in the last 14 days`, 3);
  }
  if (intentLinksCreatedLast14 >= 2) {
    add("structuring", "Notes are being connected to project intent", 2);
  }
  if (collectionCount >= 2) {
    add("structuring", "Knowledge is being organised into collections", 1);
  }

  // --- Active ---------------------------------------------------------------
  //
  // Steady rhythm: goal + focus + next step are all set, positive momentum,
  // stable focus (0-1 focus changes in the last 14 days).
  if (hasGoal && hasFocus && hasNextStep) {
    add("active", "Goal, focus, and next step are all defined", 3);
  }
  if (writingStreakDays >= 3) {
    add("active", `${writingStreakDays}-day writing streak`, 2);
  }
  if (focusChangesLast14 <= 1 && activityLast7Days >= 3) {
    add("active", "Focus is stable with recent activity", 2);
  }

  // --- Revising -------------------------------------------------------------
  //
  // Activity is present but skewed toward updates rather than new questions,
  // relationships, or focus shifts. This is an activity-pattern proxy, not
  // a claim about prose semantics.
  const structuralChangesLast14 =
    relationshipsCreatedLast14 + intentLinksCreatedLast14 + questionsRaisedLast14;
  if (
    activityLast30Days >= 5 &&
    structuralChangesLast14 === 0 &&
    focusChangesLast14 === 0
  ) {
    add("revising", "Sustained activity without new structure or new questions", 3);
  }
  if (questionsResolvedLast14 >= 2 && questionsRaisedLast14 === 0) {
    add("revising", "Existing questions are being resolved, none raised", 2);
  }

  // --- Choose the winner ----------------------------------------------------

  const totalScore = (Object.values(scores) as number[]).reduce(
    (sum, v) => sum + v,
    0
  );

  // Fallback: brand new project with nothing to score.
  if (totalScore === 0) {
    return {
      phase: "exploring",
      confidence: 0,
      signals: [
        {
          label: "Not enough history yet — treating as an early exploring project",
          weight: 0,
        },
      ],
    };
  }

  let winner: ProjectPhase = "exploring";
  let winnerScore = -1;
  (Object.keys(scores) as ProjectPhase[]).forEach((phase) => {
    if (scores[phase] > winnerScore) {
      winner = phase;
      winnerScore = scores[phase];
    }
  });

  return {
    phase: winner,
    confidence: winnerScore / totalScore,
    signals: signals[winner],
  };
}

/**
 * Given a chronological list of `(referenceTime, phase)` samples, returns
 * only the transition points — the moments where phase actually changed.
 *
 * This is what makes phase transitions "meaningful" per the brief: identical
 * consecutive resolutions collapse into a single sample.
 */
export function findPhaseTransitions<T extends { at: string; phase: ProjectPhase }>(
  samples: T[]
): T[] {
  const transitions: T[] = [];
  let last: ProjectPhase | null = null;

  for (const s of samples) {
    if (s.phase !== last) {
      transitions.push(s);
      last = s.phase;
    }
  }

  return transitions;
}
