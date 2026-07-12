// src/services/spatial/semantics/distance.ts
// Semantic distance = contextual relevance.
// Higher score = MORE relevant = CLOSER position.

import type { GraphNode, GraphEdge, GraphAdjacency } from "@/types/graph";

export interface RelevanceContext {
  focusNodeId: string | null;
  focusRelevantEntityIds: Set<string>;
  suggestedStartEntityId: string | null;
  edges: GraphEdge[];
  adjacency: GraphAdjacency;
}

/**
 * Deterministic relevance score for a node relative to current focus.
 *
 * Scoring rules (documented):
 *   Direct relationship to focus     +4
 *   Supports current focus/intent    +4
 *   Answers an open question         +3
 *   Suggested start                  +3
 *   Shared 2-hop neighbour           +2
 *   Everything else                  0
 *
 * The same inputs always produce the same score.
 */
export function scoreRelevance(
  node: GraphNode,
  ctx: RelevanceContext
): number {
  let score = 0;

  // Suggested start is always somewhat relevant
  if (
    ctx.suggestedStartEntityId &&
    node.entityId === ctx.suggestedStartEntityId
  ) {
    score += 3;
  }

  // Focus-relevant (intent-linked)
  if (ctx.focusRelevantEntityIds.has(node.entityId)) {
    score += 4;
  }

  // Directly connected to focus node
  if (ctx.focusNodeId) {
    const focusNeighbours = ctx.adjacency.get(ctx.focusNodeId);
    if (focusNeighbours?.has(node.id)) {
      score += 4;
    } else {
      // 2-hop via any focus neighbour
      if (focusNeighbours) {
        for (const neighbourId of focusNeighbours) {
          const secondHop = ctx.adjacency.get(neighbourId);
          if (secondHop?.has(node.id)) {
            score += 2;
            break;
          }
        }
      }
    }
  }

  // Answers a question — relevant when any question is in current context
  const hasAnswersEdge = ctx.edges.some(
    (e) =>
      e.source === node.id &&
      e.relationshipType === "answers_question"
  );
  if (hasAnswersEdge) {
    score += 3;
  }

  return score;
}