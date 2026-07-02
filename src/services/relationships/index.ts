// src/services/relationships/index.ts

import { createClient } from "@/lib/supabase/client";
import type {
  NoteRelationship,
  NoteRelationshipWithNote,
  Question,
  QuestionWithNote,
  NoteIntentLink,
  NoteIntentLinkWithNote,
  CreateQuestionInput,
  CreateNoteRelationshipInput,
  CreateNoteIntentLinkInput,
  QuestionStatus,
} from "@/types/relationship";

type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export async function getProjectQuestions(
  projectId: string
): Promise<ServiceResult<QuestionWithNote[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("questions")
    .select("*, answered_by_note:notes(id, title)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getProjectQuestions]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createQuestion(
  input: CreateQuestionInput
): Promise<ServiceResult<Question>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({
      user_id: user.id,
      project_id: input.project_id,
      question: input.question.trim(),
      status: "open",
    })
    .select()
    .single();

  if (error) {
    console.error("[createQuestion]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateQuestionStatus(
  id: string,
  status: QuestionStatus,
  answeredByNoteId?: string | null
): Promise<ServiceResult<Question>> {
  const supabase = createClient();

  const payload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (answeredByNoteId !== undefined) {
    payload.answered_by_note_id = answeredByNoteId;
  }

  const { data, error } = await supabase
    .from("questions")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateQuestionStatus]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function deleteQuestion(
  id: string
): Promise<ServiceResult<{ id: string }>> {
  const supabase = createClient();

  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) {
    console.error("[deleteQuestion]", error.message);
    return { data: null, error: error.message };
  }

  return { data: { id }, error: null };
}

// ---------------------------------------------------------------------------
// Note Relationships
// ---------------------------------------------------------------------------

export async function getNoteRelationships(
  noteId: string
): Promise<ServiceResult<NoteRelationshipWithNote[]>> {
  const supabase = createClient();

  const { data: outgoing, error: outError } = await supabase
    .from("note_relationships")
    .select("*, note:notes!to_note_id(id, title, category)")
    .eq("from_note_id", noteId);

  if (outError) {
    console.error("[getNoteRelationships outgoing]", outError.message);
    return { data: null, error: outError.message };
  }

  const { data: incoming, error: inError } = await supabase
    .from("note_relationships")
    .select("*, note:notes!from_note_id(id, title, category)")
    .eq("to_note_id", noteId)
    .eq("relationship_type", "related");

  if (inError) {
    console.error("[getNoteRelationships incoming]", inError.message);
    return { data: null, error: inError.message };
  }

  const combined = [...(outgoing ?? []), ...(incoming ?? [])];
  const seen = new Set<string>();
  const unique = combined.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  return { data: unique, error: null };
}

export async function createNoteRelationship(
  input: CreateNoteRelationshipInput
): Promise<ServiceResult<NoteRelationship>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("note_relationships")
    .insert({
      user_id: user.id,
      from_note_id: input.from_note_id,
      to_note_id: input.to_note_id,
      relationship_type: input.relationship_type,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "This relationship already exists." };
    }
    console.error("[createNoteRelationship]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function deleteNoteRelationship(
  id: string
): Promise<ServiceResult<{ id: string }>> {
  const supabase = createClient();

  const { error } = await supabase
    .from("note_relationships")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteNoteRelationship]", error.message);
    return { data: null, error: error.message };
  }

  return { data: { id }, error: null };
}

// ---------------------------------------------------------------------------
// Note Intent Links
// ---------------------------------------------------------------------------

export async function getNoteIntentLinks(
  projectId: string
): Promise<ServiceResult<NoteIntentLinkWithNote[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("note_intent_links")
    .select("*, note:notes(id, title, category)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getNoteIntentLinks]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createNoteIntentLink(
  input: CreateNoteIntentLinkInput
): Promise<ServiceResult<NoteIntentLink>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("note_intent_links")
    .insert({
      user_id: user.id,
      project_id: input.project_id,
      note_id: input.note_id,
      context: input.context,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "This note is already linked." };
    }
    console.error("[createNoteIntentLink]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function deleteNoteIntentLink(
  id: string
): Promise<ServiceResult<{ id: string }>> {
  const supabase = createClient();

  const { error } = await supabase
    .from("note_intent_links")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteNoteIntentLink]", error.message);
    return { data: null, error: error.message };
  }

  return { data: { id }, error: null };
}