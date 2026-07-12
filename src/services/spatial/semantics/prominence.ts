// src/services/spatial/semantics/prominence.ts
// Prominence = attention priority.

import type { GraphNode } from "@/types/graph";
import type { SpatialProminence, SpatialNodeState } from "@/types/spatial";

export interface ProminenceContext {
  selectedNodeId: string | null;
  suggestedStartEntityId: string | null;
  focusRelevantEntityIds: Set<string>;
}

export function resolveProminence(
  node: GraphNode,
  state: SpatialNodeState,
  ctx: ProminenceContext
): SpatialProminence {
  if (ctx.selectedNodeId === node.id) return "primary";

  if (
    ctx.suggestedStartEntityId &&
    node.entityId === ctx.suggestedStartEntityId
  ) {
    return "high";
  }

  if (ctx.focusRelevantEntityIds.has(node.entityId)) {
    return "high";
  }

  if (state.dormant || state.orphan) return "low";

  return "normal";
}