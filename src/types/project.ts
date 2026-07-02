// src/types/project.ts

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  goal: string | null;
  current_focus: string | null;
  next_step: string | null;
  open_questions: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
}

export interface UpdateProjectIntentInput {
  goal?: string;
  current_focus?: string;
  next_step?: string;
  open_questions?: string[];
}