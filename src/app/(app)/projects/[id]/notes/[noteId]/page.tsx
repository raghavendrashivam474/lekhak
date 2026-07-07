"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { getNoteById, deleteNote, getNotesByProject } from "@/services/notes";
import { getNoteRelationships } from "@/services/relationships";
import { getNoteTags, getProjectTags } from "@/services/collections";
import { EditNoteDialog } from "@/components/notes/EditNoteDialog";
import { NoteRelationships } from "@/components/notes/NoteRelationships";
import { KnowledgeTagsPanel } from "@/components/notes/KnowledgeTagsPanel";
import type { Note } from "@/types/note";
import type { NoteRelationshipWithNote } from "@/types/relationship";
import type { KnowledgeTag, NoteTagWithTag } from "@/types/collection";

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const noteId = params.noteId as string;

  const [note, setNote] = useState<Note | null>(null);
  const [relationships, setRelationships] = useState<NoteRelationshipWithNote[]>([]);
  const [projectNotes, setProjectNotes] = useState<{ id: string; title: string; category: string }[]>([]);
  const [noteTags, setNoteTags] = useState<NoteTagWithTag[]>([]);
  const [projectTags, setProjectTags] = useState<KnowledgeTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteId) return;

    async function load() {
      const [noteRes, relsRes, allNotesRes, noteTagsRes, projectTagsRes] =
        await Promise.all([
          getNoteById(noteId),
          getNoteRelationships(noteId),
          getNotesByProject(projectId),
          getNoteTags(noteId),
          getProjectTags(projectId),
        ]);

      if (noteRes.error) {
        setError(noteRes.error);
      } else {
        setNote(noteRes.data);
      }

      if (relsRes.data) setRelationships(relsRes.data);
      if (allNotesRes.data) {
        setProjectNotes(
          allNotesRes.data.map((n) => ({
            id: n.id,
            title: n.title,
            category: n.category,
          }))
        );
      }
      if (noteTagsRes.data) setNoteTags(noteTagsRes.data);
      if (projectTagsRes.data) setProjectTags(projectTagsRes.data);

      setLoading(false);
    }

    load();
  }, [noteId, projectId]);

  function handleNoteUpdated(updated: Note) {
    setNote(updated);
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);

    const { error } = await deleteNote(noteId);

    if (error) {
      setDeleteError(error);
      setDeleting(false);
      return;
    }

    router.push("/projects/" + projectId);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      <button
        onClick={() => router.push("/projects/" + projectId)}
        className="flex items-center gap-2 text-sm text-[#8A9BB0] hover:text-[#F5ECD7] transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </button>

      {loading && <p className="text-[#8A9BB0] text-sm">Loading note...</p>}

      {!loading && error && (
        <div className="space-y-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => router.push("/projects/" + projectId)}
            className="text-sm text-[#8A9BB0] hover:text-[#F5ECD7] transition-colors"
          >
            Return to Project
          </button>
        </div>
      )}

      {!loading && !error && note && (
        <div className="space-y-6">

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold tracking-tight text-[#F5ECD7]">
                  {note.title}
                </h1>
                <span className="text-xs text-[#4A5A6A] bg-[#0F1623] px-2 py-0.5 rounded shrink-0">
                  {note.category}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <EditNoteDialog note={note} onNoteUpdated={handleNoteUpdated} />
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center justify-center rounded-lg border border-red-900/50 bg-transparent px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/20 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#4A5A6A]">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created {format(new Date(note.created_at), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Updated {format(new Date(note.updated_at), "MMMM d, yyyy 'at' h:mm a")}</span>
            </div>
          </div>

          <div className="border-t border-[#2A3A52]" />

          <div className="min-h-[200px]">
            {note.content ? (
              <p className="text-[#C8D6E5] leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
            ) : (
              <p className="text-[#4A5A6A] text-sm italic">
                No content yet. Click Edit to add some.
              </p>
            )}
          </div>

          <KnowledgeTagsPanel
            noteId={noteId}
            projectId={projectId}
            noteTags={noteTags}
            projectTags={projectTags}
            onNoteTagsChanged={setNoteTags}
            onProjectTagsChanged={setProjectTags}
          />

          <NoteRelationships
            noteId={noteId}
            projectId={projectId}
            relationships={relationships}
            onRelationshipsChanged={setRelationships}
            projectNotes={projectNotes}
          />

          {showDeleteConfirm && (
            <div className="rounded-lg border border-red-900/50 bg-red-900/10 p-5 space-y-3">
              <p className="text-sm font-medium text-red-300">Delete this note?</p>
              <p className="text-sm text-[#8A9BB0]">
                This action cannot be undone. The note will be permanently removed.
              </p>
              {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center justify-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); }}
                  disabled={deleting}
                  className="inline-flex items-center justify-center rounded-lg border border-[#2A3A52] px-4 py-2 text-sm font-medium text-[#C8D6E5] transition-colors hover:bg-[#2A3A52] disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}