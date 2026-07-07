// src/types/collection.ts

export interface Collection {
  id: string;
  user_id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectionWithNotes extends Collection {
  notes: {
    id: string;
    title: string;
    category: string;
  }[];
}

export interface KnowledgeTag {
  id: string;
  user_id: string;
  project_id: string;
  name: string;
  created_at: string;
}

export interface NoteTag {
  id: string;
  user_id: string;
  note_id: string;
  tag_id: string;
  created_at: string;
}

export interface NoteTagWithTag extends NoteTag {
  tag: KnowledgeTag;
}

export interface NoteCollection {
  id: string;
  user_id: string;
  note_id: string;
  collection_id: string;
  created_at: string;
}

export interface ProjectHealth {
  total_notes: number;
  connected_notes: number;
  orphan_notes: number;
  total_collections: number;
  total_questions: number;
  open_questions: number;
  answered_questions: number;
  total_relationships: number;
  most_active_collection: string | null;
}

export interface CreateCollectionInput {
  project_id: string;
  name: string;
  description?: string;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
}