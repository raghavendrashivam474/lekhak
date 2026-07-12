"use client";

import { useMemo } from "react";
import { Vector3, BufferGeometry } from "three";
import type { AdaptedSpatialEdge } from "./adapters/spatial-three";

interface SpatialEdgeProps {
  edge: AdaptedSpatialEdge;
  highlighted: boolean;
}

export function SpatialEdge({ edge, highlighted }: SpatialEdgeProps) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setFromPoints([
      new Vector3(...edge.source),
      new Vector3(...edge.target),
    ]);
    return g;
  }, [edge.source, edge.target]);

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial
        color={highlighted ? "#C9A84C" : "#2A3A52"}
        transparent
        opacity={edge.opacity * (highlighted ? 1.0 : 0.5)}
      />
    </line>
  );
}