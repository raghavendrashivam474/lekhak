// src/services/spatial/semantics/intelligence.ts
// Maps graph node state (already carries Sprint 8 intelligence hints)
// into spatial node state. Renderer never touches intelligence.

import type { GraphNode } from "@/types/graph";
import type { SpatialNodeState } from "@/types/spatial";

export function graphStateToSpatialState(
  node: GraphNode,
  selectedNodeId: string | null,
  focusRelevantEntityIds: Set<string>
): SpatialNodeState {
  return {
    selected: selectedNodeId === node.id,
    focusRelevant: focusRelevantEntityIds.has(node.entityId),
    suggestedStart: node.state.suggestedStart ?? false,
    unresolved: node.state.unresolved ?? false,
    orphan: node.state.orphan ?? false,
    dormant: node.state.dormant ?? false,
    active: node.state.active ?? false,
  };
}