"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FolderOpen, FileText, ArrowRight, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActivityFeed } from "@/services/activity";
import type { Project } from "@/types/project";
import type { ActivityLog } from "@/types/activity";

function activityLabel(log: ActivityLog): string {
  switch (log.action) {
    case "project_created": return `Created project: ${log.metadata.title}`;
    case "project_updated": return `Updated project: ${log.metadata.title}`;
    case "project_deleted": return `Deleted project: ${log.metadata.title}`;
    case "note_created":    return `Created note: ${log.metadata.title}`;
    case "note_updated":    return `Updated note: ${log.metadata.title}`;
    case "note_deleted":    return `Deleted note: ${log.metadata.title}`;
    default:                return "Activity";
  }
}

function activityHref(log: ActivityLog): string | null {
  if (log.action === "project_deleted" || log.action === "note_deleted") {
    return null;
  }
  if (log.entity_type === "project") {
    return `/projects/${log.entity_id}`;
  }
  if (log.entity_type === "note" && log.project_id) {
    return `/projects/${log.project_id}/notes/${log.entity_id}`;
  }
  return null;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [projectsRes, notesRes, activityRes] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .order("updated_at", { ascending: false }),
        supabase
          .from("notes")
          .select("id"),
        getActivityFeed(),
      ]);

      if (projectsRes.data) {
        setProjects(projectsRes.data.slice(0, 4));
        setProjectCount(projectsRes.data.length);
      }

      if (notesRes.data) {
        setNoteCount(notesRes.data.length);
      }

      if (activityRes.data) {
        setActivity(activityRes.data);
      }

      setLoading(false);
    }

    load();
  }, []);

  const hasContent = projectCount > 0 || noteCount > 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-[#F5ECD7]">
          Dashboard
        </h1>
        <p className="text-[#8A9BB0] text-sm mt-1">
          Pick up where you left off.
        </p>
      </div>

      {loading && (
        <p className="text-[#8A9BB0] text-sm">Loading...</p>
      )}

      {!loading && !hasContent && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderOpen className="h-10 w-10 text-[#4A5A6A] mb-4" />
          <h2 className="text-lg font-medium text-[#F5ECD7] mb-1">
            Start your first writing project
          </h2>
          <p className="text-[#8A9BB0] text-sm max-w-xs mb-6">
            Create a project to organise your ideas, notes, and writing.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-medium text-[#0F1623] hover:bg-[#D4B86A] transition-colors"
          >
            Create your first project
          </Link>
        </div>
      )}

      {!loading && hasContent && (
        <div className="space-y-10">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
              <div className="flex items-center gap-3 mb-1">
                <FolderOpen className="h-4 w-4 text-[#C9A84C]" />
                <span className="text-sm text-[#8A9BB0]">Projects</span>
              </div>
              <p className="text-3xl font-semibold text-[#F5ECD7]">
                {projectCount}
              </p>
            </div>
            <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
              <div className="flex items-center gap-3 mb-1">
                <FileText className="h-4 w-4 text-[#C9A84C]" />
                <span className="text-sm text-[#8A9BB0]">Notes</span>
              </div>
              <p className="text-3xl font-semibold text-[#F5ECD7]">
                {noteCount}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-[#C9A84C]" />
              <h2 className="text-lg font-medium text-[#F5ECD7]">
                Recent Activity
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
                {activity.map((log) => {
                  const href = activityHref(log);
                  const label = activityLabel(log);
                  const time = formatDistanceToNow(
                    new Date(log.created_at),
                    { addSuffix: true }
                  );

                  return (
                    <li key={log.id}>
                      <div className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 border border-[#2A3A52] bg-[#1A2333]">
                        <div className="min-w-0">
                          {href ? (
                            <Link
                              href={href}
                              className="text-sm text-[#C8D6E5] hover:text-[#C9A84C] transition-colors truncate block"
                            >
                              {label}
                            </Link>
                          ) : (
                            <span className="text-sm text-[#8A9BB0] truncate block">
                              {label}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#4A5A6A] whitespace-nowrap shrink-0">
                          {time}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Recently Active Projects */}
          {projects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-[#F5ECD7]">
                  Recently Active Projects
                </h2>
                <Link
                  href="/projects"
                  className="flex items-center gap-1 text-sm text-[#C9A84C] hover:underline"
                >
                  All projects
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <ul className="space-y-2">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/projects/${project.id}`}
                      className="block rounded-lg border border-[#2A3A52] bg-[#1A2333] p-4 transition-colors hover:border-[#C9A84C]/40"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-medium text-[#F5ECD7] truncate">
                          {project.title}
                        </h3>
                        <span className="text-xs text-[#4A5A6A] whitespace-nowrap shrink-0">
                          {formatDistanceToNow(new Date(project.updated_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
