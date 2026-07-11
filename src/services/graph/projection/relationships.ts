// src/services/graph/projection/relationships.ts

import type { GraphEdge, GraphRelationshipType } from "@/types/graph";
import { graphNodeId, graphEdgeId } from "./id";

interface RawNoteRelationship {
  from_note_id: string;
  to_note_id: string;
  relationship_type: string;
}

interface RawIntentLink {
  project_id: string;
  note_id: string;
  context: string;
}

function mapNoteRelationshipType(raw: string): GraphRelationshipType {
  if (raw === "references") return "references";
  return "related_to";
}

function mapIntentContext(context: string): GraphRelationshipType {
  if (context === "goal") return "supports_goal";
  if (context === "focus") return "supports_focus";
  if (context === "next_step") return "blocks_next_step";
  return "related_to";
}

export function noteRelationshipsToEdges(
  rels: RawNoteRelationship[]
): GraphEdge[] {
  const seen = new Set<string>();
  const edges: GraphEdge[] = [];

  for (const r of rels) {
    const type = mapNoteRelationshipType(r.relationship_type);
    const sourceId = graphNodeId("note", r.from_note_id);
    const targetId = graphNodeId("note", r.to_note_id);

    // For symmetric "related_to", deduplicate reversed pairs
    if (type === "related_to") {
      const pairKey = [sourceId, targetId].sort().join("::");
      if (seen.has(pairKey)) continue;
      seen.add(pairKey);
    }

    edges.push({
      id: graphEdgeId(sourceId, targetId, type),
      source: sourceId,
      target: targetId,
      relationshipType: type,
      weight: 3,
    });
  }

  return edges;
}

export function intentLinksToEdges(links: RawIntentLink[]): GraphEdge[] {
  return links.map((l) => {
    const type = mapIntentContext(l.context);
    const noteNodeId = graphNodeId("note", l.note_id);
    const projectNodeId = graphNodeId("project", l.project_id);

    return {
      id: graphEdgeId(noteNodeId, projectNodeId, type),
      source: noteNodeId,
      target: projectNodeId,
      relationshipType: type,
      weight: 4,
    };
  });
}