"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buildProjectGraph } from "@/services/graph";
import { MemoryGraph } from "@/components/memory-graph/MemoryGraph";
import { SpatialMemory } from "@/components/spatial-memory/SpatialMemory";
import { SpatialViewSwitcher } from "@/components/spatial-memory/SpatialViewSwitcher";
import type {
  GraphProjection,
  GraphAdjacency,
  GraphEntryPoint,
} from "@/types/graph";
import type { MemoryViewMode } from "@/types/spatial";

export default function MemoryPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [projection, setProjection] = useState<GraphProjection | null>(null);
  const [adjacency, setAdjacency] = useState<GraphAdjacency | null>(null);
  const [entryPoints, setEntryPoints] = useState<GraphEntryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shared state between Graph and Space
  const [viewMode, setViewMode] = useState<MemoryViewMode>("graph");
  const [sharedEntryKind, setSharedEntryKind] =
    useState<GraphEntryPoint["kind"] | undefined>(undefined);
  const [sharedSelectedNodeId, setSharedSelectedNodeId] = useState<string | null>(
    null
  );

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
        console.error("[MemoryPage]", err);
        setError("Failed to build memory.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  // Derive helpers passed to the spatial hook
  const { focusRelevantEntityIds, suggestedStartEntityId } = useMemo(() => {
    if (!projection) {
      return {
        focusRelevantEntityIds: new Set<string>(),
        suggestedStartEntityId: null as string | null,
      };
    }
    const focus = new Set<string>();
    let suggested: string | null = null;
    for (const n of projection.nodes) {
      if (n.state.focusRelevant) focus.add(n.entityId);
      if (n.state.suggestedStart) suggested = n.entityId;
    }
    return { focusRelevantEntityIds: focus, suggestedStartEntityId: suggested };
  }, [projection]);

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

        <SpatialViewSwitcher mode={viewMode} onChange={setViewMode} />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <p className="text-[#8A9BB0] text-sm">Building memory...</p>
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

      {!loading && !error && projection && adjacency && (
        <>
          {viewMode === "graph" && (
            <MemoryGraph
              projectId={projectId}
              projection={projection}
              adjacency={adjacency}
              entryPoints={entryPoints}
            />
          )}

          {viewMode === "space" && (
            <SpatialMemory
              projectId={projectId}
              graph={projection}
              adjacency={adjacency}
              entryPoints={entryPoints}
              focusRelevantEntityIds={focusRelevantEntityIds}
              suggestedStartEntityId={suggestedStartEntityId}
              initialEntryKind={sharedEntryKind}
              initialSelectedNodeId={sharedSelectedNodeId}
              onSelectedNodeChange={setSharedSelectedNodeId}
              onEntryKindChange={setSharedEntryKind}
              onFallbackToGraph={() => setViewMode("graph")}
            />
          )}
        </>
      )}
    </div>
  );
}