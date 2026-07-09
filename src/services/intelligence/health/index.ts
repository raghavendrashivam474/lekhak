// src/services/intelligence/health/index.ts

import { createClient } from "@/lib/supabase/client";
import type { ProjectStatusInsight, ProjectStatus } from "@/types/intelligence";

const DAY_MS = 1000 * 60 * 60 * 24;

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / DAY_MS);
}

export async function calculateProjectStatus(
  projectId: string
): Promise<ProjectStatusInsight> {
  const supabase = createClient();

  const [notesRes, activityRes, questionsRes] = await Promise.all([
    supabase
      .from("notes")
      .select("id, created_at, updated_at")
      .eq("project_id", projectId),
    supabase
      .from("activity_logs")
      .select("created_at, action")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("questions")
      .select("id, status, created_at")
      .eq("project_id", projectId),
  ]);

  const notes = notesRes.data ?? [];
  const activity = activityRes.data ?? [];
  const questions = questionsRes.data ?? [];

  const now = new Date();
  const lastActivityAt = activity[0]
    ? new Date(activity[0].created_at)
    : null;
  const daysSinceActivity = lastActivityAt
    ? daysBetween(now, lastActivityAt)
    : null;

  const openQuestions = questions.filter((q) => q.status === "open").length;

  const activityLast7Days = activity.filter((a) => {
    const created = new Date(a.created_at);
    return daysBetween(now, created) <= 7;
  }).length;

  const activityLast30Days = activity.filter((a) => {
    const created = new Date(a.created_at);
    return daysBetween(now, created) <= 30;
  }).length;

  // Relationships used for orphan detection
  const noteIds = notes.map((n) => n.id);
  let orphanCount = 0;
  if (noteIds.length > 0) {
    const { data: rels } = await supabase
      .from("note_relationships")
      .select("from_note_id, to_note_id")
      .or(
        "from_note_id.in.(" +
          noteIds.join(",") +
          "),to_note_id.in.(" +
          noteIds.join(",") +
          ")"
      );

    const connected = new Set<string>();
    (rels ?? []).forEach((r) => {
      connected.add(r.from_note_id);
      connected.add(r.to_note_id);
    });
    orphanCount = noteIds.filter((id) => !connected.has(id)).length;
  }

  // Status determination — deterministic rules
  const reasons: string[] = [];
  let status: ProjectStatus = "healthy";

  if (notes.length === 0 && activity.length === 0) {
    status = "new";
    reasons.push("No notes yet. Start writing.");
    return { status, reasons };
  }

  if (daysSinceActivity !== null && daysSinceActivity >= 30) {
    status = "dormant";
    reasons.push(`No edits for ${daysSinceActivity} days.`);
    if (orphanCount > 0) {
      reasons.push(`${orphanCount} orphan note${orphanCount !== 1 ? "s" : ""}.`);
    }
    if (openQuestions > 0) {
      reasons.push(
        `${openQuestions} unresolved question${openQuestions !== 1 ? "s" : ""}.`
      );
    }
    return { status, reasons };
  }

  if (activityLast7Days >= 10) {
    status = "highly_active";
    reasons.push(`${activityLast7Days} activities in the last 7 days.`);
    return { status, reasons };
  }

  if (
    (daysSinceActivity !== null && daysSinceActivity >= 14) ||
    (orphanCount >= 3 && orphanCount / Math.max(notes.length, 1) >= 0.5) ||
    openQuestions >= 3
  ) {
    status = "needs_attention";
    if (daysSinceActivity !== null && daysSinceActivity >= 14) {
      reasons.push(`No edits for ${daysSinceActivity} days.`);
    }
    if (orphanCount >= 3) {
      reasons.push(`${orphanCount} orphan note${orphanCount !== 1 ? "s" : ""}.`);
    }
    if (openQuestions >= 3) {
      reasons.push(
        `${openQuestions} unresolved question${openQuestions !== 1 ? "s" : ""}.`
      );
    }
    return { status, reasons };
  }

  // Near completion heuristic
  const answered = questions.filter((q) => q.status === "answered").length;
  if (
    questions.length > 0 &&
    answered / questions.length >= 0.8 &&
    openQuestions <= 1 &&
    notes.length >= 5
  ) {
    status = "near_completion";
    reasons.push(
      `${answered} of ${questions.length} questions answered.`
    );
    if (openQuestions === 0) {
      reasons.push("No open questions remaining.");
    }
    return { status, reasons };
  }

  // Default healthy
  reasons.push(`${activityLast30Days} activities in the last 30 days.`);
  if (openQuestions > 0) {
    reasons.push(
      `${openQuestions} open question${openQuestions !== 1 ? "s" : ""}.`
    );
  }
  return { status, reasons };
}