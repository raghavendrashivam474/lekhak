// src/services/intelligence/momentum/index.ts

import { createClient } from "@/lib/supabase/client";
import type { MomentumInsight } from "@/types/intelligence";

const DAY_MS = 1000 * 60 * 60 * 24;

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / DAY_MS);
}

export async function calculateMomentum(): Promise<MomentumInsight> {
  const supabase = createClient();

  const [activityRes, projectsRes, collectionsRes, noteCollectionsRes] =
    await Promise.all([
      supabase
        .from("activity_logs")
        .select("created_at, project_id")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("projects").select("id, title"),
      supabase.from("collections").select("id, name, project_id"),
      supabase.from("note_collections").select("collection_id, created_at"),
    ]);

  const activity = activityRes.data ?? [];
  const projects = projectsRes.data ?? [];
  const collections = collectionsRes.data ?? [];
  const noteCollections = noteCollectionsRes.data ?? [];

  const now = new Date();
  const lastActive = activity[0] ? new Date(activity[0].created_at) : null;
  const lastActiveDaysAgo = lastActive ? daysBetween(now, lastActive) : null;

  // Streak — consecutive days with at least one activity, ending today or yesterday
  const activityDays = new Set<string>();
  activity.forEach((a) => {
    activityDays.add(dayKey(new Date(a.created_at)));
  });

  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  // Allow streak to include yesterday if today has no activity yet
  if (!activityDays.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!activityDays.has(dayKey(cursor))) {
      streak = 0;
    } else {
      while (activityDays.has(dayKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
    }
  } else {
    while (activityDays.has(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  const activeThisWeek = activity.filter((a) => {
    return daysBetween(now, new Date(a.created_at)) <= 7;
  }).length;

  const activeThisMonth = activity.filter((a) => {
    return daysBetween(now, new Date(a.created_at)) <= 30;
  }).length;

  // Most active project — by activity count in last 30 days
  const projectActivity: Record<string, number> = {};
  activity.forEach((a) => {
    if (!a.project_id) return;
    if (daysBetween(now, new Date(a.created_at)) > 30) return;
    projectActivity[a.project_id] = (projectActivity[a.project_id] ?? 0) + 1;
  });

  let mostActiveProject: MomentumInsight["most_active_project"] = null;
  let maxCount = 0;
  Object.entries(projectActivity).forEach(([pid, count]) => {
    if (count > maxCount) {
      const p = projects.find((x) => x.id === pid);
      if (p) {
        mostActiveProject = { id: p.id, title: p.title, activity_count: count };
        maxCount = count;
      }
    }
  });

  // Most active collection — by note assignments in last 30 days
  const collectionActivity: Record<string, number> = {};
  noteCollections.forEach((nc) => {
    if (daysBetween(now, new Date(nc.created_at)) > 30) return;
    collectionActivity[nc.collection_id] =
      (collectionActivity[nc.collection_id] ?? 0) + 1;
  });

  let mostActiveCollectionId: string | null = null;
  let maxColCount = 0;
  Object.entries(collectionActivity).forEach(([cid, count]) => {
    if (count > maxColCount) {
      maxColCount = count;
      mostActiveCollectionId = cid;
    }
  });

  const mostActiveCollection = mostActiveCollectionId
    ? (collections.find((c) => c.id === mostActiveCollectionId)?.name ?? null)
    : null;

  // Trend — compare last 7 days vs previous 7 days
  const prevWeek = activity.filter((a) => {
    const d = daysBetween(now, new Date(a.created_at));
    return d > 7 && d <= 14;
  }).length;

  let trend: MomentumInsight["trend"] = "steady";
  if (activeThisWeek === 0 && prevWeek === 0) {
    trend = "silent";
  } else if (activeThisWeek > prevWeek * 1.3) {
    trend = "rising";
  } else if (activeThisWeek < prevWeek * 0.7) {
    trend = "declining";
  }

  return {
    writing_streak_days: streak,
    active_this_week: activeThisWeek,
    active_this_month: activeThisMonth,
    last_active_days_ago: lastActiveDaysAgo,
    most_active_project: mostActiveProject,
    most_active_collection: mostActiveCollection,
    trend,
  };
}