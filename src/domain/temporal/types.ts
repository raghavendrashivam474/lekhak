// src/domain/temporal/types.ts
//
// Renderer-independent temporal domain.
// No React, no Three.js, no Supabase imports here.
//
// A TemporalEvent describes a MEANINGFUL semantic transition — not every
// operational action. Activity logs live elsewhere.

export type TemporalEntityType =
  | "project"
  | "intent"
  | "question"
  | "relationship";

export type TemporalEventType =
  // Intent transitions
  | "goal_changed"
  | "focus_changed"
  | "next_step_changed"

  // Question lifecycle
  | "question_raised"
  | "question_status_changed"
  | "question_resolved"
  | "question_reopened"
  | "question_deleted"

  // Relationship evolution
  | "relationship_created"
  | "relationship_removed"
  | "intent_link_created"
  | "intent_link_removed";

/**
 * A concrete temporal event as persisted and consumed.
 * previous_state and next_state describe the transition itself.
 */
export interface TemporalEvent {
  id: string;
  user_id: string;
  project_id: string;
  entity_type: TemporalEntityType;
  entity_id: string | null;
  event_type: TemporalEventType;
  previous_state: Record<string, unknown> | null;
  next_state: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
}

/**
 * Input shape for creating a temporal event.
 * user_id / occurred_at are filled by the service.
 */
export interface CreateTemporalEventInput {
  project_id: string;
  entity_type: TemporalEntityType;
  entity_id: string | null;
  event_type: TemporalEventType;
  previous_state?: Record<string, unknown> | null;
  next_state?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
}
