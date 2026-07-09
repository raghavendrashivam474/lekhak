// src/types/intelligence.ts

export type ProjectStatus =
  | "healthy"
  | "highly_active"
  | "needs_attention"
  | "dormant"
  | "near_completion"
  | "new";

export interface ProjectStatusInsight {
  status: ProjectStatus;
  reasons: string[];
}

export interface MomentumInsight {
  writing_streak_days: number;
  active_this_week: number;
  active_this_month: number;
  last_active_days_ago: number | null;
  most_active_project: {
    id: string;
    title: string;
    activity_count: number;
  } | null;
  most_active_collection: string | null;
  trend: "rising" | "steady" | "declining" | "silent";
}

export interface GoalProgress {
  has_goal: boolean;
  estimated_percentage: number;
  factors: {
    label: string;
    contribution: number;
  }[];
}

export interface FocusDrift {
  has_focus: boolean;
  drifting: boolean;
  focus_text: string | null;
  recent_categories: string[];
  message: string;
}

export interface OrphanInsight {
  orphan_note_ids: string[];
  untagged_note_ids: string[];
  unused_collection_ids: string[];
  orphan_count: number;
  untagged_count: number;
  unused_collection_count: number;
}

export interface QuestionIntelligence {
  waiting_count: number;
  answered_count: number;
  oldest_open_question: {
    id: string;
    question: string;
    days_open: number;
  } | null;
  recently_answered: {
    id: string;
    question: string;
    answered_by_title: string | null;
  }[];
}

export interface CreativeGap {
  label: string;
  detail: string;
}

export interface WeeklySummary {
  notes_created: number;
  notes_updated: number;
  questions_answered: number;
  active_collection_count: number;
  most_active_project: {
    id: string;
    title: string;
  } | null;
  most_productive_collection: string | null;
  suggested_project_to_continue: {
    id: string;
    title: string;
    reason: string;
  } | null;
}

export interface SmartResumeContext {
  goal: string | null;
  current_focus: string | null;
  next_step: string | null;
  last_active_days_ago: number | null;
  recent_note_updates: number;
  unanswered_questions: number;
  most_recent_note: {
    id: string;
    title: string;
  } | null;
  suggested_starting_point: string | null;
  suggested_next_action: string | null;
}