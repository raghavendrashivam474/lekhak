"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { buildProjectGraph } from "@/services/graph";
import { buildHistoricalProjectGraph } from "@/services/graph/historical";
import { MemoryGraph } from "@/components/memory-graph/MemoryGraph";
import { SpatialMemory } from "@/components/spatial-memory/SpatialMemory";
import { SpatialViewSwitcher } from "@/components/spatial-memory/SpatialViewSwitcher";
import type {
  GraphProjection,
  GraphAdjacency,
  GraphEntryPoint,
} from "@/types/graph";
import type { MemoryViewMode } from "@/types/spatial";

function parseAtParam(raw: string | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

// Deterministic date formatter — must NOT depend on the runtime locale,
// otherwise SSR and client render different strings and React hydration fails.
// Format: "Jun 24, 2026".
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function formatDate(iso: string): string {
  const d = new Date(iso);
  return MONTHS[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
}

export default function MemoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;

  const atParam = searchParams.get("at");
  const referenceTime = useMemo(() => parseAtParam(atParam), [atParam]);
  const isHistorical = referenceTime !== null;

  const [projection, setProjection] = useState<GraphProjection | null>(null);
  const [adjacency, setAdjacency] = useState<GraphAdjacency | null>(null);
  const [entryPoints, setEntryPoints] = useState<GraphEntryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<MemoryViewMode>("graph");
  const [sharedEntryKind, setSharedEntryKind] =
    useState<GraphEntryPoint["kind"] | undefined>(undefined);
  const [sharedSelectedNodeId, setSharedSelectedNodeId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const result = referenceTime
          ? await buildHistoricalProjectGraph(projectId, referenceTime)
          : await buildProjectGraph(projectId);

        if (cancelled) return;

        if (!result) {
          setError("Project not found or you do not have access.");
          setProjection(null);
          setAdjacency(null);
          setEntryPoints([]);
        } else {
          setProjection(result.projection);
          setAdjacency(result.adjacency);
          setEntryPoints(result.entryPoints);

          if (
            sharedSelectedNodeId &&
            !result.projection.nodes.some((n) => n.id === sharedSelectedNodeId)
          ) {
            setSharedSelectedNodeId(null);
          }
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[MemoryPage]", err);
        setError("Failed to build memory.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, referenceTime]);

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

      {isHistorical && referenceTime && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-amber-300" />
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-300">
                Historical Exploration (read-only)
              </p>
              <p className="text-sm text-slate-200">
                Memory as it existed on {formatDate(referenceTime.toISOString())}
              </p>
            </div>
          </div>
          <Link
            href={"/projects/" + projectId + "/memory"}
            className="text-xs text-slate-300 hover:text-slate-100 underline underline-offset-2"
          >
            Return to current memory
          </Link>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-24">
          <p className="text-[#8A9BB0] text-sm">
            {isHistorical ? "Reconstructing memory..." : "Building memory..."}
          </p>
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
