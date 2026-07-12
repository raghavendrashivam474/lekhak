// src/services/spatial/context/recompose.ts
// When focus changes, expand visible set to include new focus + neighbours.
// Existing visible nodes are preserved (focus without losing orientation).

import type { GraphAdjacency } from "@/types/graph";

export function recomposeVisible(
  currentVisible: Set<string>,
  newFocusNodeId: string,
  adjacency: GraphAdjacency
): Set<string> {
  const next = new Set(currentVisible);
  next.add(newFocusNodeId);
  for (const n of adjacency.get(newFocusNodeId) ?? []) {
    next.add(n);
  }
  return next;
}