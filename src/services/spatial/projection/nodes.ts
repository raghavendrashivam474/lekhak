// src/services/spatial/projection/nodes.ts

import type { GraphNode, GraphAdjacency, GraphEdge } from "@/types/graph";
import type { SpatialNode } from "@/types/spatial";
import { graphStateToSpatialState } from "../semantics/intelligence";
import { resolveDepth } from "../semantics/depth";
import { resolveProminence } from "../semantics/prominence";
import { resolveRegion } from "../semantics/regions";
import { scoreRelevance } from "../semantics/distance";
import { calculatePosition } from "./position";

export interface NodeProjectionContext {
  focusNodeId: string | null;
  selectedNodeId: string | null;
  immediateIds: Set<string>;
  supportingIds: Set<string>;
  focusRelevantEntityIds: Set<string>;
  suggestedStartEntityId: string | null;
  answeringNoteIds: Set<string>;
  adjacency: GraphAdjacency;
  edges: GraphEdge[];
  highlyConnectedThreshold: number;
}

export function graphNodesToSpatial(
  nodes: GraphNode[],
  visibleNodeIds: Set<string>,
  ctx: NodeProjectionContext
): SpatialNode[] {
  return nodes
    .filter((n) => visibleNodeIds.has(n.id))
    .map((n) => {
      const spatialState = graphStateToSpatialState(
        n,
        ctx.selectedNodeId,
        ctx.focusRelevantEntityIds
      );

      const depth = resolveDepth(n.id, {
        focusNodeId: ctx.focusNodeId,
        immediateIds: ctx.immediateIds,
        supportingIds: ctx.supportingIds,
      });

      const region = resolveRegion(n, spatialState, {
        focusRelevantEntityIds: ctx.focusRelevantEntityIds,
        suggestedStartEntityId: ctx.suggestedStartEntityId,
        answeringNoteIds: ctx.answeringNoteIds,
        adjacency: ctx.adjacency,
        highlyConnectedThreshold: ctx.highlyConnectedThreshold,
      });

      const prominence = resolveProminence(n, spatialState, {
        selectedNodeId: ctx.selectedNodeId,
        suggestedStartEntityId: ctx.suggestedStartEntityId,
        focusRelevantEntityIds: ctx.focusRelevantEntityIds,
      });

      const relevance = scoreRelevance(n, {
        focusNodeId: ctx.focusNodeId,
        focusRelevantEntityIds: ctx.focusRelevantEntityIds,
        suggestedStartEntityId: ctx.suggestedStartEntityId,
        edges: ctx.edges,
        adjacency: ctx.adjacency,
      });

      const position = calculatePosition(n.id, region, depth, relevance);

      return {
        id: "spatial::" + n.id,
        graphNodeId: n.id,
        entityId: n.entityId,
        entityType: n.entityType,
        label: n.label,
        position,
        depth,
        prominence,
        region,
        state: spatialState,
        metadata: n.metadata,
      };
    });
}