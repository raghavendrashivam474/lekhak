// src/services/graph/historical.ts
//
// Builds a GraphProjection as it would have looked at a specific past
// referenceTime. Feeds reconstructed inputs into the SAME projector modules
// the live graph uses (Sprint 9). Renderers stay time-agnostic.
//
// What is reconstructed (Sprint 11 brief §39):
//   - project intent (goal, current_focus, next_step)
//   - question lifecycle (which existed at T, and their statuses)
//   - relationship lifecycle (which existed at T)
//   - intent-link lifecycle
//
// What is NOT reconstructed:
//   - note body / title / category (see brief §39)
//   - collections, tags — treated as "as they are today", filtered to
//     entities that existed at T
//   - Sprint 8 intelligence signals (dormant/orphan/etc are current-only)

import { createClient } from "@/lib/supabase/client";
import { getProjectTemporalEvents } from "@/services/temporal";
import {
  reconstructIntentAt,
  reconstructQuestionsAt,
  reconstructRelationshipsAt,
} from "@/domain/temporal";
import type { Project } from "@/types/project";
import type { Note } from "@/types/note";
import type { GraphProjection, GraphNode, GraphEdge } from "@/types/graph";
import type { GraphEntryPoint } from "@/types/graph";

import { projectToGraphNode } from "./projection/project";
import { collectionsToGraph } from "./projection/collections";
import { notesToGraphNodes } from "./projection/notes";
import { questionsToGraph } from "./projection/questions";
import { tagsToGraph } from "./projection/tags";
import {
  noteRelationshipsToEdges,
  intentLinksToEdges,
} from "./projection/relationships";
import { buildAdjacency } from "./context/neighbours";
import { buildEntryPoints } from "./context/entry-points";

export interface HistoricalBuiltGraph {
  projection: GraphProjection;
  adjacency: Map<string, Set<string>>;
  entryPoints: GraphEntryPoint[];
  at: string;
}

interface CollectionRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  project_id: string;
}

interface TagRow {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
  project_id: string;
}

interface QuestionRow {
  id: string;
  question: string;
  status: "open" | "in_progress" | "answered" | "archived";
  answered_by_note_id: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  project_id: string;
}

interface IntentLinkRow {
  id: string;
  note_id: string;
  context: "goal" | "focus" | "next_step";
  created_at: string;
  user_id: string;
  project_id: string;
}

interface NoteRelationshipRow {
  from_note_id: string;
  to_note_id: string;
  relationship_type: string;
}

interface NoteTagRow {
  note_id: string;
  tag_id: string;
}

/**
 * Build the graph as it existed at `referenceTime`.
 * Returns null when the project doesn't exist or the user can't see it.
 */
export async function buildHistoricalProjectGraph(
  projectId: string,
  referenceTime: Date
): Promise<HistoricalBuiltGraph | null> {
  const supabase = createClient();
  const refIso = referenceTime.toISOString();

  // -------------------------------------------------------------------------
  // 1. Load current authoritative rows
  // -------------------------------------------------------------------------
  const [
    projectRes,
    notesRes,
    collectionsRes,
    tagsRes,
    questionsRes,
    intentLinksRes,
    noteRelsRes,
    noteTagsRes,
    eventsRes,
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("id", projectId).single(),
    supabase.from("notes").select("*").eq("project_id", projectId),
    supabase.from("collections").select("*").eq("project_id", projectId),
    supabase.from("knowledge_tags").select("*").eq("project_id", projectId),
    supabase.from("questions").select("*").eq("project_id", projectId),
    supabase
      .from("note_intent_links")
      .select("*")
      .eq("project_id", projectId),
    // note_relationships needs to be scoped via notes we've loaded.
    supabase
      .from("note_relationships")
      .select("id, from_note_id, to_note_id, relationship_type"),
    supabase.from("note_tags").select("note_id, tag_id"),
    getProjectTemporalEvents(projectId, 5000),
  ]);

  if (projectRes.error || !projectRes.data) return null;
  const project = projectRes.data as Project;

  const currentNotes = (notesRes.data ?? []) as Note[];
  const currentCollections = (collectionsRes.data ?? []) as CollectionRow[];
  const currentTags = (tagsRes.data ?? []) as TagRow[];
  const currentQuestions = (questionsRes.data ?? []) as QuestionRow[];
  const currentIntentLinks = (intentLinksRes.data ?? []) as IntentLinkRow[];
  const currentNoteRels = (noteRelsRes.data ?? []) as (NoteRelationshipRow & {
    id: string;
  })[];
  const currentNoteTags = (noteTagsRes.data ?? []) as NoteTagRow[];

  const eventsNewestFirst = eventsRes.data ?? [];
  const eventsOldestFirst = [...eventsNewestFirst].reverse();

  // -------------------------------------------------------------------------
  // 2. Reconstruct temporal state at referenceTime
  // -------------------------------------------------------------------------

  const historicIntent = reconstructIntentAt(
    {
      goal: project.goal,
      current_focus: project.current_focus,
      next_step: project.next_step,
    },
    eventsOldestFirst,
    referenceTime
  );

  const historicQuestions = reconstructQuestionsAt(
    eventsOldestFirst,
    referenceTime
  );
  const historicRelationships = reconstructRelationshipsAt(
    eventsOldestFirst,
    referenceTime
  );

  // -------------------------------------------------------------------------
  // 3. Filter live rows to entities that existed at referenceTime
  // -------------------------------------------------------------------------
  //
  // Notes / collections / tags carry created_at we can trust — anything
  // created after refIso didn't exist yet.

  const historicNotes = currentNotes.filter((n) => n.created_at <= refIso);
  const historicCollections = currentCollections.filter(
    (c) => c.created_at <= refIso
  );
  const historicTags = currentTags.filter((t) => t.created_at <= refIso);
  const historicNoteTags = currentNoteTags; // note_tags table lacks created_at in our schema; treat as current

  const historicNoteIds = new Set(historicNotes.map((n) => n.id));

  // -------------------------------------------------------------------------
  // 4. Build question rows in the shape the projector expects, but with
  //    historical status applied.
  // -------------------------------------------------------------------------

  const questionsById = new Map(currentQuestions.map((q) => [q.id, q]));
  const historicQuestionRows = historicQuestions
    .filter((q) => q.existed) // drop deleted
    .map((h) => {
      const live = questionsById.get(h.id);
      // The temporal snapshot is the source of truth for status.
      // Use live row for text if we still have it, else the reconstructed text.
      if (live) {
        return {
          ...live,
          status: h.status === "deleted" ? live.status : h.status,
        } as QuestionRow;
      }
      // Row was deleted from the live table but existed historically —
      // synthesise a minimal row.
      return {
        id: h.id,
        question: h.question,
        status: h.status === "deleted" ? "archived" : h.status,
        answered_by_note_id: null,
        created_at: refIso,
        updated_at: refIso,
        user_id: project.user_id,
        project_id: projectId,
      } as QuestionRow;
    });

  // -------------------------------------------------------------------------
  // 5. Build note relationships / intent links in the shape the projector
  //    expects. A live row that no longer exists but was present at T is
  //    reconstructed from historicRelationships.
  // -------------------------------------------------------------------------

  const liveNoteRelById = new Map(currentNoteRels.map((r) => [r.id, r]));
  const liveIntentLinkById = new Map(currentIntentLinks.map((l) => [l.id, l]));

  const historicNoteRelRows: (NoteRelationshipRow & { id: string })[] = [];
  const historicIntentLinkRows: IntentLinkRow[] = [];

  for (const rel of historicRelationships) {
    if (!rel.existed) continue;

    if (rel.kind === "note_relationship") {
      // Prefer the live row when we still have it (preserves any current shape),
      // otherwise reconstruct from the temporal payload.
      const live = liveNoteRelById.get(rel.id);
      if (live) {
        historicNoteRelRows.push(live);
      } else if (rel.from_note_id && rel.to_note_id && rel.relationship_type) {
        historicNoteRelRows.push({
          id: rel.id,
          from_note_id: rel.from_note_id,
          to_note_id: rel.to_note_id,
          relationship_type: rel.relationship_type,
        });
      }
    } else if (rel.kind === "intent_link") {
      const live = liveIntentLinkById.get(rel.id);
      if (live) {
        historicIntentLinkRows.push(live);
      } else if (rel.note_id && rel.context) {
        historicIntentLinkRows.push({
          id: rel.id,
          note_id: rel.note_id,
          context: rel.context as IntentLinkRow["context"],
          created_at: refIso,
          user_id: project.user_id,
          project_id: projectId,
        });
      }
    }
  }

  // Filter both rel lists to endpoints that existed at T.
  const filteredNoteRels = historicNoteRelRows.filter(
    (r) => historicNoteIds.has(r.from_note_id) && historicNoteIds.has(r.to_note_id)
  );
  const filteredIntentLinks = historicIntentLinkRows.filter((l) =>
    historicNoteIds.has(l.note_id)
  );

  // -------------------------------------------------------------------------
  // 6. Build a synthetic Project row with historical intent so the project
  //    node reflects the past state.
  // -------------------------------------------------------------------------

  const historicProject: Project = {
    ...project,
    goal: historicIntent.goal,
    current_focus: historicIntent.current_focus,
    next_step: historicIntent.next_step,
  };

  // -------------------------------------------------------------------------
  // 7. Feed reconstructed inputs into the SAME projectors as live graph.
  //    Sprint 8 intelligence is intentionally skipped in historical mode —
  //    orphan/suggested/dormant are current-only signals.
  // -------------------------------------------------------------------------

  const projectNode = projectToGraphNode(historicProject);

  const noteNodes = notesToGraphNodes(historicNotes, {
    orphanNoteIds: new Set(),
    focusRelevantNoteIds: new Set(),
    suggestedStartNoteId: null,
  });

  const collectionsResult = collectionsToGraph(
    projectId,
    historicCollections.map((c) => ({ ...c, notes: [] }))
  );
  // The collections-to-graph projector wants `notes` per collection to
  // draw belongs_to edges. Rebuild that mapping from historic note-tags
  // isn't right — collection membership isn't in note_tags. For v1
  // historical mode we accept that collection→note edges appear only via
  // notes+collection existing; if you had collection membership timestamps
  // we'd filter here. Skip for now (documented limitation).

  const questionsResult = questionsToGraph(
    projectId,
    historicQuestionRows.map((q) => ({
      ...q,
      answered_by_note:
        q.answered_by_note_id && historicNoteIds.has(q.answered_by_note_id)
          ? { id: q.answered_by_note_id, title: "" }
          : null,
    }))
  );

  const tagsResult = tagsToGraph(
    historicTags,
    historicNoteTags.filter((nt) => historicNoteIds.has(nt.note_id))
  );

  const noteRelationshipEdges = noteRelationshipsToEdges(
    filteredNoteRels.map(({ from_note_id, to_note_id, relationship_type }) => ({
      from_note_id,
      to_note_id,
      relationship_type,
    }))
  );

  const intentEdges = intentLinksToEdges(
    filteredIntentLinks.map((l) => ({
      project_id: projectId,
      note_id: l.note_id,
      context: l.context,
    }))
  );

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

  const projection: GraphProjection = { nodes: allNodes, edges: allEdges };
  const adjacency = buildAdjacency(allEdges);

  // Historical entry points are best-effort — the sprint permits reusing
  // Sprint 9 shapes but skipping current-only signals (orphans / suggested).
  const focusRelevantNoteIds = new Set(
    filteredIntentLinks
      .filter((l) => l.context === "focus" || l.context === "next_step")
      .map((l) => l.note_id)
  );

  const entryPoints = buildEntryPoints({
    projectId,
    projection,
    resume: null,
    orphans: null,
    focusRelevantNoteIds,
    recentNoteIds: historicNotes
      .slice()
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, 5)
      .map((n) => n.id),
    openQuestionIds: historicQuestionRows
      .filter((q) => q.status === "open")
      .map((q) => q.id),
  });

  return { projection, adjacency, entryPoints, at: refIso };
}
