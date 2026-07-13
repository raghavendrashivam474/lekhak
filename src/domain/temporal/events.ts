// src/domain/temporal/events.ts
//
// Pure helpers for detecting when a temporal event is warranted.
// Deterministic. No IO. Safe to unit test.

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
