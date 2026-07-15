// src/domain/reasoning/types.ts
//
// Core types for the creative reasoning domain.
// No IO. No React. No Supabase.

// ---------------------------------------------------------------------------
// Creative Thread
// ---------------------------------------------------------------------------

export interface CreativeThread {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  /** Note IDs that belong to this thread, ordered by relevance. */
  memberNoteIds: string[];
  /** Question IDs linked to this thread. */
  linkedQuestionIds: string[];
  /** Intent contexts this thread supports. */
  linkedIntentContexts: IntentThreadLink[];
  /** How the thread was derived. */
  derivation: ThreadDerivation;
  createdAt: string;
}

export interface IntentThreadLink {
  context: "goal" | "focus" | "next_step";
  noteId: string;
}

export type ThreadDerivationMethod =
  | "relationship_cluster"
  | "intent_linked"
  | "collection_based"
  | "tag_cluster";

export interface ThreadDerivation {
  method: ThreadDerivationMethod;
  /** IDs of the seed entities that formed this thread. */
  seedEntityIds: string[];
  confidence: number;
}

// ---------------------------------------------------------------------------
// Thread Resolver Input
// ---------------------------------------------------------------------------

export interface ThreadResolverInput {
  projectId: string;
  notes: ThreadNote[];
  relationships: ThreadRelationship[];
  questions: ThreadQuestion[];
  intentLinks: ThreadIntentLink[];
  collections: ThreadCollection[];
  tags: ThreadTag[];
  noteTags: ThreadNoteTag[];
}

export interface ThreadNote {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadRelationship {
  fromNoteId: string;
  toNoteId: string;
  relationshipType: string;
}

export interface ThreadQuestion {
  id: string;
  question: string;
  status: string;
  answeredByNoteId: string | null;
}

export interface ThreadIntentLink {
  noteId: string;
  context: "goal" | "focus" | "next_step";
}

export interface ThreadCollection {
  id: string;
  name: string;
  noteIds: string[];
}

export interface ThreadTag {
  id: string;
  name: string;
}

export interface ThreadNoteTag {
  noteId: string;
  tagId: string;
}

// ---------------------------------------------------------------------------
// Narrative Progress
// ---------------------------------------------------------------------------

export interface ThreadProgress {
  threadId: string;
  threadTitle: string;
  completionPercentage: number;
  factors: ProgressFactor[];
}

export interface ProgressFactor {
  label: string;
  contribution: number;
  maxContribution: number;
}

export interface ProjectNarrativeProgress {
  projectId: string;
  overallPercentage: number;
  threadProgress: ThreadProgress[];
  factors: ProgressFactor[];
}

// ---------------------------------------------------------------------------
// Dependency Engine
// ---------------------------------------------------------------------------

export type DependencyNodeType = "note" | "question" | "goal" | "focus" | "next_step" | "thread";

export interface DependencyNode {
  id: string;
  type: DependencyNodeType;
  label: string;
  resolved: boolean;
}

export interface DependencyEdge {
  fromId: string;
  toId: string;
  relationship: string;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface Blocker {
  blockerId: string;
  blockerType: DependencyNodeType;
  blockerLabel: string;
  blockedIds: string[];
  reason: string;
}

export interface DependencyAnalysis {
  graph: DependencyGraph;
  blockers: Blocker[];
  criticalPath: string[];
}

// ---------------------------------------------------------------------------
// Creative Health
// ---------------------------------------------------------------------------

export interface CreativeHealthMetric {
  label: string;
  score: number;
  maxScore: number;
  explanation: string;
}

export interface CreativeHealth {
  projectId: string;
  overallScore: number;
  confidence: number;
  metrics: CreativeHealthMetric[];
}

// ---------------------------------------------------------------------------
// Reasoning Engine
// ---------------------------------------------------------------------------

export type ReasoningRuleId =
  | "goal_blocked"
  | "focus_stale"
  | "thread_stalled"
  | "questions_accumulating"
  | "orphan_growth"
  | "dependency_chain_broken"
  | "strong_momentum"
  | "research_complete"
  | "approaching_completion"
  | "creative_drift";

export type InsightSeverity = "info" | "warning" | "critical" | "positive";

export interface ReasoningEvidence {
  entityType: string;
  entityId: string;
  label: string;
  detail: string;
}

export interface ReasoningInsight {
  id: string;
  ruleId: ReasoningRuleId;
  severity: InsightSeverity;
  title: string;
  message: string;
  evidence: ReasoningEvidence[];
}

export interface ReasoningContext {
  projectId: string;
  threads: CreativeThread[];
  progress: ProjectNarrativeProgress;
  dependencies: DependencyAnalysis;
  health: CreativeHealth;
  /** Raw inputs for rule evaluation. */
  input: ThreadResolverInput;
  /** Current intent state. */
  intent: {
    goal: string | null;
    currentFocus: string | null;
    nextStep: string | null;
  };
  /** Activity signals from existing intelligence. */
  activityLast7Days: number;
  activityLast30Days: number;
  writingStreakDays: number;
}

export interface ReasoningResult {
  projectId: string;
  insights: ReasoningInsight[];
  continueHere: string | null;
  attentionAreas: string[];
  generatedAt: string;
}
