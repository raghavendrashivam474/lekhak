// src/services/graph/projection/project.ts

import type { GraphNode } from "@/types/graph";
import type { Project } from "@/types/project";
import { graphNodeId } from "./id";

export function projectToGraphNode(project: Project): GraphNode {
  return {
    id: graphNodeId("project", project.id),
    entityId: project.id,
    entityType: "project",
    label: project.title,
    weight: 10,
    state: {},
    metadata: {
      description: project.description,
      status: project.status,
      lastUpdated: project.updated_at,
    },
  };
}