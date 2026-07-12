// src/services/graph/index.ts
// Graph orchestrator - consumes existing services, produces a projection.
// Does not query Supabase directly; reuses existing service functions.

import { createClient } from "@/lib/supabase/client";
import {
  getProjectById,
} from "@/services/projects";
import { getNotesByProject } from "@/services/notes";
import {
  getProjectCollections,
  getProjectTags,
} from "@/services/collections";
import {
  getProjectQuestions,
  getNoteIntentLinks,
} from "@/services/relationships";
import {
  calculateSmartResume,
  detectOrphans,
  calculateProjectStatus,
} from "@/services/intelligence";

import type {
  GraphProjection,
  GraphNode,
  GraphEdge,
} from "@/types/graph";

import { projectToGraphNode } from "./projection/project";
import { collectionsToGraph } from "./projection/collections";
import { notesToGraphNodes } from "./projection/notes";
import { questionsToGraph } from "./projection/questions";
import { tagsToGraph } from "./projection/tags";
import {
  noteRelationshipsToEdges,
  intentLinksToEdges,
} from "./projection/relationships";
import {
  applyIntelligenceToNodes,
  extractOrphanNoteIds,
  extractSuggestedStartNoteId,
  extractFocusRelevantNoteIds,
} from "./projection/intelligence";
import { buildAdjacency } from "./context/neighbours";
import { buildEntryPoints } from "./context/entry-points";
import type { GraphEntryPoint } from "@/types/graph";

// Explicit row shapes for the two direct Supabase queries below.
// Kept local because these are the ONLY direct queries in this module.
interface NoteRelationshipRow {
  from_note_id: string;
  to_note_id: string;
  relationship_type: string;
}

interface NoteTagRow {
  note_id: string;
  tag_id: string;
}

interface BuiltGraph {
  projection: GraphProjection;
  adjacency: Map<string, Set<string>>;
  entryPoints: GraphEntryPoint[];
}

// Load raw data the graph needs that isn't covered by existing services
async function loadGraphRawData(projectId: string): Promise<{
  noteRelationships: NoteRelationshipRow[];
  noteTagLinks: NoteTagRow[];
}> {
  const supabase = createClient();

  const { data: notes } = await supabase
    .from("notes")
    .select("id")
    .eq("project_id", projectId);

  const noteIds = (notes ?? []).map((n) => n.id as string);

  const emptyRels: NoteRelationshipRow[] = [];
  const emptyTags: NoteTagRow[] = [];

  const [noteRelsRes, noteTagsRes] = await Promise.all([
    noteIds.length > 0
      ? supabase
          .from("note_relationships")
          .select("from_note_id, to_note_id, relationship_type")
          .or(
            "from_note_id.in.(" +
              noteIds.join(",") +
              "),to_note_id.in.(" +
              noteIds.join(",") +
              ")"
          )
      : Promise.resolve({ data: emptyRels, error: null }),
    noteIds.length > 0
      ? supabase
          .from("note_tags")
          .select("note_id, tag_id")
          .in("note_id", noteIds)
      : Promise.resolve({ data: emptyTags, error: null }),
  ]);

  return {
    noteRelationships: (noteRelsRes.data ?? []) as NoteRelationshipRow[],
    noteTagLinks: (noteTagsRes.data ?? []) as NoteTagRow[],
  };
}

export async function buildProjectGraph(
  projectId: string
): Promise<BuiltGraph | null> {
  const [
    projectRes,
    notesRes,
    collectionsRes,
    questionsRes,
    intentLinksRes,
    tagsRes,
    resume,
    orphans,
    status,
    raw,
  ] = await Promise.all([
    getProjectById(projectId),
    getNotesByProject(projectId),
    getProjectCollections(projectId),
    getProjectQuestions(projectId),
    getNoteIntentLinks(projectId),
    getProjectTags(projectId),
    calculateSmartResume(projectId),
    detectOrphans(projectId),
    calculateProjectStatus(projectId),
    loadGraphRawData(projectId),
  ]);

  if (projectRes.error || !projectRes.data) return null;

  const project = projectRes.data;
  const notes = notesRes.data ?? [];
  const collections = collectionsRes.data ?? [];
  const questions = questionsRes.data ?? [];
  const intentLinks = intentLinksRes.data ?? [];
  const tags = tagsRes.data ?? [];

  const projectNode = projectToGraphNode(project);

  const orphanNoteIds = extractOrphanNoteIds(orphans);
  const suggestedStartId = extractSuggestedStartNoteId(resume);
  const focusRelevantIds = extractFocusRelevantNoteIds(intentLinks);

  const noteNodes = notesToGraphNodes(notes, {
    orphanNoteIds,
    focusRelevantNoteIds: focusRelevantIds,
    suggestedStartNoteId: suggestedStartId,
  });

  const collectionsResult = collectionsToGraph(project.id, collections);
  const questionsResult = questionsToGraph(project.id, questions);
  const tagsResult = tagsToGraph(tags, raw.noteTagLinks);
  const noteRelationshipEdges = noteRelationshipsToEdges(raw.noteRelationships);
  const intentEdges = intentLinksToEdges(intentLinks);

  const allNodes: GraphNode[] = [
    projectNode,
    ...collectionsResult.nodes,
    ...noteNodes,
    ...questionsResult.nodes,
    ...tagsResult.nodes,
  ];

  const allEdges: GraphEdge[] = [
    ...collectionsResult.edges,
    ...questionsResult.edges,
    ...tagsResult.edges,
    ...noteRelationshipEdges,
    ...intentEdges,
  ];

  const finalNodes = applyIntelligenceToNodes(allNodes, {
    orphans,
    resume,
    status,
  });

  const projection: GraphProjection = { nodes: finalNodes, edges: allEdges };
  const adjacency = buildAdjacency(allEdges);

  const recentNoteIds = notes.slice(0, 5).map((n) => n.id);
  const openQuestionIds = questions
    .filter((q) => q.status === "open")
    .map((q) => q.id);

  const entryPoints = buildEntryPoints({
    projectId,
    projection,
    resume,
    orphans,
    focusRelevantNoteIds: focusRelevantIds,
    recentNoteIds,
    openQuestionIds,
  });

  return { projection, adjacency, entryPoints };
}

export type { GraphProjection, GraphEntryPoint } from "@/types/graph";
export { searchGraphNodes } from "./search/search-graph";
export { applyFilters } from "./filters/filter-graph";
export { expandVisibleContext } from "./context/expansion";
export { buildAdjacency, getNeighbours } from "./context/neighbours";
export { resolveInitialVisible } from "./context/entry-points";
