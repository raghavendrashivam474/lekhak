"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSpatialMemory } from "@/hooks/useSpatialMemory";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { resolveCameraIntent } from "@/services/spatial/camera/intent";
import { MemoryInspector } from "@/components/memory-graph/MemoryInspector";
import { MemoryTrail } from "@/components/memory-graph/MemoryTrail";
import { SpatialEmptyState } from "./SpatialEmptyState";
import { SpatialUnsupported } from "./SpatialUnsupported";
import { SpatialErrorBoundary } from "./SpatialErrorBoundary";
import { SpatialSearch } from "./SpatialSearch";
import type {
  GraphProjection,
  GraphAdjacency,
  GraphEntryPoint,
  GraphNode,
} from "@/types/graph";

const SpatialCanvas = dynamic(
  () => import("./SpatialCanvas").then((m) => m.SpatialCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-[#8A9BB0] text-sm">
        Preparing memory space...
      </div>
    ),
  }
);

interface SpatialMemoryProps {
  projectId: string;
  graph: GraphProjection;
  adjacency: GraphAdjacency;
  entryPoints: GraphEntryPoint[];
  focusRelevantEntityIds: Set<string>;
  suggestedStartEntityId: string | null;
  initialEntryKind?: GraphEntryPoint["kind"];
  initialSelectedNodeId?: string | null;
  onSelectedNodeChange?: (graphNodeId: string | null) => void;
  onEntryKindChange?: (kind: GraphEntryPoint["kind"]) => void;
  onFallbackToGraph: () => void;
}

export function SpatialMemory({
  projectId,
  graph,
  adjacency,
  entryPoints,
  focusRelevantEntityIds,
  suggestedStartEntityId,
  initialEntryKind,
  initialSelectedNodeId,
  onSelectedNodeChange,
  onEntryKindChange,
  onFallbackToGraph,
}: SpatialMemoryProps) {
  const reducedMotion = useReducedMotion();
  const webglSupported = useWebGLSupport();

  const spatial = useSpatialMemory({
    graph,
    adjacency,
    entryPoints,
    initialEntryKind,
    initialSelectedNodeId,
    focusRelevantEntityIds,
    suggestedStartEntityId,
  });

  useEffect(() => {
    onSelectedNodeChange?.(spatial.selectedNodeId);
  }, [spatial.selectedNodeId, onSelectedNodeChange]);

  useEffect(() => {
    if (spatial.activeEntry) onEntryKindChange?.(spatial.activeEntry.kind);
  }, [spatial.activeEntry, onEntryKindChange]);

  const cameraIntent = useMemo(
    () =>
      resolveCameraIntent({
        projection: spatial.projection,
        selectedNodeId: spatial.selectedNodeId,
        previousMode: null,
      }),
    [spatial.projection, spatial.selectedNodeId]
  );

  const selectedGraphNode: GraphNode | null = useMemo(() => {
    if (!spatial.selectedNodeId) return null;
    return graph.nodes.find((n) => n.id === spatial.selectedNodeId) ?? null;
  }, [graph.nodes, spatial.selectedNodeId]);

  const nodesById = useMemo(() => {
    const m = new Map<string, GraphNode>();
    for (const n of graph.nodes) m.set(n.id, n);
    return m;
  }, [graph.nodes]);

  const hasContent =
    spatial.projection.nodes.filter((n) => n.entityType !== "project").length > 0;

  const isWebGLBlocked = webglSupported === false;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-[#0F1623] rounded-lg border border-[#2A3A52] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-4 border-b border-[#2A3A52]">
        <div className="flex items-center gap-2 flex-wrap">
          {spatial.entryPoints.map((entry) => (
            <button
              key={entry.kind}
              onClick={() => spatial.setEntryPoint(entry.kind)}
              type="button"
              aria-pressed={entry.kind === spatial.activeEntry?.kind}
              aria-label={"Enter memory from " + entry.label}
              className={
                "text-xs rounded-lg px-3 py-1.5 border transition-colors " +
                (entry.kind === spatial.activeEntry?.kind
                  ? "bg-[#C9A84C] text-[#0F1623] border-[#C9A84C] font-medium"
                  : "bg-[#1A2333] text-[#8A9BB0] border-[#2A3A52] hover:text-[#F5ECD7]")
              }
            >
              {entry.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SpatialSearch
            projection={graph}
            onSelectResult={spatial.selectNode}
          />
          {reducedMotion && (
            <span className="text-[10px] text-[#4A5A6A] uppercase tracking-wide">
              Reduced motion on
            </span>
          )}
        </div>
      </div>

      {/* Canvas + Inspector */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          {isWebGLBlocked ? (
            <SpatialUnsupported
              reason="WebGL is not available in this browser. Memory Graph shows the same knowledge."
              onFallbackToGraph={onFallbackToGraph}
            />
          ) : !hasContent ? (
            <SpatialEmptyState />
          ) : (
            <SpatialErrorBoundary onFallbackToGraph={onFallbackToGraph}>
              <SpatialCanvas
                projection={spatial.projection}
                selectedNodeId={spatial.selectedNodeId}
                onSelectNode={spatial.selectNode}
                cameraIntent={cameraIntent}
                reducedMotion={reducedMotion}
              />
            </SpatialErrorBoundary>
          )}
        </div>

        <div className="w-80 shrink-0 border-l border-[#2A3A52]">
          <MemoryInspector
            projectId={projectId}
            node={selectedGraphNode}
            onClose={spatial.clearSelection}
          />
        </div>
      </div>

      {/* Trail */}
      <MemoryTrail
        trail={spatial.memoryTrail}
        nodesById={nodesById}
        onJump={spatial.jumpToTrailItem}
      />
    </div>
  );
}