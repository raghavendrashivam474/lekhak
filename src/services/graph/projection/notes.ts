// src/services/graph/projection/notes.ts

import type { GraphNode, GraphEdge, GraphNodeState } from "@/types/graph";
import type { Note } from "@/types/note";
import { graphNodeId } from "./id";

interface NoteProjectionContext {
  orphanNoteIds: Set<string>;
  focusRelevantNoteIds: Set<string>;
  suggestedStartNoteId: string | null;
}

export function notesToGraphNodes(
  notes: Note[],
  ctx: NoteProjectionContext
): GraphNode[] {
  return notes.map((n) => {
    const state: GraphNodeState = {};
    if (ctx.orphanNoteIds.has(n.id)) state.orphan = true;
    if (ctx.focusRelevantNoteIds.has(n.id)) state.focusRelevant = true;
    if (ctx.suggestedStartNoteId === n.id) state.suggestedStart = true;

    return {
      id: graphNodeId("note", n.id),
      entityId: n.id,
      entityType: "note" as const,
      label: n.title,
      weight: 4,
      state,
      metadata: {
        category: n.category,
        lastUpdated: n.updated_at,
      },
    };
  });
}