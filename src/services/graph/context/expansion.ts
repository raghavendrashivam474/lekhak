// src/services/graph/context/expansion.ts

import type { GraphAdjacency } from "@/types/graph";
import { getNeighboursOfMany } from "./neighbours";

export function expandVisibleContext(
  currentVisible: Set<string>,
  selectedNodeId: string,
  adjacency: GraphAdjacency
): Set<string> {
  const next = new Set(currentVisible);
  next.add(selectedNodeId);
  for (const n of getNeighboursOfMany(adjacency, [selectedNodeId])) {
    next.add(n);
  }
  return next;
}