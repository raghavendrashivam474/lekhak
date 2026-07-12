// src/services/spatial/context/entry-points.ts
// Resolves an anchor focus node from a graph entry point.
// Does not duplicate Sprint 9 entry point logic — reuses initialNodeIds.

import type { GraphEntryPoint } from "@/types/graph";

export function resolveAnchorNodeId(
  entry: GraphEntryPoint | null
): string | null {
  if (!entry || entry.initialNodeIds.length === 0) return null;
  return entry.initialNodeIds[0];
}

export function initialVisibleFromEntry(
  entry: GraphEntryPoint | null,
  adjacency: Map<string, Set<string>>
): Set<string> {
  const visible = new Set<string>();
  if (!entry) return visible;

  for (const id of entry.initialNodeIds) {
    visible.add(id);
    for (const n of adjacency.get(id) ?? []) {
      visible.add(n);
    }
  }
  return visible;
}