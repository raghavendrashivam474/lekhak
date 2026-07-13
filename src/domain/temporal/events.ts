// src/domain/temporal/events.ts
//
// Pure helpers for detecting when a temporal event is warranted.
// Deterministic. No IO. Safe to unit test.

import type { TemporalEventType } from "./types";

/**
 * Normalises text values before comparison so that whitespace-only
 * or case-only changes do not pollute the temporal history.
 * Sprint 11 rule: only meaningful transitions become events.
 */
export function normaliseIntentValue(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  return value.trim();
}

/**
 * Compares two intent field values and returns true only when the change
 * is semantically meaningful.
 */
export function isMeaningfulTextChange(
  previous: string | null | undefined,
  next: string | null | undefined
): boolean {
  return normaliseIntentValue(previous) !== normaliseIntentValue(next);
}

// -----------------------------------------------------------------------------
// Question lifecycle resolver
// -----------------------------------------------------------------------------
//
// Existing Sprint 6 statuses: "open" | "in_progress" | "answered" | "archived"
// The temporal brief speaks of raised / exploring / resolved / reopened —
// we map those CONCEPTS onto the real statuses without changing the schema.
//
// Rules:
//   open        → in_progress   question_status_changed
//   open        → answered      question_resolved
//   in_progress → answered      question_resolved
//   answered    → open          question_reopened
//   answered    → in_progress   question_reopened
//   anything    → archived      question_status_changed
//   archived    → *             question_status_changed  (recovered)
//   same → same                 null (no-op, skip)
//
// Returns null when no event should be recorded (identical status).

export type LifecycleStatus =
  | "open"
  | "in_progress"
  | "answered"
  | "archived";

export function resolveQuestionTemporalEvent(
  previous: LifecycleStatus,
  next: LifecycleStatus
): TemporalEventType | null {
  if (previous === next) return null;

  // Resolution — moving out of an unresolved state into "answered"
  if (next === "answered" && (previous === "open" || previous === "in_progress")) {
    return "question_resolved";
  }

  // Reopen — moving out of "answered" back into an unresolved state
  if (previous === "answered" && (next === "open" || next === "in_progress")) {
    return "question_reopened";
  }

  // Everything else — a status change, but not a resolution or reopen
  return "question_status_changed";
}
