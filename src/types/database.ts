// src/types/database.ts

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  project_id: string | null;
  user_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
};