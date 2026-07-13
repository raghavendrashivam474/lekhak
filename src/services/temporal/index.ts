// src/services/temporal/index.ts
//
// Temporal event service.
//
// Design rules (from Sprint 11 brief):
//   1. Never record before mutation succeeds — the CALLER controls ordering.
//   2. Never throw raw Supabase errors into UI — return ServiceResult.
//   3. Never called directly from UI components — services call services.

import type { ServiceResult } from "@/types/service";
import type {
  TemporalEvent,
  CreateTemporalEventInput,
  TemporalEntityType,
  TemporalEventType,
} from "@/domain/temporal";
import { createClient } from "@/lib/supabase/client";

/**
 * Record a single temporal event. Called by other services AFTER their
 * primary mutation has succeeded.
 *
 * Failures here MUST NOT propagate as user-facing errors — a lost temporal
 * event is a soft failure. The user's writing action already succeeded.
 * We log the failure for observability and return the result envelope so
 * callers can decide what to do.
 */
export async function recordTemporalEvent(
  input: CreateTemporalEventInput
): Promise<ServiceResult<TemporalEvent>> {
  const supabase = createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { data: null, error: "Not authenticated." };
  }

  const row = {
    user_id: userData.user.id,
    project_id: input.project_id,
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    event_type: input.event_type,
    previous_state: input.previous_state ?? null,
    next_state: input.next_state ?? null,
    metadata: input.metadata ?? {},
  };

  const { data, error } = await supabase
    .from("temporal_events")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    console.warn("[temporal] failed to record event", {
      event_type: input.event_type,
      entity_type: input.entity_type,
      message: error.message,
    });
    return { data: null, error: error.message };
  }

  return { data: data as TemporalEvent, error: null };
}

// -----------------------------------------------------------------------------
// Query functions — read-only, chronological.
// -----------------------------------------------------------------------------

/**
 * All temporal events for a project, most recent first.
 */
export async function getProjectTemporalEvents(
  projectId: string,
  limit = 500
): Promise<ServiceResult<TemporalEvent[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("temporal_events")
    .select("*")
    .eq("project_id", projectId)
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: (data ?? []) as TemporalEvent[], error: null };
}

/**
 * All temporal events for a specific entity (question / relationship / etc).
 * Chronological (oldest first) — useful for lifecycle reconstruction.
 */
export async function getEntityTemporalEvents(
  entityType: TemporalEntityType,
  entityId: string
): Promise<ServiceResult<TemporalEvent[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("temporal_events")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("occurred_at", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: (data ?? []) as TemporalEvent[], error: null };
}

/**
 * All events for a project up to (and including) a reference time.
 * Ordered oldest → newest so reconstruction can replay forwards.
 */
export async function getTemporalEventsUntil(
  projectId: string,
  until: string
): Promise<ServiceResult<TemporalEvent[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("temporal_events")
    .select("*")
    .eq("project_id", projectId)
    .lte("occurred_at", until)
    .order("occurred_at", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: (data ?? []) as TemporalEvent[], error: null };
}

/**
 * All events for a project within a time window (inclusive).
 */
export async function getTemporalEventsBetween(
  projectId: string,
  from: string,
  to: string
): Promise<ServiceResult<TemporalEvent[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("temporal_events")
    .select("*")
    .eq("project_id", projectId)
    .gte("occurred_at", from)
    .lte("occurred_at", to)
    .order("occurred_at", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: (data ?? []) as TemporalEvent[], error: null };
}

/**
 * Optionally filter project events by event type.
 * Used later by phase/turning-point resolvers.
 */
export async function getProjectTemporalEventsOfType(
  projectId: string,
  eventTypes: TemporalEventType[]
): Promise<ServiceResult<TemporalEvent[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("temporal_events")
    .select("*")
    .eq("project_id", projectId)
    .in("event_type", eventTypes)
    .order("occurred_at", { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }
  return { data: (data ?? []) as TemporalEvent[], error: null };
}
