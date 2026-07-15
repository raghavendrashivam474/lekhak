// src/services/reasoning/index.ts
//
// Thin orchestrator: loads project data, maps to domain input,
// calls pure reasoning functions.
// This is where IO lives so the domain stays pure.

import type { ServiceResult } from "@/types/service";
import { createClient } from "@/lib/supabase/client";
import { calculateMomentum } from "@/services/intelligence/momentum";
import {
  resolveCreativeThreads,
  calculateProjectNarrativeProgress,
  analyzeDependencies,
  calculateCreativeHealth,
  analyzeProject,
  type ThreadResolverInput,
  type CreativeThread,
  type ProjectNarrativeProgress,
  type DependencyAnalysis,
  type CreativeHealth,
  type ReasoningContext,
  type ReasoningResult,
} from "@/domain/reasoning";

// ---------------------------------------------------------------------------
// Load project data into ThreadResolverInput
// ---------------------------------------------------------------------------

async function loadResolverInput(
  projectId: string
): Promise<ServiceResult<ThreadResolverInput>> {
  const supabase = createClient();

  const [
    notesRes,
    relsRes,
    questionsRes,
    intentLinksRes,
    collectionsRes,
    tagsRes,
    noteTagsRes,
  ] = await Promise.all([
    supabase
      .from("notes")
      .select("id, title, category, created_at, updated_at")
      .eq("project_id", projectId),
    supabase
      .from("note_relationships")
      .select("from_note_id, to_note_id, relationship_type"),
    supabase
      .from("questions")
      .select("id, question, status, answered_by_note_id")
      .eq("project_id", projectId),
    supabase
      .from("note_intent_links")
      .select("note_id, context")
      .eq("project_id", projectId),
    supabase
      .from("collections")
      .select("id, name")
      .eq("project_id", projectId),
    supabase
      .from("knowledge_tags")
      .select("id, name")
      .eq("project_id", projectId),
    supabase.from("note_tags").select("note_id, tag_id"),
  ]);

  const notes = (notesRes.data ?? []).map((n: Record<string, unknown>) => ({
    id: n.id as string,
    title: n.title as string,
    category: n.category as string,
    createdAt: n.created_at as string,
    updatedAt: n.updated_at as string,
  }));

  const noteIdSet = new Set(notes.map((n) => n.id));

  const relationships = (relsRes.data ?? [])
    .filter(
      (r: Record<string, unknown>) =>
        noteIdSet.has(r.from_note_id as string) ||
        noteIdSet.has(r.to_note_id as string)
    )
    .map((r: Record<string, unknown>) => ({
      fromNoteId: r.from_note_id as string,
      toNoteId: r.to_note_id as string,
      relationshipType: r.relationship_type as string,
    }));

  const questions = (questionsRes.data ?? []).map((q: Record<string, unknown>) => ({
    id: q.id as string,
    question: q.question as string,
    status: q.status as string,
    answeredByNoteId: (q.answered_by_note_id as string | null) ?? null,
  }));

  const intentLinks = (intentLinksRes.data ?? []).map((l: Record<string, unknown>) => ({
    noteId: l.note_id as string,
    context: l.context as "goal" | "focus" | "next_step",
  }));

  const collectionRows = collectionsRes.data ?? [];
  const collectionIds = collectionRows.map((c: Record<string, unknown>) => c.id as string);
  const noteCollectionMap = new Map<string, string[]>();

  if (collectionIds.length > 0) {
    const { data: ncData } = await supabase
      .from("note_collections")
      .select("collection_id, note_id")
      .in("collection_id", collectionIds);

    for (const nc of ncData ?? []) {
      const r = nc as Record<string, unknown>;
      const colId = r.collection_id as string;
      const noteId = r.note_id as string;
      const list = noteCollectionMap.get(colId) ?? [];
      list.push(noteId);
      noteCollectionMap.set(colId, list);
    }
  }

  const collections = collectionRows.map((c: Record<string, unknown>) => ({
    id: c.id as string,
    name: c.name as string,
    noteIds: noteCollectionMap.get(c.id as string) ?? [],
  }));

  const tags = (tagsRes.data ?? []).map((t: Record<string, unknown>) => ({
    id: t.id as string,
    name: t.name as string,
  }));

  const noteTags = (noteTagsRes.data ?? [])
    .filter((nt: Record<string, unknown>) => noteIdSet.has(nt.note_id as string))
    .map((nt: Record<string, unknown>) => ({
      noteId: nt.note_id as string,
      tagId: nt.tag_id as string,
    }));

  return {
    data: {
      projectId,
      notes,
      relationships,
      questions,
      intentLinks,
      collections,
      tags,
      noteTags,
    },
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Full reasoning pipeline
// ---------------------------------------------------------------------------

export interface FullReasoningSnapshot {
  threads: CreativeThread[];
  progress: ProjectNarrativeProgress;
  dependencies: DependencyAnalysis;
  health: CreativeHealth;
  reasoning: ReasoningResult;
  /** Raw input — needed by explanation and adapter layers. */
  input: ThreadResolverInput;
}

export async function getProjectReasoning(
  projectId: string
): Promise<ServiceResult<FullReasoningSnapshot>> {
  const supabase = createClient();

  const { data: project, error: projectErr } = await supabase
    .from("projects")
    .select("goal, current_focus, next_step")
    .eq("id", projectId)
    .single();

  if (projectErr || !project) {
    return { data: null, error: projectErr?.message ?? "Project not found" };
  }

  const inputRes = await loadResolverInput(projectId);
  if (inputRes.error || !inputRes.data) {
    return { data: null, error: inputRes.error ?? "Failed to load project data" };
  }

  const input = inputRes.data;

  // calculateMomentum is user-scoped (documented limitation from Sprint 11).
  // A project-scoped momentum function is planned for a future sprint.
  const momentum = await calculateMomentum();

  const intent = {
    goal: (project as Record<string, unknown>).goal as string | null,
    currentFocus: (project as Record<string, unknown>).current_focus as string | null,
    nextStep: (project as Record<string, unknown>).next_step as string | null,
  };

  const threads = resolveCreativeThreads(input);
  const progress = calculateProjectNarrativeProgress(threads, input);
  const dependencies = analyzeDependencies(threads, input, intent);
  const health = calculateCreativeHealth({
    projectId,
    threads,
    progress,
    dependencies,
    input,
    intent,
    activityLast7Days: momentum.active_this_week,
    activityLast30Days: momentum.active_this_month,
    writingStreakDays: momentum.writing_streak_days,
  });

  const reasoningCtx: ReasoningContext = {
    projectId,
    threads,
    progress,
    dependencies,
    health,
    input,
    intent,
    activityLast7Days: momentum.active_this_week,
    activityLast30Days: momentum.active_this_month,
    writingStreakDays: momentum.writing_streak_days,
  };

  const reasoning = analyzeProject(reasoningCtx);

  return {
    data: { threads, progress, dependencies, health, reasoning, input },
    error: null,
  };
}
