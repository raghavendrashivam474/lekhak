"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { buildProjectGraph } from "@/services/graph";
import { MemoryGraph } from "@/components/memory-graph/MemoryGraph";
import type {
  GraphProjection,
  GraphAdjacency,
  GraphEntryPoint,
} from "@/types/graph";

export default function MemoryGraphPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [projection, setProjection] = useState<GraphProjection | null>(null);
  const [adjacency, setAdjacency] = useState<GraphAdjacency | null>(null);
  const [entryPoints, setEntryPoints] = useState<GraphEntryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    async function load() {
      try {
        const result = await buildProjectGraph(projectId);

        if (!result) {
          setError("Project not found or you do not have access.");
        } else {
          setProjection(result.projection);
          setAdjacency(result.adjacency);
          setEntryPoints(result.entryPoints);
        }
      } catch (err) {
        console.error("[MemoryGraphPage]", err);
        setError("Failed to build memory graph.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projectId]);

  const isEmpty =
    !loading &&
    !error &&
    projection &&
    projection.nodes.filter((n) => n.entityType !== "project").length === 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/projects/" + projectId)}
          className="flex items-center gap-2 text-sm text-[#8A9BB0] hover:text-[#F5ECD7] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#C9A84C]" />
          <h1 className="text-sm font-medium text-[#C9A84C]">Memory Graph</h1>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <p className="text-[#8A9BB0] text-sm">Building memory graph...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <Link
            href={"/projects/" + projectId}
            className="text-sm text-[#8A9BB0] hover:text-[#F5ECD7]"
          >
            Return to Project
          </Link>
        </div>
      )}

      {!loading && !error && isEmpty && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Sparkles className="h-10 w-10 text-[#4A5A6A] mb-4" />
          <h2 className="text-lg font-medium text-[#F5ECD7] mb-1">
            Your project memory is still quiet
          </h2>
          <p className="text-[#8A9BB0] text-sm max-w-sm mb-6">
            Create notes and connections to begin shaping its visual memory.
          </p>
          <Link
            href={"/projects/" + projectId}
            className="inline-flex items-center rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-medium text-[#0F1623] hover:bg-[#D4B86A] transition-colors"
          >
            Back to project
          </Link>
        </div>
      )}

      {!loading && !error && !isEmpty && projection && adjacency && (
        <MemoryGraph
          projectId={projectId}
          projection={projection}
          adjacency={adjacency}
          entryPoints={entryPoints}
        />
      )}
    </div>
  );
}