// src/services/graph/context/neighbours.ts

import type { GraphAdjacency, GraphEdge, GraphProjection } from "@/types/graph";

export function buildAdjacency(edges: GraphEdge[]): GraphAdjacency {
  const map: GraphAdjacency = new Map();

  for (const e of edges) {
    if (!map.has(e.source)) map.set(e.source, new Set());
    if (!map.has(e.target)) map.set(e.target, new Set());
    map.get(e.source)!.add(e.target);
    map.get(e.target)!.add(e.source);
  }

  return map;
}

export function getNeighbours(
  adjacency: GraphAdjacency,
  nodeId: string
): string[] {
  return Array.from(adjacency.get(nodeId) ?? []);
}

export function getNeighboursOfMany(
  adjacency: GraphAdjacency,
  nodeIds: string[]
): string[] {
  const result = new Set<string>();
  for (const id of nodeIds) {
    for (const neighbour of adjacency.get(id) ?? []) {
      result.add(neighbour);
    }
  }
  return Array.from(result);
}