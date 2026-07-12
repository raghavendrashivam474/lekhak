// src/services/spatial/context/resolve-context.ts
// Classifies visible nodes into immediate / supporting / peripheral
// context sets around a focus node.

import type { GraphAdjacency } from "@/types/graph";

export interface ResolvedContext {
  immediateIds: Set<string>;
  supportingIds: Set<string>;
  peripheralIds: Set<string>;
}

/**
 * Classification rules:
 *   focus + 1-hop neighbours → immediate
 *   2-hop neighbours         → supporting
 *   everything else visible  → peripheral
 */
export function resolveContext(
  focusNodeId: string | null,
  visibleNodeIds: Set<string>,
  adjacency: GraphAdjacency
): ResolvedContext {
  const immediate = new Set<string>();
  const supporting = new Set<string>();
  const peripheral = new Set<string>();

  if (!focusNodeId) {
    // No focus — everything visible is peripheral orientation context
    for (const id of visibleNodeIds) peripheral.add(id);
    return {
      immediateIds: immediate,
      supportingIds: supporting,
      peripheralIds: peripheral,
    };
  }

  immediate.add(focusNodeId);

  const firstHop = adjacency.get(focusNodeId) ?? new Set();
  for (const id of firstHop) {
    if (visibleNodeIds.has(id)) immediate.add(id);
  }

  for (const firstNeighbour of firstHop) {
    const secondHop = adjacency.get(firstNeighbour) ?? new Set();
    for (const id of secondHop) {
      if (
        visibleNodeIds.has(id) &&
        !immediate.has(id) &&
        id !== focusNodeId
      ) {
        supporting.add(id);
      }
    }
  }

  for (const id of visibleNodeIds) {
    if (!immediate.has(id) && !supporting.has(id)) {
      peripheral.add(id);
    }
  }

  return {
    immediateIds: immediate,
    supportingIds: supporting,
    peripheralIds: peripheral,
  };
}