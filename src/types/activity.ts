// src/types/activity.ts

export type ActivityAction =
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "note_created"
  | "note_updated"
  | "note_deleted";

export type ActivityEntityType = "project" | "note";

export interface ActivityLog {
  id: string;
  user_id: string;
  project_id: string | null;
  entity_type: ActivityEntityType;
  entity_id: string;
  action: ActivityAction;
  metadata: Record<string, string>;
  created_at: string;
}