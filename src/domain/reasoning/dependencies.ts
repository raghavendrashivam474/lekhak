// src/domain/reasoning/dependencies.ts
//
// Deterministic creative dependency graph and blocker detection.
// Pure function. No IO.

import type {
  CreativeThread,
  ThreadResolverInput,
  DependencyGraph,
  DependencyNode,
  DependencyEdge,
  Blocker,
  DependencyAnalysis,
} from "./types";

// ---------------------------------------------------------------------------
// Build dependency graph
// ---------------------------------------------------------------------------

export function buildDependencyGraph(
  threads: CreativeThread[],
  input: ThreadResolverInput,
  intent: { goal: string | null; currentFocus: string | null; nextStep: string | null }
): DependencyGraph {
  const nodes: DependencyNode[] = [];
  const edges: DependencyEdge[] = [];
  const seenIds = new Set<string>();

  function addNode(node: DependencyNode): void {
    if (seenIds.has(node.id)) return;
    seenIds.add(node.id);
    nodes.push(node);
  }

  // Intent nodes
  if (intent.goal) {
    addNode({ id: "intent::goal", type: "goal", label: intent.goal, resolved: false });
  }
  if (intent.currentFocus) {
    addNode({ id: "intent::focus", type: "focus", label: intent.currentFocus, resolved: false });
  }
  if (intent.nextStep) {
    addNode({ id: "intent::next_step", type: "next_step", label: intent.nextStep, resolved: false });
  }

  // Question nodes
  for (const q of input.questions) {
    const resolved = q.status === "answered" || q.status === "archived";
    addNode({
      id: `question::${q.id}`,
      type: "question",
      label: q.question,
      resolved,
    });
  }

  // Thread nodes
  for (const t of threads) {
    addNode({
      id: `thread::${t.id}`,
      type: "thread",
      label: t.title,
      resolved: false,
    });
  }

  // Edges: questions answered by notes that support intent
  for (const link of input.intentLinks) {
    const intentId =
      link.context === "goal" ? "intent::goal"
      : link.context === "focus" ? "intent::focus"
      : "intent::next_step";

    if (!seenIds.has(intentId)) continue;

    // Find questions answered by this note
    const answeredQuestions = input.questions.filter(
      (q) => q.answeredByNoteId === link.noteId
    );
    for (const q of answeredQuestions) {
      edges.push({
        fromId: `question::${q.id}`,
        toId: intentId,
        relationship: "supports",
      });
    }

    // Note itself supports intent
    addNode({
      id: `note::${link.noteId}`,
      type: "note",
      label: input.notes.find((n) => n.id === link.noteId)?.title ?? "Note",
      resolved: true,
    });
    edges.push({
      fromId: `note::${link.noteId}`,
      toId: intentId,
      relationship: "supports",
    });
  }

  // Edges: threads to intent contexts
  for (const t of threads) {
    for (const intentLink of t.linkedIntentContexts) {
      const intentId =
        intentLink.context === "goal" ? "intent::goal"
        : intentLink.context === "focus" ? "intent::focus"
        : "intent::next_step";

      if (seenIds.has(intentId)) {
        edges.push({
          fromId: `thread::${t.id}`,
          toId: intentId,
          relationship: "contributes_to",
        });
      }
    }

    // Edges: unresolved questions block thread
    for (const qId of t.linkedQuestionIds) {
      const q = input.questions.find((qu) => qu.id === qId);
      if (q && q.status !== "answered" && q.status !== "archived") {
        edges.push({
          fromId: `question::${q.id}`,
          toId: `thread::${t.id}`,
          relationship: "blocks",
        });
      }
    }
  }

  // Edges: focus -> goal, next_step -> focus (natural dependency chain)
  if (seenIds.has("intent::focus") && seenIds.has("intent::goal")) {
    edges.push({
      fromId: "intent::focus",
      toId: "intent::goal",
      relationship: "contributes_to",
    });
  }
  if (seenIds.has("intent::next_step") && seenIds.has("intent::focus")) {
    edges.push({
      fromId: "intent::next_step",
      toId: "intent::focus",
      relationship: "contributes_to",
    });
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Blocker detection
// ---------------------------------------------------------------------------

export function detectBlockers(graph: DependencyGraph): Blocker[] {
  const blockers: Blocker[] = [];

  // Find all "blocks" edges where the source is unresolved
  const blockEdges = graph.edges.filter((e) => e.relationship === "blocks");
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

  // Group by blocker
  const blockerMap = new Map<string, Set<string>>();
  for (const edge of blockEdges) {
    const source = nodeMap.get(edge.fromId);
    if (!source || source.resolved) continue;

    const set = blockerMap.get(edge.fromId) ?? new Set();
    set.add(edge.toId);
    blockerMap.set(edge.fromId, set);
  }

  for (const [blockerId, blockedSet] of blockerMap) {
    const node = nodeMap.get(blockerId);
    if (!node) continue;

    const blockedLabels = [...blockedSet]
      .map((id) => nodeMap.get(id)?.label ?? id)
      .join(", ");

    blockers.push({
      blockerId,
      blockerType: node.type,
      blockerLabel: node.label,
      blockedIds: [...blockedSet],
      reason: `Unresolved ${node.type} "${node.label}" blocks: ${blockedLabels}`,
    });
  }

  return blockers.sort((a, b) => b.blockedIds.length - a.blockedIds.length);
}

// ---------------------------------------------------------------------------
// Critical path — simplified: longest chain of unresolved dependencies
// ---------------------------------------------------------------------------

function findCriticalPath(graph: DependencyGraph): string[] {
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const adj = new Map<string, string[]>();

  for (const edge of graph.edges) {
    if (edge.relationship !== "blocks" && edge.relationship !== "contributes_to") continue;
    const list = adj.get(edge.fromId) ?? [];
    list.push(edge.toId);
    adj.set(edge.fromId, list);
  }

  // DFS for longest path from any unresolved node
  let longestPath: string[] = [];

  function dfs(nodeId: string, path: string[], visited: Set<string>): void {
    if (path.length > longestPath.length) {
      longestPath = [...path];
    }
    for (const next of adj.get(nodeId) ?? []) {
      if (visited.has(next)) continue;
      visited.add(next);
      dfs(next, [...path, next], visited);
      visited.delete(next);
    }
  }

  for (const node of graph.nodes) {
    if (node.resolved) continue;
    const visited = new Set([node.id]);
    dfs(node.id, [node.id], visited);
  }

  return longestPath;
}

// ---------------------------------------------------------------------------
// Public analyzer
// ---------------------------------------------------------------------------

export function analyzeDependencies(
  threads: CreativeThread[],
  input: ThreadResolverInput,
  intent: { goal: string | null; currentFocus: string | null; nextStep: string | null }
): DependencyAnalysis {
  const graph = buildDependencyGraph(threads, input, intent);
  const blockers = detectBlockers(graph);
  const criticalPath = findCriticalPath(graph);

  return { graph, blockers, criticalPath };
}
