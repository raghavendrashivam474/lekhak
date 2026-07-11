// src/services/graph/projection/id.ts
// Deterministic graph node id — allows stable lookups across projections.

import type { GraphNodeType } from "@/types/graph";

export function graphNodeId(type: GraphNodeType, entityId: string): string {
  return type + ":" + entityId;
}

export function graphEdgeId(
  sourceId: string,
  targetId: string,
  relationshipType: string
): string {
  return relationshipType + "::" + sourceId + "->" + targetId;
}