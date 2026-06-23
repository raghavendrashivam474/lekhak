// src/types/note.ts

export interface Note {
  id: string;
  project_id: string | null;
  user_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  project_id: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}
