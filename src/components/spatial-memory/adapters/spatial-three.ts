// src/components/spatial-memory/adapters/spatial-three.ts
// Renderer boundary. This file (and renderer components) are the ONLY
// places allowed to translate spatial domain into Three.js structures.

import { Vector3 } from "three";
import type {
  SpatialProjection,
  SpatialNode,
  SpatialEdge,
  SpatialRegion,
  SpatialProminence,
  SpatialDepth,
} from "@/types/spatial";

// Convert domain vector → Three.js vector at the renderer boundary.
export function toVector3(v: { x: number; y: number; z: number }): Vector3 {
  return new Vector3(v.x, v.y, v.z);
}

// Prominence → renderer scale hint
const PROMINENCE_SCALE: Record<SpatialProminence, number> = {
  primary: 1.4,
  high: 1.15,
  normal: 1.0,
  low: 0.75,
};

export function prominenceScale(p: SpatialProminence): number {
  return PROMINENCE_SCALE[p];
}

// Depth → renderer opacity hint
const DEPTH_OPACITY: Record<SpatialDepth, number> = {
  immediate: 1.0,
  supporting: 0.75,
  peripheral: 0.35,
};

export function depthOpacity(d: SpatialDepth): number {
  return DEPTH_OPACITY[d];
}

// Adapter output — pre-shaped for the renderer, but still POJO
export interface AdaptedSpatialNode {
  id: string;
  entityType: SpatialNode["entityType"];
  label: string;
  position: [number, number, number];
  scale: number;
  opacity: number;
  state: SpatialNode["state"];
  depth: SpatialDepth;
  region: SpatialNode["region"];
}

export interface AdaptedSpatialEdge {
  id: string;
  source: [number, number, number];
  target: [number, number, number];
  opacity: number;
}

export interface AdaptedSpatialRegion {
  id: SpatialRegion["id"];
  label: string;
  center: [number, number, number];
}

export interface AdaptedProjection {
  nodes: AdaptedSpatialNode[];
  edges: AdaptedSpatialEdge[];
  regions: AdaptedSpatialRegion[];
}

export function adaptProjection(projection: SpatialProjection): AdaptedProjection {
  const nodesById = new Map<string, SpatialNode>();
  for (const n of projection.nodes) nodesById.set(n.id, n);

  const nodes: AdaptedSpatialNode[] = projection.nodes.map((n) => ({
    id: n.id,
    entityType: n.entityType,
    label: n.label,
    position: [n.position.x, n.position.y, n.position.z],
    scale: PROMINENCE_SCALE[n.prominence],
    opacity: DEPTH_OPACITY[n.depth],
    state: n.state,
    depth: n.depth,
    region: n.region,
  }));

  const edges: AdaptedSpatialEdge[] = projection.edges
    .map((e) => {
      const s = nodesById.get(e.source);
      const t = nodesById.get(e.target);
      if (!s || !t) return null;
      // Edge opacity = min of endpoint opacities
      const opacity = Math.min(
        DEPTH_OPACITY[s.depth],
        DEPTH_OPACITY[t.depth]
      );
      return {
        id: e.id,
        source: [s.position.x, s.position.y, s.position.z] as [number, number, number],
        target: [t.position.x, t.position.y, t.position.z] as [number, number, number],
        opacity,
      };
    })
    .filter((e): e is AdaptedSpatialEdge => e !== null);

  const regions: AdaptedSpatialRegion[] = projection.regions.map((r) => ({
    id: r.id,
    label: r.label,
    center: [r.center.x, r.center.y, r.center.z],
  }));

  return { nodes, edges, regions };
}