// src/services/spatial/projection/position.ts
// Deterministic spatial positioning.
// Same input → same output. No Math.random().

import type {
  SpatialVector,
  SpatialDepth,
  SpatialRegionType,
} from "@/types/spatial";

// Region centers form conceptual territories in space.
// Y axis = vertical, Z axis = depth (negative = further from camera).
const REGION_CENTERS: Record<SpatialRegionType, SpatialVector> = {
  current_work:          { x: -6,  y:  0,  z:  4 },
  open_threads:          { x:  6,  y:  3,  z:  0 },
  established_knowledge: { x:  0,  y: -3,  z: -2 },
  peripheral_memory:     { x:  0,  y:  0,  z: -12 },
};

const DEPTH_OFFSET: Record<SpatialDepth, number> = {
  immediate: 3,
  supporting: 0,
  peripheral: -4,
};

// Deterministic hash → stable offset per node id.
// Prevents nodes stacking at exact region center without randomness.
function seededOffset(id: string): SpatialVector {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  // Map hash to a small 3D offset in range ~[-2.5, 2.5]
  const rx = ((h & 0xff) / 255 - 0.5) * 5;
  const ry = (((h >> 8) & 0xff) / 255 - 0.5) * 5;
  const rz = (((h >> 16) & 0xff) / 255 - 0.5) * 5;
  return { x: rx, y: ry, z: rz };
}

export function regionCenter(region: SpatialRegionType): SpatialVector {
  return REGION_CENTERS[region];
}

export function calculatePosition(
  nodeId: string,
  region: SpatialRegionType,
  depth: SpatialDepth,
  relevanceScore: number
): SpatialVector {
  const center = REGION_CENTERS[region];
  const offset = seededOffset(nodeId);

  // Higher relevance pulls the node closer to region center (dampen offset)
  const damp = Math.max(0.3, 1 - relevanceScore / 12);

  return {
    x: center.x + offset.x * damp,
    y: center.y + offset.y * damp,
    z: center.z + offset.z * damp + DEPTH_OFFSET[depth],
  };
}