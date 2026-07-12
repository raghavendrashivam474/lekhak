"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  GraphProjection,
  GraphAdjacency,
  GraphEntryPoint,
} from "@/types/graph";
import type { SpatialProjection } from "@/types/spatial";
import {
  buildSpatialProjection,
  recomposeVisible,
  initialVisibleFromEntry,
} from "@/services/spatial";

interface UseSpatialMemoryInput {
  graph: GraphProjection;
  adjacency: GraphAdjacency;
  entryPoints: GraphEntryPoint[];
  initialEntryKind?: GraphEntryPoint["kind"];
  initialSelectedNodeId?: string | null;
  focusRelevantEntityIds: Set<string>;
  suggestedStartEntityId: string | null;
}

export function useSpatialMemory({
  graph,
  adjacency,
  entryPoints,
  initialEntryKind,
  initialSelectedNodeId = null,
  focusRelevantEntityIds,
  suggestedStartEntityId,
}: UseSpatialMemoryInput) {
  const [activeEntryKind, setActiveEntryKind] = useState<GraphEntryPoint["kind"]>(
    initialEntryKind ?? entryPoints[0]?.kind ?? "project_memory"
  );

  const activeEntry = useMemo(
    () => entryPoints.find((e) => e.kind === activeEntryKind) ?? entryPoints[0],
    [entryPoints, activeEntryKind]
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    initialSelectedNodeId
  );
  const [focusNodeId, setFocusNodeId] = useState<string | null>(
    initialSelectedNodeId
  );

  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(() =>
    activeEntry ? initialVisibleFromEntry(activeEntry, adjacency) : new Set()
  );

  const [memoryTrail, setMemoryTrail] = useState<string[]>([]);

  // Reset on entry point change
  useEffect(() => {
    if (!activeEntry) return;
    setVisibleNodeIds(initialVisibleFromEntry(activeEntry, adjacency));
    setMemoryTrail([]);
    setSelectedNodeId(null);
    setFocusNodeId(null);
  }, [activeEntry, adjacency]);

  // Guard: if the graph changes and the selected node no longer exists,
  // clear selection so we don't try to focus on a ghost.
  useEffect(() => {
    if (!selectedNodeId) return;
    const stillExists = graph.nodes.some((n) => n.id === selectedNodeId);
    if (!stillExists) {
      setSelectedNodeId(null);
      setFocusNodeId(null);
    }
  }, [graph.nodes, selectedNodeId]);

  const projection: SpatialProjection = useMemo(() => {
    if (!activeEntry) {
      return {
        nodes: [],
        edges: [],
        regions: [],
        context: {
          entryPoint: entryPoints[0],
          focusNodeId: null,
          immediateNodeIds: [],
          supportingNodeIds: [],
          peripheralNodeIds: [],
        },
      };
    }

    return buildSpatialProjection({
      graph,
      adjacency,
      entryPoint: activeEntry,
      focusNodeId,
      selectedNodeId,
      focusRelevantEntityIds,
      suggestedStartEntityId,
      visibleNodeIds,
    });
  }, [
    graph,
    adjacency,
    activeEntry,
    focusNodeId,
    selectedNodeId,
    focusRelevantEntityIds,
    suggestedStartEntityId,
    visibleNodeIds,
    entryPoints,
  ]);

  const selectNode = useCallback(
    (spatialId: string) => {
      const graphNodeId = spatialId.startsWith("spatial::")
        ? spatialId.slice("spatial::".length)
        : spatialId;

      // Guard: only select nodes that exist in the current graph
      if (!graph.nodes.some((n) => n.id === graphNodeId)) return;

      setSelectedNodeId(graphNodeId);
      setFocusNodeId(graphNodeId);
      setVisibleNodeIds((prev) => recomposeVisible(prev, graphNodeId, adjacency));
      setMemoryTrail((prev) => {
        if (prev[prev.length - 1] === graphNodeId) return prev;
        return [...prev, graphNodeId];
      });
    },
    [adjacency, graph.nodes]
  );

  const jumpToTrailItem = useCallback(
    (index: number) => {
      const graphNodeId = memoryTrail[index];
      if (!graphNodeId) return;
      if (!graph.nodes.some((n) => n.id === graphNodeId)) {
        // Node was deleted — trim trail up to this index
        setMemoryTrail((prev) => prev.slice(0, index));
        return;
      }
      setSelectedNodeId(graphNodeId);
      setFocusNodeId(graphNodeId);
      setVisibleNodeIds((prev) => recomposeVisible(prev, graphNodeId, adjacency));
      setMemoryTrail((prev) => prev.slice(0, index + 1));
    },
    [memoryTrail, adjacency, graph.nodes]
  );

  const setEntryPoint = useCallback((kind: GraphEntryPoint["kind"]) => {
    setActiveEntryKind(kind);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setFocusNodeId(null);
  }, []);

  return {
    projection,
    selectedNodeId,
    focusNodeId,
    activeEntry,
    entryPoints,
    memoryTrail,
    selectNode,
    jumpToTrailItem,
    setEntryPoint,
    clearSelection,
  };
}