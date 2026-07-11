// src/services/graph/context/entry-points.ts

import type {
  GraphEntryPoint,
  GraphEntryPointKind,
  GraphProjection,
} from "@/types/graph";
import type { SmartResumeContext, OrphanInsight } from "@/types/intelligence";
import { graphNodeId } from "../projection/id";

interface EntryPointContext {
  projectId: string;
  projection: GraphProjection;
  resume: SmartResumeContext | null;
  orphans: OrphanInsight | null;
  focusRelevantNoteIds: Set<string>;
  recentNoteIds: string[];
  openQuestionIds: string[];
}

export function buildEntryPoints(ctx: EntryPointContext): GraphEntryPoint[] {
  const projectNode = graphNodeId("project", ctx.projectId);

  const entries: GraphEntryPoint[] = [];

  // Project memory — always present
  entries.push({
    kind: "project_memory",
    label: "Project Memory",
    initialNodeIds: [projectNode],
  });

  // Current focus
  const focusIds = Array.from(ctx.focusRelevantNoteIds).map((id) =>
    graphNodeId("note", id)
  );
  if (focusIds.length > 0) {
    entries.push({
      kind: "current_focus",
      label: "Current Focus",
      initialNodeIds: focusIds,
    });
  }

  // Suggested start
  if (ctx.resume?.most_recent_note) {
    entries.push({
      kind: "suggested_start",
      label: "Suggested Starting Point",
      initialNodeIds: [
        graphNodeId("note", ctx.resume.most_recent_note.id),
      ],
    });
  }

  // Recent work
  if (ctx.recentNoteIds.length > 0) {
    entries.push({
      kind: "recent_work",
      label: "Recent Work",
      initialNodeIds: ctx.recentNoteIds.map((id) => graphNodeId("note", id)),
    });
  }

  // Open questions
  if (ctx.openQuestionIds.length > 0) {
    entries.push({
      kind: "open_questions",
      label: "Open Questions",
      initialNodeIds: ctx.openQuestionIds.map((id) =>
        graphNodeId("question", id)
      ),
    });
  }

  // Orphan knowledge
  if (ctx.orphans && ctx.orphans.orphan_count > 0) {
    entries.push({
      kind: "orphan_knowledge",
      label: "Orphan Knowledge",
      initialNodeIds: ctx.orphans.orphan_note_ids.map((id) =>
        graphNodeId("note", id)
      ),
    });
  }

  return entries;
}

export function resolveInitialVisible(
  entry: GraphEntryPoint,
  adjacency: Map<string, Set<string>>
): Set<string> {
  const visible = new Set<string>();

  for (const id of entry.initialNodeIds) {
    visible.add(id);
    for (const n of adjacency.get(id) ?? []) {
      visible.add(n);
    }
  }

  return visible;
}