// src/components/memory-graph/adapters/react-flow.ts
// Boundary between graph domain and React Flow.
// This is the only file allowed to translate domain into library shape.

import type { Node, Edge } from "@xyflow/react";
import type {
  GraphNode,
  GraphEdge,
  GraphProjection,
} from "@/types/graph";

export interface RFNodeData extends Record<string, unknown> {
  label: string;
  entityType: GraphNode["entityType"];
  entityId: string;
  state: GraphNode["state"];
  metadata: GraphNode["metadata"];
  isFocused: boolean;
  isSelected: boolean;
  isDimmed: boolean;
}

export interface RFEdgeData extends Record<string, unknown> {
  relationshipType: GraphEdge["relationshipType"];
}

interface AdapterContext {
  selectedId: string | null;
  focusedIds: Set<string>;
  visibleIds: Set<string>;
}

// Simple radial layout — deterministic based on node type
function layoutPosition(
  node: GraphNode,
  index: number,
  total: number
): { x: number; y: number } {
  if (node.entityType === "project") {
    return { x: 0, y: 0 };
  }

  const layerRadius: Record<GraphNode["entityType"], number> = {
    project: 0,
    collection: 220,
    note: 420,
    question: 580,
    knowledge_tag: 700,
  };

  const radius = layerRadius[node.entityType];
  const angle = (index / Math.max(total, 1)) * Math.PI * 2;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

export function toReactFlow(
  projection: GraphProjection,
  ctx: AdapterContext
): { nodes: Node<RFNodeData>[]; edges: Edge<RFEdgeData>[] } {
  const nodesByType: Record<string, GraphNode[]> = {};
  for (const n of projection.nodes) {
    if (!nodesByType[n.entityType]) nodesByType[n.entityType] = [];
    nodesByType[n.entityType].push(n);
  }

  const positionMap = new Map<string, { x: number; y: number }>();
  for (const [type, list] of Object.entries(nodesByType)) {
    list.forEach((n, i) => {
      positionMap.set(n.id, layoutPosition(n, i, list.length));
    });
  }

  const rfNodes: Node<RFNodeData>[] = projection.nodes
    .filter((n) => ctx.visibleIds.has(n.id))
    .map((n) => ({
      id: n.id,
      type: "memoryNode",
      position: positionMap.get(n.id) ?? { x: 0, y: 0 },
      data: {
        label: n.label,
        entityType: n.entityType,
        entityId: n.entityId,
        state: n.state,
        metadata: n.metadata,
        isFocused: ctx.focusedIds.has(n.id),
        isSelected: ctx.selectedId === n.id,
        isDimmed:
          ctx.selectedId !== null &&
          !ctx.focusedIds.has(n.id) &&
          ctx.selectedId !== n.id,
      },
    }));

  const rfEdges: Edge<RFEdgeData>[] = projection.edges
    .filter(
      (e) => ctx.visibleIds.has(e.source) && ctx.visibleIds.has(e.target)
    )
    .map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      data: { relationshipType: e.relationshipType },
      animated: false,
      style: {
        stroke:
          ctx.selectedId &&
          (e.source === ctx.selectedId || e.target === ctx.selectedId)
            ? "#C9A84C"
            : "#2A3A52",
        strokeWidth:
          ctx.selectedId &&
          (e.source === ctx.selectedId || e.target === ctx.selectedId)
            ? 1.5
            : 0.75,
      },
    }));

  return { nodes: rfNodes, edges: rfEdges };
}