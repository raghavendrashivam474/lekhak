// src/services/relationships/index.ts

import type { ServiceResult } from "@/types/service";

import { createClient } from "@/lib/supabase/client";
import { recordTemporalEvent } from "@/services/temporal";
import {
  resolveQuestionTemporalEvent,
  type LifecycleStatus,
} from "@/domain/temporal";
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

  const question = data as Question;

  await recordTemporalEvent({
    project_id: question.project_id,
    entity_type: "question",
    entity_id: question.id,
    event_type: "question_raised",
    previous_state: null,
    next_state: {
      status: question.status,
      question: question.question,
    },
  });

  return { data: question, error: null };
}

export async function updateQuestionStatus(
  id: string,
  status: QuestionStatus,
  answeredByNoteId?: string | null
): Promise<ServiceResult<Question>> {
  const supabase = createClient();

  let previousStatus: LifecycleStatus | null = null;
  const { data: prev, error: prevErr } = await supabase
    .from("questions")
    .select("status")
    .eq("id", id)
    .single();

  if (prevErr) {
    console.warn(
      "[updateQuestionStatus] could not load previous status, skipping temporal recording:",
      prevErr.message
    );
  } else if (prev) {
    previousStatus = prev.status as LifecycleStatus;
  }

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

  const question = data as Question;

  if (previousStatus) {
    const eventType = resolveQuestionTemporalEvent(
      previousStatus,
      status as LifecycleStatus
    );

    if (eventType) {
      await recordTemporalEvent({
        project_id: question.project_id,
        entity_type: "question",
        entity_id: question.id,
        event_type: eventType,
        previous_state: { status: previousStatus },
        next_state: {
          status: question.status,
          answered_by_note_id: question.answered_by_note_id,
        },
      });
    }
  }

  return { data: question, error: null };
}

export async function deleteQuestion(
  id: string
): Promise<ServiceResult<{ id: string }>> {
  const supabase = createClient();

  const { data: existing, error: loadErr } = await supabase
    .from("questions")
    .select("project_id, status, question")
    .eq("id", id)
    .single();

  if (loadErr) {
    console.warn(
      "[deleteQuestion] could not load question before deletion, skipping temporal recording:",
      loadErr.message
    );
  }

  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) {
    console.error("[deleteQuestion]", error.message);
    return { data: null, error: error.message };
  }

  if (existing) {
    await recordTemporalEvent({
      project_id: existing.project_id as string,
      entity_type: "question",
      entity_id: id,
      event_type: "question_deleted",
      previous_state: { status: existing.status },
      next_state: null,
      metadata: { question: existing.question },
    });
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

/**
 * Create a note-to-note relationship.
 *
 * Sprint 11 [4/8]: records `relationship_created` after successful insertion.
 * Needs the project_id for scoping temporal events — inferred from the
 * source note.
 */
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

  const relationship = data as NoteRelationship;

  // Need project_id for temporal scoping — look it up from the source note.
  const { data: sourceNote, error: noteErr } = await supabase
    .from("notes")
    .select("project_id")
    .eq("id", relationship.from_note_id)
    .single();

  if (noteErr) {
    console.warn(
      "[createNoteRelationship] could not resolve project for temporal event:",
      noteErr.message
    );
  } else if (sourceNote?.project_id) {
    await recordTemporalEvent({
      project_id: sourceNote.project_id as string,
      entity_type: "relationship",
      entity_id: relationship.id,
      event_type: "relationship_created",
      previous_state: null,
      next_state: {
        from_note_id: relationship.from_note_id,
        to_note_id: relationship.to_note_id,
        relationship_type: relationship.relationship_type,
      },
    });
  }

  return { data: relationship, error: null };
}

/**
 * Delete a note-to-note relationship.
 *
 * Sprint 11 [4/8]: capture relationship metadata BEFORE deletion so the
 * removal event carries enough semantic information for later reconstruction.
 */
export async function deleteNoteRelationship(
  id: string
): Promise<ServiceResult<{ id: string }>> {
  const supabase = createClient();

  // Load first — we need project_id (via source note) and the relationship
  // shape before the row disappears.
  const { data: existing, error: loadErr } = await supabase
    .from("note_relationships")
    .select("from_note_id, to_note_id, relationship_type")
    .eq("id", id)
    .single();

  if (loadErr) {
    console.warn(
      "[deleteNoteRelationship] could not load relationship before deletion, skipping temporal recording:",
      loadErr.message
    );
  }

  let projectId: string | null = null;
  if (existing?.from_note_id) {
    const { data: sourceNote } = await supabase
      .from("notes")
      .select("project_id")
      .eq("id", existing.from_note_id)
      .single();
    projectId = (sourceNote?.project_id as string) ?? null;
  }

  const { error } = await supabase
    .from("note_relationships")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteNoteRelationship]", error.message);
    return { data: null, error: error.message };
  }

  if (existing && projectId) {
    await recordTemporalEvent({
      project_id: projectId,
      entity_type: "relationship",
      entity_id: id,
      event_type: "relationship_removed",
      previous_state: {
        from_note_id: existing.from_note_id,
        to_note_id: existing.to_note_id,
        relationship_type: existing.relationship_type,
      },
      next_state: null,
    });
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

/**
 * Create a note-to-project intent link (goal / focus / next_step support).
 *
 * Sprint 11 [4/8]: records `intent_link_created` after successful insertion.
 */
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

  const link = data as NoteIntentLink;

  await recordTemporalEvent({
    project_id: link.project_id,
    entity_type: "relationship",
    entity_id: link.id,
    event_type: "intent_link_created",
    previous_state: null,
    next_state: {
      note_id: link.note_id,
      context: link.context,
    },
  });

  return { data: link, error: null };
}

/**
 * Delete a note-to-project intent link.
 *
 * Sprint 11 [4/8]: capture link metadata BEFORE deletion.
 */
export async function deleteNoteIntentLink(
  id: string
): Promise<ServiceResult<{ id: string }>> {
  const supabase = createClient();

  const { data: existing, error: loadErr } = await supabase
    .from("note_intent_links")
    .select("project_id, note_id, context")
    .eq("id", id)
    .single();

  if (loadErr) {
    console.warn(
      "[deleteNoteIntentLink] could not load link before deletion, skipping temporal recording:",
      loadErr.message
    );
  }

  const { error } = await supabase
    .from("note_intent_links")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteNoteIntentLink]", error.message);
    return { data: null, error: error.message };
  }

  if (existing) {
    await recordTemporalEvent({
      project_id: existing.project_id as string,
      entity_type: "relationship",
      entity_id: id,
      event_type: "intent_link_removed",
      previous_state: {
        note_id: existing.note_id,
        context: existing.context,
      },
      next_state: null,
    });
  }

  return { data: { id }, error: null };
}
