// src/services/reasoning/spatial-adapter.ts
//
// Reasoning → Spatial decoration.
// Does NOT modify the spatial projection engine.
// Maps reasoning signals onto SpatialNodeState after projection.

import type { SpatialProjection, SpatialNode } from "@/types/spatial";
import type { FullReasoningSnapshot } from "./index";

export function applyReasoningToSpatial(
  projection: SpatialProjection,
  snap: FullReasoningSnapshot
): SpatialProjection {
  const criticalPathIds = new Set(snap.dependencies.criticalPath);
  const blockerEntityIds = new Set(
    snap.dependencies.blockers.map((b) => b.blockerId)
  );

  const noteHealthyThread = new Set<string>();
  const noteStalledThread = new Set<string>();

  for (const tp of snap.progress.threadProgress) {
    const thread = snap.threads.find((t) => t.id === tp.threadId);
    if (!thread) continue;
    for (const nid of thread.memberNoteIds) {
      if (tp.completionPercentage >= 70) noteHealthyThread.add(nid);
      else if (tp.completionPercentage > 0 && tp.completionPercentage < 40)
        noteStalledThread.add(nid);
    }
  }

  const nodes: SpatialNode[] = projection.nodes.map((node) => {
    const gid = `${node.entityType}::${node.entityId}`;
    const isBlocker =
      blockerEntityIds.has(gid) ||
      blockerEntityIds.has(node.entityId) ||
      criticalPathIds.has(gid);

    const isHealthy = noteHealthyThread.has(node.entityId);
    const isStalled = noteStalledThread.has(node.entityId);

    return {
      ...node,
      state: {
        ...node.state,
        unresolved: node.state.unresolved || isBlocker,
        active: node.state.active || isHealthy,
        orphan: node.state.orphan || isStalled,
      },
    };
  });

  return { ...projection, nodes, edges: projection.edges, regions: projection.regions, context: projection.context };
}
