// src/services/reasoning/graph-adapter.ts
//
// Reasoning → Graph decoration.
// Does NOT modify the graph projection engine.
// Decorates GraphNode.state with reasoning signals after projection.

import type { GraphNode, GraphProjection } from "@/types/graph";
import type { FullReasoningSnapshot } from "./index";

export type ReasoningNodeDecoration = {
  /** Node is part of the critical dependency path */
  onCriticalPath: boolean;
  /** Node is a blocker */
  isBlocker: boolean;
  /** Node belongs to a stalled thread */
  inStalledThread: boolean;
  /** Node belongs to a healthy (high completion) thread */
  inHealthyThread: boolean;
  /** Node is an attention area */
  needsAttention: boolean;
};

export type DecoratedGraphProjection = {
  projection: GraphProjection;
  decorations: Map<string, ReasoningNodeDecoration>;
};

function defaultDecoration(): ReasoningNodeDecoration {
  return {
    onCriticalPath: false,
    isBlocker: false,
    inStalledThread: false,
    inHealthyThread: false,
    needsAttention: false,
  };
}

export function decorateGraph(
  projection: GraphProjection,
  snap: FullReasoningSnapshot
): DecoratedGraphProjection {
  const decorations = new Map<string, ReasoningNodeDecoration>();

  // Build lookup sets from reasoning
  const criticalPathIds = new Set(snap.dependencies.criticalPath);
  const blockerEntityIds = new Set(
    snap.dependencies.blockers.map((b) => b.blockerId)
  );

  // Thread completion lookup: threadId → pct
  const threadPct = new Map<string, number>();
  for (const tp of snap.progress.threadProgress) {
    threadPct.set(tp.threadId, tp.completionPercentage);
  }

  // Note → thread membership
  const noteStalledThread = new Set<string>();
  const noteHealthyThread = new Set<string>();
  for (const thread of snap.threads) {
    const pct = threadPct.get(thread.id) ?? 0;
    for (const nid of thread.memberNoteIds) {
      if (pct >= 70) noteHealthyThread.add(nid);
      else if (pct > 0 && pct < 40) noteStalledThread.add(nid);
    }
  }

  // Attention note ids from blocker entity ids (questions)
  const attentionEntityIds = new Set<string>(
    snap.dependencies.blockers.flatMap((b) => [
      b.blockerId,
      ...b.blockedIds,
    ])
  );

  for (const node of projection.nodes) {
    const dec = defaultDecoration();

    const gid = `${node.entityType}::${node.entityId}`;
    dec.onCriticalPath = criticalPathIds.has(gid) || criticalPathIds.has(node.id);
    dec.isBlocker = blockerEntityIds.has(gid) || blockerEntityIds.has(node.entityId);
    dec.needsAttention = attentionEntityIds.has(node.entityId) || attentionEntityIds.has(gid);

    if (node.entityType === "note") {
      dec.inStalledThread = noteStalledThread.has(node.entityId);
      dec.inHealthyThread = noteHealthyThread.has(node.entityId);
    }

    if (node.entityType === "question") {
      dec.isBlocker = dec.isBlocker || blockerEntityIds.has(`question::${node.entityId}`);
    }

    decorations.set(node.id, dec);
  }

  return { projection, decorations };
}

/**
 * Apply reasoning decorations back into GraphNode.state so the existing
 * renderer picks them up without modification.
 * Only sets flags — never removes existing ones.
 */
export function applyReasoningToGraph(
  projection: GraphProjection,
  snap: FullReasoningSnapshot
): GraphProjection {
  const { decorations } = decorateGraph(projection, snap);

  const nodes: GraphNode[] = projection.nodes.map((node) => {
    const dec = decorations.get(node.id);
    if (!dec) return node;

    return {
      ...node,
      state: {
        ...node.state,
        // Map reasoning signals onto existing GraphNodeState fields
        unresolved: node.state.unresolved || dec.isBlocker || dec.onCriticalPath,
        active: node.state.active || dec.inHealthyThread,
        orphan: node.state.orphan || dec.inStalledThread,
      },
    };
  });

  return { ...projection, nodes };
}
