// src/services/projects/index.ts

import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/services/activity";
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/types/project";

type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export async function createProject(
  input: CreateProjectInput
): Promise<ServiceResult<Project>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("[createProject]", error.message);
    return { data: null, error: error.message };
  }

  await logActivity({
    project_id: data.id,
    entity_type: "project",
    entity_id: data.id,
    action: "project_created",
    metadata: { title: data.title },
  });

  return { data, error: null };
}

export async function getProjects(): Promise<ServiceResult<Project[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[getProjects]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getProjectById(
  id: string
): Promise<ServiceResult<Project>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getProjectById]", error.message);
    if (error.code === "PGRST116") {
      return { data: null, error: "Project not found." };
    }
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<ServiceResult<Project>> {
  const supabase = createClient();

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.description !== undefined) {
    payload.description = input.description.trim() || null;
  }

  const { data, error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateProject]", error.message);
    return { data: null, error: error.message };
  }

  await logActivity({
    project_id: id,
    entity_type: "project",
    entity_id: id,
    action: "project_updated",
    metadata: { title: data.title },
  });

  return { data, error: null };
}

export async function deleteProject(
  id: string
): Promise<ServiceResult<{ id: string }>> {
  const supabase = createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("title")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("[deleteProject]", error.message);
    return { data: null, error: error.message };
  }

  await logActivity({
    project_id: null,
    entity_type: "project",
    entity_id: id,
    action: "project_deleted",
    metadata: { title: project?.title ?? "Unknown" },
  });

  return { data: { id }, error: null };
}