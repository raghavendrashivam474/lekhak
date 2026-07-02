// src/types/note.ts

export type NoteCategory =
  | "idea"
  | "scene"
  | "outline"
  | "dialogue"
  | "research"
  | "character"
  | "theme"
  | "worldbuilding"
  | "revision";

export interface Note {
  id: string;
  project_id: string | null;
  user_id: string;
  title: string;
  content: string | null;
  category: NoteCategory;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  project_id: string;
  category?: NoteCategory;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  category?: NoteCategory;
}