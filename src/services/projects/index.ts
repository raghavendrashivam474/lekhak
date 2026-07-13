// src/services/projects/index.ts

import type { ServiceResult } from "@/types/service";

import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/services/activity";
import { recordTemporalEvent } from "@/services/temporal";
import { isMeaningfulTextChange } from "@/domain/temporal";
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  UpdateProjectIntentInput,
} from "@/types/project";


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

/**
 * Update project intent fields (goal / current_focus / next_step /
 * open_questions).
 *
 * Sprint 11 [2/8]: also records TemporalEvents for meaningful transitions in
 * the three text intent fields. open_questions is handled by the question
 * lifecycle in Commit 3/8.
 *
 * Recording rules (Sprint 11 brief):
 *   - Load previous state BEFORE the mutation.
 *   - Only record events AFTER the mutation succeeds (Rule 1).
 *   - Ignore whitespace-only / no-op saves (isMeaningfulTextChange).
 *   - A temporal recording failure must not fail the user's save.
 */
export async function updateProjectIntent(
  id: string,
  input: UpdateProjectIntentInput
): Promise<ServiceResult<Project>> {
  const supabase = createClient();

  // --- 1. Load previous intent BEFORE mutating -----------------------------
  //
  // We only fetch this when at least one intent-text field is being updated.
  // This keeps question-only saves cheap.
  const willTouchIntentText =
    input.goal !== undefined ||
    input.current_focus !== undefined ||
    input.next_step !== undefined;

  let previous: Pick<
    Project,
    "goal" | "current_focus" | "next_step"
  > | null = null;

  if (willTouchIntentText) {
    const { data: prev, error: prevErr } = await supabase
      .from("projects")
      .select("goal, current_focus, next_step")
      .eq("id", id)
      .single();

    if (prevErr) {
      console.warn(
        "[updateProjectIntent] could not load previous intent, skipping temporal recording:",
        prevErr.message
      );
    } else if (prev) {
      previous = prev as Pick<
        Project,
        "goal" | "current_focus" | "next_step"
      >;
    }
  }

  // --- 2. Perform the mutation (unchanged behaviour) -----------------------

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.goal !== undefined) {
    payload.goal = input.goal.trim() || null;
  }

  if (input.current_focus !== undefined) {
    payload.current_focus = input.current_focus.trim() || null;
  }

  if (input.next_step !== undefined) {
    payload.next_step = input.next_step.trim() || null;
  }

  if (input.open_questions !== undefined) {
    payload.open_questions = input.open_questions.filter((q) => q.trim() !== "");
  }

  const { data, error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateProjectIntent]", error.message);
    return { data: null, error: error.message };
  }

  await logActivity({
    project_id: id,
    entity_type: "project",
    entity_id: id,
    action: "project_updated",
    metadata: { title: data.title },
  });

  // --- 3. Record temporal events (only meaningful transitions) --------------
  //
  // Fire-and-forget. Failures already log warnings inside the temporal
  // service; we never propagate them as user-facing errors.

  if (previous) {
    const project = data as Project;

    if (
      input.goal !== undefined &&
      isMeaningfulTextChange(previous.goal, project.goal)
    ) {
      await recordTemporalEvent({
        project_id: id,
        entity_type: "intent",
        entity_id: id,
        event_type: "goal_changed",
        previous_state: { value: previous.goal },
        next_state: { value: project.goal },
      });
    }

    if (
      input.current_focus !== undefined &&
      isMeaningfulTextChange(previous.current_focus, project.current_focus)
    ) {
      await recordTemporalEvent({
        project_id: id,
        entity_type: "intent",
        entity_id: id,
        event_type: "focus_changed",
        previous_state: { value: previous.current_focus },
        next_state: { value: project.current_focus },
      });
    }

    if (
      input.next_step !== undefined &&
      isMeaningfulTextChange(previous.next_step, project.next_step)
    ) {
      await recordTemporalEvent({
        project_id: id,
        entity_type: "intent",
        entity_id: id,
        event_type: "next_step_changed",
        previous_state: { value: previous.next_step },
        next_state: { value: project.next_step },
      });
    }
  }

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
