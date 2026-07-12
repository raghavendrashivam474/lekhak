"use client";

import { SpatialNodeShell } from "../SpatialNode";
import type { AdaptedSpatialNode } from "../adapters/spatial-three";

interface Props {
  node: AdaptedSpatialNode;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

// Project → anchor form (octahedron)
export function ProjectSpatialNode({ node, onSelect, isSelected }: Props) {
  return (
    <SpatialNodeShell node={node} onSelect={onSelect} isSelected={isSelected}>
      <mesh>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color={isSelected ? "#C9A84C" : "#8A9BB0"}
          transparent
          opacity={node.opacity}
          emissive={isSelected ? "#C9A84C" : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
    </SpatialNodeShell>
  );
}