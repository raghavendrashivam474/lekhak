// src/services/spatial/camera/intent.ts
// Pure function: given the current spatial context, return where the camera
// SHOULD look and how far away it should sit. No THREE. No React.

import type {
  SpatialProjection,
  CameraIntent,
  CameraMode,
  SpatialVector,
} from "@/types/spatial";

interface ResolveCameraInput {
  projection: SpatialProjection;
  selectedNodeId: string | null;
  previousMode: CameraMode | null;
}

const OVERVIEW_TARGET: SpatialVector = { x: 0, y: 0, z: 0 };
const OVERVIEW_DISTANCE = 22;
const FOCUS_DISTANCE = 10;
const ENTRY_DISTANCE = 16;

export function resolveCameraIntent(input: ResolveCameraInput): CameraIntent {
  const { projection, selectedNodeId } = input;

  // Focus mode — a specific node is selected
  if (selectedNodeId) {
    const node = projection.nodes.find(
      (n) => n.graphNodeId === selectedNodeId
    );
    if (node) {
      return {
        mode: "focus",
        target: node.position,
        distance: FOCUS_DISTANCE,
      };
    }
  }

  // Entry point mode — no selection, but we have visible context
  if (projection.nodes.length > 0) {
    const immediateNodes = projection.nodes.filter(
      (n) => n.depth === "immediate"
    );
    const targets =
      immediateNodes.length > 0 ? immediateNodes : projection.nodes;

    const centroid: SpatialVector = targets.reduce(
      (acc, n) => ({
        x: acc.x + n.position.x / targets.length,
        y: acc.y + n.position.y / targets.length,
        z: acc.z + n.position.z / targets.length,
      }),
      { x: 0, y: 0, z: 0 }
    );

    return {
      mode: "entry_point",
      target: centroid,
      distance: ENTRY_DISTANCE,
    };
  }

  // Fallback — quiet overview
  return {
    mode: "overview",
    target: OVERVIEW_TARGET,
    distance: OVERVIEW_DISTANCE,
  };
}