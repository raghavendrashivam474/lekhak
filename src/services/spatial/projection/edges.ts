// src/services/spatial/projection/edges.ts

import type { GraphEdge } from "@/types/graph";
import type { SpatialEdge } from "@/types/spatial";

export function graphEdgesToSpatial(
  edges: GraphEdge[],
  visibleNodeIds: Set<string>
): SpatialEdge[] {
  return edges
    .filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    )
    .map((e) => ({
      id: "spatial::" + e.id,
      graphEdgeId: e.id,
      source: e.source,
      target: e.target,
      relationshipType: e.relationshipType,
      weight: e.weight,
    }));
}