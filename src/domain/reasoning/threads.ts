// src/domain/reasoning/threads.ts
//
// Deterministic thread resolver. Pure function. No IO.
// Derives creative threads from existing project relationships.

import type {
  CreativeThread,
  ThreadResolverInput,
  ThreadDerivation,
  IntentThreadLink,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build adjacency from note relationships. */
function buildNoteAdjacency(
  input: ThreadResolverInput
): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  for (const rel of input.relationships) {
    if (!adj.has(rel.fromNoteId)) adj.set(rel.fromNoteId, new Set());
    if (!adj.has(rel.toNoteId)) adj.set(rel.toNoteId, new Set());
    adj.get(rel.fromNoteId)!.add(rel.toNoteId);
    adj.get(rel.toNoteId)!.add(rel.fromNoteId);
  }
  return adj;
}

/** BFS to find a connected component starting from a seed. */
function bfsCluster(seed: string, adj: Map<string, Set<string>>, visited: Set<string>): string[] {
  const cluster: string[] = [];
  const queue = [seed];
  visited.add(seed);
  while (queue.length > 0) {
    const current = queue.shift()!;
    cluster.push(current);
    for (const neighbour of adj.get(current) ?? []) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push(neighbour);
      }
    }
  }
  return cluster;
}

/** Deterministic ID from method + sorted seed IDs. */
function makeThreadId(method: string, seedIds: string[]): string {
  const sorted = [...seedIds].sort();
  return `thread::${method}::${sorted.slice(0, 3).join(":")}`;
}

/** Find questions linked to a set of note IDs. */
function findLinkedQuestions(
  noteIds: Set<string>,
  input: ThreadResolverInput
): string[] {
  return input.questions
    .filter(
      (q) =>
        q.answeredByNoteId !== null && noteIds.has(q.answeredByNoteId)
    )
    .map((q) => q.id);
}

/** Find intent links for a set of note IDs. */
function findIntentLinks(
  noteIds: Set<string>,
  input: ThreadResolverInput
): IntentThreadLink[] {
  return input.intentLinks
    .filter((l) => noteIds.has(l.noteId))
    .map((l) => ({ context: l.context, noteId: l.noteId }));
}

/** Pick a title from the most connected or first note. */
function deriveTitle(noteIds: string[], input: ThreadResolverInput): string {
  if (noteIds.length === 0) return "Untitled Thread";
  const notesById = new Map(input.notes.map((n) => [n.id, n]));
  const first = notesById.get(noteIds[0]);
  if (noteIds.length === 1) return first?.title ?? "Untitled Thread";
  // Use the category of the majority as a label hint
  const categories = noteIds
    .map((id) => notesById.get(id)?.category)
    .filter(Boolean) as string[];
  const freq = new Map<string, number>();
  for (const c of categories) freq.set(c, (freq.get(c) ?? 0) + 1);
  let topCategory = "";
  let topCount = 0;
  for (const [c, n] of freq) {
    if (n > topCount) { topCategory = c; topCount = n; }
  }
  const categoryLabel = topCategory.charAt(0).toUpperCase() + topCategory.slice(1);
  return `${categoryLabel}: ${first?.title ?? "Thread"}`;
}

function deriveSummary(noteIds: string[], input: ThreadResolverInput): string {
  return `${noteIds.length} connected notes`;
}

// ---------------------------------------------------------------------------
// Cluster-based thread resolution
// ---------------------------------------------------------------------------

function resolveRelationshipClusters(input: ThreadResolverInput): CreativeThread[] {
  const adj = buildNoteAdjacency(input);
  const visited = new Set<string>();
  const threads: CreativeThread[] = [];

  const noteIdSet = new Set(input.notes.map((n) => n.id));

  for (const note of input.notes) {
    if (visited.has(note.id)) continue;
    if (!adj.has(note.id)) continue;

    const cluster = bfsCluster(note.id, adj, visited);
    // Only form a thread if there are at least 2 connected notes
    if (cluster.length < 2) continue;
    // Filter to notes that actually exist in this project
    const validCluster = cluster.filter((id) => noteIdSet.has(id));
    if (validCluster.length < 2) continue;

    const memberSet = new Set(validCluster);
    const derivation: ThreadDerivation = {
      method: "relationship_cluster",
      seedEntityIds: validCluster.slice(0, 5),
      confidence: Math.min(0.5 + validCluster.length * 0.1, 1.0),
    };

    threads.push({
      id: makeThreadId("rel", validCluster),
      projectId: input.projectId,
      title: deriveTitle(validCluster, input),
      summary: deriveSummary(validCluster, input),
      memberNoteIds: validCluster,
      linkedQuestionIds: findLinkedQuestions(memberSet, input),
      linkedIntentContexts: findIntentLinks(memberSet, input),
      derivation,
      createdAt: new Date().toISOString(),
    });
  }

  return threads;
}

// ---------------------------------------------------------------------------
// Collection-based thread resolution
// ---------------------------------------------------------------------------

function resolveCollectionThreads(
  input: ThreadResolverInput,
  existingNoteIds: Set<string>
): CreativeThread[] {
  const threads: CreativeThread[] = [];

  for (const col of input.collections) {
    if (col.noteIds.length < 2) continue;
    // Skip notes already covered by relationship clusters
    const uncovered = col.noteIds.filter((id) => !existingNoteIds.has(id));
    if (uncovered.length < 2) continue;

    const memberSet = new Set(col.noteIds);
    const derivation: ThreadDerivation = {
      method: "collection_based",
      seedEntityIds: [col.id],
      confidence: 0.6,
    };

    threads.push({
      id: makeThreadId("col", [col.id]),
      projectId: input.projectId,
      title: col.name,
      summary: `${col.noteIds.length} notes in collection`,
      memberNoteIds: col.noteIds,
      linkedQuestionIds: findLinkedQuestions(memberSet, input),
      linkedIntentContexts: findIntentLinks(memberSet, input),
      derivation,
      createdAt: new Date().toISOString(),
    });
  }

  return threads;
}

// ---------------------------------------------------------------------------
// Intent-linked thread resolution
// ---------------------------------------------------------------------------

function resolveIntentThreads(
  input: ThreadResolverInput,
  existingNoteIds: Set<string>
): CreativeThread[] {
  const threads: CreativeThread[] = [];
  const byContext = new Map<string, string[]>();

  for (const link of input.intentLinks) {
    if (existingNoteIds.has(link.noteId)) continue;
    const list = byContext.get(link.context) ?? [];
    list.push(link.noteId);
    byContext.set(link.context, list);
  }

  for (const [context, noteIds] of byContext) {
    if (noteIds.length < 1) continue;

    const memberSet = new Set(noteIds);
    const label = context === "goal" ? "Goal Support"
      : context === "focus" ? "Focus Support"
      : "Next Step Support";

    const derivation: ThreadDerivation = {
      method: "intent_linked",
      seedEntityIds: noteIds.slice(0, 5),
      confidence: 0.7,
    };

    threads.push({
      id: makeThreadId("intent", [context, ...noteIds]),
      projectId: input.projectId,
      title: label,
      summary: `${noteIds.length} notes supporting ${context.replace("_", " ")}`,
      memberNoteIds: noteIds,
      linkedQuestionIds: findLinkedQuestions(memberSet, input),
      linkedIntentContexts: [
        ...noteIds.map((nid) => ({ context: context as "goal" | "focus" | "next_step", noteId: nid })),
      ],
      derivation,
      createdAt: new Date().toISOString(),
    });
  }

  return threads;
}

// ---------------------------------------------------------------------------
// Public resolver
// ---------------------------------------------------------------------------

export function resolveCreativeThreads(input: ThreadResolverInput): CreativeThread[] {
  // 1. Relationship clusters (highest signal)
  const relThreads = resolveRelationshipClusters(input);

  // Track which notes are already assigned
  const coveredNoteIds = new Set<string>();
  for (const t of relThreads) {
    for (const nid of t.memberNoteIds) coveredNoteIds.add(nid);
  }

  // 2. Collection-based threads for uncovered notes
  const colThreads = resolveCollectionThreads(input, coveredNoteIds);
  for (const t of colThreads) {
    for (const nid of t.memberNoteIds) coveredNoteIds.add(nid);
  }

  // 3. Intent-linked threads for remaining uncovered notes
  const intentThreads = resolveIntentThreads(input, coveredNoteIds);

  return [...relThreads, ...colThreads, ...intentThreads];
}
