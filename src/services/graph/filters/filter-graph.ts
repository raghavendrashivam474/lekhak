// src/services/graph/filters/filter-graph.ts

import type {
  GraphNodeType,
  GraphRelationshipType,
  GraphProjection,
} from "@/types/graph";

export interface GraphFilters {
  nodeTypes: Set<GraphNodeType>;
  relationshipTypes: Set<GraphRelationshipType>;
}

export function applyFilters(
  projection: GraphProjection,
  filters: GraphFilters
): GraphProjection {
  const filteredNodes = projection.nodes.filter((n) =>
    filters.nodeTypes.has(n.entityType)
  );

  const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredEdges = projection.edges.filter(
    (e) =>
      filters.relationshipTypes.has(e.relationshipType) &&
      visibleNodeIds.has(e.source) &&
      visibleNodeIds.has(e.target)
  );

  return { nodes: filteredNodes, edges: filteredEdges };
}