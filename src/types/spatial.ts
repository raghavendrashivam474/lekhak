// src/types/spatial.ts
// Renderer-independent spatial domain.
// NO Three.js. NO React Three Fiber. NO renderer types.

import type {
  GraphNodeType,
  GraphRelationshipType,
  GraphEntryPoint,
} from "@/types/graph";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export interface SpatialVector {
  x: number;
  y: number;
  z: number;
}

// ---------------------------------------------------------------------------
// Semantic classifications
// ---------------------------------------------------------------------------

export type SpatialDepth = "immediate" | "supporting" | "peripheral";

export type SpatialProminence = "primary" | "high" | "normal" | "low";

export type SpatialRegionType =
  | "current_work"
  | "open_threads"
  | "established_knowledge"
  | "peripheral_memory";

// ---------------------------------------------------------------------------
// Node & edge shapes
// ---------------------------------------------------------------------------

export interface SpatialNodeState {
  selected?: boolean;
  focusRelevant?: boolean;
  suggestedStart?: boolean;
  unresolved?: boolean;
  orphan?: boolean;
  dormant?: boolean;
  active?: boolean;
}

export interface SpatialNode {
  id: string;
  graphNodeId: string;
  entityId: string;
  entityType: GraphNodeType;
  label: string;

  position: SpatialVector;
  depth: SpatialDepth;
  prominence: SpatialProminence;
  region: SpatialRegionType;

  state: SpatialNodeState;

  metadata: Record<string, unknown>;
}

export interface SpatialEdge {
  id: string;
  graphEdgeId: string;
  source: string;
  target: string;
  relationshipType: GraphRelationshipType;
  weight: number;
}

// ---------------------------------------------------------------------------
// Regions
// ---------------------------------------------------------------------------

export interface SpatialRegion {
  id: SpatialRegionType;
  label: string;
  center: SpatialVector;
  nodeIds: string[];
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface SpatialContext {
  entryPoint: GraphEntryPoint;
  focusNodeId: string | null;
  immediateNodeIds: string[];
  supportingNodeIds: string[];
  peripheralNodeIds: string[];
}

// ---------------------------------------------------------------------------
// Projection
// ---------------------------------------------------------------------------

export interface SpatialProjection {
  nodes: SpatialNode[];
  edges: SpatialEdge[];
  regions: SpatialRegion[];
  context: SpatialContext;
}

// ---------------------------------------------------------------------------
// View mode (shared with UI layer)
// ---------------------------------------------------------------------------

export type MemoryViewMode = "graph" | "space";

// ---------------------------------------------------------------------------
// Camera intent (renderer-independent hint)
// ---------------------------------------------------------------------------

export type CameraMode =
  | "overview"
  | "focus"
  | "entry_point"
  | "search_focus"
  | "trail_restore";

export interface CameraIntent {
  mode: CameraMode;
  target: SpatialVector;
  distance: number;
}