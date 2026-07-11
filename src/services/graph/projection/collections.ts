// src/services/graph/projection/collections.ts

import type { GraphNode, GraphEdge } from "@/types/graph";
import type { CollectionWithNotes } from "@/types/collection";
import { graphNodeId, graphEdgeId } from "./id";

export function collectionsToGraph(
  projectId: string,
  collections: CollectionWithNotes[]
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const projectNodeId = graphNodeId("project", projectId);

  for (const col of collections) {
    const colNodeId = graphNodeId("collection", col.id);

    nodes.push({
      id: colNodeId,
      entityId: col.id,
      entityType: "collection",
      label: col.name,
      weight: 6,
      state: {},
      metadata: {
        description: col.description,
        noteCount: col.notes.length,
        parentId: projectId,
      },
    });

    edges.push({
      id: graphEdgeId(projectNodeId, colNodeId, "contains"),
      source: projectNodeId,
      target: colNodeId,
      relationshipType: "contains",
      weight: 3,
    });

    // Note-belongs-to-collection edges
    for (const n of col.notes) {
      edges.push({
        id: graphEdgeId(colNodeId, graphNodeId("note", n.id), "belongs_to"),
        source: graphNodeId("note", n.id),
        target: colNodeId,
        relationshipType: "belongs_to",
        weight: 2,
      });
    }
  }

  return { nodes, edges };
}