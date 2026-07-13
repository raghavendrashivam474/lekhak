// src/domain/temporal/turning-points.ts
//
// Deterministic detector for creative turning points.
//
// A turning point is not the same as an event. Every day has events.
// Turning points are moments the project changed direction or reached
// a meaningful milestone. We derive them from temporal history using
// explicit, documented rules.

import type { TemporalEvent } from "./types";
import type { ProjectPhase } from "./phases";

export type TurningPointType =
  | "direction_change"
  | "major_question_resolved"
  | "project_resumed"
  | "phase_transition"
  | "knowledge_breakthrough"
  | "focus_shift";

export interface TurningPoint {
  /**
   * Deterministic id built from (type, occurred_at, sourceEventIds).
   * Two runs of the detector on the same input produce identical ids.
   */
  id: string;
  project_id: string;
  type: TurningPointType;
  occurred_at: string;
  /**
   * Integer significance score. Currently in the range 1..10.
   * The UI can sort or filter by this without inventing its own scale.
   */
  significance: number;
  source_event_ids: string[];
  metadata: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// Detector input
// -----------------------------------------------------------------------------

export interface TurningPointInput {
  projectId: string;
  events: TemporalEvent[]; // oldest → newest
  /**
   * Optional pre-computed phase transitions produced by the phase resolver.
   * When supplied, they become `phase_transition` turning points.
   */
  phaseTransitions?: Array<{
    at: string;
    fromPhase: ProjectPhase | null;
    toPhase: ProjectPhase;
  }>;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(aIso: string, bIso: string): number {
  return Math.abs(
    (new Date(aIso).getTime() - new Date(bIso).getTime()) / DAY_MS
  );
}

function makeId(
  type: TurningPointType,
  occurredAt: string,
  sourceEventIds: string[]
): string {
  return [type, occurredAt, ...sourceEventIds.slice(0, 3)].join("::");
}

// -----------------------------------------------------------------------------
// Detection rules
// -----------------------------------------------------------------------------

/**
 * Direction change — a goal change after the goal remained stable for a
 * meaningful stretch (>= 14 days since the previous goal change, or since
 * project inception).
 */
function detectDirectionChanges(input: TurningPointInput): TurningPoint[] {
  const goalChanges = input.events
    .filter((e) => e.event_type === "goal_changed")
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));

  const out: TurningPoint[] = [];
  let previousGoalChangeAt: string | null = null;

  for (const change of goalChanges) {
    const stableFor = previousGoalChangeAt
      ? daysBetween(previousGoalChangeAt, change.occurred_at)
      : Infinity;

    if (stableFor >= 14) {
      out.push({
        id: makeId("direction_change", change.occurred_at, [change.id]),
        project_id: input.projectId,
        type: "direction_change",
        occurred_at: change.occurred_at,
        significance: 8,
        source_event_ids: [change.id],
        metadata: {
          previous: change.previous_state,
          next: change.next_state,
          stable_days: previousGoalChangeAt ? Math.round(stableFor) : null,
        },
      });
    }

    previousGoalChangeAt = change.occurred_at;
  }

  return out;
}

/**
 * Focus shift — a focus change after the focus remained stable for
 * a meaningful stretch (>= 14 days).
 */
function detectFocusShifts(input: TurningPointInput): TurningPoint[] {
  const focusChanges = input.events
    .filter((e) => e.event_type === "focus_changed")
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));

  const out: TurningPoint[] = [];
  let previousAt: string | null = null;

  for (const change of focusChanges) {
    const stableFor = previousAt
      ? daysBetween(previousAt, change.occurred_at)
      : Infinity;

    if (stableFor >= 14) {
      out.push({
        id: makeId("focus_shift", change.occurred_at, [change.id]),
        project_id: input.projectId,
        type: "focus_shift",
        occurred_at: change.occurred_at,
        significance: 6,
        source_event_ids: [change.id],
        metadata: {
          previous: change.previous_state,
          next: change.next_state,
          stable_days: previousAt ? Math.round(stableFor) : null,
        },
      });
    }

    previousAt = change.occurred_at;
  }

  return out;
}

/**
 * Major question resolved — a question that lived at least 7 days between
 * `question_raised` and `question_resolved`.
 */
function detectMajorQuestionResolutions(
  input: TurningPointInput
): TurningPoint[] {
  const out: TurningPoint[] = [];

  const resolutions = input.events.filter(
    (e) => e.event_type === "question_resolved"
  );

  for (const resolution of resolutions) {
    const raised = input.events.find(
      (e) =>
        e.event_type === "question_raised" &&
        e.entity_id === resolution.entity_id
    );

    if (!raised) continue; // no raised event → we can't measure age

    const ageDays = daysBetween(raised.occurred_at, resolution.occurred_at);
    if (ageDays >= 7) {
      out.push({
        id: makeId("major_question_resolved", resolution.occurred_at, [
          resolution.id,
          raised.id,
        ]),
        project_id: input.projectId,
        type: "major_question_resolved",
        occurred_at: resolution.occurred_at,
        significance: Math.min(10, 4 + Math.floor(ageDays / 7)),
        source_event_ids: [resolution.id, raised.id],
        metadata: {
          question: raised.next_state,
          age_days: Math.round(ageDays),
        },
      });
    }
  }

  return out;
}

/**
 * Knowledge breakthrough (v1 conservative signal) — a relationship_created
 * event where BOTH sides had zero prior relationships in the temporal log.
 * That is: a previously-isolated note being connected for the first time.
 */
function detectKnowledgeBreakthroughs(
  input: TurningPointInput
): TurningPoint[] {
  const out: TurningPoint[] = [];

  const relCreated = input.events.filter(
    (e) => e.event_type === "relationship_created"
  );

  // Track which note ids have appeared in relationship events over time.
  const seenNoteIds = new Set<string>();
  const relEvents = input.events.filter(
    (e) =>
      e.event_type === "relationship_created" ||
      e.event_type === "relationship_removed"
  );

  for (const e of relEvents) {
    const state = e.next_state ?? e.previous_state ?? {};
    const from = (state as Record<string, unknown>).from_note_id as
      | string
      | undefined;
    const to = (state as Record<string, unknown>).to_note_id as string | undefined;

    if (relCreated.includes(e)) {
      const fromNew = from ? !seenNoteIds.has(from) : false;
      const toNew = to ? !seenNoteIds.has(to) : false;

      if (from && to && fromNew && toNew) {
        out.push({
          id: makeId("knowledge_breakthrough", e.occurred_at, [e.id]),
          project_id: input.projectId,
          type: "knowledge_breakthrough",
          occurred_at: e.occurred_at,
          significance: 6,
          source_event_ids: [e.id],
          metadata: { from_note_id: from, to_note_id: to },
        });
      }
    }

    if (from) seenNoteIds.add(from);
    if (to) seenNoteIds.add(to);
  }

  return out;
}

/**
 * Project resumed — flag phase transitions that leave "dormant".
 * These are the moments the project comes back to life.
 */
function detectProjectResumes(input: TurningPointInput): TurningPoint[] {
  if (!input.phaseTransitions) return [];

  return input.phaseTransitions
    .filter((t) => t.fromPhase === "dormant")
    .map((t) => ({
      id: makeId("project_resumed", t.at, [t.at]),
      project_id: input.projectId,
      type: "project_resumed" as TurningPointType,
      occurred_at: t.at,
      significance: 9,
      source_event_ids: [],
      metadata: { from_phase: t.fromPhase, to_phase: t.toPhase },
    }));
}

/**
 * Phase transitions — every distinct transition becomes a turning point of
 * moderate significance. project_resumed above will duplicate some of these;
 * `dedupeById` cleans up.
 */
function detectPhaseTransitions(input: TurningPointInput): TurningPoint[] {
  if (!input.phaseTransitions) return [];

  return input.phaseTransitions.map((t) => ({
    id: makeId("phase_transition", t.at, [t.at]),
    project_id: input.projectId,
    type: "phase_transition" as TurningPointType,
    occurred_at: t.at,
    significance: 4,
    source_event_ids: [],
    metadata: { from_phase: t.fromPhase, to_phase: t.toPhase },
  }));
}

// -----------------------------------------------------------------------------
// Public detector
// -----------------------------------------------------------------------------

function dedupeById(list: TurningPoint[]): TurningPoint[] {
  const byId = new Map<string, TurningPoint>();
  for (const tp of list) {
    if (!byId.has(tp.id)) byId.set(tp.id, tp);
  }
  return Array.from(byId.values());
}

export function detectTurningPoints(
  input: TurningPointInput
): TurningPoint[] {
  const collected = [
    ...detectDirectionChanges(input),
    ...detectFocusShifts(input),
    ...detectMajorQuestionResolutions(input),
    ...detectKnowledgeBreakthroughs(input),
    ...detectProjectResumes(input),
    ...detectPhaseTransitions(input),
  ];

  return dedupeById(collected).sort((a, b) =>
    a.occurred_at.localeCompare(b.occurred_at)
  );
}
