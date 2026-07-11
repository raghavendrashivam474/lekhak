// src/services/graph/projection/intelligence.ts
// Maps Sprint 8 intelligence into graph state hints.
// Intelligence never runs inside components — this is the boundary.

import type { GraphNode } from "@/types/graph";
import type {
  OrphanInsight,
  SmartResumeContext,
  ProjectStatusInsight,
} from "@/types/intelligence";
import { graphNodeId } from "./id";

interface IntelligenceContext {
  orphans: OrphanInsight | null;
  resume: SmartResumeContext | null;
  status: ProjectStatusInsight | null;
}

export function applyIntelligenceToNodes(
  nodes: GraphNode[],
  ctx: IntelligenceContext
): GraphNode[] {
  const orphanIds = new Set(ctx.orphans?.orphan_note_ids ?? []);
  const suggestedNoteId = ctx.resume?.most_recent_note?.id ?? null;
  const projectDormant = ctx.status?.status === "dormant";
  const projectActive =
    ctx.status?.status === "highly_active" ||
    ctx.status?.status === "healthy";

  return nodes.map((node) => {
    const nextState = { ...node.state };

    if (node.entityType === "note") {
      if (orphanIds.has(node.entityId)) nextState.orphan = true;
      if (suggestedNoteId === node.entityId) nextState.suggestedStart = true;
    }

    if (node.entityType === "project") {
      if (projectDormant) nextState.dormant = true;
      if (projectActive) nextState.active = true;
    }

    return { ...node, state: nextState };
  });
}

export function extractSuggestedStartNoteId(
  resume: SmartResumeContext | null
): string | null {
  return resume?.most_recent_note?.id ?? null;
}

export function extractOrphanNoteIds(
  orphans: OrphanInsight | null
): Set<string> {
  return new Set(orphans?.orphan_note_ids ?? []);
}

export function extractFocusRelevantNoteIds(
  intentLinks: Array<{ note_id: string; context: string }>
): Set<string> {
  const ids = new Set<string>();
  for (const link of intentLinks) {
    if (link.context === "focus" || link.context === "next_step") {
      ids.add(link.note_id);
    }
  }
  return ids;
}