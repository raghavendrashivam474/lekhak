// src/services/intelligence/resume/index.ts

import { createClient } from "@/lib/supabase/client";
import type { SmartResumeContext } from "@/types/intelligence";

const DAY_MS = 1000 * 60 * 60 * 24;

export async function calculateSmartResume(
  projectId: string
): Promise<SmartResumeContext> {
  const supabase = createClient();

  const [projectRes, notesRes, activityRes, questionsRes] = await Promise.all([
    supabase
      .from("projects")
      .select("goal, current_focus, next_step")
      .eq("id", projectId)
      .single(),
    supabase
      .from("notes")
      .select("id, title, updated_at")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("activity_logs")
      .select("created_at, action")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("questions")
      .select("id, status")
      .eq("project_id", projectId),
  ]);

  const project = projectRes.data;
  const notes = notesRes.data ?? [];
  const activity = activityRes.data ?? [];
  const questions = questionsRes.data ?? [];

  const now = new Date();
  const lastActivity = activity[0]
    ? new Date(activity[0].created_at)
    : null;
  const lastActiveDaysAgo = lastActivity
    ? Math.floor((now.getTime() - lastActivity.getTime()) / DAY_MS)
    : null;

  const recentNoteUpdates = activity.filter(
    (a) => a.action === "note_updated" || a.action === "note_created"
  ).length;

  const unanswered = questions.filter((q) => q.status === "open").length;
  const mostRecentNote = notes[0] ?? null;

  // Suggested starting point — prefer next_step, fall back to most recent note
  const suggestedStartingPoint =
    project?.next_step ??
    (mostRecentNote ? `Continue editing: ${mostRecentNote.title}` : null);

  // Suggested next action — one concrete recommendation
  let suggestedNextAction: string | null = null;

  if (!project?.goal) {
    suggestedNextAction = "Define a project goal to focus your work.";
  } else if (!project?.current_focus) {
    suggestedNextAction = "Set a current focus to guide today's session.";
  } else if (!project?.next_step) {
    suggestedNextAction = "Write down the very next thing to do.";
  } else if (unanswered > 0) {
    suggestedNextAction = `Resolve one of ${unanswered} open question${unanswered !== 1 ? "s" : ""}.`;
  } else if (notes.length === 0) {
    suggestedNextAction = "Capture your first note.";
  } else if (lastActiveDaysAgo !== null && lastActiveDaysAgo >= 7) {
    suggestedNextAction = "Re-read your most recent note to regain context.";
  } else {
    suggestedNextAction = "Continue with your next step.";
  }

  return {
    goal: project?.goal ?? null,
    current_focus: project?.current_focus ?? null,
    next_step: project?.next_step ?? null,
    last_active_days_ago: lastActiveDaysAgo,
    recent_note_updates: recentNoteUpdates,
    unanswered_questions: unanswered,
    most_recent_note: mostRecentNote
      ? { id: mostRecentNote.id, title: mostRecentNote.title }
      : null,
    suggested_starting_point: suggestedStartingPoint,
    suggested_next_action: suggestedNextAction,
  };
}