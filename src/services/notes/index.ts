// src/services/notes/index.ts

import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/services/activity";
import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
} from "@/types/note";

type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export async function createNote(
  input: CreateNoteInput
): Promise<ServiceResult<Note>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      content: input.content?.trim() || null,
      project_id: input.project_id,
      category: input.category ?? "idea",
    })
    .select()
    .single();

  if (error) {
    console.error("[createNote]", error.message);
    return { data: null, error: error.message };
  }

  await logActivity({
    project_id: input.project_id,
    entity_type: "note",
    entity_id: data.id,
    action: "note_created",
    metadata: { title: data.title, project_id: input.project_id },
  });

  return { data, error: null };
}

export async function getNotesByProject(
  projectId: string
): Promise<ServiceResult<Note[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[getNotesByProject]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getNoteById(
  id: string
): Promise<ServiceResult<Note>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getNoteById]", error.message);
    if (error.code === "PGRST116") {
      return { data: null, error: "Note not found." };
    }
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateNote(
  id: string,
  input: UpdateNoteInput
): Promise<ServiceResult<Note>> {
  const supabase = createClient();

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.content !== undefined) {
    payload.content = input.content.trim() || null;
  }
  if (input.category !== undefined) {
    payload.category = input.category;
  }

  const { data, error } = await supabase
    .from("notes")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateNote]", error.message);
    return { data: null, error: error.message };
  }

  await logActivity({
    project_id: data.project_id,
    entity_type: "note",
    entity_id: id,
    action: "note_updated",
    metadata: { title: data.title },
  });

  return { data, error: null };
}

export async function deleteNote(
  id: string
): Promise<ServiceResult<{ id: string }>> {
  const supabase = createClient();

  const { data: note } = await supabase
    .from("notes")
    .select("title, project_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    console.error("[deleteNote]", error.message);
    return { data: null, error: error.message };
  }

  await logActivity({
    project_id: note?.project_id ?? null,
    entity_type: "note",
    entity_id: id,
    action: "note_deleted",
    metadata: { title: note?.title ?? "Unknown" },
  });

  return { data: { id }, error: null };
}