// src/hooks/useMemoryGraph.ts

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  GraphProjection,
  GraphEntryPoint,
  GraphAdjacency,
  GraphNodeType,
  GraphRelationshipType,
} from "@/types/graph";
import {
  applyFilters,
  expandVisibleContext,
  resolveInitialVisible,
  searchGraphNodes,
} from "@/services/graph";

const ALL_NODE_TYPES: GraphNodeType[] = [
  "project",
  "collection",
  "note",
  "question",
  "knowledge_tag",
];

const ALL_RELATIONSHIP_TYPES: GraphRelationshipType[] = [
  "contains",
  "belongs_to",
  "related_to",
  "references",
  "answers_question",
  "supports_goal",
  "supports_focus",
  "blocks_next_step",
  "tagged_with",
];

interface UseMemoryGraphInput {
  projection: GraphProjection;
  adjacency: GraphAdjacency;
  entryPoints: GraphEntryPoint[];
}

export function useMemoryGraph({
  projection,
  adjacency,
  entryPoints,
}: UseMemoryGraphInput) {
  const [activeEntryKind, setActiveEntryKind] = useState(
    entryPoints[0]?.kind ?? "project_memory"
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(
    () => new Set()
  );
  const [memoryTrail, setMemoryTrail] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [nodeTypeFilters, setNodeTypeFilters] = useState<Set<GraphNodeType>>(
    () => new Set(ALL_NODE_TYPES)
  );
  const [relationshipFilters, setRelationshipFilters] = useState<
    Set<GraphRelationshipType>
  >(() => new Set(ALL_RELATIONSHIP_TYPES));

  const activeEntry = useMemo(
    () => entryPoints.find((e) => e.kind === activeEntryKind) ?? entryPoints[0],
    [entryPoints, activeEntryKind]
  );

  // When entry point changes, reset visible set
  useEffect(() => {
    if (!activeEntry) return;
    // Entry point change = external context change; resetting derived
    // state is the correct synchronisation pattern.
    const initial = resolveInitialVisible(activeEntry, adjacency);
    setVisibleNodeIds(initial);
    setMemoryTrail([]);
    setSelectedNodeId(null);
  }, [activeEntry, adjacency]);

  const filteredProjection = useMemo(
    () =>
      applyFilters(projection, {
        nodeTypes: nodeTypeFilters,
        relationshipTypes: relationshipFilters,
      }),
    [projection, nodeTypeFilters, relationshipFilters]
  );

  const focusedIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const set = new Set<string>([selectedNodeId]);
    for (const n of adjacency.get(selectedNodeId) ?? []) set.add(n);
    return set;
  }, [selectedNodeId, adjacency]);

  const searchResults = useMemo(
    () => searchGraphNodes(projection, searchQuery),
    [projection, searchQuery]
  );

  const selectNode = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      setVisibleNodeIds((prev) =>
        expandVisibleContext(prev, nodeId, adjacency)
      );
      setMemoryTrail((prev) => {
        if (prev[prev.length - 1] === nodeId) return prev;
        return [...prev, nodeId];
      });
    },
    [adjacency]
  );

  const setEntryPoint = useCallback((kind: GraphEntryPoint["kind"]) => {
    setActiveEntryKind(kind);
  }, []);

  const jumpToTrailItem = useCallback(
    (index: number) => {
      const nodeId = memoryTrail[index];
      if (!nodeId) return;
      setSelectedNodeId(nodeId);
      setVisibleNodeIds((prev) =>
        expandVisibleContext(prev, nodeId, adjacency)
      );
      setMemoryTrail((prev) => prev.slice(0, index + 1));
    },
    [memoryTrail, adjacency]
  );

  const toggleNodeType = useCallback((type: GraphNodeType) => {
    setNodeTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const toggleRelationshipType = useCallback(
    (type: GraphRelationshipType) => {
      setRelationshipFilters((prev) => {
        const next = new Set(prev);
        if (next.has(type)) next.delete(type);
        else next.add(type);
        return next;
      });
    },
    []
  );

  const selectedNode = useMemo(
    () => projection.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [projection.nodes, selectedNodeId]
  );

  return {
    // State
    projection: filteredProjection,
    visibleNodeIds,
    selectedNodeId,
    selectedNode,
    focusedIds,
    memoryTrail,
    searchQuery,
    searchResults,
    activeEntry,
    entryPoints,
    nodeTypeFilters,
    relationshipFilters,
    // Actions
    selectNode,
    setEntryPoint,
    jumpToTrailItem,
    setSearchQuery,
    toggleNodeType,
    toggleRelationshipType,
  };
}