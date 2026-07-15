// src/domain/reasoning/explanations.ts
//
// Deterministic temporal explanation derivation.
// Connects temporal event history to current reasoning state.
// Pure functions. No IO. No generated text.

import type { TemporalEvent } from "@/domain/temporal";
import type { CreativeThread } from "./types";

export interface ExplanationStep {
  occurredAt: string;
  eventType: string;
  label: string;
  detail: string;
}

export interface EvidenceReference {
  entityType: string;
  entityId: string | null;
  label: string;
}

export interface TemporalExplanation {
  subject: string;
  steps: ExplanationStep[];
  evidence: EvidenceReference[];
  summary: string;
}

export interface ExplanationSummary {
  goalEvolution: TemporalExplanation | null;
  focusChanges: TemporalExplanation | null;
  threadEvolutions: TemporalExplanation[];
  questionLifecycles: TemporalExplanation[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return MONTHS[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
}

function intentLabel(eventType: string, prev: Record<string,unknown> | null, next: Record<string,unknown> | null): string {
  const p = (prev?.value as string | null) ?? null;
  const n = (next?.value as string | null) ?? null;
  if (p && n) return `Changed from "${truncate(p, 50)}" to "${truncate(n, 50)}"`;
  if (n) return `Set to "${truncate(n, 50)}"`;
  if (p) return `Cleared (was "${truncate(p, 50)}")`;
  return eventType;
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

// ---------------------------------------------------------------------------
// Goal evolution
// ---------------------------------------------------------------------------

export function explainGoalEvolution(events: TemporalEvent[]): TemporalExplanation | null {
  const goalEvents = events
    .filter((e) => e.event_type === "goal_changed")
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));

  if (goalEvents.length === 0) return null;

  const steps: ExplanationStep[] = goalEvents.map((e) => ({
    occurredAt: e.occurred_at,
    eventType: e.event_type,
    label: "Goal Changed",
    detail: intentLabel(e.event_type, e.previous_state, e.next_state),
  }));

  const latest = goalEvents[goalEvents.length - 1];
  const current = (latest.next_state?.value as string | null) ?? null;

  return {
    subject: "Project Goal",
    steps,
    evidence: goalEvents.map((e) => ({
      entityType: "intent",
      entityId: e.entity_id,
      label: fmtDate(e.occurred_at),
    })),
    summary: goalEvents.length === 1
      ? "The goal was set once and has not changed."
      : `The goal changed ${goalEvents.length} times. Current: ${current ? truncate(current, 60) : "—"}`,
  };
}

// ---------------------------------------------------------------------------
// Focus changes
// ---------------------------------------------------------------------------

export function explainFocusChanges(events: TemporalEvent[]): TemporalExplanation | null {
  const focusEvents = events
    .filter((e) => e.event_type === "focus_changed")
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));

  if (focusEvents.length === 0) return null;

  const steps: ExplanationStep[] = focusEvents.map((e) => ({
    occurredAt: e.occurred_at,
    eventType: e.event_type,
    label: "Focus Shifted",
    detail: intentLabel(e.event_type, e.previous_state, e.next_state),
  }));

  return {
    subject: "Current Focus",
    steps,
    evidence: focusEvents.map((e) => ({
      entityType: "intent",
      entityId: e.entity_id,
      label: fmtDate(e.occurred_at),
    })),
    summary: focusEvents.length === 1
      ? "Focus was set once."
      : `Focus shifted ${focusEvents.length} times — indicating iterative direction refinement.`,
  };
}

// ---------------------------------------------------------------------------
// Thread evolution
// ---------------------------------------------------------------------------

export function explainThreadEvolution(
  thread: CreativeThread,
  events: TemporalEvent[]
): TemporalExplanation {
  const memberNoteSet = new Set(thread.memberNoteIds);
  const relevantEvents = events
    .filter(
      (e) =>
        (e.entity_type === "relationship" &&
          thread.linkedQuestionIds.includes(e.entity_id ?? "")) ||
        (e.entity_type === "question" &&
          thread.linkedQuestionIds.includes(e.entity_id ?? ""))
    )
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));

  const steps: ExplanationStep[] = relevantEvents.map((e) => {
    const label =
      e.event_type === "question_resolved"
        ? "Question Resolved"
        : e.event_type === "question_raised"
        ? "Question Raised"
        : e.event_type === "relationship_created"
        ? "Connection Made"
        : e.event_type === "relationship_removed"
        ? "Connection Removed"
        : e.event_type;

    return {
      occurredAt: e.occurred_at,
      eventType: e.event_type,
      label,
      detail: (e.metadata?.question as string | undefined)
        ?? (e.next_state?.value as string | undefined)
        ?? "",
    };
  });

  const resolvedCount = relevantEvents.filter(
    (e) => e.event_type === "question_resolved"
  ).length;

  return {
    subject: thread.title,
    steps,
    evidence: relevantEvents.map((e) => ({
      entityType: e.entity_type,
      entityId: e.entity_id,
      label: fmtDate(e.occurred_at),
    })),
    summary: steps.length === 0
      ? `Thread "${thread.title}" has no recorded temporal history yet.`
      : `Thread "${thread.title}" has ${steps.length} recorded events. ${resolvedCount} question${resolvedCount !== 1 ? "s" : ""} resolved.`,
  };
}

// ---------------------------------------------------------------------------
// Question lifecycle
// ---------------------------------------------------------------------------

export function explainQuestionLifecycle(
  questionId: string,
  questionText: string,
  events: TemporalEvent[]
): TemporalExplanation {
  const qEvents = events
    .filter((e) => e.entity_type === "question" && e.entity_id === questionId)
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));

  const steps: ExplanationStep[] = qEvents.map((e) => {
    const labels: Record<string, string> = {
      question_raised: "Raised",
      question_status_changed: "Status Changed",
      question_resolved: "Resolved",
      question_reopened: "Reopened",
      question_deleted: "Deleted",
    };
    const prev = (e.previous_state?.status as string | null) ?? null;
    const next = (e.next_state?.status as string | null) ?? null;
    const detail = prev && next ? `${prev} → ${next}` : next ?? prev ?? "";
    return {
      occurredAt: e.occurred_at,
      eventType: e.event_type,
      label: labels[e.event_type] ?? e.event_type,
      detail,
    };
  });

  const resolved = qEvents.some((e) => e.event_type === "question_resolved");
  const reopened = qEvents.filter((e) => e.event_type === "question_reopened").length;

  return {
    subject: truncate(questionText, 80),
    steps,
    evidence: qEvents.map((e) => ({
      entityType: "question",
      entityId: e.entity_id,
      label: fmtDate(e.occurred_at),
    })),
    summary: resolved
      ? reopened > 0
        ? `Resolved after ${reopened} reopen${reopened !== 1 ? "s" : ""}.`
        : "Resolved."
      : steps.length === 0
      ? "No lifecycle events recorded."
      : "Still open.",
  };
}

// ---------------------------------------------------------------------------
// Full evolution summary
// ---------------------------------------------------------------------------

export function buildEvolutionSummary(
  events: TemporalEvent[],
  threads: CreativeThread[],
  questionIds: Array<{ id: string; question: string }>
): ExplanationSummary {
  const goalEvolution = explainGoalEvolution(events);
  const focusChanges = explainFocusChanges(events);

  const threadEvolutions = threads.map((t) =>
    explainThreadEvolution(t, events)
  );

  const questionLifecycles = questionIds
    .slice(0, 5)
    .map((q) => explainQuestionLifecycle(q.id, q.question, events));

  return {
    goalEvolution,
    focusChanges,
    threadEvolutions,
    questionLifecycles,
  };
}
