"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSpatialMemory } from "@/hooks/useSpatialMemory";
import { MemoryInspector } from "@/components/memory-graph/MemoryInspector";
import { MemoryTrail } from "@/components/memory-graph/MemoryTrail";
import { SpatialEmptyState } from "./SpatialEmptyState";
import type {
  GraphProjection,
  GraphAdjacency,
  GraphEntryPoint,
  GraphNode,
} from "@/types/graph";

// Canvas is client-only — Three.js touches window/document during init.
const SpatialCanvas = dynamic(
  () => import("./SpatialCanvas").then((m) => m.SpatialCanvas),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-full text-[#8A9BB0] text-sm">
      Preparing memory space...
    </div>
  )}
);

interface SpatialMemoryProps {
  projectId: string;
  graph: GraphProjection;
  adjacency: GraphAdjacency;
  entryPoints: GraphEntryPoint[];
  focusRelevantEntityIds: Set<string>;
  suggestedStartEntityId: string | null;
  // Cross-view sync from parent
  initialEntryKind?: GraphEntryPoint["kind"];
  initialSelectedNodeId?: string | null;
  onSelectedNodeChange?: (graphNodeId: string | null) => void;
  onEntryKindChange?: (kind: GraphEntryPoint["kind"]) => void;
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
}: SpatialMemoryProps) {
  const spatial = useSpatialMemory({
    graph,
    adjacency,
    entryPoints,
    initialEntryKind,
    initialSelectedNodeId,
    focusRelevantEntityIds,
    suggestedStartEntityId,
  });

  // Sync outward — must be effects (setState in render is illegal)
  useEffect(() => {
    onSelectedNodeChange?.(spatial.selectedNodeId);
  }, [spatial.selectedNodeId, onSelectedNodeChange]);

  useEffect(() => {
    if (spatial.activeEntry) onEntryKindChange?.(spatial.activeEntry.kind);
  }, [spatial.activeEntry, onEntryKindChange]);

  // Selected graph node (for shared inspector)
  const selectedGraphNode: GraphNode | null = useMemo(() => {
    if (!spatial.selectedNodeId) return null;
    return graph.nodes.find((n) => n.id === spatial.selectedNodeId) ?? null;
  }, [graph.nodes, spatial.selectedNodeId]);

  // Trail nodes lookup (reuse MemoryTrail component from Sprint 9)
  const nodesById = useMemo(() => {
    const m = new Map<string, GraphNode>();
    for (const n of graph.nodes) m.set(n.id, n);
    return m;
  }, [graph.nodes]);

  const hasContent =
    spatial.projection.nodes.filter((n) => n.entityType !== "project").length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-[#0F1623] rounded-lg border border-[#2A3A52] overflow-hidden">
      {/* Entry point pills */}
      <div className="flex items-center gap-2 flex-wrap p-4 border-b border-[#2A3A52]">
        {spatial.entryPoints.map((entry) => (
          <button
            key={entry.kind}
            onClick={() => spatial.setEntryPoint(entry.kind)}
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

      {/* Canvas + Inspector */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          {!hasContent ? (
            <SpatialEmptyState />
          ) : (
            <SpatialCanvas
              projection={spatial.projection}
              selectedNodeId={spatial.selectedNodeId}
              onSelectNode={spatial.selectNode}
            />
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