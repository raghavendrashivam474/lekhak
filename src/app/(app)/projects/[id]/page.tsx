"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, Clock, History } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { getProjectById, deleteProject } from "@/services/projects";
import { getNotesByProject } from "@/services/notes";
import { getProjectActivity } from "@/services/activity";
import { CreateNoteDialog } from "@/components/notes/CreateNoteDialog";
import { EditProjectDialog } from "@/components/projects/EditProjectDialog";
import type { Project } from "@/types/project";
import type { Note } from "@/types/note";
import type { ActivityLog } from "@/types/activity";

function activityLabel(log: ActivityLog): string {
  switch (log.action) {
    case "project_created": return "Project created";
    case "project_updated": return `Project updated: ${log.metadata.title}`;
    case "note_created":    return `Note created: ${log.metadata.title}`;
    case "note_updated":    return `Note updated: ${log.metadata.title}`;
    case "note_deleted":    return `Note deleted: ${log.metadata.title}`;
    default:                return log.action;
  }
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const [projectRes, notesRes, activityRes] = await Promise.all([
        getProjectById(id),
        getNotesByProject(id),
        getProjectActivity(id),
      ]);

      if (projectRes.error) {
        setError(projectRes.error);
      } else {
        setProject(projectRes.data);
      }

      if (notesRes.data) setNotes(notesRes.data);
      if (activityRes.data) setActivity(activityRes.data);

      setLoading(false);
    }

    load();
  }, [id]);

  function handleNoteCreated(note: Note) {
    setNotes((prev) => [note, ...prev]);
    setActivity((prev) => [
      {
        id: crypto.randomUUID(),
        user_id: "",
        project_id: id,
        entity_type: "note",
        entity_id: note.id,
        action: "note_created",
        metadata: { title: note.title },
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  function handleProjectUpdated(updated: Project) {
    setProject(updated);
  }

  async function handleDeleteProject() {
    setDeleting(true);
    setDeleteError(null);

    const { error } = await deleteProject(id);

    if (error) {
      setDeleteError(error);
      setDeleting(false);
      return;
    }

    router.push("/projects");
  }

  // Resume context derived from activity
  const lastActivity = activity[0] ?? null;
  const recentNoteUpdates = activity.filter(
    (a) => a.action === "note_updated" || a.action === "note_created"
  ).length;
  const mostRecentNote = notes[0] ?? null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      <button
        onClick={() => router.push("/projects")}
        className="flex items-center gap-2 text-sm text-[#8A9BB0] hover:text-[#F5ECD7] transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        All Projects
      </button>

      {loading && (
        <p className="text-[#8A9BB0] text-sm">Loading project...</p>
      )}

      {!loading && error && (
        <div className="space-y-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => router.push("/projects")}
            className="text-sm text-[#8A9BB0] hover:text-[#F5ECD7] transition-colors"
          >
            Return to Projects
          </button>
        </div>
      )}

      {!loading && !error && project && (
        <div className="space-y-8">

          {/* Project header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-tight text-[#F5ECD7]">
                  {project.title}
                </h1>
                {project.description && (
                  <p className="text-[#8A9BB0] mt-3 leading-relaxed max-w-2xl">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <EditProjectDialog
                  project={project}
                  onProjectUpdated={handleProjectUpdated}
                />
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center justify-center rounded-lg border border-red-900/50 bg-transparent px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/20 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-4 text-xs text-[#4A5A6A]">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Created {format(new Date(project.created_at), "MMMM d, yyyy")}
              </span>
            </div>
          </div>

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="rounded-lg border border-red-900/50 bg-red-900/10 p-5 space-y-3">
              <p className="text-sm font-medium text-red-300">
                Delete this project?
              </p>
              <p className="text-sm text-[#8A9BB0]">
                This action cannot be undone. You will be redirected back to
                Projects after deletion.
              </p>
              {deleteError && (
                <p className="text-sm text-red-400">{deleteError}</p>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteProject}
                  disabled={deleting}
                  className="inline-flex items-center justify-center rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Yes, delete project"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteError(null);
                  }}
                  disabled={deleting}
                  className="inline-flex items-center justify-center rounded-lg border border-[#2A3A52] px-4 py-2 text-sm font-medium text-[#C8D6E5] transition-colors hover:bg-[#2A3A52] disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Resume context */}
          {(lastActivity || mostRecentNote) && (
            <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333]/50 p-5 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-[#C9A84C]" />
                <h2 className="text-sm font-medium text-[#C9A84C]">
                  Where you left off
                </h2>
              </div>

              {lastActivity && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#8A9BB0]">Last worked on</span>
                  <span className="text-sm text-[#C8D6E5]">
                    {formatDistanceToNow(new Date(lastActivity.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )}

              {recentNoteUpdates > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#8A9BB0]">Recent changes</span>
                  <span className="text-sm text-[#C8D6E5]">
                    {recentNoteUpdates} note{recentNoteUpdates !== 1 ? "s" : ""} updated
                  </span>
                </div>
              )}

              {mostRecentNote && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#8A9BB0]">Most recent note</span>
                  <Link
                    href={`/projects/${id}/notes/${mostRecentNote.id}`}
                    className="text-sm text-[#C9A84C] hover:underline truncate max-w-[200px]"
                  >
                    {mostRecentNote.title}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Notes section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[#F5ECD7]">
                Notes
                {notes.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-[#4A5A6A]">
                    ({notes.length})
                  </span>
                )}
              </h2>
              <CreateNoteDialog
                projectId={id}
                onNoteCreated={handleNoteCreated}
              />
            </div>

            {notes.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#2A3A52] p-8 text-center">
                <FileText className="h-8 w-8 text-[#4A5A6A] mx-auto mb-3" />
                <p className="text-[#8A9BB0] text-sm">
                  No notes yet. Capture your first idea.
                </p>
              </div>
            )}

            {notes.length > 0 && (
              <ul className="space-y-2">
                {notes.map((note) => (
                  <li key={note.id}>
                    <Link
                      href={`/projects/${id}/notes/${note.id}`}
                      className="block rounded-lg border border-[#2A3A52] bg-[#1A2333] p-4 transition-colors hover:border-[#C9A84C]/40"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-medium text-[#F5ECD7] truncate">
                            {note.title}
                          </h3>
                          {note.content && (
                            <p className="text-[#8A9BB0] text-sm mt-1 line-clamp-2 whitespace-pre-wrap">
                              {note.content}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-[#4A5A6A] whitespace-nowrap shrink-0 mt-0.5">
                          {formatDistanceToNow(new Date(note.updated_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Project Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <History className="h-4 w-4 text-[#C9A84C]" />
              <h2 className="text-lg font-medium text-[#F5ECD7]">
                Project Timeline
              </h2>
            </div>

            {activity.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#2A3A52] p-6 text-center">
                <p className="text-[#4A5A6A] text-sm">
                  Start writing to build your project history.
                </p>
              </div>
            )}

            {activity.length > 0 && (
              <ul className="space-y-1">
                {activity.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-[#2A3A52] bg-[#1A2333] px-4 py-3"
                  >
                    <span className="text-sm text-[#C8D6E5] truncate">
                      {activityLabel(log)}
                    </span>
                    <span className="text-xs text-[#4A5A6A] whitespace-nowrap shrink-0">
                      {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
