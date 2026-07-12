// src/services/spatial/semantics/regions.ts
// Region resolution with documented precedence.
//
// Precedence (highest wins):
//   1. current_work           — focus-relevant, suggested start, active recent
//   2. open_threads           — unresolved questions, notes answering them
//   3. established_knowledge  — collections and highly-connected notes
//   4. peripheral_memory      — orphans, dormant, everything else

import type { GraphNode, GraphAdjacency } from "@/types/graph";
import type { SpatialRegionType, SpatialNodeState } from "@/types/spatial";

export interface RegionContext {
  focusRelevantEntityIds: Set<string>;
  suggestedStartEntityId: string | null;
  answeringNoteIds: Set<string>;
  adjacency: GraphAdjacency;
  highlyConnectedThreshold: number;
}

export function resolveRegion(
  node: GraphNode,
  state: SpatialNodeState,
  ctx: RegionContext
): SpatialRegionType {
  // Projects always sit within established_knowledge (structural anchors).
  if (node.entityType === "project") {
    return "established_knowledge";
  }

  // 1. Current Work — highest precedence
  const isFocusRelevant = ctx.focusRelevantEntityIds.has(node.entityId);
  const isSuggestedStart =
    ctx.suggestedStartEntityId !== null &&
    node.entityId === ctx.suggestedStartEntityId;

  if (isFocusRelevant || isSuggestedStart || state.active) {
    return "current_work";
  }

  // 2. Open Threads
  if (node.entityType === "question" && state.unresolved) {
    return "open_threads";
  }
  if (ctx.answeringNoteIds.has(node.id)) {
    return "open_threads";
  }

  // 3. Established Knowledge
  if (node.entityType === "collection") {
    return "established_knowledge";
  }
  const connectionCount = ctx.adjacency.get(node.id)?.size ?? 0;
  if (
    node.entityType === "note" &&
    !state.orphan &&
    connectionCount >= ctx.highlyConnectedThreshold
  ) {
    return "established_knowledge";
  }

  // 4. Peripheral Memory — fallback
  return "peripheral_memory";
}