// src/services/intelligence/summary/index.ts

import { createClient } from "@/lib/supabase/client";
import type { WeeklySummary } from "@/types/intelligence";

const DAY_MS = 1000 * 60 * 60 * 24;

export async function calculateWeeklySummary(): Promise<WeeklySummary> {
  const supabase = createClient();

  const [activityRes, projectsRes, collectionsRes, noteCollectionsRes] =
    await Promise.all([
      supabase
        .from("activity_logs")
        .select("action, project_id, created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("projects").select("id, title, updated_at"),
      supabase.from("collections").select("id, name, project_id"),
      supabase.from("note_collections").select("collection_id, created_at"),
    ]);

  const activity = activityRes.data ?? [];
  const projects = projectsRes.data ?? [];
  const collections = collectionsRes.data ?? [];
  const noteCollections = noteCollectionsRes.data ?? [];

  const now = new Date();
  const weekActivity = activity.filter((a) => {
    const days = Math.floor(
      (now.getTime() - new Date(a.created_at).getTime()) / DAY_MS
    );
    return days <= 7;
  });

  const notesCreated = weekActivity.filter(
    (a) => a.action === "note_created"
  ).length;
  const notesUpdated = weekActivity.filter(
    (a) => a.action === "note_updated"
  ).length;

  // Questions answered — use activity? We don't log question_answered.
  // Approximate by fetching questions with recent updated_at that are answered
  const { data: recentAnswered } = await supabase
    .from("questions")
    .select("id, updated_at")
    .eq("status", "answered")
    .gte("updated_at", new Date(now.getTime() - 7 * DAY_MS).toISOString());

  const questionsAnswered = (recentAnswered ?? []).length;

  // Active collections this week
  const activeCollections = new Set<string>();
  noteCollections.forEach((nc) => {
    const days = Math.floor(
      (now.getTime() - new Date(nc.created_at).getTime()) / DAY_MS
    );
    if (days <= 7) activeCollections.add(nc.collection_id);
  });

  // Most active project this week
  const projectCounts: Record<string, number> = {};
  weekActivity.forEach((a) => {
    if (!a.project_id) return;
    projectCounts[a.project_id] = (projectCounts[a.project_id] ?? 0) + 1;
  });

  let mostActiveProject: WeeklySummary["most_active_project"] = null;
  let maxCount = 0;
  Object.entries(projectCounts).forEach(([pid, count]) => {
    if (count > maxCount) {
      const p = projects.find((x) => x.id === pid);
      if (p) {
        mostActiveProject = { id: p.id, title: p.title };
        maxCount = count;
      }
    }
  });

  // Most productive collection — most note assignments this week
  const collectionCounts: Record<string, number> = {};
  noteCollections.forEach((nc) => {
    const days = Math.floor(
      (now.getTime() - new Date(nc.created_at).getTime()) / DAY_MS
    );
    if (days > 7) return;
    collectionCounts[nc.collection_id] =
      (collectionCounts[nc.collection_id] ?? 0) + 1;
  });

  let mostProductiveCollection: string | null = null;
  let maxColCount = 0;
  Object.entries(collectionCounts).forEach(([cid, count]) => {
    if (count > maxColCount) {
      const c = collections.find((x) => x.id === cid);
      if (c) {
        mostProductiveCollection = c.name;
        maxColCount = count;
      }
    }
  });

  // Suggested project to continue — least recently updated among active projects
  let suggestedProject: WeeklySummary["suggested_project_to_continue"] = null;

  const projectsWithLastActivity = projects.map((p) => {
    const projectActivity = activity.filter((a) => a.project_id === p.id);
    const lastAt = projectActivity[0]
      ? new Date(projectActivity[0].created_at)
      : new Date(p.updated_at);
    return { project: p, lastAt };
  });

  const staleActive = projectsWithLastActivity
    .filter((entry) => {
      const daysAgo = Math.floor(
        (now.getTime() - entry.lastAt.getTime()) / DAY_MS
      );
      return daysAgo >= 3 && daysAgo <= 21;
    })
    .sort((a, b) => a.lastAt.getTime() - b.lastAt.getTime());

  if (staleActive.length > 0) {
    const target = staleActive[0];
    const daysAgo = Math.floor(
      (now.getTime() - target.lastAt.getTime()) / DAY_MS
    );
    suggestedProject = {
      id: target.project.id,
      title: target.project.title,
      reason: `Last touched ${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago.`,
    };
  }

  return {
    notes_created: notesCreated,
    notes_updated: notesUpdated,
    questions_answered: questionsAnswered,
    active_collection_count: activeCollections.size,
    most_active_project: mostActiveProject,
    most_productive_collection: mostProductiveCollection,
    suggested_project_to_continue: suggestedProject,
  };
}