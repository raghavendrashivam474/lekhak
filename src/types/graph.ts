// src/types/graph.ts
// Renderer-independent graph domain types.
// No visualization library imports allowed in this file.

export type GraphNodeType =
  | "project"
  | "collection"
  | "note"
  | "question"
  | "knowledge_tag";

export type GraphRelationshipType =
  | "contains"
  | "belongs_to"
  | "related_to"
  | "references"
  | "answers_question"
  | "supports_goal"
  | "supports_focus"
  | "blocks_next_step"
  | "tagged_with";

export interface GraphNodeState {
  orphan?: boolean;
  dormant?: boolean;
  active?: boolean;
  suggestedStart?: boolean;
  unresolved?: boolean;
  focusRelevant?: boolean;
}

export interface GraphNodeMetadata {
  category?: string;
  status?: string;
  description?: string | null;
  noteCount?: number;
  relationshipCount?: number;
  usageCount?: number;
  lastUpdated?: string;
  parentId?: string | null;
}

export interface GraphNode {
  id: string;
  entityId: string;
  entityType: GraphNodeType;
  label: string;
  weight: number;
  state: GraphNodeState;
  metadata: GraphNodeMetadata;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationshipType: GraphRelationshipType;
  weight: number;
}

export interface GraphProjection {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Entry point declaration — controls initial visible context
export type GraphEntryPointKind =
  | "project_memory"
  | "current_focus"
  | "suggested_start"
  | "recent_work"
  | "open_questions"
  | "orphan_knowledge";

export interface GraphEntryPoint {
  kind: GraphEntryPointKind;
  initialNodeIds: string[];
  label: string;
}

// Adjacency map for efficient neighbour lookup
export type GraphAdjacency = Map<string, Set<string>>;