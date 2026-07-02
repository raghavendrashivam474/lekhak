// src/types/relationship.ts

export type RelationshipType = "references" | "related";

export type QuestionStatus = "open" | "in_progress" | "answered" | "archived";

export type IntentContext = "goal" | "focus" | "next_step";

export interface NoteRelationship {
  id: string;
  user_id: string;
  from_note_id: string;
  to_note_id: string;
  relationship_type: RelationshipType;
  created_at: string;
}

export interface NoteRelationshipWithNote extends NoteRelationship {
  note: {
    id: string;
    title: string;
    category: string;
  };
}

export interface Question {
  id: string;
  user_id: string;
  project_id: string;
  question: string;
  status: QuestionStatus;
  answered_by_note_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionWithNote extends Question {
  answered_by_note?: {
    id: string;
    title: string;
  } | null;
}

export interface NoteIntentLink {
  id: string;
  user_id: string;
  project_id: string;
  note_id: string;
  context: IntentContext;
  created_at: string;
}

export interface NoteIntentLinkWithNote extends NoteIntentLink {
  note: {
    id: string;
    title: string;
    category: string;
  };
}

export interface CreateQuestionInput {
  project_id: string;
  question: string;
}

export interface CreateNoteRelationshipInput {
  from_note_id: string;
  to_note_id: string;
  relationship_type: RelationshipType;
}

export interface CreateNoteIntentLinkInput {
  project_id: string;
  note_id: string;
  context: IntentContext;
}