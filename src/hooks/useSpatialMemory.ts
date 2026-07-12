"use client";

// src/hooks/useSpatialMemory.ts
// Owns spatial interaction state and recomposes the projection on focus change.
// Zero Three.js imports.

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
  // Cross-view sync (optional): initial values coming from the graph view
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

  // When entry point changes, reset visible set + trail
  useEffect(() => {
    if (!activeEntry) return;
    setVisibleNodeIds(initialVisibleFromEntry(activeEntry, adjacency));
    setMemoryTrail([]);
    setSelectedNodeId(null);
    setFocusNodeId(null);
  }, [activeEntry, adjacency]);

  const projection: SpatialProjection = useMemo(() => {
    if (!activeEntry) {
      // Safety net — shouldn't happen but avoid crashing render
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

  // ---- Actions -------------------------------------------------------------

  const selectNode = useCallback(
    (spatialId: string) => {
      // Spatial ids are "spatial::graphNodeId" — map back to graph id.
      const graphNodeId = spatialId.startsWith("spatial::")
        ? spatialId.slice("spatial::".length)
        : spatialId;

      setSelectedNodeId(graphNodeId);
      setFocusNodeId(graphNodeId);
      setVisibleNodeIds((prev) => recomposeVisible(prev, graphNodeId, adjacency));
      setMemoryTrail((prev) => {
        if (prev[prev.length - 1] === graphNodeId) return prev;
        return [...prev, graphNodeId];
      });
    },
    [adjacency]
  );

  const jumpToTrailItem = useCallback(
    (index: number) => {
      const graphNodeId = memoryTrail[index];
      if (!graphNodeId) return;
      setSelectedNodeId(graphNodeId);
      setFocusNodeId(graphNodeId);
      setVisibleNodeIds((prev) => recomposeVisible(prev, graphNodeId, adjacency));
      setMemoryTrail((prev) => prev.slice(0, index + 1));
    },
    [memoryTrail, adjacency]
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