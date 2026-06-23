// src/services/activity/index.ts

import { createClient } from "@/lib/supabase/client";
import type { ActivityLog, ActivityAction, ActivityEntityType } from "@/types/activity";

type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export async function logActivity(params: {
  project_id: string | null;
  entity_type: ActivityEntityType;
  entity_id: string;
  action: ActivityAction;
  metadata?: Record<string, string>;
}): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.from("activity_logs").insert({
    user_id: user.id,
    project_id: params.project_id,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    action: params.action,
    metadata: params.metadata ?? {},
  });

  if (error) {
    console.error("[logActivity]", error.message);
  }
}

export async function getActivityFeed(): Promise<ServiceResult<ActivityLog[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("[getActivityFeed]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getProjectActivity(
  projectId: string
): Promise<ServiceResult<ActivityLog[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[getProjectActivity]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}