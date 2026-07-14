// src/domain/temporal/reconstruction.ts
//
// Deterministic historical reconstruction.
//
// Strategy: reverse replay for intent, forward replay per-entity for
// questions and relationships. Pure functions only. No IO.
//
// Boundaries (Sprint 11 brief §39):
//   Reconstructs: goal, current_focus, next_step, question lifecycle,
//                 relationship lifecycle.
//   Does NOT reconstruct: note body content, note titles, note category,
//                         rich text history.

import type { TemporalEvent } from "./types";

// -----------------------------------------------------------------------------
// Reconstructed shapes
// -----------------------------------------------------------------------------

export interface ReconstructedIntent {
  goal: string | null;
  current_focus: string | null;
  next_step: string | null;
}

export interface ReconstructedQuestion {
  id: string;
  question: string;
  // "deleted" is intentionally absent. Deletion is tracked via the existed boolean.
  status: "open" | "in_progress" | "answered" | "archived";
  existed: boolean;
}

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

export interface TemporalSnapshot {
  project_id: string;
  at: string;
  intent: ReconstructedIntent;
  questions: ReconstructedQuestion[];
  relationships: ReconstructedRelationship[];
}

// -----------------------------------------------------------------------------
// Intent reconstruction — reverse replay
// -----------------------------------------------------------------------------

export function reconstructIntentAt(
  currentIntent: ReconstructedIntent,
  events: TemporalEvent[],
  referenceTime: Date
): ReconstructedIntent {
  const refMs = referenceTime.getTime();
  const forward = events
    .filter((e) => new Date(e.occurred_at).getTime() > refMs)
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));

  let goal = currentIntent.goal;
  let focus = currentIntent.current_focus;
  let step = currentIntent.next_step;

  for (const e of forward) {
    const prev = (e.previous_state ?? {}) as { value?: string | null };
    if (e.event_type === "goal_changed") goal = prev.value ?? null;
    else if (e.event_type === "focus_changed") focus = prev.value ?? null;
    else if (e.event_type === "next_step_changed") step = prev.value ?? null;
  }

  return { goal, current_focus: focus, next_step: step };
}

// -----------------------------------------------------------------------------
// Question reconstruction — forward replay per entity
// -----------------------------------------------------------------------------

export function reconstructQuestionsAt(
  events: TemporalEvent[],
  referenceTime: Date
): ReconstructedQuestion[] {
  const refMs = referenceTime.getTime();

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
    let deleted = false;
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
        deleted = false;
        text = next.question ?? text;
        status = next.status ?? "open";
        continue;
      }

      if (e.event_type === "question_deleted") {
        deleted = true;
        if (meta.question && !text) text = meta.question;
        continue;
      }

      if (!existed) continue;
      if (next.status) status = next.status;
      if (meta.question && !text) text = meta.question;
    }

    if (existed) {
      out.push({
        id: questionId,
        question: text,
        status,
        existed: !deleted,
      });
    }
  }

  return out;
}

// -----------------------------------------------------------------------------
// Relationship reconstruction — forward replay per entity
// -----------------------------------------------------------------------------

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

      if ("context" in asRecord) kind = "intent_link";
      else if ("relationship_type" in asRecord || "to_note_id" in asRecord)
        kind = "note_relationship";

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
