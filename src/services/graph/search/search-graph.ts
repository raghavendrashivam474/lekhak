// src/services/graph/search/search-graph.ts

import type { GraphNode, GraphProjection } from "@/types/graph";

export function searchGraphNodes(
  projection: GraphProjection,
  query: string
): GraphNode[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  return projection.nodes.filter((node) =>
    node.label.toLowerCase().includes(q)
  );
}