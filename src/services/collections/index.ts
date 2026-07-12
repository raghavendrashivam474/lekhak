// src/services/collections/index.ts

import type { ServiceResult } from "@/types/service";

import { createClient } from "@/lib/supabase/client";
import type {
  Collection,
  CollectionWithNotes,
  KnowledgeTag,
  NoteTagWithTag,
  NoteCollection,
  ProjectHealth,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/types/collection";


// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export async function getProjectCollections(
  projectId: string
): Promise<ServiceResult<CollectionWithNotes[]>> {
  const supabase = createClient();

  const { data: collections, error } = await supabase
    .from("collections")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getProjectCollections]", error.message);
    return { data: null, error: error.message };
  }

  const collectionsWithNotes: CollectionWithNotes[] = await Promise.all(
    (collections ?? []).map(async (col) => {
      const { data: noteCollections } = await supabase
        .from("note_collections")
        .select("note_id, notes(id, title, category)")
        .eq("collection_id", col.id);

      interface NoteCollectionRow {
        note_id: string;
        notes: { id: string; title: string; category: string } | null;
      }
      const notes = ((noteCollections ?? []) as unknown as NoteCollectionRow[]).map((nc) => ({
        id: nc.notes?.id ?? "",
        title: nc.notes?.title ?? "",
        category: nc.notes?.category ?? "idea",
      }));

      return { ...col, notes };
    })
  );

  return { data: collectionsWithNotes, error: null };
}

export async function createCollection(
  input: CreateCollectionInput
): Promise<ServiceResult<Collection>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id: user.id,
      project_id: input.project_id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[createCollection]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateCollection(
  id: string,
  input: UpdateCollectionInput
): Promise<ServiceResult<Collection>> {
  const supabase = createClient();

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.description !== undefined) {
    payload.description = input.description.trim() || null;
  }

  const { data, error } = await supabase
    .from("collections")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateCollection]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function deleteCollection(
  id: string
): Promise<ServiceResult<{ id: string }>> {
  const supabase = createClient();

  const { error } = await supabase.from("collections").delete().eq("id", id);

  if (error) {
    console.error("[deleteCollection]", error.message);
    return { data: null, error: error.message };
  }

  return { data: { id }, error: null };
}

export async function assignNoteToCollection(
  noteId: string,
  collectionId: string
): Promise<ServiceResult<NoteCollection>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "Not authenticated." };
  }

  await supabase.from("note_collections").delete().eq("note_id", noteId);

  const { data, error } = await supabase
    .from("note_collections")
    .insert({
      user_id: user.id,
      note_id: noteId,
      collection_id: collectionId,
    })
    .select()
    .single();

  if (error) {
    console.error("[assignNoteToCollection]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function removeNoteFromCollection(
  noteId: string,
  collectionId: string
): Promise<ServiceResult<{ noteId: string }>> {
  const supabase = createClient();

  const { error } = await supabase
    .from("note_collections")
    .delete()
    .eq("note_id", noteId)
    .eq("collection_id", collectionId);

  if (error) {
    console.error("[removeNoteFromCollection]", error.message);
    return { data: null, error: error.message };
  }

  return { data: { noteId }, error: null };
}

export async function getNoteCollection(
  noteId: string
): Promise<ServiceResult<NoteCollection | null>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("note_collections")
    .select("*")
    .eq("note_id", noteId)
    .maybeSingle();

  if (error) {
    console.error("[getNoteCollection]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// ---------------------------------------------------------------------------
// Knowledge Tags
// ---------------------------------------------------------------------------

export async function getProjectTags(
  projectId: string
): Promise<ServiceResult<KnowledgeTag[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("knowledge_tags")
    .select("*")
    .eq("project_id", projectId)
    .order("name", { ascending: true });

  if (error) {
    console.error("[getProjectTags]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createTag(
  projectId: string,
  name: string
): Promise<ServiceResult<KnowledgeTag>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("knowledge_tags")
    .insert({
      user_id: user.id,
      project_id: projectId,
      name: name.trim().toLowerCase(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "This tag already exists." };
    }
    console.error("[createTag]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function deleteTag(
  id: string
): Promise<ServiceResult<{ id: string }>> {
  const supabase = createClient();

  const { error } = await supabase.from("knowledge_tags").delete().eq("id", id);

  if (error) {
    console.error("[deleteTag]", error.message);
    return { data: null, error: error.message };
  }

  return { data: { id }, error: null };
}

export async function getNoteTags(
  noteId: string
): Promise<ServiceResult<NoteTagWithTag[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("note_tags")
    .select("*, tag:knowledge_tags(*)")
    .eq("note_id", noteId);

  if (error) {
    console.error("[getNoteTags]", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function addTagToNote(
  noteId: string,
  tagId: string
): Promise<ServiceResult<{ id: string }>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("note_tags")
    .insert({ user_id: user.id, note_id: noteId, tag_id: tagId })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "Tag already applied." };
    }
    console.error("[addTagToNote]", error.message);
    return { data: null, error: error.message };
  }

  return { data: { id: data.id }, error: null };
}

export async function removeTagFromNote(
  noteId: string,
  tagId: string
): Promise<ServiceResult<{ tagId: string }>> {
  const supabase = createClient();

  const { error } = await supabase
    .from("note_tags")
    .delete()
    .eq("note_id", noteId)
    .eq("tag_id", tagId);

  if (error) {
    console.error("[removeTagFromNote]", error.message);
    return { data: null, error: error.message };
  }

  return { data: { tagId }, error: null };
}

// ---------------------------------------------------------------------------
// Project Health
// Fixed: notes fetched first, then relationships queried using note ids
// ---------------------------------------------------------------------------

export async function getProjectHealth(
  projectId: string
): Promise<ServiceResult<ProjectHealth>> {
  const supabase = createClient();

  // Step 1 — get notes first
  const { data: notes } = await supabase
    .from("notes")
    .select("id")
    .eq("project_id", projectId);

  const noteIds = (notes ?? []).map((n) => n.id);

  // Step 2 — get everything else in parallel
  const [collectionsRes, questionsRes, relationshipsRes, noteCollectionsRes] =
    await Promise.all([
      supabase
        .from("collections")
        .select("id, name")
        .eq("project_id", projectId),
      supabase
        .from("questions")
        .select("id, status")
        .eq("project_id", projectId),
      noteIds.length > 0
        ? supabase
            .from("note_relationships")
            .select("from_note_id, to_note_id")
            .or(
              "from_note_id.in.(" +
                noteIds.join(",") +
                "),to_note_id.in.(" +
                noteIds.join(",") +
                ")"
            )
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("note_collections")
        .select("note_id, collection_id")
        .in(
          "collection_id",
          (await supabase
            .from("collections")
            .select("id")
            .eq("project_id", projectId)
            .then((r) => r.data ?? [])).map((c) => c.id)
        ),
    ]);

  const collections = collectionsRes.data ?? [];
  const questions = questionsRes.data ?? [];
  const relationships = relationshipsRes.data ?? [];
  const noteCollections = noteCollectionsRes.data ?? [];

  const connectedNoteIds = new Set<string>();
  relationships.forEach((r) => {
    connectedNoteIds.add(r.from_note_id);
    connectedNoteIds.add(r.to_note_id);
  });

  const collectionNoteCounts: Record<string, number> = {};
  noteCollections.forEach((nc) => {
    collectionNoteCounts[nc.collection_id] =
      (collectionNoteCounts[nc.collection_id] ?? 0) + 1;
  });

  let mostActiveCollectionId: string | null = null;
  let maxCount = 0;
  Object.entries(collectionNoteCounts).forEach(([id, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostActiveCollectionId = id;
    }
  });

  const mostActiveCollection = mostActiveCollectionId
    ? (collections.find((c) => c.id === mostActiveCollectionId)?.name ?? null)
    : null;

  return {
    data: {
      total_notes: noteIds.length,
      connected_notes: connectedNoteIds.size,
      orphan_notes: noteIds.filter((id) => !connectedNoteIds.has(id)).length,
      total_collections: collections.length,
      total_questions: questions.length,
      open_questions: questions.filter((q) => q.status === "open").length,
      answered_questions: questions.filter((q) => q.status === "answered").length,
      total_relationships: relationships.length,
      most_active_collection: mostActiveCollection,
    },
    error: null,
  };
}