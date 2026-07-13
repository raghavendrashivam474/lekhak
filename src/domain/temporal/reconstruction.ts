// src/domain/temporal/reconstruction.ts
//
// Deterministic historical reconstruction.
//
// Strategy: reverse replay.
//   1. Start from CURRENT state.
//   2. Walk temporal events from newest to oldest.
//   3. For every event whose occurred_at > referenceTime, invert its effect.
//   4. What remains is the state at referenceTime.
//
// Pure functions. No IO. No `new Date()` without an explicit parameter.
//
// Boundaries (per Sprint 11 brief §39):
//   - Reconstructs: goal, current_focus, next_step, question lifecycle,
//                   relationship lifecycle.
//   - Does NOT reconstruct: note body content, note titles, deleted note
//                           bodies, rich text history.

import type { TemporalEvent } from "./types";

// -----------------------------------------------------------------------------
// Reconstructed shapes
// -----------------------------------------------------------------------------

export interface ReconstructedIntent {
  goal: string | null;
  current_focus: string | null;
  next_step: string | null;
}

/**
 * A question as it existed at the reference time.
 * `existed=false` means the question did not yet exist at that moment.
 */
export interface ReconstructedQuestion {
  id: string;
  question: string;
  status: "open" | "in_progress" | "answered" | "archived" | "deleted";
  existed: boolean;
}

/**
 * A note-to-note or note-to-project relationship as it existed at the
 * reference time.
 */
export interface ReconstructedRelationship {
  id: string;
  kind: "note_relationship" | "intent_link";
  from_note_id?: string;
  to_note_id?: string;
  relationship_type?: string;
  note_id?: string;
  context?: string;
  existed: boolean;
}

/**
 * Full temporal snapshot passed to the UI layer. `phase` is filled in by
 * the service caller which reuses the Sprint 11/5 phase resolver against
 * events-until-T; kept optional so this domain module stays independent
 * from phases.ts.
 */
export interface TemporalSnapshot {
  project_id: string;
  at: string; // ISO
  intent: ReconstructedIntent;
  questions: ReconstructedQuestion[];
  relationships: ReconstructedRelationship[];
}

// -----------------------------------------------------------------------------
// Intent reconstruction
// -----------------------------------------------------------------------------

/**
 * Walk events newer than referenceTime in REVERSE (newest first),
 * inverting each intent change to unwind it.
 *
 * An event's `previous_state.value` is the value that existed BEFORE the
 * event. So when we unwind, `previous_state.value` becomes our current
 * reconstructed value.
 */
export function reconstructIntentAt(
  currentIntent: ReconstructedIntent,
  events: TemporalEvent[],
  referenceTime: Date
): ReconstructedIntent {
  const refMs = referenceTime.getTime();
  const forward = events
    .filter((e) => new Date(e.occurred_at).getTime() > refMs)
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)); // newest first

  let goal = currentIntent.goal;
  let focus = currentIntent.current_focus;
  let step = currentIntent.next_step;

  for (const e of forward) {
    const prev = (e.previous_state ?? {}) as { value?: string | null };
    if (e.event_type === "goal_changed") {
      goal = prev.value ?? null;
    } else if (e.event_type === "focus_changed") {
      focus = prev.value ?? null;
    } else if (e.event_type === "next_step_changed") {
      step = prev.value ?? null;
    }
  }

  return { goal, current_focus: focus, next_step: step };
}

// -----------------------------------------------------------------------------
// Question reconstruction
// -----------------------------------------------------------------------------

/**
 * For each question referenced in the event log, walk its events oldest →
 * newest, applying only those with occurred_at <= referenceTime.
 *
 * This is FORWARD replay because questions are additive — we know the
 * "raised" event exists so building up is straightforward and avoids
 * inverting deletes.
 */
export function reconstructQuestionsAt(
  events: TemporalEvent[],
  referenceTime: Date
): ReconstructedQuestion[] {
  const refMs = referenceTime.getTime();

  // Group question events by entity_id, oldest first.
  const byQuestion = new Map<string, TemporalEvent[]>();
  for (const e of events) {
    if (e.entity_type !== "question" || !e.entity_id) continue;
    if (new Date(e.occurred_at).getTime() > refMs) continue;
    const list = byQuestion.get(e.entity_id) ?? [];
    list.push(e);
    byQuestion.set(e.entity_id, list);
  }

  const out: ReconstructedQuestion[] = [];

  for (const [questionId, list] of byQuestion.entries()) {
    list.sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));

    let existed = false;
    let text = "";
    let status: ReconstructedQuestion["status"] = "open";

    for (const e of list) {
      const next = (e.next_state ?? {}) as {
        status?: ReconstructedQuestion["status"];
        question?: string;
      };
      const meta = (e.metadata ?? {}) as { question?: string };

      if (e.event_type === "question_raised") {
        existed = true;
        text = next.question ?? text;
        status = next.status ?? "open";
        continue;
      }

      if (!existed) continue; // never raised before this point

      if (next.status) status = next.status;
      // deleteQuestion stores the question text in metadata.
      if (meta.question && !text) text = meta.question;
    }

    // If the question was deleted, keep it in the snapshot as
    // status="deleted" — the timeline can render "question ended".
    // If it was never raised at this point, skip it.
    if (existed) {
      out.push({
        id: questionId,
        question: text,
        status,
        existed: status !== "deleted",
      });
    }
  }

  return out;
}

// -----------------------------------------------------------------------------
// Relationship reconstruction
// -----------------------------------------------------------------------------

/**
 * Reconstruct which relationships existed at referenceTime.
 * Handles both note-to-note relationships and intent links.
 *
 * Forward replay per entity_id:
 *   created → mark existed=true, remember the shape from next_state
 *   removed → mark existed=false but keep the shape from previous_state
 *             so the timeline can still describe what was removed.
 */
export function reconstructRelationshipsAt(
  events: TemporalEvent[],
  referenceTime: Date
): ReconstructedRelationship[] {
  const refMs = referenceTime.getTime();

  const byEntity = new Map<string, TemporalEvent[]>();
  for (const e of events) {
    if (e.entity_type !== "relationship" || !e.entity_id) continue;
    if (new Date(e.occurred_at).getTime() > refMs) continue;
    const list = byEntity.get(e.entity_id) ?? [];
    list.push(e);
    byEntity.set(e.entity_id, list);
  }

  const out: ReconstructedRelationship[] = [];

  for (const [entityId, list] of byEntity.entries()) {
    list.sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));

    let existed = false;
    let kind: ReconstructedRelationship["kind"] = "note_relationship";
    let shape: Record<string, unknown> = {};

    for (const e of list) {
      const state = e.next_state ?? e.previous_state ?? {};
      const asRecord = state as Record<string, unknown>;

      // Classify by which fields the payload carries.
      if ("context" in asRecord) {
        kind = "intent_link";
      } else if ("relationship_type" in asRecord || "to_note_id" in asRecord) {
        kind = "note_relationship";
      }

      if (
        e.event_type === "relationship_created" ||
        e.event_type === "intent_link_created"
      ) {
        existed = true;
        shape = (e.next_state ?? {}) as Record<string, unknown>;
      } else if (
        e.event_type === "relationship_removed" ||
        e.event_type === "intent_link_removed"
      ) {
        existed = false;
        // preserve shape from previous_state so we can describe what was removed
        shape = (e.previous_state ?? shape) as Record<string, unknown>;
      }
    }

    out.push({
      id: entityId,
      kind,
      from_note_id: shape.from_note_id as string | undefined,
      to_note_id: shape.to_note_id as string | undefined,
      relationship_type: shape.relationship_type as string | undefined,
      note_id: shape.note_id as string | undefined,
      context: shape.context as string | undefined,
      existed,
    });
  }

  return out;
}
