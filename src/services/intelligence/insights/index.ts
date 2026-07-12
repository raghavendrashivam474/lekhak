// src/services/intelligence/insights/index.ts

import { createClient } from "@/lib/supabase/client";
import type {
  OrphanInsight,
  QuestionIntelligence,
  FocusDrift,
  CreativeGap,
} from "@/types/intelligence";

const DAY_MS = 1000 * 60 * 60 * 24;

// ---------------------------------------------------------------------------
// Orphan detection
// ---------------------------------------------------------------------------

export async function detectOrphans(projectId: string): Promise<OrphanInsight> {
  const supabase = createClient();

  const { data: notes } = await supabase
    .from("notes")
    .select("id")
    .eq("project_id", projectId);

  const noteIds = (notes ?? []).map((n) => n.id);

  if (noteIds.length === 0) {
    return {
      orphan_note_ids: [],
      untagged_note_ids: [],
      unused_collection_ids: [],
      orphan_count: 0,
      untagged_count: 0,
      unused_collection_count: 0,
    };
  }

  const [relsRes, tagsRes, collectionsRes, noteCollectionsRes] =
    await Promise.all([
      supabase
        .from("note_relationships")
        .select("from_note_id, to_note_id")
        .or(
          "from_note_id.in.(" +
            noteIds.join(",") +
            "),to_note_id.in.(" +
            noteIds.join(",") +
            ")"
        ),
      supabase.from("note_tags").select("note_id").in("note_id", noteIds),
      supabase.from("collections").select("id").eq("project_id", projectId),
      supabase
        .from("note_collections")
        .select("collection_id")
        .in("collection_id", []),
    ]);

  const rels = relsRes.data ?? [];
  const tags = tagsRes.data ?? [];
  const collections = collectionsRes.data ?? [];

  const connected = new Set<string>();
  rels.forEach((r) => {
    connected.add(r.from_note_id);
    connected.add(r.to_note_id);
  });

  const tagged = new Set<string>();
  tags.forEach((t) => tagged.add(t.note_id));

  // Fetch note_collections for this project's collections
  const collectionIds = collections.map((c) => c.id);
  const usedCollections = new Set<string>();
  if (collectionIds.length > 0) {
    const { data: ncData } = await supabase
      .from("note_collections")
      .select("collection_id")
      .in("collection_id", collectionIds);

    (ncData ?? []).forEach((nc) => usedCollections.add(nc.collection_id));
  }

  const orphanNoteIds = noteIds.filter((id) => !connected.has(id));
  const untaggedNoteIds = noteIds.filter((id) => !tagged.has(id));
  const unusedCollectionIds = collectionIds.filter(
    (id) => !usedCollections.has(id)
  );

  return {
    orphan_note_ids: orphanNoteIds,
    untagged_note_ids: untaggedNoteIds,
    unused_collection_ids: unusedCollectionIds,
    orphan_count: orphanNoteIds.length,
    untagged_count: untaggedNoteIds.length,
    unused_collection_count: unusedCollectionIds.length,
  };
}

// ---------------------------------------------------------------------------
// Question intelligence
// ---------------------------------------------------------------------------

export async function analyzeQuestions(
  projectId: string
): Promise<QuestionIntelligence> {
  const supabase = createClient();

  const { data: questions } = await supabase
    .from("questions")
    .select("id, question, status, created_at, updated_at, answered_by_note_id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  const list = questions ?? [];

  const openQs = list.filter((q) => q.status === "open");
  const answeredQs = list.filter((q) => q.status === "answered");

  const now = new Date();
  let oldestOpen: QuestionIntelligence["oldest_open_question"] = null;
  if (openQs.length > 0) {
    const oldest = openQs[0];
    const daysOpen = Math.floor(
      (now.getTime() - new Date(oldest.created_at).getTime()) / DAY_MS
    );
    oldestOpen = {
      id: oldest.id,
      question: oldest.question,
      days_open: daysOpen,
    };
  }

  // Recently answered — last 3 with note titles
  const recentAnsweredIds = answeredQs
    .filter((q) => q.answered_by_note_id)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  const noteIds = recentAnsweredIds
    .map((q) => q.answered_by_note_id)
    .filter((id): id is string => id !== null);

  const noteTitles: Record<string, string> = {};
  if (noteIds.length > 0) {
    const { data: notes } = await supabase
      .from("notes")
      .select("id, title")
      .in("id", noteIds);
    (notes ?? []).forEach((n) => {
      noteTitles[n.id] = n.title;
    });
  }

  const recentAnswered = recentAnsweredIds.map((q) => ({
    id: q.id,
    question: q.question,
    answered_by_title: q.answered_by_note_id
      ? (noteTitles[q.answered_by_note_id] ?? null)
      : null,
  }));

  return {
    waiting_count: openQs.length,
    answered_count: answeredQs.length,
    oldest_open_question: oldestOpen,
    recently_answered: recentAnswered,
  };
}

// ---------------------------------------------------------------------------
// Focus drift
// ---------------------------------------------------------------------------

export async function detectFocusDrift(
  projectId: string
): Promise<FocusDrift> {
  const supabase = createClient();

  const [projectRes, activityRes] = await Promise.all([
    supabase
      .from("projects")
      .select("current_focus")
      .eq("id", projectId)
      .single(),
    supabase
      .from("activity_logs")
      .select("entity_id, action, created_at")
      .eq("project_id", projectId)
      .in("action", ["note_created", "note_updated"])
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const focus = projectRes.data?.current_focus ?? null;
  const recentActivity = activityRes.data ?? [];

  if (!focus) {
    return {
      has_focus: false,
      drifting: false,
      focus_text: null,
      recent_categories: [],
      message: "",
    };
  }

  if (recentActivity.length === 0) {
    return {
      has_focus: true,
      drifting: false,
      focus_text: focus,
      recent_categories: [],
      message: "No recent activity to compare against your focus.",
    };
  }

  const recentNoteIds = recentActivity.map((a) => a.entity_id);
  const { data: recentNotes } = await supabase
    .from("notes")
    .select("category, title")
    .in("id", recentNoteIds);

  const categories = new Set<string>();
  (recentNotes ?? []).forEach((n) => {
    if (n.category) categories.add(n.category);
  });

  const categoryList = Array.from(categories);

  // Naive drift detection — check if focus keywords appear in note titles
  const focusLower = focus.toLowerCase();
  const focusKeywords = focusLower
    .split(/\s+/)
    .filter((w: string) => w.length >= 4);

  const titlesMatchingFocus = (recentNotes ?? []).filter((n) => {
    const title = n.title.toLowerCase();
    return focusKeywords.some((kw: string) => title.includes(kw));
  }).length;

  const drifting =
    focusKeywords.length > 0 &&
    titlesMatchingFocus / (recentNotes?.length || 1) < 0.3;

  return {
    has_focus: true,
    drifting,
    focus_text: focus,
    recent_categories: categoryList,
    message: drifting
      ? "Your recent work differs from your stated focus."
      : "Your recent work aligns with your focus.",
  };
}

// ---------------------------------------------------------------------------
// Creative gap analysis
// ---------------------------------------------------------------------------

export async function analyzeCreativeGaps(
  projectId: string
): Promise<CreativeGap[]> {
  const supabase = createClient();

  const [notesRes, questionsRes, collectionsRes, intentLinksRes] =
    await Promise.all([
      supabase
        .from("notes")
        .select("id, category")
        .eq("project_id", projectId),
      supabase
        .from("questions")
        .select("id, status, answered_by_note_id")
        .eq("project_id", projectId),
      supabase
        .from("collections")
        .select("id, name")
        .eq("project_id", projectId),
      supabase
        .from("note_intent_links")
        .select("context")
        .eq("project_id", projectId),
    ]);

  const notes = notesRes.data ?? [];
  const questions = questionsRes.data ?? [];
  const collections = collectionsRes.data ?? [];
  const intentLinks = intentLinksRes.data ?? [];

  const gaps: CreativeGap[] = [];

  const characterNotes = notes.filter((n) => n.category === "character").length;
  const dialogueNotes = notes.filter((n) => n.category === "dialogue").length;
  if (characterNotes > 0 && dialogueNotes === 0) {
    gaps.push({
      label: "Characters without dialogue",
      detail: `You have ${characterNotes} character note${characterNotes !== 1 ? "s" : ""} but no dialogue notes yet.`,
    });
  }

  const unanswered = questions.filter(
    (q) => q.status !== "answered" && q.status !== "archived"
  ).length;
  if (unanswered >= 3) {
    gaps.push({
      label: "Questions without answers",
      detail: `${unanswered} question${unanswered !== 1 ? "s remain" : " remains"} open.`,
    });
  }

  const themeNotes = notes.filter((n) => n.category === "theme").length;
  if (themeNotes > 0 && themeNotes < 2 && notes.length >= 10) {
    gaps.push({
      label: "Themes with limited exploration",
      detail: `Only ${themeNotes} theme note in a project with ${notes.length} notes.`,
    });
  }

  const goalLinkCount = intentLinks.filter((l) => l.context === "goal").length;
  if (notes.length >= 5 && goalLinkCount === 0) {
    gaps.push({
      label: "Goal without supporting work",
      detail: "No notes are linked to your project goal.",
    });
  }

  return gaps;
}