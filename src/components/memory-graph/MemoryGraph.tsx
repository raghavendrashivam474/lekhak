"use client";

import { useMemo } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useMemoryGraph } from "@/hooks/useMemoryGraph";
import { GraphCanvas } from "./GraphCanvas";
import { GraphControls } from "./GraphControls";
import { GraphSearch } from "./GraphSearch";
import { GraphFilters } from "./GraphFilters";
import { MemoryInspector } from "./MemoryInspector";
import { MemoryTrail } from "./MemoryTrail";
import type {
  GraphProjection,
  GraphAdjacency,
  GraphEntryPoint,
  GraphNode,
} from "@/types/graph";

interface MemoryGraphProps {
  projectId: string;
  projection: GraphProjection;
  adjacency: GraphAdjacency;
  entryPoints: GraphEntryPoint[];
}

export function MemoryGraph({
  projectId,
  projection,
  adjacency,
  entryPoints,
}: MemoryGraphProps) {
  const graph = useMemoryGraph({ projection, adjacency, entryPoints });

  const nodesById = useMemo(() => {
    const m = new Map<string, GraphNode>();
    for (const n of projection.nodes) m.set(n.id, n);
    return m;
  }, [projection.nodes]);

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-[calc(100vh-120px)] bg-[#0F1623] rounded-lg border border-[#2A3A52] overflow-hidden">
        {/* Controls bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap p-4 border-b border-[#2A3A52]">
          <GraphControls
            entryPoints={graph.entryPoints}
            activeKind={graph.activeEntry?.kind ?? "project_memory"}
            onChange={graph.setEntryPoint}
          />
          <div className="flex items-center gap-2">
            <GraphSearch
              query={graph.searchQuery}
              results={graph.searchResults}
              onQueryChange={graph.setSearchQuery}
              onSelectResult={graph.selectNode}
            />
            <GraphFilters
              nodeTypeFilters={graph.nodeTypeFilters}
              relationshipFilters={graph.relationshipFilters}
              onToggleNodeType={graph.toggleNodeType}
              onToggleRelationshipType={graph.toggleRelationshipType}
            />
          </div>
        </div>

        {/* Canvas + Inspector */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <GraphCanvas
              projection={graph.projection}
              visibleNodeIds={graph.visibleNodeIds}
              focusedIds={graph.focusedIds}
              selectedNodeId={graph.selectedNodeId}
              onSelectNode={graph.selectNode}
            />
          </div>
          <div className="w-80 shrink-0">
            <MemoryInspector
              projectId={projectId}
              node={graph.selectedNode}
              onClose={() => graph.selectNode("")}
            />
          </div>
        </div>

        {/* Trail */}
        <MemoryTrail
          trail={graph.memoryTrail}
          nodesById={nodesById}
          onJump={graph.jumpToTrailItem}
        />
      </div>
    </ReactFlowProvider>
  );
}