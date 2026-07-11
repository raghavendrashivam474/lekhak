// src/services/graph/projection/questions.ts

import type { GraphNode, GraphEdge, GraphNodeState } from "@/types/graph";
import type { QuestionWithNote } from "@/types/relationship";
import { graphNodeId, graphEdgeId } from "./id";

export function questionsToGraph(
  projectId: string,
  questions: QuestionWithNote[]
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const projectNodeId = graphNodeId("project", projectId);

  for (const q of questions) {
    if (q.status === "archived") continue;

    const qNodeId = graphNodeId("question", q.id);
    const state: GraphNodeState = {};
    if (q.status === "open" || q.status === "in_progress") {
      state.unresolved = true;
    }

    nodes.push({
      id: qNodeId,
      entityId: q.id,
      entityType: "question",
      label: q.question,
      weight: 3,
      state,
      metadata: {
        status: q.status,
        parentId: projectId,
      },
    });

    // Question hangs off the project
    edges.push({
      id: graphEdgeId(projectNodeId, qNodeId, "contains"),
      source: projectNodeId,
      target: qNodeId,
      relationshipType: "contains",
      weight: 1,
    });

    // Answering note → question
    if (q.answered_by_note_id) {
      const noteNodeId = graphNodeId("note", q.answered_by_note_id);
      edges.push({
        id: graphEdgeId(noteNodeId, qNodeId, "answers_question"),
        source: noteNodeId,
        target: qNodeId,
        relationshipType: "answers_question",
        weight: 4,
      });
    }
  }

  return { nodes, edges };
}