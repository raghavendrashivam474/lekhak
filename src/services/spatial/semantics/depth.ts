// src/services/spatial/semantics/depth.ts
// Depth = contextual priority.
// Selected node always immediate; direct neighbours immediate/supporting;
// weakly related nodes peripheral.

import type { SpatialDepth } from "@/types/spatial";

export interface DepthContext {
  focusNodeId: string | null;
  immediateIds: Set<string>;
  supportingIds: Set<string>;
}

export function resolveDepth(
  nodeId: string,
  ctx: DepthContext
): SpatialDepth {
  if (nodeId === ctx.focusNodeId) return "immediate";
  if (ctx.immediateIds.has(nodeId)) return "immediate";
  if (ctx.supportingIds.has(nodeId)) return "supporting";
  return "peripheral";
}