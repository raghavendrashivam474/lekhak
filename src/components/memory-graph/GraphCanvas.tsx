"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react";
import type { Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MemoryNode } from "./MemoryNode";
import { toReactFlow } from "./adapters/react-flow";
import type { RFNodeData } from "./adapters/react-flow";
import type { GraphProjection } from "@/types/graph";

const nodeTypes = { memoryNode: MemoryNode };

interface GraphCanvasProps {
  projection: GraphProjection;
  visibleNodeIds: Set<string>;
  focusedIds: Set<string>;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export function GraphCanvas({
  projection,
  visibleNodeIds,
  focusedIds,
  selectedNodeId,
  onSelectNode,
}: GraphCanvasProps) {
  const { nodes, edges } = useMemo(
    () =>
      toReactFlow(projection, {
        selectedId: selectedNodeId,
        focusedIds,
        visibleIds: visibleNodeIds,
      }),
    [projection, selectedNodeId, focusedIds, visibleNodeIds]
  );

  const handleClick = useCallback(
    (_evt: React.MouseEvent, node: Node) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  return (
    <div className="w-full h-full bg-[#0F1623]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleClick}
        fitView
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#2A3A52" gap={24} size={1} />
        <Controls className="!bg-[#1A2333] !border-[#2A3A52]" />
        <MiniMap
          nodeColor={(n) => {
            const data = n.data as unknown as RFNodeData;
            if (data?.isSelected) return "#C9A84C";
            if (data?.isFocused) return "#8A9BB0";
            return "#2A3A52";
          }}
          maskColor="rgba(15, 22, 35, 0.8)"
          style={{ background: "#0F1623", border: "1px solid #2A3A52" }}
        />
      </ReactFlow>
    </div>
  );
}