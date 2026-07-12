// src/services/spatial/index.ts
// Spatial orchestrator.
// Input : GraphProjection + adjacency + entry point + focus + intelligence hints
// Output: SpatialProjection
//
// NO Three.js. NO React. Pure domain transformation.

import type {
  GraphProjection,
  GraphAdjacency,
  GraphEntryPoint,
} from "@/types/graph";
import type { SpatialProjection, SpatialContext } from "@/types/spatial";

import { resolveContext } from "./context/resolve-context";
import {
  resolveAnchorNodeId,
  initialVisibleFromEntry,
} from "./context/entry-points";
import { graphNodesToSpatial } from "./projection/nodes";
import { graphEdgesToSpatial } from "./projection/edges";
import { buildRegions } from "./projection/regions";

export interface BuildSpatialInput {
  graph: GraphProjection;
  adjacency: GraphAdjacency;
  entryPoint: GraphEntryPoint;
  focusNodeId: string | null;
  selectedNodeId: string | null;
  focusRelevantEntityIds: Set<string>;
  suggestedStartEntityId: string | null;
  visibleNodeIds?: Set<string>;
}

const HIGHLY_CONNECTED_THRESHOLD = 3;

export function buildSpatialProjection(
  input: BuildSpatialInput
): SpatialProjection {
  const {
    graph,
    adjacency,
    entryPoint,
    focusNodeId,
    selectedNodeId,
    focusRelevantEntityIds,
    suggestedStartEntityId,
  } = input;

  // Anchor and initial visibility
  const anchorId = focusNodeId ?? resolveAnchorNodeId(entryPoint);
  const visible =
    input.visibleNodeIds ?? initialVisibleFromEntry(entryPoint, adjacency);

  // If we have a focus and it isn't in visible, add it and neighbours
  if (anchorId && !visible.has(anchorId)) {
    visible.add(anchorId);
    for (const n of adjacency.get(anchorId) ?? []) visible.add(n);
  }

  // Classify context
  const resolved = resolveContext(anchorId, visible, adjacency);

  // Identify notes that answer questions (region hint)
  const answeringNoteIds = new Set<string>();
  for (const e of graph.edges) {
    if (e.relationshipType === "answers_question" && visible.has(e.source)) {
      answeringNoteIds.add(e.source);
    }
  }

  // Nodes
  const spatialNodes = graphNodesToSpatial(graph.nodes, visible, {
    focusNodeId: anchorId,
    selectedNodeId,
    immediateIds: resolved.immediateIds,
    supportingIds: resolved.supportingIds,
    focusRelevantEntityIds,
    suggestedStartEntityId,
    answeringNoteIds,
    adjacency,
    edges: graph.edges,
    highlyConnectedThreshold: HIGHLY_CONNECTED_THRESHOLD,
  });

  // Edges
  const spatialEdges = graphEdgesToSpatial(graph.edges, visible);

  // Regions
  const regions = buildRegions(spatialNodes);

  // Context payload
  const context: SpatialContext = {
    entryPoint,
    focusNodeId: anchorId,
    immediateNodeIds: Array.from(resolved.immediateIds),
    supportingNodeIds: Array.from(resolved.supportingIds),
    peripheralNodeIds: Array.from(resolved.peripheralIds),
  };

  return {
    nodes: spatialNodes,
    edges: spatialEdges,
    regions,
    context,
  };
}

// Re-exports for consumers
export { resolveContext } from "./context/resolve-context";
export { recomposeVisible } from "./context/recompose";
export { resolveAnchorNodeId, initialVisibleFromEntry } from "./context/entry-points";