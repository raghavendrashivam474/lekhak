// src/services/graph/projection/tags.ts

import type { GraphNode, GraphEdge } from "@/types/graph";
import type { KnowledgeTag } from "@/types/collection";
import { graphNodeId, graphEdgeId } from "./id";

interface NoteTagLink {
  note_id: string;
  tag_id: string;
}

export function tagsToGraph(
  tags: KnowledgeTag[],
  noteTagLinks: NoteTagLink[]
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const usageCount: Record<string, number> = {};
  for (const link of noteTagLinks) {
    usageCount[link.tag_id] = (usageCount[link.tag_id] ?? 0) + 1;
  }

  for (const tag of tags) {
    nodes.push({
      id: graphNodeId("knowledge_tag", tag.id),
      entityId: tag.id,
      entityType: "knowledge_tag",
      label: tag.name,
      weight: 2,
      state: {},
      metadata: {
        usageCount: usageCount[tag.id] ?? 0,
      },
    });
  }

  for (const link of noteTagLinks) {
    const noteNodeId = graphNodeId("note", link.note_id);
    const tagNodeId = graphNodeId("knowledge_tag", link.tag_id);

    edges.push({
      id: graphEdgeId(noteNodeId, tagNodeId, "tagged_with"),
      source: noteNodeId,
      target: tagNodeId,
      relationshipType: "tagged_with",
      weight: 1,
    });
  }

  return { nodes, edges };
}