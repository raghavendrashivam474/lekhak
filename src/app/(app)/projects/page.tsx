// src/app/(app)/projects/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FolderOpen } from "lucide-react";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { getProjects } from "@/services/projects";
import type { Project } from "@/types/project";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await getProjects();
      if (error) {
        setError(error);
      } else {
        setProjects(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleProjectCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F5ECD7]">
            Projects
          </h1>
          <p className="text-[#8A9BB0] text-sm mt-1">
            Every project is a world. Keep building.
          </p>
        </div>
        <CreateProjectDialog onProjectCreated={handleProjectCreated} />
      </div>

      {loading && (
        <p className="text-[#8A9BB0] text-sm">Loading your projects...</p>
      )}

      {!loading && error && (
        <p className="text-red-400 text-sm">Something went wrong: {error}</p>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderOpen className="h-10 w-10 text-[#4A5A6A] mb-4" />
          <h2 className="text-lg font-medium text-[#F5ECD7] mb-1">
            No projects yet
          </h2>
          <p className="text-[#8A9BB0] text-sm max-w-xs">
            Start by creating your first project. Every story begins somewhere.
          </p>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="block rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5 transition-colors hover:border-[#C9A84C]/40 hover:bg-[#1A2333]/80"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-medium text-[#F5ECD7] truncate">
                      {project.title}
                    </h2>
                    {project.description && (
                      <p className="text-[#8A9BB0] text-sm mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-[#4A5A6A] whitespace-nowrap shrink-0 mt-0.5">
                    {formatDistanceToNow(new Date(project.updated_at), {
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
  );
}
