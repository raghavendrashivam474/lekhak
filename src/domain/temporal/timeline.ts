// src/domain/temporal/timeline.ts
//
// Curator that turns raw temporal events + turning points into a viewable
// evolution timeline.
//
// Rule from Sprint 11 brief §33:
//   "Avoid displaying every temporal event. The timeline is curated through
//    deterministic domain rules."
//
// So this module PROMOTES some events into timeline items, filters others
// out, and mixes in turning points. All labels are template-based — no AI.

import type { TemporalEvent } from "./types";
import type { TurningPoint } from "./turning-points";

export type EvolutionTimelineItemType =
  | "project_began"
  | "goal_changed"
  | "focus_shifted"
  | "next_step_changed"
  | "question_raised"
  | "major_question_resolved"
  | "relationship_emerged"
  | "turning_point";

export interface EvolutionTimelineItem {
  id: string;
  type: EvolutionTimelineItemType;
  occurred_at: string;
  title: string;       // short label — e.g. "Focus Shift"
  detail: string;      // one-line explanation, template-based
  significance: number; // used by the UI to rank / filter
  source_event_id?: string;
  source_turning_point_id?: string;
  metadata: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// Templates — deterministic, no generative text
// -----------------------------------------------------------------------------

function truncate(text: string, max = 80): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

function describeIntentChange(
  eventType: TemporalEvent["event_type"],
  event: TemporalEvent
): { title: string; detail: string } {
  const prev = (event.previous_state ?? {}) as { value?: string | null };
  const next = (event.next_state ?? {}) as { value?: string | null };
  const from = prev.value ? truncate(prev.value) : "—";
  const to = next.value ? truncate(next.value) : "—";

  const labels: Record<string, string> = {
    goal_changed: "Goal Changed",
    focus_changed: "Focus Shifted",
    next_step_changed: "Next Step Changed",
  };

  return {
    title: labels[eventType] ?? "Change",
    detail: `From: ${from} → To: ${to}`,
  };
}

// -----------------------------------------------------------------------------
// Curator
// -----------------------------------------------------------------------------

export interface BuildTimelineInput {
  projectCreatedAt: string; // used to synthesise "Project Began"
  events: TemporalEvent[];  // oldest → newest
  turningPoints: TurningPoint[];
}

export function buildEvolutionTimeline(
  input: BuildTimelineInput
): EvolutionTimelineItem[] {
  const items: EvolutionTimelineItem[] = [];

  // -- Project Began -------------------------------------------------------
  items.push({
    id: `project_began::${input.projectCreatedAt}`,
    type: "project_began",
    occurred_at: input.projectCreatedAt,
    title: "Project Began",
    detail: "Creative memory started here.",
    significance: 10,
    metadata: {},
  });

  // -- Intent changes ------------------------------------------------------
  //
  // We include every intent change in v1. Turning points already flag
  // "meaningful" direction/focus shifts separately (with stability
  // metadata); showing all intent changes here gives writers the full
  // ledger of decisions.
  for (const e of input.events) {
    if (
      e.event_type === "goal_changed" ||
      e.event_type === "focus_changed" ||
      e.event_type === "next_step_changed"
    ) {
      const { title, detail } = describeIntentChange(e.event_type, e);
      items.push({
        id: `intent::${e.id}`,
        type:
          e.event_type === "goal_changed"
            ? "goal_changed"
            : e.event_type === "focus_changed"
              ? "focus_shifted"
              : "next_step_changed",
        occurred_at: e.occurred_at,
        title,
        detail,
        significance: 5,
        source_event_id: e.id,
        metadata: {},
      });
    }
  }

  // -- Questions raised ----------------------------------------------------
  for (const e of input.events) {
    if (e.event_type !== "question_raised") continue;
    const next = (e.next_state ?? {}) as { question?: string };
    items.push({
      id: `qraised::${e.id}`,
      type: "question_raised",
      occurred_at: e.occurred_at,
      title: "Question Raised",
      detail: next.question ? truncate(next.question, 100) : "New question added.",
      significance: 3,
      source_event_id: e.id,
      metadata: {},
    });
  }

  // -- Turning points ------------------------------------------------------
  //
  // Turning points already carry rich metadata + high significance.
  // We map them into the timeline verbatim with a friendly title.
  const tpTitles: Record<TurningPoint["type"], string> = {
    direction_change: "Direction Changed",
    focus_shift: "Focus Shifted (Significant)",
    major_question_resolved: "Major Question Resolved",
    knowledge_breakthrough: "Knowledge Breakthrough",
    project_resumed: "Project Resumed",
    phase_transition: "Phase Transition",
  };

  for (const tp of input.turningPoints) {
    let detail = "";
    const md = tp.metadata as Record<string, unknown>;

    switch (tp.type) {
      case "direction_change": {
        const prev = md.previous as { value?: string } | undefined;
        const next = md.next as { value?: string } | undefined;
        const stable = md.stable_days;
        detail = `From: ${truncate(prev?.value ?? "—")} → To: ${truncate(
          next?.value ?? "—"
        )}${stable ? ` · stable for ${stable} days` : ""}`;
        break;
      }
      case "focus_shift": {
        const prev = md.previous as { value?: string } | undefined;
        const next = md.next as { value?: string } | undefined;
        const stable = md.stable_days;
        detail = `From: ${truncate(prev?.value ?? "—")} → To: ${truncate(
          next?.value ?? "—"
        )}${stable ? ` · stable for ${stable} days` : ""}`;
        break;
      }
      case "major_question_resolved": {
        const q = md.question as { question?: string } | undefined;
        const age = md.age_days;
        detail = `${q?.question ? truncate(q.question, 80) : "Question"} · resolved after ${age} days`;
        break;
      }
      case "knowledge_breakthrough": {
        detail = "Two previously-isolated notes became connected.";
        break;
      }
      case "project_resumed": {
        detail = "Meaningful activity resumed after a long silence.";
        break;
      }
      case "phase_transition": {
        detail = `Moved from ${md.from_phase ?? "—"} → ${md.to_phase ?? "—"}.`;
        break;
      }
    }

    items.push({
      id: `tp::${tp.id}`,
      type: "turning_point",
      occurred_at: tp.occurred_at,
      title: tpTitles[tp.type],
      detail,
      significance: tp.significance,
      source_turning_point_id: tp.id,
      metadata: { turning_point_type: tp.type },
    });
  }

  // Newest first for display
  return items.sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
}
